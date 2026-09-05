"""Browse metadata with links to the trial's physical post URLs."""
from pathlib import Path
import re
import yaml


def values(value):
    return value if isinstance(value, list) else ([] if value is None or value == '' else [value])


def album_labels(article):
    value = getattr(article, 'labels', None) or getattr(article, 'label', None)
    if value:
        return value
    folders = article.source_folder.split('/')
    if 'Labels' in folders:
        index = folders.index('Labels') + 1
        if index < len(folders):
            return folders[index]
    return None


def prepare(generator):
    specs = [('artists', 'Artists', 'artist'), ('recordings', 'Recordings', 'recording'),
             ('labels', 'Labels', 'labels'), ('movies/directors', 'Directors', 'directors'),
             ('movies/cast', 'Cast', 'cast'), ('movies/genres', 'Genres', 'genres'),
             ('movies/years', 'Years', 'year'), ('movies/ratings', 'Ratings', 'rating')]
    navigation = []
    for route, title, field in specs:
        groups = {}
        for article in generator.articles:
            movie = article.source_folder.split('/')[0] == 'Movie'
            if movie != route.startswith('movies/'):
                continue
            value = getattr(article, field, None)
            if field == 'labels':
                value = album_labels(article)
            if field == 'rating' and value is None:
                value = 'Unrated'
            for name in values(value):
                groups.setdefault(str(name), []).append(article)
        entries = [dict(name=name, url=f'{route}/{name.encode("utf-8").hex()}/', articles=posts)
                   for name, posts in sorted(groups.items())]
        decades = []
        if field == 'year':
            for decade in sorted({int(entry['name']) // 10 * 10 for entry in entries if entry['name'].isdigit()}):
                children = [entry for entry in entries if entry['name'].isdigit() and int(entry['name']) // 10 * 10 == decade]
                decades.append(dict(name=f'{decade}s', children=children))
        navigation.append(dict(name=title, url=route + '/', entries=entries, decades=decades))

    # Reuse the existing curated composer/work associations, translating album
    # references to the trial's URLs rather than rendering old Liquid templates.
    lookup = {}
    for article in generator.articles:
        lookup.setdefault('/albums/' + article.slug + '/', []).append(article)
    root = Path(generator.settings['PATH']) / '_generated/composers'
    entries = []
    for path in sorted(root.glob('*.md')):
        raw = path.read_text()
        parts = raw.split('---', 2)
        metadata = yaml.safe_load(parts[1])
        posts = []
        works = []
        for work_path in sorted((root / path.stem).glob('*.md')):
            work_parts = work_path.read_text().split('---', 2)
            work_meta = yaml.safe_load(work_parts[1])
            work_posts = []
            for url in re.findall(r'/albums/[^\s)"<>]+/', work_parts[2]):
                for article in lookup.get(url, []):
                    if article not in work_posts:
                        work_posts.append(article)
                    if article not in posts:
                        posts.append(article)
            if work_posts:
                works.append(dict(name=work_meta['title'], url=f'composers/{path.stem}/{work_path.stem}/', articles=work_posts, favorite=work_meta.get('favorite') is True))
        for url in re.findall(r'/albums/[^\s)"<>]+/', parts[2]):
            for article in lookup.get(url, []):
                if article not in posts:
                    posts.append(article)
        if posts:
            entries.append(dict(name=metadata['title'], url='composers/' + path.stem + '/', articles=posts, children=works))
    navigation.append(dict(name="Composers' works", url='composers/', entries=entries))
    favorites = [a for a in generator.articles if getattr(a, 'favorite', False)]
    generator.context.update(navigators=navigation, favorite_articles=favorites,
                             favorite_works=[w for e in entries for w in e['children'] if w.get('favorite')])
    prepare_sections(generator, navigation)


def prepare_sections(generator, legacy):
    """Each section owns its metadata handlers and filtered destinations."""
    handlers = {
        'Blog': [('Categories', 'category'), ('Tags', 'tags')],
        'Classical': [('Artists', 'artist'), ('Recordings', 'recording'), ('Labels', 'labels')],
        'Movie': [('Directors', 'directors'), ('Cast', 'cast'), ('Genres', 'genres'), ('Years', 'year'), ('Ratings', 'rating')],
        'Music': [('Artists', 'artist'), ('Recordings', 'recording'), ('Labels', 'labels'), ('Tags', 'tags')],
    }
    sections = []
    for section, fields in handlers.items():
        posts = [a for a in generator.articles if a.source_folder.split('/')[0] == section]
        navigators = []
        for title, field in fields:
            route = f'browse/{section}/{title.lower()}/'
            groups = {}
            for article in posts:
                value = getattr(article, field, None)
                if field == 'labels':
                    value = album_labels(article)
                if field == 'rating' and value is None:
                    value = 'Unrated'
                for name in values(value):
                    groups.setdefault(str(name), []).append(article)
            entries = [dict(name=name, url=route + name.encode('utf-8').hex() + '/', articles=items)
                       for name, items in sorted(groups.items())]
            decades = []
            if field == 'year':
                for decade in sorted({int(e['name']) // 10 * 10 for e in entries if e['name'].isdigit()}):
                    decades.append(dict(name=f'{decade}s', children=[e for e in entries if e['name'].isdigit() and int(e['name']) // 10 * 10 == decade]))
            navigators.append(dict(name=title, url=route, entries=entries, decades=decades, year_mode=field == 'year'))
        if section == 'Classical':
            composer = next(n for n in legacy if n['url'] == 'composers/')
            entries = []
            for entry in composer['entries']:
                selected = [a for a in entry['articles'] if a in posts]
                children = [dict(w, articles=[a for a in w['articles'] if a in posts]) for w in entry.get('children', [])]
                children = [w for w in children if w['articles']]
                if selected:
                    route = 'browse/Classical/' + entry['url']
                    entries.append(dict(entry, url=route, articles=selected, children=[dict(w, url='browse/Classical/' + w['url']) for w in children]))
            navigators.insert(0, dict(name="Composers' works", url='browse/Classical/composers/', entries=entries))
            album_entries = [dict(name=entry['name'],
                                  url=entry['url'].replace('/composers/', '/composer-albums/'),
                                  articles=entry['articles'], count_unit='albums') for entry in entries]
            navigators.insert(1, dict(name="Composers' albums", url='browse/Classical/composer-albums/', entries=album_entries))
        favorites = [a for a in posts if getattr(a, 'favorite', False)]
        if section in ('Classical', 'Music'):
            works = [w for e in entries for w in e.get('children', []) if w.get('favorite')] if section == 'Classical' else []
            navigators.append(dict(name='Favorites', url=f'browse/{section}/favorites/', entries=works, articles=favorites,
                                   favorite_count=len(works) + len(favorites)))
        sections.append(dict(name=section, navigators=navigators))
    generator.context['browse_sections'] = sections


def write(generator, writer):
    scoped = [nav for section in generator.context['browse_sections'] for nav in section['navigators']]
    for navigator in generator.context['navigators'] + scoped:
        if 'articles' in navigator:
            writer.write_file(navigator['url'] + 'index.html', generator.get_template('favorites'),
                              dict(generator.context, favorite_posts=navigator['articles'], favorite_work_entries=navigator['entries']), relative_urls=False)
            continue
        writer.write_file(navigator['url'] + 'index.html', generator.get_template('navigator'),
                          dict(generator.context, navigator=navigator), relative_urls=False)
        for entry in navigator['entries']:
            if entry.get('children'):
                writer.write_file(entry['url'] + 'index.html', generator.get_template('navigator'),
                                  dict(generator.context, navigator=dict(name=entry['name'], entries=entry['children'])), relative_urls=False)
            else:
                writer.write_file(entry['url'] + 'index.html', generator.get_template('folder'),
                              dict(generator.context, folder=dict(path=entry['name'], articles=entry['articles'])),
                              relative_urls=False)
            for work in entry.get('children', []):
                writer.write_file(work['url'] + 'index.html', generator.get_template('folder'),
                                  dict(generator.context, folder=dict(path=work['name'], articles=work['articles'])), relative_urls=False)
    writer.write_file('favorites/index.html', generator.get_template('favorites'),
                      dict(generator.context, favorite_posts=generator.context['favorite_articles'], favorite_work_entries=generator.context['favorite_works']),
                      relative_urls=False)
