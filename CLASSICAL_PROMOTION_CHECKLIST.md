# Classical Music File Promotion Checklist

Before moving a Classical music file from `_imports/tistory_classical_review/` to `_posts/Classical/`, verify all items below.

## Front Matter (YAML)

- [ ] **Title format**: `"[Composer]: [Work Title] - [Performers]"`
  - Example: `"Khachaturian: Piano Concerto, Concert Rhapsody - Yablonskaya, Yablonsky"`
  - Not: `"Khachaturian: Piano Concerto, Concert Rhapsody"`

- [ ] **Date format**: `YYYY-MM-DD` unless a time is required to order posts.

- [ ] **Artist field**: Contains ONLY performers/conductors using complete names
  ```yaml
  artist:
    - Yablonskaya, Oxana
    - Yablonsky, Dmitry
    - Moscow Symphony Orchestra
  ```
  - Not: Composer names or work titles
  - Not: Mixed with album descriptors

- [ ] **Year field**: Release/recording year (if known)
  ```yaml
  year: 1975
  ```
  - Optional but recommended
  - Use Discogs or recording company metadata

- [ ] **Cover field**: URL to a verified album cover image
  ```yaml
  cover: "https://example.com/image.jpg"
  coverWidth: 600
  ```
  - Prefer 1000px width or greater; a verified 500px source is acceptable when a larger image is unavailable
  - From an official label, distributor, artist, or verified Apple Music variant
  - Not a placeholder, a Tistory thumbnail, or a Discogs/AllMusic image
  - For a generic official/CDN URL, record the independently verified width as `coverWidth: 500` or greater. Apple 500px-or-larger and Universal 2048px variants are recognized directly.

- [ ] **Recording field**: Label/recording company (if applicable)
  ```yaml
  recording: "Deutsche Grammophon"
  ```
  - Optional
  - For compilation albums or specific recordings

- [ ] **Confirmation state**: Record whether the user has personally confirmed this entry
  ```yaml
  confirmed: false
  ```
  - Use `true` only after an explicit user confirmation
  - Research and automated validation do not set this value to `true`

- [ ] **Other fields**: Present and formatted
  ```yaml
  folder: ""
  frontmatterVersion: 2
  ```

## Content Structure

- [ ] **Album section exists**
  ```markdown
  ## Album
  ```

- [ ] **Composer hierarchy**: composer (`###`) then work (`####`)
  ```markdown
  ### Composer, First Name
  #### Work Title 1
  1. Movement 1
  2. Movement 2

  #### Work Title 2
  3. Movement 1
  4. Movement 2
  ```
  - **NO blank lines** between: composer heading → work heading → first track
  - **YES blank line** between: last track of Work A → next work heading
  - This visually separates different works while keeping work structure compact

- [ ] **Work titles**: Using proper names
  - Use Wikipedia or IMSLP for canonical titles
  - Include opus numbers: `Piano Concerto No. 2 in B♭ Major, Op. 19`
  - Not: Abbreviated or informal versions

- [ ] **Movement numbering**: Clear and complete
  ```markdown
  1. 1. Allegro
  2. 2. Adagio
  3. 3. Presto
  ```
  - First number = track number
  - Second number = movement number (if applicable)

- [ ] **Multiple works organized**: By disc or by composer
  ```markdown
  ### CD1
  #### Composer 1
  ##### Work 1
  ...
  #### Composer 2
  ##### Work 2
  ...
  ### CD2
  #### Composer 3
  ...
  ```

- [ ] **Sources section exists**
  ```markdown
  ## Sources

  - [Official Label](URL)
  - [Wikipedia](URL)
  - [IMSLP](URL) (if applicable)
  - [Discogs](URL)
  ```

## Metadata Quality

- [ ] **Performer names**: Correct and complete
  - Full names if available
  - Conductors identified: `Conductor: Name`
  - Orchestras identified: `Orchestra: Name`

- [ ] **Composer names**: Standardized format
  - Use Wikipedia/IMSLP canonical spelling
  - Handle accents and diacritics correctly
  - Format: `Last Name, First Name` for Western composers
  - Exception: Established single-name artists (e.g., Yo-Yo Ma, Lang Lang)

- [ ] **Recording metadata**: Accurate
  - Label name matches source
  - Catalog number if available (front matter or content)
  - Recording year if known (not just release year)

- [ ] **Album version**: Specific edition
  - "Reissue", "Expanded", "Remastered", etc. noted in title
  - Different recordings of same work in different entries

