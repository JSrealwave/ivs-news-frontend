#!/usr/bin/env python3
"""One-shot: upsert thin ivs_articles rows for every published brief source URL.

Does not delete hidden junk. Un-hides only URLs a brief actually cited.
"""

from __future__ import annotations

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from ingest_brief import (  # noqa: E402
    bootstrap_env,
    load_env_file,
    rest_json,
    upsert_brief_source_articles,
)
import os  # noqa: E402


def main() -> int:
    repo_root = SCRIPT_DIR.parent
    bootstrap_env(repo_root)
    load_env_file(repo_root.parent / "ivs_news" / ".env")

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
        "NEXT_PUBLIC_SUPABASE_URL"
    )
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print("ERROR: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        return 1

    briefs = (
        rest_json(
            supabase_url=supabase_url,
            service_role_key=service_key,
            path_qs=(
                "ivs_briefs?select=brief_date,items,published"
                "&published=eq.true&order=brief_date.desc"
            ),
        )
        or []
    )

    totals = {
        "briefs": 0,
        "items": 0,
        "inserted": 0,
        "updated": 0,
        "unhidden": 0,
        "skipped": 0,
        "errors": 0,
    }
    for brief in briefs:
        brief_date = str(brief.get("brief_date") or "")
        items = brief.get("items") if isinstance(brief.get("items"), list) else []
        if not brief_date:
            continue
        totals["briefs"] += 1
        stats = upsert_brief_source_articles(
            supabase_url=supabase_url,
            service_role_key=service_key,
            brief_date=brief_date,
            items=items,
        )
        for key in ("items", "inserted", "updated", "unhidden", "skipped", "errors"):
            totals[key] += stats[key]
        print(
            f"{brief_date}  items={stats['items']} "
            f"ins={stats['inserted']} upd={stats['updated']} "
            f"unhide={stats['unhidden']} skip={stats['skipped']} err={stats['errors']}"
        )

    print("BACKFILL TOTALS", totals)
    return 0 if totals["errors"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
