#!/usr/bin/env python3
"""Ingest a Grok Build IVS research brief markdown file into public.ivs_briefs.

Env (shell, .env.local, .env, or ../ivs_news/.env — same pattern as seed-providers.mjs):
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Usage:
  python scripts/ingest_brief.py --file ~/IVS-research-gb/2026-08-07-gb.md
  python scripts/ingest_brief.py --file ~/IVS-research-gb/2026-08-07-gb.md --publish false
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

SOURCE_DEFAULT = "grok_build_tavily"

HEADING_ITEM_RE = re.compile(
    r"^##\s+(\d+)\.\s+(.+?)\s*$",
    re.MULTILINE,
)
FETCHED_RE = re.compile(
    r"\*\*Fetched:\*\*\s*(\d{4}-\d{2}-\d{2})",
    re.IGNORECASE,
)
FILENAME_DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
SIGNAL_CELL_RE = re.compile(
    r"\|\s*\*\*Signal level\*\*\s*\|\s*(.+?)\s*\|",
    re.IGNORECASE,
)


def load_env_file(path: Path) -> None:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return
    for line in text.splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#") or "=" not in trimmed:
            continue
        key, _, value = trimmed.partition("=")
        key = key.strip()
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        if key and os.environ.get(key) is None:
            os.environ[key] = value


def bootstrap_env(repo_root: Path) -> None:
    load_env_file(repo_root.parent / "ivs_news" / ".env")
    load_env_file(repo_root / ".env.local")
    load_env_file(repo_root / ".env")


def strip_md(text: str) -> str:
    text = MD_LINK_RE.sub(r"\1", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def first_url(text: str) -> str | None:
    match = MD_LINK_RE.search(text)
    return match.group(2) if match else None


def table_field(block: str, label: str) -> str | None:
    pattern = re.compile(
        rf"\|\s*\*\*{re.escape(label)}\*\*\s*\|\s*(.*?)\s*\|",
        re.IGNORECASE | re.DOTALL,
    )
    match = pattern.search(block)
    if not match:
        return None
    return re.sub(r"\s+", " ", match.group(1)).strip()


def parse_signal_level(markdown: str) -> str | None:
    match = SIGNAL_CELL_RE.search(markdown)
    if not match:
        return None
    raw = strip_md(match.group(1))
    lowered = raw.lower()
    if "critical" in lowered:
        return "critical"
    if "high" in lowered:
        return "high" if "medium" not in lowered else "medium-high"
    if "medium" in lowered:
        return "medium"
    if "low" in lowered:
        return "low"
    return raw[:80]


def parse_assessment(markdown: str) -> str | None:
    match = re.search(
        r"^##\s+Overall assessment\s*$",
        markdown,
        re.IGNORECASE | re.MULTILINE,
    )
    if not match:
        return None
    section = markdown[match.end() :].strip()
    section = re.split(r"\n\*\*Method note:\*\*", section, maxsplit=1)[0].strip()
    return section or None


def parse_items(markdown: str) -> list[dict[str, Any]]:
    matches = list(HEADING_ITEM_RE.finditer(markdown))
    items: list[dict[str, Any]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown)
        block = markdown[start:end]
        block = re.split(
            r"\n###\s+Honorable mentions|\n##\s+Overall assessment",
            block,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        title = match.group(2).strip()
        source_raw = table_field(block, "Source") or ""
        key_point = table_field(block, "Key point") or ""
        why = (
            table_field(block, "Why it matters for IVS")
            or table_field(block, "Why it matters")
            or ""
        )
        item_date = table_field(block, "Date")

        item: dict[str, Any] = {
            "title": title,
            "summary": strip_md(key_point) if key_point else "",
            "key_point": strip_md(key_point) if key_point else "",
            "why_it_matters": strip_md(why) if why else "",
            "url": first_url(source_raw),
            "source": strip_md(source_raw) if source_raw else None,
        }
        if item_date:
            item["date"] = strip_md(item_date)
        items.append({k: v for k, v in item.items() if v not in (None, "")})
    return items


def extract_entity_names(items: list[dict[str, Any]], limit: int = 24) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for item in items:
        title = str(item.get("title") or "")
        token = re.split(r"\s+[—\-:]\s+", title, maxsplit=1)[0].strip()
        token = re.sub(r"\s+", " ", token)
        if not token or token.lower() in seen:
            continue
        seen.add(token.lower())
        names.append(token)
        if len(names) >= limit:
            break
    return names


def parse_brief(path: Path, markdown: str) -> dict[str, Any]:
    fetched = FETCHED_RE.search(markdown)
    file_date = FILENAME_DATE_RE.search(path.name)
    brief_date = (
        fetched.group(1)
        if fetched
        else (file_date.group(1) if file_date else None)
    )
    if not brief_date:
        raise ValueError(
            "Could not determine brief_date from **Fetched:** line or filename."
        )

    title_match = re.search(r"^#\s+(.+?)\s*$", markdown, re.MULTILINE)
    title = (
        strip_md(title_match.group(1))
        if title_match
        else f"IVS Research Brief — {brief_date}"
    )

    items = parse_items(markdown)
    assessment = parse_assessment(markdown)
    signal_level = parse_signal_level(markdown)

    return {
        "brief_date": brief_date,
        "title": title,
        "source": SOURCE_DEFAULT,
        "markdown": markdown,
        "signal_level": signal_level,
        "assessment_md": assessment,
        "items": items,
        "entity_names": extract_entity_names(items),
    }


def parse_publish_flag(value: str) -> bool:
    lowered = value.strip().lower()
    if lowered in {"1", "true", "yes", "y", "on"}:
        return True
    if lowered in {"0", "false", "no", "n", "off"}:
        return False
    raise argparse.ArgumentTypeError("--publish expects true/false")


def upsert_brief(
    *,
    supabase_url: str,
    service_role_key: str,
    row: dict[str, Any],
) -> dict[str, Any]:
    endpoint = supabase_url.rstrip("/") + "/rest/v1/ivs_briefs?on_conflict=brief_date"
    payload = json.dumps([row]).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body) if body else []
            if not data:
                raise RuntimeError("Upsert succeeded but returned no row.")
            return data[0]
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase HTTP {exc.code}: {detail}") from exc


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ingest Grok Build brief into ivs_briefs"
    )
    parser.add_argument("--file", required=True, help="Path to markdown brief")
    parser.add_argument(
        "--publish",
        type=parse_publish_flag,
        default=True,
        help="published flag (default: true)",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    bootstrap_env(repo_root)

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
        "NEXT_PUBLIC_SUPABASE_URL"
    )
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print(
            "ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n"
            "Set them in the environment, .env.local, .env, or ../ivs_news/.env.",
            file=sys.stderr,
        )
        return 1

    path = Path(args.file).expanduser().resolve()
    if not path.is_file():
        print(f"ERROR: File not found: {path}", file=sys.stderr)
        return 1

    try:
        markdown = path.read_text(encoding="utf-8")
        parsed = parse_brief(path, markdown)
        row = {
            **parsed,
            "published": bool(args.publish),
        }
        result = upsert_brief(
            supabase_url=supabase_url,
            service_role_key=service_key,
            row=row,
        )
    except Exception as exc:
        print(f"ERROR: Failed to ingest {path.name}: {exc}", file=sys.stderr)
        return 1

    print("SUCCESS: Upserted ivs_briefs row")
    print(f"  file:         {path}")
    print(f"  brief_date:   {result.get('brief_date') or parsed['brief_date']}")
    print(f"  title:        {result.get('title') or parsed['title']}")
    print(f"  signal_level: {result.get('signal_level') or parsed.get('signal_level')}")
    print(f"  items:        {len(parsed['items'])}")
    print(f"  published:    {result.get('published', args.publish)}")
    print(f"  id:           {result.get('id', '(unknown)')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