## File Organization

- [ ] **File location**: Proper directory structure
  ```
  _posts/Classical/
  ├── Pianists/[Artist Name]/[file].md
  ├── Violinist/[Artist Name]/[file].md
  ├── Labels/[Label Name]/[file].md
  ├── Series/[Series Name]/[file].md
  └── [file].md (for compilations/uncategorized)
  ```

- [ ] **Filename format**: `YYYY-MM-DD-[slug].md`
  - Example: `2019-12-27-khachaturian-piano-concerto-yablonskaya.md`
  - No special characters except hyphens

## Verification Steps

### Step 1: Source Verification
- [ ] Check IMSLP for work titles and canonical spellings
- [ ] Verify performer information from album credits
- [ ] Confirm recording label from physical or digital source
- [ ] Find the largest available verified cover image (prefer 1000px; accept 500px or greater)

### Step 2: Front Matter Validation
- [ ] YAML parses without errors
- [ ] All required fields present
- [ ] Date/time format correct
- [ ] Artist field contains only performers

### Step 3: Content Validation
- [ ] Album section has proper hierarchy
- [ ] All movements/tracks listed
- [ ] No missing tracks or movements
- [ ] Sources section links to authoritative sources

### Step 4: Link Check
- [ ] Cover image URL is valid and accessible
- [ ] Source links are working and relevant
- [ ] No broken references

## Quality Examples

### ✓ Good Classical Entry
```yaml
---
title: "Khachaturian: Piano Concerto, Concert Rhapsody - Yablonskaya, Yablonsky, Moscow Symphony Orchestra (1997)"
date: 2019-12-27
artist:
  - Yablonskaya, Oxana
  - Yablonsky, Dmitry
  - Moscow Symphony Orchestra
year: 1997
cover: "https://is1-ssl.mzstatic.com/image/thumb/Music/x.jpg/1200x1200bb.jpg"
recording: "Naxos"
folder: ""
---

## Album

### Khachaturian, Aram
#### Piano Concerto in D-flat Major

1. 1. Allegro ma non troppo e maestoso
2. 2. Andante con anima
3. 3. Allegro brillante

#### Concert Rhapsody for Piano and Orchestra in D-flat Major

4. Concert Rhapsody

## Sources

- [Naxos](https://www.naxos.com/CatalogueDetail/?id=8.550799)
- [IMSLP](https://imslp.org/wiki/Piano_Concerto,_Op._38_(Khachaturian,_Aram))
- [Discogs](https://www.discogs.com/release/12345)
```

### ✗ Needs Review
```yaml
---
title: "Khachaturian: Piano Concerto, Concert Rhapsody - Yablonskaya, Yablonsky"
date: 2019-12-27
artist:
  - Khachaturian: Piano Concerto  # WRONG: Should be performer name
  - Concert Rhapsody              # WRONG: Not an artist
cover: ""
folder: ""
---

## Album

Aram Khachaturian              # Needs proper hierarchy
Piano Concerto In D Flat Major # Inconsistent capitalization
1. Allegro Ma Non Troppo E Maestoso  # Movement numbers missing
```

## Promotion Workflow

1. **Find file** in `_imports/tistory_classical_review/`
2. **Verify against checklist** above
3. **Enrich metadata**:
   - Research on Wikipedia/IMSLP
   - Find cover image
   - Add recording details
   - Standardize formatting
4. **Restructure content**:
   - Add proper hierarchy
   - Complete all movements
   - Format artist names

5. **Run the promotion gate** (audit first; it never writes without `--write`):
   ```bash
   python3 scripts/process_classical_files.py path/to/album.md
   python3 scripts/process_classical_files.py path/to/album.md --write
   ```
5. **Create entry** in `_posts/Classical/[Category]/`
6. **Test**: Run `ruby scripts/generate_music_pages.rb`
7. **Verify**: Check generated artist pages and work pages

## Resources

- **IMSLP** (International Music Score Library Project): https://imslp.org
  - Canonical work titles and compositions
  - Movement lists and catalog numbers

- **Wikipedia**: Search "Composer" or "Work Title"
  - Performer information
  - Recording history
  - Catalog references

- **Discogs**: https://www.discogs.com
  - Recording metadata
  - Cover images
  - Label information
  - Release dates

- **MusicBrainz**: https://musicbrainz.org
  - Artist disambiguation
  - Release grouping
  - Recording relationships
