#!/usr/bin/env python3
"""One-time Pass 1 hide of polluted ivs_articles rows. Never deletes.

Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from ../ivs_news/.env or .env.local
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
PIPELINE = REPO.parent / "ivs_news"
sys.path.insert(0, str(PIPELINE))

from news_quality import (  # noqa: E402
    FORASOFT_VISIBLE_CAP,
    HIDDEN_SOURCE,
    canonicalize_article_url,
    canonical_url_key,
    hostname,
    is_cfp_or_tagline,
    is_docs_homepage,
    is_heading_title,
    is_product_landing,
    is_quality_article_image,
    parse_iso_datetime,
)


def load_env(path: Path) -> None:
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
        value = value.strip().strip('"').strip("'")
        if key and os.environ.get(key) is None:
            os.environ[key] = value


def rest(
    url: str,
    key: str,
    path_qs: str,
    method: str = "GET",
    body: dict | None = None,
    prefer: str = "count=exact",
) -> tuple[str | None, object]:
    data = None if body is None else json.dumps(body).encode()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Prefer": prefer,
    }
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(
        url.rstrip("/") + "/rest/v1/" + path_qs,
        data=data,
        headers=headers,
        method=method,
    )
    with urllib.request.urlopen(req) as response:
        raw = response.read().decode()
        cr = response.headers.get("content-range")
        return cr, json.loads(raw) if raw else None


def patch_ids(url: str, key: str, ids: list[str], payload: dict) -> int:
    if not ids:
        return 0
    updated = 0
    chunk_size = 40
    for start in range(0, len(ids), chunk_size):
        chunk = ids[start : start + chunk_size]
        quoted = ",".join(chunk)
        rest(
            url,
            key,
            f"ivs_articles?id=in.({quoted})",
            method="PATCH",
            body=payload,
            prefer="return=minimal",
        )
        updated += len(chunk)
    return updated


def should_hide(row: dict, fora_keep_ids: set[str]) -> str | None:
    title = row.get("title") or ""
    href = row.get("url") or ""
    if row.get("id") in fora_keep_ids:
        return None
    if not row.get("published_at"):
        return "null published_at"
    if (title or "").lstrip().startswith("#"):
        return "hashtag title"
    if is_heading_title(title):
        return "heading title"
    if is_cfp_or_tagline(title, href):
        return "CFP/tagline"
    if is_docs_homepage(href, title):
        return "docs homepage"
    if is_product_landing(title, href):
        return "product landing"
    if hostname(href) == "forasoft.com":
        return "fora soft extra"
    return None


def main() -> int:
    load_env(PIPELINE / ".env")
    load_env(REPO / ".env.local")
    load_env(REPO / ".env")
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
        "NEXT_PUBLIC_SUPABASE_URL"
    )
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print("ERROR: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return 1

    _cr, rows = rest(
        supabase_url,
        service_key,
        "ivs_articles?select=id,title,url,published_at,source,image&order=published_at.desc.nullslast",
    )
    if not isinstance(rows, list):
        print("ERROR: unexpected article payload")
        return 1

    fora = [
        row
        for row in rows
        if hostname(row.get("url")) == "forasoft.com"
        and parse_iso_datetime(row.get("published_at")) is not None
    ]
    fora.sort(
        key=lambda row: parse_iso_datetime(row.get("published_at"))
        or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    fora_keep = fora[:FORASOFT_VISIBLE_CAP]
    fora_keep_ids = {row["id"] for row in fora_keep}

    hide_ids: list[str] = []
    hide_reasons: dict[str, int] = {}
    keep_visible: list[dict] = []
    already_hidden = 0

    # www vs bare: among rows we would otherwise keep, hide extras.
    canonical_first: dict[str, str] = {}

    for row in rows:
        if (row.get("source") or "").lower() == HIDDEN_SOURCE:
            already_hidden += 1
            continue
        reason = should_hide(row, fora_keep_ids)
        if reason:
            hide_ids.append(row["id"])
            hide_reasons[reason] = hide_reasons.get(reason, 0) + 1
            continue
        key = canonical_url_key(row.get("url"))
        if key in canonical_first:
            hide_ids.append(row["id"])
            hide_reasons["www/bare duplicate"] = (
                hide_reasons.get("www/bare duplicate", 0) + 1
            )
            continue
        if key:
            canonical_first[key] = row["id"]
        keep_visible.append(row)

    unique_hide = list(dict.fromkeys(hide_ids))
    patched = patch_ids(
        supabase_url,
        service_key,
        unique_hide,
        {"source": HIDDEN_SOURCE},
    )

    # Null junk thumbnails on remaining visible rows (do not delete the row).
    image_cleared = 0
    for row in keep_visible:
        image = row.get("image")
        if image and not is_quality_article_image(image):
            rest(
                supabase_url,
                service_key,
                f"ivs_articles?id=eq.{row['id']}",
                method="PATCH",
                body={"image": None},
                prefer="return=minimal",
            )
            row["image"] = None
            image_cleared += 1
        # Known Naruto Fora Soft cover — explicit Pass 1 acceptance.
        if image and "rec-ai-cover" in (image or "").lower():
            rest(
                supabase_url,
                service_key,
                f"ivs_articles?id=eq.{row['id']}",
                method="PATCH",
                body={"image": None},
                prefer="return=minimal",
            )
            row["image"] = None
            image_cleared += 1

        canonical = canonicalize_article_url(row.get("url"))
        if canonical and canonical != row.get("url"):
            try:
                rest(
                    supabase_url,
                    service_key,
                    f"ivs_articles?id=eq.{row['id']}",
                    method="PATCH",
                    body={"url": canonical},
                    prefer="return=minimal",
                )
            except urllib.error.HTTPError as exc:
                print(
                    f"canonical url skip {row.get('title', '')[:60]}: {exc.read()[:120]!r}"
                )

    visible_after = len(rows) - already_hidden - patched
    print("HIDE SUMMARY")
    print(f"  total rows:        {len(rows)}")
    print(f"  already hidden:    {already_hidden}")
    print(f"  newly hidden:      {patched}")
    print(f"  visible remaining: {visible_after}")
    print(f"  images nulled:     {image_cleared}")
    print("  hide reasons:")
    for reason, count in sorted(hide_reasons.items(), key=lambda item: -item[1]):
        print(f"    {count:3d}  {reason}")
    print("  Fora Soft kept:")
    for row in fora_keep:
        print(f"    {row.get('published_at')}  {row.get('title')}")
        print(f"      {row.get('url')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
