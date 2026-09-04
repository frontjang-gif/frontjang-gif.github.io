<div align="center">
  <br>
  <img src="/images/reverie-text.png" alt="Reverie" width="200"/>
  <br>  
  <p align="center">
    <i>Support my work via <a href="https://paypal.me/AmitMerchant">Paypal</a> or <a href="https://buymeacoffee.com/amitmerchant">Buy me a coffee</a></i>
  </p>
</div>

---

Reverie is a [Jekyll](https://jekyllrb.com/)-powered theme which is simple and opinionated. It's actually a fork of [jekyll-now](https://github.com/barryclark/jekyll-now) with some additional features and personal touches which I've implemented to suit my needs for my blog.

> [Theme demo](https://reverie.pages.dev/)

This is a plug-and-play Jekyll theme best suited to use on [GitHub Pages](https://pages.github.com) (or [Cloudflare Pages](https://pages.cloudflare.com/) if you want to have your repository private) without even setting up a local environment.

![](/images/reverie-demo.png)

|  Responsiveness            |  Search | Categories |
|---------------------|----------------------|----------------------|
|![Responsiveness](/images/mobile-demo.png) | ![search](/images/search.png) | ![categories](/images/categories.png) |

# Table of Contents
  - [Features overview](#features-overview)
  - [Using Reverie on GitHub Pages](#using-reverie-on-github-pages)
    - [1. Fork Reverie to your User Repository](#1-fork-reverie-to-your-user-repository)
    - [2. Customize and view your site](#2-customize-and-view-your-site)
    - [3. Publish your first blog post](#3-publish-your-first-blog-post)
  - [Using Categories in Reverie](#using-categories-in-reverie)
  - [Pagination](#pagination)
  - [RSS](#rss)
  - [Sitemap](#sitemap)
  - [Troubleshooting](#troubleshooting)
  - [Emailware](#emailware)
  - [The name?](#the-name)
  - [License](#license)

{:toc}

## Features overview

- Clean and minimal design
- Single column post layout
- Command-line free fork-first workflow, using GitHub.com to create, customize and post to your blog
- Fully responsive and mobile optimized theme
- Sass/Coffeescript support using Jekyll 2.0
- Free hosting on your GitHub Pages user site
- All the SEO goodies come built-in
- Markdown blogging
- Supports [Pullquotes](https://reverie-jekyll.netlify.app/pullquotes/)
- Syntax highlighting using Pygments
    - [Dracula syntax theme](https://draculatheme.com/) included
- Disqus commenting
- Social media icons
- Google Analytics integration
- Supports [Google Analytics 4](https://support.google.com/analytics/answer/10089681?hl=en)
- Fuzzy search across blog posts
- Blog with pagination
- Categorize posts out-of-the box
- RSS Feed
- Built-in sitemap

> <p><i>Like this theme?</i> If so, consider donating a small amount that will help my maintaining this project further.<p>
> You can support me via <a href="https://paypal.me/AmitMerchant">Paypal</a>.

## Using Reverie on GitHub Pages

Setting up Reverie on GitHub Pages is as simple as it gets!

### 1. Fork Reverie to your User Repository

Fork this repository, then rename the repository to `yourgithubusername.github.io`.

Alternatively, you can click the [`Use this template`](https://github.com/amitmerchant1990/reverie/generate) button if you want to create a repository with a clean commit history which will use Reverie as a template.

Your Jekyll blog will often be viewable immediately at <https://yourgithubusername.github.io> (if it's not, you can often force it to build by completing step 2).

### 2. Customize and view your site

Enter your site name, description, avatar and many other options by editing the `_config.yml` file. You can easily turn on Google Analytics tracking, Disqus commenting and social icons here.

Making a change to `_config.yml` (or any file in your repository) will force GitHub Pages to rebuild your site with Jekyll. Your rebuilt site will be viewable a few seconds later at <https://yourgithubusername.github.io> - if not, give it ten minutes as GitHub suggests and it'll appear soon.

### 3. Publish your first blog post

Delete all files from `_posts`directory and create a new file called `/_posts/2019-2-13-Hello-World.md` to publish your first blog post. That's all you need to do to publish your first blog post! This [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) might come in handy while writing the posts.

> You can add additional posts in the browser on GitHub.com too! Just hit the <kbd>Create new file</kbd> button in `/_posts/` to create new content. Just make sure to include the [front-matter](http://jekyllrb.com/docs/frontmatter/) block at the top of each new blog post and make sure the post's filename is in this format: year-month-day-title.md

## Using Categories in Reverie

You can categorize your content based on `categories` in Reverie. For this, you just need to add `categories` in front matter like below:

For adding single category:

```md
categories: JavaScript
```

For adding multiple categories:

```md
categories: [PHP, Laravel]
```

The categorized content can be shown over this URL: <https://yourgithubusername.github.io/categories/>

## Deploying with GitHub Actions

This repository uses `.github/workflows/pages.yml` to build and deploy the site with GitHub Pages. The workflow normalizes Music filenames with `ruby scripts/normalize_music_filenames.rb`, regenerates navigator Markdown and the nested Music sidebar with `ruby scripts/generate_music_pages.rb`, then runs `bundle exec jekyll build`.

In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. After that, pushes to `master` and manual workflow runs publish the generated `_site` directory.

To push the current branch and wait for the matching Pages workflow, use `scripts/push_and_check_pages.sh`. It requires an authenticated [GitHub CLI](https://cli.github.com/).

```sh
scripts/push_and_check_pages.sh
```

## Managing Work Pages

Composer and work pages are generated automatically in `/composers/` from the `####` composer and `#####` work headings in album Markdown. No separate registry or album front matter is required. Generated pages are kept in `_generated/` as a Jekyll collection so their front matter can be reviewed and edited manually. The front matter `title` is the displayed name; the body contains only movements and references, without a duplicate title heading. URLs come from the `_generated/` folder path, not a page-level `permalink`, so renaming or moving a generated file updates its URL automatically. Existing `title`, `aliases`, `source`, and other front matter are preserved when pages are regenerated. If no matching page exists, a new one is created.

Use Wikipedia or IMSLP when choosing work names and catalog numbers. Use Discogs only as a secondary source for recording metadata. Run `ruby scripts/generate_music_pages.rb` followed by `bundle exec jekyll build` to verify new work pages.

Artist pages are also generated in `_generated/artists/`. New pages include empty `wiki` and `born` front matter placeholders plus `original_name`, which stores the source spelling when accents or unsupported characters are removed from the displayed artist name. Fill these fields manually; existing artist front matter is preserved on regeneration.

Composer pages use `wiki`, `born`, and `original_name`. Work pages use `imslp` for the canonical IMSLP reference. These fields are generated empty when needed and preserve manual values. Verify the referenced page before filling a URL.

Composer pages use the same `wiki`, `born`, `original_name`, and `aliases` front matter placeholders and preserve manual edits during regeneration. Add alternate composer spellings to `aliases`; album headings using them resolve to the same composer page.

For Classical albums, artist names normally use `Last name, First name`, but established exceptions such as `Lang Lang` can be entered in their commonly used form. For other genres, use the musician's commonly used name order. The generator preserves the entered form.

Music albums and composer works can use `favorite: true` and appear in the corresponding `Favorite Albums` and `Favorite Works` sections at `/favorites/`. Music folder navigation mirrors the capitalization and hierarchy below `_posts/Music/`, for example `/Music/Classical/Labels/` and `/Music/Jazz/`. These are separate from the Blog Categories and Tags pages.

Music albums may use `recording`. Label navigation is derived from `Labels/{label name}/` folders, with album lists generated at `/labels/`.

Music files may be moved into nested folders. Before each build, their filenames are automatically normalized to `{record date}-{title slug}.md` within their current folder. Renaming an album `title` therefore updates its filename while preserving the folder.

## Researching and Importing Music and Movies

Use `scripts/music_source_research.py` to gather an auditable research packet before creating an album post. Give it the original post first, then any authoritative catalogue pages (recording company, Apple Music, Amazon, AllMusic, or Discogs). It extracts candidate title, publication date, cover, credited artists, and track text without publishing an unreviewed post.

```sh
python3 scripts/music_source_research.py \
  'https://frontjang1.tistory.com/984' \
  'https://www.universalmusic.it/musica-classica/album/grieg-piano-concerto-chopin-piano-concerto-no-2_20012688877/' \
  --wikipedia 'Edvard Grieg' \
  --wikipedia 'Frédéric Chopin' \
  --output research/grieg-chopin-thibaudet.json \
  --markdown research/grieg-chopin-thibaudet.md
```

The packet is source material, not final metadata: verify each Wikipedia or IMSLP page before assigning `wiki` or `imslp`, treat Discogs as secondary recording metadata, and choose a cover that is at least 1000px wide. Once reviewed, create the post in `_posts/Music/`, then run `ruby scripts/normalize_music_filenames.rb`, `ruby scripts/generate_music_pages.rb`, and `bundle exec jekyll build`.

The same collector supports Movie posts through the generic entry point. It extracts Movie JSON-LD fields for directors, cast, genres, and running time; the built-in TMDb plugin supplements pages that use site-specific HTML with release date, director, genre, running time, and a high-resolution cover candidate. IMDb, TMDb, Letterboxd, and Rotten Tomatoes links are classified as movie databases.

```sh
python3 scripts/media_source_research.py --media-type movie \
  'https://example.com/original-movie-post' \
  'https://www.imdb.com/title/tt0000000/' \
  --output research/example-film.json
```

The importer has a plugin architecture. Its built-in plugins cover Tistory, Universal Music, Deutsche Grammophon, Eloquence Classics, Warner Classics, TMDb, Wikipedia, IMSLP, Discogs, AllMusic, Amazon, Apple Music, and Naxos, while the generic extractor handles Open Graph and JSON-LD metadata. The Discogs and AllMusic plugins deliberately mark their data as secondary; they cannot override an original post or recording-company source. To add a site, create a Python file in a separate directory and pass it with `--plugin-dir plugins/music-sources`. Each file exports `plugin` or `plugins`; a plugin provides a `name`, `matches(url)`, and `enrich(context)` method. `context.source` is the JSON record being assembled, so a plugin can add a catalogue number, direct cover candidates, recording company, or site-specific tracklist without modifying the importer itself.

Music album titles are limited to 140 characters in CI. Run `ruby scripts/check_music_title_lengths.rb` to report violations, or add `--apply` to omit safe catalogue/opus identifiers from title metadata and rename the affected album files. Full canonical work names remain in the track headings.

To migrate a Tistory blog, first make an inventory without changing posts: `python3 scripts/migrate_tistory.py --site https://frontjang1.tistory.com --output _research/tistory-manifest.json`. Add `--research --write-drafts _imports/tistory` to fetch only posts not already cited from `_posts/` and create review-only Markdown drafts. Use `--resume _research/tistory-manifest.json` after an interrupted run to reuse completed research. The drafts deliberately stay outside `_posts/`: Music and Movie metadata still need authoritative-source verification and folder assignment before publication.

```python
# plugins/music-sources/example_label.py
from urllib.parse import urlparse

class ExampleLabel:
    name = "example_label"

    def matches(self, url):
        return urlparse(url).netloc.endswith("example-label.com")

    def enrich(self, context):
        context.source["recording_company"] = "Example Label"

plugin = ExampleLabel()
```

Album track entries may include both numbers, for example `1. 1. Allegro non troppo`. The first number is the track number and the second is the movement number.

Generated composer work pages include `favorite: false`. Change it to `favorite: true` in the work page front matter to mark a favorite work; the value is preserved when pages are regenerated.

Movies automatically generate navigator pages from `directors`, `cast`, `genres`, `rating`, and `year`. Rating pages preserve exact points, so `2` and `2.5` appear on separate pages at `/movies/ratings/2/` and `/movies/ratings/2-5/`. Movie pages are available under `/movies/directors/`, `/movies/cast/`, `/movies/genres/`, `/movies/ratings/`, and `/movies/years/`, with year pages grouped by decade such as `/movies/years/1950s/`.

Use the movie title format `{year} {titleKo} ({titleOrg})`.

The site navigation is organized as `Root > Blog | Music | Movie`. Blog posts are physically grouped under `_posts/Daily/` and `_posts/Tech/`. Music albums are stored under `_posts/Music/`, with folders such as `_posts/Music/Classical/Labels/Mercury Living Presence/` rendered as a nested, collapsible sidebar tree. The top-level Music folder drives category pages, and `Labels/{label name}/` drives label pages.

## Post Templates

Templates are stored in `_templates/`:

- `default.md` for daily and tech posts
- `music.md` for music albums
- `movie.md` for Movie Vault entries

Copy the appropriate template into its target `_posts/` subdirectory, then replace the placeholder values. Music and movie layouts use their front matter to render album covers, metadata, and navigation automatically.

## Pagination

Pagination of posts in Reverie works out-of-the-box. You only need to specify the number of posts you want on a single page in `_config.yml` and Reverie will take care of the rest.

```yml
paginate: 6
```

## RSS

Reverie comes with a [RSS feed](https://en.wikipedia.org/wiki/RSS) in-built. The generated RSS Feed of your blog can be found at <https://yourgithubusername.github.io/feed>. You can see the example RSS feed over [here](https://reverie-jekyll.netlify.app/feed.xml).

## Sitemap

The generated sitemap of your blog can be found at <https://yourgithubusername.github.io/sitemap.xml>. You can see the example sitemap feed over [here](https://reverie-jekyll.netlify.app/sitemap.xml).

## Troubleshooting

There might be instances where your site based on Reverie won't have the styling working as expected. 

The common reason for this issue is the incorrect `baseurl` set in the `_config.yml` file. You need to use the `baseurl` according to where you're hosting it.

So, for instance, if you're hosting your site at a Project repository on GitHub pages (http://yourusername.github.io/repository-name) and NOT your user repository (http://yourusername.github.io) then the `baseurl` will be `/repository-name`.

Otherwise the `baseurl` will be `/`.

## Emailware
Reverie is an [emailware](https://en.wiktionary.org/wiki/emailware). Meaning, if you liked using this theme or it has helped you in any way, I'd like you send me an email at <bullredeyes@gmail.com> about anything you'd want to say about this software. I'd really appreciate it!

## The name?

reverie - _a state of being pleasantly lost in one's thoughts; a daydream._<br><sup>/ˈrɛv(ə)ri/</sup> 


## License

MIT
