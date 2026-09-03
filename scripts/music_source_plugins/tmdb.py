from __future__ import annotations

import re
from urllib.parse import urlparse

from . import PageContext


def text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", value)).strip()


class TmdbPlugin:
    name = "tmdb"

    def matches(self, url: str) -> bool:
        host = urlparse(url).netloc.lower()
        return "themoviedb.org" in host or host.endswith("tmdb.org")

    def enrich(self, context: PageContext) -> None:
        page = context.page
        release = re.search(r'<span class="release">\s*([^<]+)', page)
        if release:
            context.source["published"] = text(release.group(1))

        genres = re.search(r'<span class="genres">(.*?)</span>', page, re.DOTALL)
        if genres:
            context.source["genres"] = [text(name) for name in re.findall(r">([^<]+)</a>", genres.group(1))]

        runtime = re.search(r'<span class="runtime">\s*([^<]+)', page)
        if runtime:
            context.source["runtime"] = text(runtime.group(1))

        people = re.findall(r'<li class="profile">(.*?)</li>', page, re.DOTALL)
        directors = []
        for person in people:
            if re.search(r'class="character">[^<]*Director', person):
                match = re.search(r'<a [^>]*>([^<]+)</a>', person)
                if match:
                    directors.append(text(match.group(1)))
        if directors:
            context.source["directors"] = directors

        cover = context.source.get("cover")
        if isinstance(cover, str) and "/w500/" in cover:
            high_resolution = cover.replace("/w500/", "/w1280/")
            context.source["cover"] = high_resolution
            context.source["cover_candidates"] = [high_resolution]


plugin = TmdbPlugin()
