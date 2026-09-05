# Blog Writing Guidelines

## Tone and Structure

- Write in Korean first person with a calm, honest, practical tone.
- Explain the reason, process, problems, and lessons learned, not only the result.
- Keep paragraphs focused and use `##` headings for major topics in longer posts.
- Use the front matter `title` as the page title; do not repeat it as an H1 in the body.
- The post layout generates a table of contents from `h2` and `h3` headings.

## Post Files

- Store posts under `_posts/` using `YYYY-MM-DD-title.md`.
- The filename must begin with a valid `YYYY-MM-DD` date. Korean titles are valid, but lowercase English words separated by hyphens are preferred for portable URLs.
- Use a date-only value such as `date: 2026-08-27` unless time is needed to order multiple posts on the same day.

Use this front matter as the default:

```yaml
---
layout: post
title: "Post title"
date: YYYY-MM-DD
category: Category
tags: [tag1, tag2]
---
```

- Omit `author` when the site-wide author in `_config.yml` is sufficient.
- Omit `description` unless a custom SEO or social sharing description is needed.

## Content and Media

- The home page automatically displays up to 40 words from `post.content`; do not add `<!--more-->` for normal posts.
- Keep locally owned images in `images/` and use normal Markdown image syntax from a post: `![Description](../images/file.png)`. Remote images may be referenced directly without making a local copy.
- The post layout adds a visible caption from the image alt text and applies the image border styling.
- Use Markdown links such as `[Link text](https://example.com)` instead of bare URLs.
- Category links appear above the post body and tag links appear below it.
- Add referenced image files to Git. Do not commit local `.vscode/` settings or temporary `_posts/image*.png` files unless explicitly requested.

## Album Writing Guidelines

### Source Research, Importing, and Plugin Evolution

### Review Workflow

- Before giving a user a clickable review path for an imported album, first complete its metadata, source research, cover verification, artist credits, CD structure, work boundaries, and track numbering; run the relevant processor and rendering checks.
- A review path always refers to the processed draft. Do not present an untouched or partially processed import as the next review item.
- After the user explicitly says an album is good, set `confirmed: true`. Do not push unless the user explicitly requests a push.

- Before importing a Music or Movie post, collect the original post and corroborating primary sources with `scripts/music_source_research.py` or `scripts/media_source_research.py`.
- Prefer an official recording company, distributor, artist, studio, or publisher page for credits, tracklists, release data, and covers. Treat Discogs and AllMusic as secondary sources and never let them override primary data without review.
- When the generic Open Graph/JSON-LD extractor cannot reliably collect a source site's required metadata, automatically create a dedicated module under `scripts/music_source_plugins/`. Do not wait for separate approval.
- A source plugin must have a focused `matches(url)` rule, add only evidence available on that site, have a unit test in `test/music_source_research_test.py`, and be registered in `scripts/music_source_plugins/__init__.py`.
- After adding a plugin, verify it against a real public page when possible, document it in `README.md`, and do not claim support for fields that the verification did not extract.
- Evolve the importer when repeated imports expose a reusable parsing or normalization gap. Keep the plugin registry, tests, README, and these instructions aligned with the new capability.
- Do not set a custom identifying `User-Agent` header for source-research requests.
- Use `scripts/migrate_tistory.py` to inventory a Tistory archive. Its `_imports/tistory/` output is review-only and must never be treated as publishable `_posts/` content by default.
- Promote a Tistory draft to `_posts/` only when the original URL, release identity, credited artists, track sequence, recording/imprint, and a cover from an independent primary catalogue, artist, distributor, or streaming source have been verified. Prefer covers at least 1000px wide; accept a verified cover of at least 500px when a larger source is unavailable. Leave uncertain credits, editions, categories, or work boundaries in `_imports/`.
- On promotion, add both the original Tistory URL and corroborating source URLs to `## Sources`, rerun the migration with `--resume` so its draft is removed and manifest status becomes `imported`, then regenerate the Music pages and run the build and rendering tests.

### Cover Image

