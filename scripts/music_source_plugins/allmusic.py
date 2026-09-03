from urllib.parse import urlparse

from . import PageContext


class AllMusicPlugin:
    name = "allmusic"

    def matches(self, url: str) -> bool:
        return "allmusic.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "secondary_catalogue"
        context.source["metadata_reliability"] = "secondary"


plugin = AllMusicPlugin()
