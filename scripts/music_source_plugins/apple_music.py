from urllib.parse import urlparse

from . import PageContext


class AppleMusicPlugin:
    name = "apple_music"

    def matches(self, url: str) -> bool:
        return "music.apple.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "apple_music"
        item_id = urlparse(context.url).path.rstrip("/").split("/")[-1]
        if item_id.isdigit():
            context.source["catalogue_id"] = item_id
        cover = context.source.get("cover")
        if isinstance(cover, str) and "mzstatic.com" in cover:
            square = cover.rsplit("/", 1)[0] + "/1200x1200bb.jpg"
            context.source["cover_candidates"] = list(dict.fromkeys([square, cover]))


plugin = AppleMusicPlugin()
