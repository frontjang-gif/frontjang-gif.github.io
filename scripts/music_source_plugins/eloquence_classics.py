import re
from urllib.parse import urlparse

from . import PageContext


class EloquenceClassicsPlugin:
    """Extract stable catalogue and cover data from official Eloquence pages."""

    name = "eloquence_classics"

    def matches(self, url: str) -> bool:
        return "eloquenceclassics.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "recording_company"
        context.source["recording_company"] = "Decca"
        catalogue = re.search(r"\b(\d{7})\b", context.url)
        if not catalogue:
            catalogue = re.search(r"/uploads/[^\"'\s]*/(\d{7})(?:-|\.)", context.page)
        if catalogue:
            context.source["catalogue_number"] = catalogue.group(1)

        covers = re.findall(
            r"https?://[^\"'\s]+/uploads/[^\"'\s]+?-1024x1024\.(?:jpg|jpeg|webp|png)",
            context.page,
            re.I,
        )
        if covers:
            context.source["cover_candidates"] = list(dict.fromkeys(covers))


plugin = EloquenceClassicsPlugin()
