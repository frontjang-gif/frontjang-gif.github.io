from urllib.parse import urlparse

from . import PageContext


class ImslpPlugin:
    name = "imslp"

    def matches(self, url: str) -> bool:
        return "imslp.org" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "imslp"
        context.source["reference"] = {"type": "score_catalogue", "url": context.url}


plugin = ImslpPlugin()