- Prefer a cover image at least 1000px wide. A verified 500px-or-larger source is acceptable when no larger source is publicly available.
- Do not infer a cover's dimensions from a resized Tistory/Open Graph thumbnail. Verify the direct source image or use a known-size official/Apple Music variant before publishing it.
- Use an image from a public website such as Amazon, AllMusic, Naxos, or Apple Music.
- Prefer official or reliable sources over Discogs.
- Reference the remote cover URL directly; a local copy is not required. Preserve its source link in the album post when possible.
- For a non-Apple or non-official cover host, add a clearly labelled `[Cover image source](...)` link to `## Sources`. The cover CDN URL and the source page may use different domains; verify their relationship manually.

### Title

- Use the format `Composer: Work - Performer or Orchestra`. Do not include a release year in an album title, even when it is known; keep release-date evidence in sources or metadata instead.
- Include only enough information to distinguish the album.
- When catalogue or opus numbers make an album title unnecessarily long, omit them from the title and filename; retain the complete canonical work name and number in the album track headings and generated work pages.
- Use the Wikipedia spelling for composer names, such as `Rachmaninov` rather than `Rachmaninoff`.
- Use `Last name, First name` for composers, except for established single-name or conventional exceptions.
- Use performers' last names. If multiple performers share a last name, use the shared last name only.
- List every credited artist needed to identify an album. For a sole human artist, use the full name in both the album title and `artist` metadata; for multiple human artists, use surnames in the title and full names in `artist` metadata. Separate artist credits with commas, never `&`.
- Add a first-name initial before a less-famous composer with a duplicated last name, such as `B.Tchaikovsky` or `CPE.Bach`.
- Use the orchestra's historical name from the recording period; put its latest name in the tags instead.
- Expand shortened orchestra names and do not use abbreviations.
- Write work numbers as `No.` or `Nos.` with a period and a space.
- Remove accents, diacritics, and unsupported special characters from titles and filenames. Allowed punctuation is `:`, `;`, `&`, `,`, `.`, and `-`.
- Use `;` between distinct composer/work parts, `&` when multiple composers share one work name (or to combine the final item in a work list), and `,` between works by the same composer.
- When a title begins with a composer list and then names a recital, collection, or other descriptor, use `:` between the composer list and that descriptor; use `-` between the descriptor and performer credit.

### Tags

- Do not add composer or performer tags; the Composers and Artists navigators provide those links. Use tags only for other useful classifications.
- Use the top-level folder under `_posts/Music/` for music category navigation, such as `Jazz` or `7080s`. Store Classical albums under `_posts/Classical/`.
- Music albums may use `favorite: true` to mark a favorite recording; omit it or use `false` otherwise.
- Set `confirmed: true` only after the user explicitly confirms an album entry. New or imported entries must use `confirmed: false`; research and automated validation never imply user confirmation.
- Music albums may use `recording` for the recording company or release/edition imprint.
- Multi-disc albums may use `cdCount` as a positive integer. When present, it must equal the number of `### CD1`, `### CD2`, and subsequent disc headings.
- Keep recording companies separate from label series. Place an album under `Labels/{series name}/` only when it belongs to a named series, such as `Mercury Living Presence`; a company such as Decca belongs in `recording` and does not by itself determine the album's folder.
- Composer work pages may use `favorite: true` to mark a favorite work; omit it or use `false` otherwise.
- Keep Jekyll `categories` and `tags` for Blog posts; Music and Movie use their own navigation and category fields.

## Movie Writing Guidelines

- Store movies under `_posts/Movie/`.
- Keep movie metadata in front matter, including `title`, `titleKo`, `titleOrg`, `year`, `directors`, `cast`, `genres`, `language`, `source`, `poster`, `rating`, and `folder`. Use a numeric rating such as `2.5` or `null` when unrated.
- Music albums and movies use `folder` for their media folder path. Use `frontmatterVersion: 2` for the current schema. Version 1 used `musicFolder` or `movieFolder`; readers must map those legacy fields to `folder`.
- Music album filenames are normalized to `{record date}-{title slug}.md` within their current folder; nested folders are supported.
- The sidebar mirrors the physical directory tree under `_posts/` as `Home > Blog | Classical | Movie | Music`. `_plugins/post_folder_navigation.rb` generates folder links, counts, and listing pages at build time. Do not merge Classical into Music or add virtual folders to this tree.
- Keep top-level post folders capitalized: `_posts/Blog/`, `_posts/Music/`, `_posts/Classical/`, and `_posts/Movie/`. Blog topics live under `_posts/Blog/`, such as `Daily/` and `Tech/`. Folder navigation follows physical directories, not front matter categories.
- Movie navigators are generated from `directors`, `cast`, `genres`, and `year`; years are grouped by decade.
- Use performers' full names in the `artist` array. Put shortened or alternate names in the artist page's `aliases` front matter.
- For Classical albums, use `Last name, First name` for ordinary performers, but preserve established exceptions such as `Lang Lang` in their commonly used form. For other genres, use the musician's commonly used name order.
- Remove accents, diacritics, and unsupported special characters from artist page names and filenames. Preserve the original spelling in the artist page's `original_name` front matter.

