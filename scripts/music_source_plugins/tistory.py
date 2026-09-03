from __future__ import annotations

from urllib.parse import urlparse

from . import PageContext


class TistoryPlugin:
    name = "tistory"

    def matches(self, url: str) -> bool:
        return "tistory.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "original"
        # Tistory's OG image is frequently a resized preview. Preserve the
        # original image URL as an explicit candidate for later size checking.
        direct_images = list(dict.fromkeys(context.parser.images))
        if direct_images:
            context.source["cover_candidates"] = direct_images


plugin = TistoryPlugin()
