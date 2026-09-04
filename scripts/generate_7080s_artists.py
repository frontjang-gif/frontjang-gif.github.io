#!/usr/bin/env python3
"""Generate artist index pages for 7080s music collection."""

import re
from pathlib import Path
from collections import defaultdict
import yaml

# Paths
MUSIC_DIR = Path(__file__).parent.parent / "_posts" / "Music" / "7080s"
OUTPUT_DIR = Path(__file__).parent.parent / "_generated" / "7080s-artists"

def extract_metadata(md_file):
    """Extract front matter from markdown file."""
    with open(md_file) as f:
        content = f.read()

    # Parse front matter
    if not content.startswith('---'):
        return None

    parts = content.split('---', 2)
    if len(parts) < 3:
        return None

    try:
        fm = yaml.safe_load(parts[1])
        return {
            'file': md_file,
            'title': fm.get('title', ''),
            'artist': fm.get('artist', []),
            'year': fm.get('year'),
            'date': fm.get('date'),
        }
    except:
        return None

def slug(value):
    """Convert to URL-friendly slug."""
    if not value:
        return ""
    return re.sub(r'[^a-z0-9-]', '',
                  value.lower().replace(' ', '-').replace('&', 'and'))

def generate_artist_page(artist_name, albums, output_dir):
    """Generate an artist index page."""
    output_dir.mkdir(parents=True, exist_ok=True)

    artist_slug = slug(artist_name)
    output_file = output_dir / f"{artist_slug}.md"

    # Group by year
    by_year = defaultdict(list)
    for album in sorted(albums, key=lambda x: (x.get('date', ''), x.get('title', ''))):
        year = album.get('year', 'Unknown')
        by_year[year].append(album)

    # Generate markdown
    lines = [
        "---",
        f"layout: page",
        f"title: {artist_name}",
        f"---",
        "",
        f"[All 7080s Artists]({{ {{ site.baseurl }}}}/7080s-artists/)",
        "",
    ]

    # Add albums by year
    for year in sorted(by_year.keys(), key=lambda x: str(x) if x != 'Unknown' else 'zzz', reverse=True):
        lines.append(f"## {year}\n")

        for album in by_year[year]:
            file_path = album['file']
            # Calculate relative path for URL
            rel_path = file_path.relative_to(MUSIC_DIR)
            url_path = "/".join(str(rel_path).replace(".md", "").split("/"))

            title = album.get('title', 'Unknown')
            lines.append(f"- [{title}]({{{{ site.baseurl }}}}/albums/{url_path}/)")

        lines.append("")

    # Write file
    with open(output_file, 'w') as f:
        f.write("\n".join(lines))

    return output_file

def main():
    """Generate all 7080s artist pages."""

    # Collect albums by artist
    artists = defaultdict(list)

    # Scan root directory for single-album entries
    for md_file in MUSIC_DIR.glob("*.md"):
        metadata = extract_metadata(md_file)
        if metadata:
            artist_list = metadata.get('artist', [])
            if artist_list:
                for artist in artist_list:
                    artists[artist].append(metadata)

    # Scan artist folders
    for artist_dir in MUSIC_DIR.iterdir():
        if not artist_dir.is_dir():
            continue

        artist_name = artist_dir.name
        for md_file in artist_dir.glob("*.md"):
            metadata = extract_metadata(md_file)
            if metadata:
                # Use folder name as artist name
                metadata['artist'] = [artist_name]
                artists[artist_name].append(metadata)

    # Generate pages
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated_count = 0

    for artist_name in sorted(artists.keys()):
        try:
            output_file = generate_artist_page(artist_name, artists[artist_name], OUTPUT_DIR)
            print(f"✓ {artist_name}: {len(artists[artist_name])} albums")
            generated_count += 1
        except Exception as e:
            print(f"✗ {artist_name}: {e}")

    # Generate main index
    index_lines = [
        "---",
        "layout: page",
        "title: 7080s Artists",
        "---",
        "",
        "# 7080s Soul/Funk Artists",
        "",
    ]

    for artist in sorted(artists.keys()):
        artist_slug = slug(artist)
        album_count = len(artists[artist])
        index_lines.append(f"- [{artist}]({{{{ site.baseurl }}}}/7080s-artists/{artist_slug}/) — {album_count} album{'s' if album_count != 1 else ''}")

    index_file = OUTPUT_DIR / "index.md"
    with open(index_file, 'w') as f:
        f.write("\n".join(index_lines))

    print(f"\n✓ Generated {generated_count} artist pages")
    print(f"✓ Main index: {index_file}")

if __name__ == "__main__":
    main()
