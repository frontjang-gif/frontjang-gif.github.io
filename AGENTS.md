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
- Keep images in `images/` and use normal Markdown image syntax from a post: `![Description](../images/file.png)`.
- The post layout adds a visible caption from the image alt text and applies the image border styling.
- Use Markdown links such as `[Link text](https://example.com)` instead of bare URLs.
- Category links appear above the post body and tag links appear below it.
- Add referenced image files to Git. Do not commit local `.vscode/` settings or temporary `_posts/image*.png` files unless explicitly requested.

## Album Writing Guidelines

### Cover Image

- Attach a cover image that is at least 1000px wide.
- Use an image from a public website such as Amazon, AllMusic, Naxos, or Apple Music.
- Prefer official or reliable sources over Discogs.
- Keep the image in `images/` and preserve its source link in the album post when possible.

### Title

- Use the format `Composer: Work - Performer or Orchestra (release year)`. Omit the year when it is unavailable.
- Include only enough information to distinguish the album.
- Use the Wikipedia spelling for composer names, such as `Rachmaninov` rather than `Rachmaninoff`.
- Use `Last name, First name` for composers, except for established single-name or conventional exceptions.
- Use performers' last names. If multiple performers share a last name, use the shared last name only.
- Add a first-name initial before a less-famous composer with a duplicated last name, such as `B.Tchaikovsky` or `CPE.Bach`.
- Use the orchestra's historical name from the recording period; put its latest name in the tags instead.
- Expand shortened orchestra names and do not use abbreviations.
- Write work numbers as `No.` or `Nos.` with a period and a space.
- Remove accents, diacritics, and unsupported special characters from titles and filenames. Allowed punctuation is `;`, `&`, `,`, `.`, and `-`.
- Use `;` between composers, `&` to combine composers or the final item in a work list, and `,` between works by the same composer.

### Tags

- Do not add composer or performer tags; the Composers and Artists navigators provide those links. Use tags only for other useful classifications.
- Add a music `music_category` such as `Classical`, `Jazz`, or `7080s` for genre navigation; this stays separate from Blog `categories`.
- Music albums may use `favorite: true` to mark a favorite recording; omit it or use `false` otherwise.
- Music albums may use `label` for a recording series or label such as `Mercury Living Presence`.
- Music albums may use `recording` for the release/edition and `label` for a recording series or label; both have generated album navigators.
- Composer work pages may use `favorite: true` to mark a favorite work; omit it or use `false` otherwise.
- Keep Jekyll `categories` and `tags` for Blog posts; Music and Movie use their own navigation and category fields.

## Movie Writing Guidelines

- Store movies under `_posts/movie/`.
- Keep movie metadata in front matter, including `title`, `titleKo`, `titleOrg`, `year`, `directors`, `cast`, `genres`, `language`, `source`, `poster`, `rating`, and `movieFolder`. Use a numeric rating such as `2.5` or `null` when unrated.
- Music albums may use `musicFolder` for their media folder path.
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

### Tracklist

- Use heading hierarchy to distinguish topics, discs, works, chapters, and tracks: `## topic` > `### CD1` > `#### work` > `##### chapter` > track.
- For multi-disc albums, label discs as `CD1`, `CD2`, and so on, never `CD01` or `Disc1`. Do not add a disc label to a single-disc album.
- Mention each work's information once, including when it spans multiple CDs; do not repeat it in every track title.
- Use ordinary Markdown emphasis such as `**bold**` and `*italic*` where emphasis is needed, while using headings for the album hierarchy.
- Write album tracks as `track number. movement number. title`, such as `1. 1. Allegro non troppo`. The album page preserves both numbers; generated work pages retain only the movement number.
- Accept non-standard source numbering such as `1a.` and `1b.` when parsing tracks; normalize the generated movement list to sequential numbers.
