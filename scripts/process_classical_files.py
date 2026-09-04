#!/usr/bin/env python3
"""
Validate Classical music files before promotion from _imports to _posts/Classical/.

Applies formatting rules and prepares files for review:
- Removes blank lines between hierarchy levels (composer, work, tracks)
- Structures album content properly
- Validates front matter format
- Refuses incomplete artist credits and unverified cover images
- Requires explicit --write before changing a file
"""

import re
import sys
from pathlib import Path
from urllib.parse import urlparse
import yaml


PLACEHOLDER_COVER_MARKERS = ("[image-url]", "example.com", "placeholder")
SECONDARY_COVER_HOSTS = ("discogs.com", "allmusic.com")
CURRENT_FRONTMATTER_VERSION = 2


def upgrade_frontmatter(metadata):
    """Normalize supported legacy front matter to the current schema."""
    upgraded = dict(metadata or {})
    version = upgraded.get("frontmatterVersion", 1)
    if not isinstance(version, int):
        raise ValueError("frontmatterVersion must be an integer")
    if version > CURRENT_FRONTMATTER_VERSION:
        raise ValueError(
            f"Unsupported frontmatterVersion {version}; this tool supports up to {CURRENT_FRONTMATTER_VERSION}"
        )

    if version < 2:
        # Version 1 used media-specific path keys. A generic folder replaces both.
        upgraded.setdefault("folder", upgraded.pop("musicFolder", upgraded.pop("movieFolder", "")))

    upgraded["frontmatterVersion"] = CURRENT_FRONTMATTER_VERSION
    return upgraded


def is_full_artist_credit(name):
    """Accept a full human or ensemble name, never a surname-only credit."""
    value = str(name).strip()
    if not value:
        return False
    if "," in value:
        surname, given = (part.strip() for part in value.split(",", 1))
        return bool(surname and given)
    return len(value.split()) >= 2


def cover_error(url, declared_width=None):
    """Return a promotion-blocking error unless a cover has verifiable provenance."""
    value = str(url or "").strip()
    if not value:
        return "Missing cover image URL"
    lowered = value.lower()
    if not lowered.startswith("https://"):
        return "Cover URL must use HTTPS"
    if any(marker in lowered for marker in PLACEHOLDER_COVER_MARKERS):
        return "Cover URL is a placeholder"
    host = urlparse(value).netloc.lower()
    if any(domain in host for domain in SECONDARY_COVER_HOSTS):
        return "Cover comes from a secondary catalogue; use an official or streaming source"
    if "mzstatic.com" in host and not re.search(r"/(?:500|600|1000|1200|2048)x(?:500|600|1000|1200|2048)[a-z]*\.jpg", lowered):
        return "Apple cover URL must request a verified 500px-or-larger variant"
    if "universal-music" in host and "/2048/" not in value:
        return "Universal Music cover URL must request the 2048px variant"
    if "blog.kakaocdn.net" in host or "img1.daumcdn.net" in host:
        return "Tistory/Kakao cover dimensions are unverified; use an official or verified large source"
    if "mzstatic.com" not in host and "universal-music" not in host:
        try:
            width = int(declared_width)
        except (TypeError, ValueError):
            return "Cover requires a verified coverWidth of at least 500px"
        if width < 500:
            return "Cover must be at least 500px wide"
    return None


def source_urls(content):
    return re.findall(r"https?://[^\s)]+", content)

