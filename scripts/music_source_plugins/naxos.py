from urllib.parse import parse_qs, urlparse

from . import PageContext


class NaxosPlugin:
    name = "naxos"

    def matches(self, url: str) -> bool:
        return "naxos.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "catalogue"
        catalogue_number = parse_qs(urlparse(context.url).query).get("id", [None])[0]
        if catalogue_number:
            context.source["catalogue_number"] = catalogue_number


plugin = NaxosPlugin()
