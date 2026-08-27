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
