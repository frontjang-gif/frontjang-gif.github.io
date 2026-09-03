import re
from urllib.parse import urljoin, urlparse

from . import PageContext


class WarnerClassicsPlugin:
    name = "warner_classics"

    def matches(self, url: str) -> bool:
        return "warnerclassics.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "recording_company"
        context.source["recording_company"] = "Warner Classics"
        barcode = re.search(r"Barcode:\s*([0-9]{12,14})", context.page, re.I)
        if barcode:
            context.source["barcode"] = barcode.group(1)

        cover_paths = re.findall(
            r'(?:src|srcset)="(/sites/default/files/styles/release_and_playlist_cover_[^\"?]+)',
            context.page,
        )
        if cover_paths:
            context.source["cover_candidates"] = list(
                dict.fromkeys(urljoin(context.url, path) for path in cover_paths)
            )


plugin = WarnerClassicsPlugin()
