import re
from urllib.parse import urlparse

from . import PageContext


class DiscogsPlugin:
    name = "discogs"

    def matches(self, url: str) -> bool:
        return "discogs.com" in urlparse(url).netloc.lower()

    def enrich(self, context: PageContext) -> None:
        context.source["kind"] = "secondary_catalogue"
        context.source["metadata_reliability"] = "secondary"

        # Extract release year from Discogs page
        # Look for multiple patterns: "Released 1987", "℗ 1987", "© 1987", etc.
        year_patterns = [
            r'[℗©]\s*(\d{4})',                                    # Copyright/phonogram symbol
            r'(?:Released|Rel\.|released on)[\s\w]*?(\d{4})',     # Release keywords
            r'(\d{4})\s*(?:Vinyl|CD|LP|Record|Release|Pressing)',  # Year before format
            r'Year[:\s]*(\d{4})',                                  # Explicit year label
        ]

        for pattern in year_patterns:
            year_match = re.search(pattern, context.page, re.IGNORECASE)
            if year_match:
                year = year_match.group(1)
                if 1900 <= int(year) <= 2100:  # Sanity check
                    context.source["release_year"] = year
                    break

        # Extract catalogue number from Discogs
        # Look for explicit Catalog# or Cat# patterns with alphanumeric codes
        catalog_patterns = [
            r'(?:Catalog|Cat)\s*#?\s*[:=\s]\s*([A-Z]{1,4}[0-9\-\.]+)',  # Label + number (e.g., SPLP-1052)
            r'Catalog\s*Number\s*[:=\s]\s*([A-Z0-9\-\.]+)',              # Explicit "Catalog Number"
        ]

        for pattern in catalog_patterns:
            catalog_match = re.search(pattern, context.page, re.IGNORECASE)
            if catalog_match:
                number = catalog_match.group(1).strip()
                # Filter out URLs and other false positives
                if not any(x in number for x in ['/', '.com', 'http', '://']):
                    context.source["catalogue_number"] = number
                    break

        # Try to get from JSON-LD if available
        for obj in context.json_ld:
            if obj.get("@type") == "MusicAlbum" or "MusicAlbum" in obj.get("@type", []):
                if "datePublished" in obj and not context.source.get("release_year"):
                    date_str = obj["datePublished"]
                    year_match = re.search(r'(\d{4})', date_str)
                    if year_match:
                        context.source["release_year"] = year_match.group(1)


plugin = DiscogsPlugin()
