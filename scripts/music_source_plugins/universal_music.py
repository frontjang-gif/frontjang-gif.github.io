from __future__ import annotations

from urllib.parse import urlparse

from . import PageContext


class UniversalMusicPlugin:
    name = "universal_music"

    def matches(self, url: str) -> bool:
        return "universalmusic" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "recording_company"
        context.source["recording_company"] = "Universal Music"


plugin = UniversalMusicPlugin()
