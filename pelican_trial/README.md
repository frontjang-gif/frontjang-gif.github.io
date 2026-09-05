# Pelican trial

This builds the existing 359 YAML/Markdown posts into `_site_pelican/`, independently of Jekyll and the deployed site. It reads source posts without rewriting them. URLs follow physical folders for Blog, Classical, Movie, and Music. Date prefixes are omitted from post URLs; Korean slugs are preserved.

## Build and review

Run from the repository root:

```sh
python3 -m venv .venv-pelican
.venv-pelican/bin/pip install -r pelican_trial/requirements.txt
.venv-pelican/bin/pelican -s pelican_trial/settings.py
.venv-pelican/bin/python pelican_trial/verify.py
.venv-pelican/bin/python -m http.server 8001 --directory _site_pelican
```

Open `http://localhost:8001/` or `http://localhost:8001/Blog/Daily/`. Serve the preview over HTTP because navigation and asset links start at the site root.

The output directory is dedicated to this trial. Pelican cleans it before each build; do not store authored files there. Source images and fonts are copied explicitly. Development files and imports are excluded by the static-file allowlist.

## What this trial demonstrates

- Existing YAML metadata and all published Markdown posts can be read by a custom Pelican reader.
- Folder indexes, recursive right-side navigation, and post URLs share the physical source hierarchy.
- Home pagination, cover images, basic Markdown, and plain-text album track numbers render.
- Home and card-based folder/detail listings support Items 5/10/20/All and Text/Half preview/Tiles. Client-side pagination covers the full listing; item count and layout preferences persist in browser storage. Without JavaScript, the full listing remains visible.
- `/search/` provides live full-text search with section and tag filters, shareable query URLs, result counts, and incremental result display. It supports Korean and accent-insensitive text matching.
- `/tags/` lists tag counts and links to static tag pages, also accessible from individual posts. Tag browsing works without JavaScript.
- Tree branches remember explicit open/closed state in browser local storage across refreshes and page navigation. Branch URLs provide stable identities shared by the sidebar and special-page trees. With storage blocked, native tree controls still work for the current page.
- Default expansion opens Home and Special pages, plus Blog/Classical/Movie/Music under Special pages. Physical folders under Home and individual metadata navigators start collapsed. Saved browser choices override these defaults.
- A collapsible Special pages root sits directly below Home and has Blog, Classical, Movie, and Music branches. It remembers its expansion state like other folders. Section-specific handlers generate scoped metadata pages under `/browse/{section}/`: Blog categories/tags, Classical composers/artists/recordings/labels/favorites, Movie directors/cast/genres/years/ratings, and Music artists/recordings/labels/tags/favorites. Existing unscoped navigator URLs remain accessible.
- The sidebar Browse section provides Artists, Composers, Recordings, Labels, Favorites, Directors, Cast, Genres, Years, and Ratings. Metadata listings use current post fields; composer associations are imported from the existing curated `_generated/composers` pages and translated to trial album URLs. Work detail pages and full navigator metadata parity remain pending.
- The verifier checks every source post has a unique destination, sidebar links resolve, Blog images exist, and development files do not leak into output.

## Remaining parity work

This is a functional prototype, not a production replacement or a claim of identical rendering. The theme is a simplified Jinja2 implementation. Album work-boundary semantics, nested track numbering, full movie credits, artist/composer/work navigators, feeds, sitemap, old-URL redirects, image captions, and the existing list-view controls still require migration and comparison. Existing body links to legacy URLs are not rewritten by this trial. The checks do not establish whole-site link or visual parity.

Production deployment still uses Jekyll. No deployment workflow is changed.

Implementation follows the official [Pelican reader/plugin API](https://docs.getpelican.com/en/stable/plugins.html) and [theme API](https://docs.getpelican.com/en/stable/themes.html).