class ClassicalFileProcessor:
    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.content = self.file_path.read_text()
        self.fm_section = ""
        self.body_section = ""
        self.metadata = {}

        self.parse()

    def parse(self):
        """Extract front matter and body."""
        if not self.content.startswith('---'):
            raise ValueError("File doesn't start with front matter")

        parts = self.content.split('---', 2)
        if len(parts) < 3:
            raise ValueError("Invalid front matter format")

        self.fm_section = parts[1]
        self.body_section = parts[2]

        try:
            self.metadata = upgrade_frontmatter(yaml.safe_load(self.fm_section) or {})
        except yaml.YAMLError as e:
            print(f"⚠ YAML parse error: {e}")

    def fix_hierarchy_spacing(self):
        """
        Fix spacing between hierarchy levels:
        - NO blank lines: composer → work → first track
        - YES blank line: last track of work → next work heading
        """
        lines = self.body_section.split('\n')
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # Add non-blank lines
            if line.strip():
                fixed_lines.append(line)

                # After composer heading, skip all blank lines until next work/track
                if re.match(r'^###\s', line.strip()):
                    i += 1
                    while i < len(lines) and not lines[i].strip():
                        i += 1
                    i -= 1  # Back up one since the loop will increment

                # After work heading, skip all blank lines until first track
                elif re.match(r'^####\s', line.strip()):
                    i += 1
                    while i < len(lines) and not lines[i].strip():
                        i += 1
                    i -= 1  # Back up one since the loop will increment

            # Handle blank lines
            else:
                # Look back and ahead to decide if we should keep this blank
                if fixed_lines:
                    last_line = fixed_lines[-1].strip()
                    # Skip blank after headings
                    if re.match(r'^###\s', last_line) or re.match(r'^####\s', last_line):
                        i += 1
                        continue
                    # Look ahead for next non-blank
                    j = i + 1
                    while j < len(lines) and not lines[j].strip():
                        j += 1
                    if j < len(lines):
                        next_line = lines[j].strip()
                        # Keep structural gaps after a track, including between CDs.
                        if (re.match(r'^####\s', next_line) or re.match(r'^### CD\d+\s*$', next_line)) and re.match(r'^\d+\.', last_line):
                            fixed_lines.append(line)
                        # Skip blank before any other heading
                        elif re.match(r'^###\s', next_line) or re.match(r'^####\s', next_line):
                            i += 1
                            continue
                        else:
                            fixed_lines.append(line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)

            i += 1

        self.body_section = '\n'.join(fixed_lines)

    def fix_formatting(self):
        """Apply all formatting fixes."""
        self.fix_hierarchy_spacing()

        # Ensure blank line after and before section headings (## level only)
        lines = self.body_section.split('\n')
        fixed_lines = []
        for i, line in enumerate(lines):
            fixed_lines.append(line)
            # Add blank line after ## heading if next line isn't blank
            if re.match(r'^##\s', line) and i + 1 < len(lines) and lines[i + 1].strip():
                fixed_lines.append('')

        self.body_section = '\n'.join(fixed_lines)

        # Remove excessive blank lines (more than 2 in a row)
        self.body_section = re.sub(r'\n{3,}', '\n\n', self.body_section)

    def validate_front_matter(self):
        """Check fields that are safe enough to promote, not just syntactically present."""
        required = ['title', 'date', 'artist']
        missing = [f for f in required if not self.metadata.get(f)]

        if missing:
            return False, f"Missing fields: {', '.join(missing)}"

        if 'confirmed' not in self.metadata:
            return False, "Missing confirmed field; set it to false until the user confirms the entry"
        if not isinstance(self.metadata['confirmed'], bool):
            return False, "confirmed must be true or false"

        artists = self.metadata.get('artist')
        artists = artists if isinstance(artists, list) else [artists]
        incomplete = [str(artist) for artist in artists if not is_full_artist_credit(artist)]
        if incomplete:
            return False, "Artist credits must use full names, not surname-only values: " + ", ".join(incomplete)

        error = cover_error(self.metadata.get('cover'), self.metadata.get('coverWidth'))
        if error:
            return False, error

        urls = source_urls(self.body_section)
        if not any("tistory.com/" in url for url in urls):
            return False, "Sources must include the original Tistory post"
        corroborating = [url for url in urls if "tistory.com/" not in url]
        if not corroborating:
            return False, "Sources must include an independent corroborating source"
        if all(any(host in urlparse(url).netloc.lower() for host in SECONDARY_COVER_HOSTS) for url in corroborating):
            return False, "Sources cannot rely only on secondary catalogues"

        return True, "Promotion requirements satisfied"

    def get_processed_content(self):
        """Return processed content."""
        fm_lines = self.fm_section.strip().split('\n')
        fm_dict = upgrade_frontmatter(yaml.safe_load(self.fm_section) or {})

        # Ensure required fields
        fm_dict.setdefault('folder', "")
        if 'confirmed' not in fm_dict:
            fm_dict['confirmed'] = False

        fm_yaml = yaml.dump(fm_dict, default_flow_style=False, allow_unicode=True)

        return f"---\n{fm_yaml}---{self.body_section}"

    def process(self):
        """Run all processing steps."""
        valid, msg = self.validate_front_matter()
        if not valid:
            return False, msg

        self.fix_formatting()
        return True, "Processing complete"


def process_file(input_path, output_path=None, write=False):
    """Process a single file."""
    if output_path is None:
        output_path = input_path

    try:
        processor = ClassicalFileProcessor(input_path)
        success, msg = processor.process()

        if success and write:
            # Write processed content
            Path(output_path).write_text(processor.get_processed_content())
            return True, f"✓ {Path(input_path).name}: {msg}; written"
        if success:
            return True, f"✓ {Path(input_path).name}: {msg}; dry run (use --write to change files)"
        else:
            return False, f"✗ {Path(input_path).name}: {msg}"

    except Exception as e:
        return False, f"✗ {Path(input_path).name}: Error - {str(e)}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 process_classical_files.py <file_or_directory> [--output-dir <dir>] [--write]")
        print("  Validates Classical files for promotion to _posts/Classical/.")
        sys.exit(1)

    source = Path(sys.argv[1])
    output_dir = None
    write = '--write' in sys.argv

    if '--output-dir' in sys.argv:
        idx = sys.argv.index('--output-dir')
        output_dir = Path(sys.argv[idx + 1])
        output_dir.mkdir(parents=True, exist_ok=True)

    if source.is_file():
        success, msg = process_file(
            source,
            output_dir / source.name if output_dir else source,
            write=write,
        )
        print(msg)
        sys.exit(0 if success else 1)

    elif source.is_dir():
        print(f"Processing files in {source}...\n")

        md_files = list(source.glob("**/*.md"))
        print(f"Found {len(md_files)} files\n")

        processed = 0
        failed = 0

        for md_file in sorted(md_files):
            output = output_dir / md_file.name if output_dir else md_file
            success, msg = process_file(md_file, output, write=write)
            print(msg)

            if success:
                processed += 1
            else:
                failed += 1

        print(f"\n✓ Processed: {processed}")
        print(f"✗ Failed: {failed}")

        sys.exit(0 if failed == 0 else 1)

    else:
        print(f"Error: {source} is not a file or directory")
        sys.exit(1)


if __name__ == "__main__":
    main()
