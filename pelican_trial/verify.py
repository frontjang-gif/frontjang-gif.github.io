"""Verify trial coverage, physical URLs, sidebar links, and Blog images."""
from pathlib import Path
import re
import json
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site_pelican'
sources = list((ROOT / '_posts').rglob('*.md'))
destinations = set()
for source in sources:
    relative = source.relative_to(ROOT / '_posts')
    stem = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', relative.stem)
    destination = OUTPUT / relative.parent / stem / 'index.html'
    assert destination not in destinations, f'Duplicate destination: {destination}'
    destinations.add(destination)
    assert destination.is_file(), f'Missing post: {destination}'
    if relative.parts[0] == 'Blog':
        document = BeautifulSoup(destination.read_text(), 'html.parser')
        for image in document.select('main img[src]'):
            url = urlsplit(image['src'])
            if not url.scheme and not url.netloc:
                assert (OUTPUT / unquote(url.path).lstrip('/')).is_file(), image['src']

document = BeautifulSoup((OUTPUT / 'index.html').read_text(), 'html.parser')
roots = document.select('aside > details:not(.special-navigation) > details > summary > a')
leaves = [a for branch in document.select('aside > details:not(.special-navigation) > details') for a in branch.select('a.tree-leaf')]
assert len(leaves) == len(sources), 'Every post must appear once as a tree leaf'
assert len({a['href'] for a in leaves}) == len(sources), 'Duplicate tree leaves'
assert [a.get_text(' ', strip=True).split()[0] for a in roots] == ['Blog', 'Classical', 'Movie', 'Music']
composer_link = document.select_one('aside summary a[href="/browse/Classical/composers/"]')
assert composer_link.parent.parent.select('details details a.tree-leaf'), 'Composer > work > album tree is empty'
for anchor in document.select('aside a[href]'):
    target = OUTPUT / unquote(anchor['href']).lstrip('/') / 'index.html'
    assert target.is_file(), f'Broken sidebar destination: {target}'
for forbidden in ('scripts', 'test', 'AGENTS.md', 'pelican_trial', '_imports'):
    assert not (OUTPUT / forbidden).exists(), f'Development file copied: {forbidden}'
assert not any('{{' in path.read_text() or '{%' in path.read_text() for path in destinations), 'Unresolved Liquid'
print(f'Passed: {len(sources)} posts, unique folder URLs, sidebar destinations, Blog images, and output exclusions.')
records = json.loads((OUTPUT / 'search-index.json').read_text())
assert len(records) == len(sources), 'Search index must cover every post'
for record in records:
    assert (OUTPUT / unquote(record['url']).lstrip('/') / 'index.html').is_file(), record['url']
    for tag in record['tags']:
        assert (OUTPUT / 'tags' / tag.encode('utf-8').hex() / 'index.html').is_file(), tag
assert any('블로그' in record['text'] for record in records), 'Korean content missing'
assert (OUTPUT / 'search/index.html').is_file()
assert (OUTPUT / 'tags/index.html').is_file()
print('Passed: full search coverage, Korean text, and all tag destinations.')
for route in ('artists', 'composers', 'recordings', 'labels', 'favorites',
              'movies/directors', 'movies/cast', 'movies/genres', 'movies/years', 'movies/ratings'):
    page = OUTPUT / route / 'index.html'
    assert page.is_file(), route
    for anchor in BeautifulSoup(page.read_text(), 'html.parser').select('main a[href]'):
        href = anchor['href']
        if href.startswith('/'):
            assert (OUTPUT / unquote(href).lstrip('/') / 'index.html').is_file(), href
print('Passed: special navigator indexes and their detail-page links.')
sections = document.select('.special-navigation > details')
assert [s.select_one('summary').get_text(strip=True) for s in sections] == ['Blog', 'Classical', 'Movie', 'Music']
for section in sections:
    name = section.select_one('summary').get_text(strip=True)
    for leaf in section.select('a.tree-leaf'):
        assert unquote(leaf['href']).startswith('/' + name + '/'), f'Cross-section result: {leaf["href"]}'
print('Passed: four Browse sections and section-specific leaf membership.')
