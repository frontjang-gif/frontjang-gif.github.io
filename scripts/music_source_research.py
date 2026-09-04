#!/usr/bin/env python3
"""Collect auditable source material before importing music or movie posts.

This deliberately writes a research packet rather than a published post. Titles,
credits, canonical work names, and cover rights still need human review before
they are added below _posts/Music/ or _posts/Movie/.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from music_source_plugins import PageContext, SourcePlugin, discover


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value).replace("\xa0", " ")).strip()


def source_kind(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if "tistory.com" in host:
        return "original"
    if "wikipedia.org" in host:
        return "wikipedia"
    if "imslp.org" in host:
        return "imslp"
    if "discogs.com" in host:
        return "discogs"
    if "allmusic.com" in host:
        return "allmusic"
    if "amazon." in host:
        return "amazon"
    if "music.apple.com" in host:
        return "apple_music"
    if "warnerclassics.com" in host:
        return "recording_company"
    if any(name in host for name in ("imdb.com", "themoviedb.org", "tmdb.org", "letterboxd.com", "rottentomatoes.com")):
        return "movie_database"
    if "naxos.com" in host:
        return "catalogue"
    if any(name in host for name in ("decca", "dg", "universal-music", "universalmusic")):
        return "recording_company"
    return "web"


class PageParser(HTMLParser):
    """Small dependency-free extractor for metadata, JSON-LD, and article text."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.title_parts: list[str] = []
        self.article_parts: list[str] = []
        self.images: list[str] = []
        self.json_ld: list[str] = []
        self._in_title = False
        self._json_depth = 0
        self._json_parts: list[str] = []
        self._article_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "meta":
            key = (attributes.get("property") or attributes.get("name") or "").lower()
            value = attributes.get("content")
            if key and value and key not in self.meta:
                self.meta[key] = value
        elif tag == "title":
            self._in_title = True
        elif tag == "script" and "ld+json" in (attributes.get("type") or "").lower():
            self._json_depth = 1
            self._json_parts = []
        elif self._json_depth:
            self._json_depth += 1

        classes = attributes.get("class") or ""
        identifier = attributes.get("id") or ""
        if tag in {"article", "main"} or any(
            marker in f"{classes} {identifier}".lower()
            for marker in ("entry-content", "article-view", "article-content", "post-content")
        ):
            self._article_depth += 1
        elif self._article_depth and tag in {"p", "br", "li", "div", "h1", "h2", "h3", "h4", "h5"}:
            self.article_parts.append("\n")

        if tag == "img":
            image = attributes.get("data-url") or attributes.get("src")
            if image and image.startswith("http"):
                self.images.append(image)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        if self._json_depth:
            self._json_depth -= 1
            if self._json_depth == 0:
                self.json_ld.append("".join(self._json_parts))
        if self._article_depth and tag in {"article", "main", "div"}:
            self._article_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)
        if self._json_depth:
            self._json_parts.append(data)
        if self._article_depth:
            self.article_parts.append(data)


