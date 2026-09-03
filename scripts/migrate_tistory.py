#!/usr/bin/env python3
"""Inventory and stage a complete Tistory migration without publishing blindly.

The default command reads the site's sitemap and writes an auditable manifest.
Use ``--research`` to collect each pending post's metadata and article text, and
``--write-drafts`` to create review-only Markdown drafts outside ``_posts``.
This keeps Music and Movie imports subject to their canonical-metadata review.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen

from music_source_research import discover, fetch, parse_page


POST_ID = re.compile(r"https?://[^/]+/(\d+)(?!\d)")
ENTRY_INFO = re.compile(r"window\.T\.entryInfo\s*=\s*(\{.*?\});", re.DOTALL)


def post_id(url: str) -> str | None:
    match = POST_ID.match(url)
    return match.group(1) if match else None


def sitemap_post_urls(xml_text: str, site_url: str) -> list[str]:
    root = ET.fromstring(xml_text)
    urls = []
    site_host = urlparse(site_url).netloc.lower()
    for location in root.findall("{*}url/{*}loc"):
        url = (location.text or "").strip()
        if urlparse(url).netloc.lower() == site_host and post_id(url):
            urls.append(url)
    return list(dict.fromkeys(urls))


def fetch_sitemap(url: str) -> str:
    """Fetch XML without HTML-only Accept headers, which Tistory rejects."""
    with urlopen(url, timeout=20) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def imported_post_ids(posts_root: Path, site_url: str) -> set[str]:
    host = re.escape(urlparse(site_url).netloc)
    pattern = re.compile(rf"https?://{host}/(\d+)(?!\d)", re.IGNORECASE)
    imported: set[str] = set()
    for path in posts_root.glob("**/*.md"):
        imported.update(pattern.findall(path.read_text(encoding="utf-8")))
    return imported


def entry_category(page: str) -> dict[str, Any]:
    match = ENTRY_INFO.search(page)
    if not match:
        return {}
    try:
        entry = json.loads(match.group(1))
    except json.JSONDecodeError:
        return {}
    return {
        "id": entry.get("categoryId"),
        "label": entry.get("categoryLabel"),
    }


def draft_filename(record: dict[str, Any]) -> str:
    published = (record.get("published") or "")[:10]
    date = published if re.fullmatch(r"\d{4}-\d{2}-\d{2}", published) else "undated"
    safe_title = re.sub(r"[^a-z0-9]+", "-", (record.get("title") or "untitled").lower()).strip("-")
    return f"{date}-{record['id']}-{safe_title[:80] or 'untitled'}.md"


def render_draft(record: dict[str, Any]) -> str:
    title = json.dumps(record.get("title") or "Untitled", ensure_ascii=False)
    category = json.dumps(record.get("tistory_category", {}), ensure_ascii=False)
    lines = [
        "---",
        f"title: {title}",
        f"date: {(record.get('published') or '')[:10]}",
        "migration_status: review_required",
        f"original_url: {record['url']}",
        f"tistory_category: {category}",
        "---",
        "",
        "<!-- Review category, canonical metadata, and media before moving this draft into _posts/. -->",
        "",
        record.get("article_text") or "",
        "",
    ]
    return "\n".join(lines)


def build_manifest(
    site_url: str,
    sitemap_xml: str,
    imported_ids: set[str],
    *,
    limit: int | None = None,
) -> dict[str, Any]:
    records = []
    for url in sitemap_post_urls(sitemap_xml, site_url):
        identifier = post_id(url)
        assert identifier
        records.append({"id": identifier, "url": url, "status": "imported" if identifier in imported_ids else "pending"})
    if limit is not None:
        records = records[:limit]
    return {
        "schema_version": 1,
        "site": site_url.rstrip("/"),
        "total": len(records),
        "imported": sum(record["status"] == "imported" for record in records),
        "pending": sum(record["status"] == "pending" for record in records),
        "posts": records,
    }


def research_record(record: dict[str, Any], draft_dir: Path | None, plugins: list[Any]) -> None:
    try:
        page = fetch(record["url"])
        source = parse_page(record["url"], page, plugins)
        record.update({key: value for key, value in source.items() if key != "url"})
        record["tistory_category"] = entry_category(page)
        record["status"] = "drafted" if draft_dir else "researched"
        if draft_dir:
            draft_dir.mkdir(parents=True, exist_ok=True)
            (draft_dir / draft_filename(record)).write_text(render_draft(record), encoding="utf-8")
    except OSError as error:
        record["status"] = "error"
        record["error"] = str(error)


def research_pending(manifest: dict[str, Any], draft_dir: Path | None = None, workers: int = 6) -> None:
    plugins = discover()
    pending = [record for record in manifest["posts"] if record["status"] == "pending"]
    with ThreadPoolExecutor(max_workers=workers) as executor:
        list(executor.map(lambda record: research_record(record, draft_dir, plugins), pending))


def merge_previous_research(manifest: dict[str, Any], previous_path: Path) -> None:
    """Resume a large migration without re-fetching already drafted posts."""
    previous = json.loads(previous_path.read_text(encoding="utf-8"))
    records = {record.get("id"): record for record in previous.get("posts", [])}
    for record in manifest["posts"]:
        if record["status"] == "imported":
            continue
        old = records.get(record["id"])
        if old and old.get("status") in {"drafted", "researched", "error"}:
            record.update({key: value for key, value in old.items() if key not in {"id", "url", "status"}})
            record["status"] = old["status"]


def remove_imported_drafts(draft_dir: Path, imported_ids: set[str]) -> int:
    """Remove only review drafts whose explicit original URL is already published."""
    if not draft_dir.is_dir():
        return 0
    removed = 0
    for path in draft_dir.glob("*.md"):
        source = re.search(r"^original_url:\s*(\S+)\s*$", path.read_text(encoding="utf-8"), re.MULTILINE)
        if source and post_id(source.group(1)) in imported_ids:
            path.unlink()
            removed += 1
    return removed


def main() -> None:
    parser = argparse.ArgumentParser(description="Inventory and stage Tistory posts for migration.")
    parser.add_argument("--site", required=True, help="Tistory blog URL, e.g. https://frontjang1.tistory.com")
    parser.add_argument("--sitemap", help="Sitemap URL (defaults to <site>/sitemap.xml)")
    parser.add_argument("--posts-root", type=Path, default=Path("_posts"), help="Existing destination posts directory.")
    parser.add_argument("--output", type=Path, required=True, help="Write the migration manifest JSON here.")
    parser.add_argument("--research", action="store_true", help="Fetch pending posts and add extracted source data to the manifest.")
    parser.add_argument("--write-drafts", type=Path, metavar="DIRECTORY", help="Write review-only drafts here; requires --research.")
    parser.add_argument("--workers", type=int, default=6, help="Concurrent source requests while researching (default: 6).")
    parser.add_argument("--resume", type=Path, metavar="MANIFEST", help="Reuse research records from an earlier manifest.")
    parser.add_argument("--limit", type=int, help="Limit sitemap records, useful for a small migration batch.")
    args = parser.parse_args()
    if args.write_drafts and not args.research:
        parser.error("--write-drafts requires --research")
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    if args.workers < 1:
        parser.error("--workers must be positive")

    site = args.site.rstrip("/")
    sitemap = args.sitemap or urljoin(f"{site}/", "sitemap.xml")
    imported = imported_post_ids(args.posts_root, site)
    manifest = build_manifest(site, fetch_sitemap(sitemap), imported, limit=args.limit)
    if args.resume:
        merge_previous_research(manifest, args.resume)
    removed = remove_imported_drafts(args.write_drafts, imported) if args.write_drafts else 0
    if args.research:
        research_pending(manifest, args.write_drafts, args.workers)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.output}: {manifest['pending']} pending, {manifest['imported']} already imported, {removed} stale draft(s) removed.")


if __name__ == "__main__":
    main()
