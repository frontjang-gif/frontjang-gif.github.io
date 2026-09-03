import re
from urllib.parse import urlparse

from . import PageContext


class AmazonPlugin:
    name = "amazon"

    def matches(self, url: str) -> bool:
        return "amazon." in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "retailer"
        match = re.search(r"/(?:dp|gp/product)/([A-Z0-9]{10})(?:[/?]|$)", urlparse(context.url).path, re.I)
        if match:
            context.source["asin"] = match.group(1).upper()


plugin = AmazonPlugin()