def fetch(url: str) -> str:
    import os

    # Try Playwright first for problematic sites like Discogs
    use_playwright = os.environ.get("USE_PLAYWRIGHT", "").lower() in ("1", "true", "yes")
    is_discogs = "discogs.com" in url

    if use_playwright or is_discogs:
        result = _try_playwright_fetch(url)
        if result:
            return result

    # Fall back to urllib
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    # Add Discogs API token if available (for Discogs API requests)
    discogs_token = os.environ.get("DISCOGS_TOKEN")
    if discogs_token and "discogs.com" in url:
        headers["Authorization"] = f"Discogs token={discogs_token}"

    request = Request(url, headers=headers)
    with urlopen(request, timeout=20) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def _try_playwright_fetch(url: str) -> str | None:
    """Try fetching with Playwright if available, return None if not installed or fails."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
            context = browser.new_context()
            page = context.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            content = page.content()
            browser.close()
            return content
    except Exception as e:
        # Silently fail and fall back to urllib
        return None


def json_objects(raw_json: list[str]) -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []
    for raw in raw_json:
        try:
            value = json.loads(raw)
        except json.JSONDecodeError:
            continue
        queue = value if isinstance(value, list) else [value]
        while queue:
            item = queue.pop(0)
            if isinstance(item, dict):
                objects.append(item)
                graph = item.get("@graph")
                if isinstance(graph, list):
                    queue.extend(graph)
    return objects


def names(value: Any) -> list[str]:
    if isinstance(value, str):
        return [clean(value)]
    if isinstance(value, dict):
        return names(value.get("name"))
    if isinstance(value, list):
        return [name for item in value for name in names(item)]
    return []


def extract_tracks(article_text: str, objects: list[dict[str, Any]]) -> list[str]:
    tracks: list[str] = []
    for item in objects:
        types = item.get("@type", [])
        types = [types] if isinstance(types, str) else types
        if "MusicAlbum" not in types:
            continue
        track_value = item.get("track", [])
        for track in track_value if isinstance(track_value, list) else [track_value]:
            if isinstance(track, dict) and track.get("name"):
                tracks.append(clean(str(track["name"])))
    if tracks:
        return list(dict.fromkeys(tracks))

    for line in article_text.splitlines():
        line = clean(line)
        if re.match(r"^\d+[A-Za-z]?\.\s+(?:\d+\.\s+)?\S", line):
            tracks.append(line)
    return tracks


def movie_details(objects: list[dict[str, Any]]) -> dict[str, Any]:
    movie = next(
        (
            item
            for item in objects
            if "Movie" in ([item.get("@type")] if isinstance(item.get("@type"), str) else item.get("@type", []))
        ),
        {},
    )
    genres = movie.get("genre", [])
    genres = [genres] if isinstance(genres, str) else genres
    return {
        "directors": names(movie.get("director")),
        "cast": names(movie.get("actor")),
        "genres": [clean(str(genre)) for genre in genres if clean(str(genre))],
        "runtime": movie.get("duration"),
    }


def parse_page(
    url: str,
    page: str,
    plugins: list[SourcePlugin] | None = None,
    media_type: str = "music",
) -> dict[str, Any]:
    parser = PageParser()
    parser.feed(page)
    objects = json_objects(parser.json_ld)
    media_records = []
    expected_type = "MusicAlbum" if media_type == "music" else "Movie"
    for item in objects:
        types = item.get("@type", [])
        types = [types] if isinstance(types, str) else types
        if expected_type in types:
            media_records.append(item)
    record = media_records[0] if media_records else {}
    article_text = "\n".join(clean(part) for part in "".join(parser.article_parts).splitlines() if clean(part))
    title = clean(
        parser.meta.get("og:title")
        or str(record.get("name") or "")
        or " ".join(parser.title_parts)
    )
    cover = parser.meta.get("og:image") or record.get("image") or (parser.images[0] if parser.images else None)
    if isinstance(cover, dict):
        cover = cover.get("url")
    source = {
        "url": url,
        "kind": source_kind(url),
        "title": title or None,
        "published": parser.meta.get("article:published_time") or parser.meta.get("date"),
        "description": clean(parser.meta.get("og:description") or parser.meta.get("description") or "") or None,
        "cover": cover,
        "artists": names(record.get("byArtist")),
        "tracks": extract_tracks(article_text, objects) if media_type == "music" else [],
        "article_text": article_text or None,
    }
    if media_type == "movie":
        source.update(movie_details(objects))
    applied = []
    for plugin in plugins or []:
        if plugin.matches(url):
            plugin.enrich(PageContext(url, page, parser, objects, source))
            applied.append(plugin.name)
    if applied:
        source["plugins"] = applied
    return source


def wikipedia_search(query: str) -> dict[str, str] | None:
    endpoint = "https://en.wikipedia.org/w/api.php?" + urlencode(
        {"action": "query", "list": "search", "srsearch": query, "format": "json", "srlimit": 1}
    )
    payload = json.loads(fetch(endpoint))
    results = payload.get("query", {}).get("search", [])
    if not results:
        return None
    title = results[0]["title"]
    return {"kind": "wikipedia", "title": title, "url": "https://en.wikipedia.org/wiki/" + title.replace(" ", "_")}


def render_markdown(packet: dict[str, Any]) -> str:
    lines = ["# Music import research", "", "## Source candidates", ""]
    for source in packet["sources"]:
        lines.append(f"- **{source['kind']}**: [{source.get('title') or source['url']}]({source['url']})")
    lines += ["", "## Extracted candidates", ""]
    for key in ("title", "published", "cover"):
        value = packet["candidates"].get(key)
        if value:
            lines.append(f"- {key}: {value}")
    if packet["candidates"].get("artists"):
        lines.append("- artists: " + ", ".join(packet["candidates"]["artists"]))
    if packet["candidates"].get("tracks"):
        lines += ["", "## Extracted tracks (verify canonical spelling)", ""]
        lines.extend(f"- {track}" for track in packet["candidates"]["tracks"])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Gather source material for a music or movie import.")
    parser.add_argument("urls", nargs="+", help="Original post and corroborating catalogue URLs.")
    parser.add_argument("--media-type", choices=("music", "movie"), default="music", help="Type of post being researched (default: music).")
    parser.add_argument("--wikipedia", action="append", default=[], metavar="QUERY", help="Search Wikipedia and add its top result as a reference.")
    parser.add_argument("--output", type=Path, help="Write a JSON research packet to this path.")
    parser.add_argument("--markdown", type=Path, help="Also write a human-readable research summary.")
    parser.add_argument(
        "--plugin-dir",
        action="append",
        default=[],
        type=Path,
        metavar="DIRECTORY",
        help="Load additional source plugins from this directory (may be repeated).",
    )
    args = parser.parse_args()

    try:
        plugins = discover(args.plugin_dir)
    except ValueError as error:
        raise SystemExit(str(error)) from error

    sources = []
    for url in args.urls:
        try:
            sources.append(parse_page(url, fetch(url), plugins, args.media_type))
        except OSError as error:
            raise SystemExit(f"Could not fetch {url}: {error}") from error
    for query in args.wikipedia:
        result = wikipedia_search(query)
        if result:
            sources.append(result)

    primary = sources[0]
    corroborating = next((source for source in sources[1:] if source.get("kind") == "recording_company"), {})
    candidates = {
        "title": primary.get("title"),
        "published": primary.get("published"),
        "cover": primary.get("cover"),
    }
    if args.media_type == "music":
        candidates.update({
            "artists": corroborating.get("artists") or primary.get("artists") or [],
            "tracks": corroborating.get("tracks") or primary.get("tracks") or [],
        })
    else:
        candidates.update({
            "directors": primary.get("directors") or [],
            "cast": primary.get("cast") or [],
            "genres": primary.get("genres") or [],
            "runtime": primary.get("runtime"),
        })
    packet = {
        "schema_version": 1,
        "media_type": args.media_type,
        "sources": sources,
        "candidates": candidates,
        "review_required": [
            "Use verified primary and reference sources for names, credits, and release data.",
            "For music, use canonical composer and work spellings from verified Wikipedia or IMSLP pages.",
            "Use a cover at least 1000px wide; do not publish a low-resolution social preview.",
        ],
    }
    output = json.dumps(packet, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        sys.stdout.write(output)
    if args.markdown:
        args.markdown.parent.mkdir(parents=True, exist_ok=True)
        args.markdown.write_text(render_markdown(packet), encoding="utf-8")


if __name__ == "__main__":
    main()