### Work Names

- Use the composer and work headings in album Markdown as the canonical names.
- Use Wikipedia or IMSLP for canonical spelling and catalog information; use Discogs only as a secondary source for recording metadata.
- Preserve alternate spellings in generated page front matter when needed instead of creating duplicate work pages.
- Use `wiki` for artist and composer reference URLs and `imslp` for canonical work references. Verify the page itself before recording a URL; do not invent or infer reference URLs.
- Composer pages may use `aliases` for alternate composer names; matching album headings resolve to the same composer page.
- When an existing composer page uses only a surname and a reliable source supplies the composer's first name, promote `Last name, First name` to the canonical page title and retain the old surname-only form in `aliases`. Regenerate the composer and work pages under the improved canonical slug.

### Tracklist

- Use heading hierarchy to distinguish topics, discs, works, chapters, and tracks: `## topic` > `### CD1` > `#### work` > `##### chapter` > track.
- Render disc and composer headings bold and left-aligned. Render work headings italic, normal-weight, and left-aligned. Do not add visual spacing between consecutive disc, composer, and work headings.
- Do not put blank lines between a composer heading, its work heading, and the first track. Keep those lines contiguous in Markdown. Use a blank line only when it carries structure, such as separating the end of a movement list from the next standalone work.
- Put one blank line before every new composer heading (`#### Last, First`) when it follows a track or another work. Do not put a blank line after that composer heading before its first work or track.
- A composer declaration remains active across CD boundaries. Do not repeat the composer heading on each CD when the composer has not changed; add a new composer heading only when the composer changes.
- For multi-disc albums, label discs as `CD1`, `CD2`, and so on, never `CD01` or `Disc1`. Do not add a disc label to a single-disc album.
- Leave one blank line between the final track on a CD and the following CD heading. Do not add blank lines between a CD heading and its active composer or first work.
- Mention each work's information once, including when it spans multiple CDs; do not repeat it in every track title.
- Use ordinary Markdown emphasis such as `**bold**` and `*italic*` where emphasis is needed, while using headings for the album hierarchy.
- Write album tracks as `global track number. work track number. original movement label and title`, such as `1. 1. I. Allegro non troppo` or `7. 2. No. 2. Andante`. The first number is continuous within the CD, the second restarts for each work, and the original label preserves the score's own `I.`, `II.`, or `No.` style. When the work track number duplicates an original sequential `No.` label, omit the redundant work track number: `7. No. 2. Andante`. The album page preserves applicable numeric levels; generated work pages retain the work track number and original label.
- When an anthology selects non-consecutive items from a numbered opus, keep both numbers: the anthology's work track number and the original opus number. For example, `10. 1. No. 10. La Cathedrale Engloutie` preserves global track 10, selection track 1, and the original Prelude No. 10.
- Separate consecutive work headings with one blank line after the preceding work's final track; do not insert a blank line between tracks within the same work.
- Render every album track as plain text rather than an HTML ordered list. Source Markdown may use numbered-list syntax for parsing, but list indentation and browser list spacing must not appear on the album page.
- A blank line after a movement-numbered track list marks the end of that work when the next track has no movement number. Treat the following track as a separate work under the current composer and render visible spacing before it; do not fold it into the preceding work.
- A bold composer in a single track, such as `4. **Liszt** - Hungarian Rhapsody...`, overrides the surrounding composer heading for that track and creates the work under that composer.
- Accept non-standard source numbering such as `1a.` and `1b.` when parsing tracks; normalize the generated movement list to sequential numbers.
