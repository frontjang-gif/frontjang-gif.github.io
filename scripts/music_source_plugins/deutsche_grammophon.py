import re
from urllib.parse import urlparse

from . import PageContext


class DeutscheGrammophonPlugin:
    name = "deutsche_grammophon"

    def matches(self, url: str) -> bool:
        return "deutschegrammophon.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "recording_company"
        context.source["recording_company"] = "Deutsche Grammophon"
        upc = re.search(r"\bUPC\s*</[^>]+>\s*<[^>]+>\s*([0-9]{12,14})", context.page, re.I)
        if not upc:
            upc = re.search(r'"(?:upc|gtin(?:13)?)"\s*:\s*"?([0-9]{12,14})', context.page, re.I)
        if upc:
            context.source["upc"] = upc.group(1)

        image_urls = re.findall(
            r"https://images\.universal-music\.de/img/assets/[^\"'\s]+?\.jpg",
            context.page,
        )
        candidates = []
        for image_url in image_urls:
            candidate = image_url.replace("/{ratio}/{width}/", "/4/2048/")
            candidate = re.sub(r"/\d+/(?:1280|1200|1024|768|568|480|380|288|160)/", "/4/2048/", candidate)
            candidates.append(candidate)
        if candidates:
            context.source["cover_candidates"] = list(dict.fromkeys(candidates))


plugin = DeutscheGrammophonPlugin()
