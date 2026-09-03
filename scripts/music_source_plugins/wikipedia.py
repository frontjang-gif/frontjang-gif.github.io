from urllib.parse import urlparse

from . import PageContext


class WikipediaPlugin:
    name = "wikipedia"

    def matches(self, url: str) -> bool:
        return "wikipedia.org" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "wikipedia"
        context.source["reference"] = {"type": "encyclopedia", "url": context.url}


plugin = WikipediaPlugin()
