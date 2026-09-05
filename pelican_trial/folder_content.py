"""Trial reader for existing YAML posts, with physical-folder URLs."""
from pathlib import Path
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import quote

import markdown
import yaml
import navigators
from pelican import signals
from pelican.readers import BaseReader


class YAMLReader(BaseReader):
    enabled = True
    file_extensions = ['md', 'markdown']

    def read(self, filename):
        path = Path(filename)
        raw = path.read_text(encoding='utf-8-sig')
        match = re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z', raw, re.S)
        if not match:
            raise ValueError(f'Missing YAML front matter: {filename}')
        meta = yaml.safe_load(match[1])
        body = match[2]
        relative = path.relative_to(Path(self.settings['PATH']) / '_posts')
        stem = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', path.stem)
        route = relative.parent / stem
        result = dict(meta)
        for key in ('title', 'date', 'tags', 'category', 'author'):
            if key in meta and meta[key] is not None:
                value = meta[key]
                if key == 'date':
                    value = str(value)
                result[key] = self.process_metadata(key, value)
        if 'date' not in result:
            result['date'] = self.process_metadata('date', path.name[:10])
        result.update(slug=stem, url=quote(route.as_posix()) + '/',
                      save_as=route.as_posix() + '/index.html',
                      source_folder=relative.parent.as_posix(),
                      source_file=relative.as_posix())
        body = re.sub(r'{{\s*site.baseurl\s*}}', '', body)
        body = re.sub(r'(\]\()(?:(?:\.\./)+)(images/)', r'\1/\2', body)
        if relative.parts[0] in ('Music', 'Classical'):
            # Preserve both global and work-local numbers as plain track text.
            body = re.sub(r'^(\d+[a-z]?)\.\s+', r'\1\\. ', body, flags=re.M)
        return markdown.markdown(body, extensions=['extra', 'sane_lists', 'nl2br']), result


def add_reader(readers):
    readers.reader_classes.update(md=YAMLReader, markdown=YAMLReader)


def prepare_folders(generator):
    root = Path(generator.settings['PATH']) / '_posts'
    articles = generator.articles

    def tree(directory):
        return [dict(name=p.name, url=quote(p.relative_to(root).as_posix()) + '/',
                     path=p.relative_to(root).as_posix(), children=tree(p),
                     articles=[a for a in articles if a.source_folder == p.relative_to(root).as_posix()
                               or a.source_folder.startswith(p.relative_to(root).as_posix() + '/')])
                for p in sorted(directory.iterdir()) if p.is_dir()]

    generator.context['folder_tree'] = tree(root)
    tags = {}
    for article in articles:
        article.browse_tags = []
        for tag in getattr(article, 'tags', []):
            name = str(tag)
            node = tags.setdefault(name, dict(name=name, url='tags/' + name.encode('utf-8').hex() + '/', articles=[]))
            node['articles'].append(article)
            article.browse_tags.append(node)
    generator.context['browse_tags'] = sorted(tags.values(), key=lambda tag: tag['name'].casefold())
    navigators.prepare(generator)


def write_folders(generator, writer):
    def write(nodes):
        for node in nodes:
            context = dict(generator.context, folder=node)
            writer.write_file(node['path'] + '/index.html', generator.get_template('folder'),
                              context, relative_urls=False)
            write(node['children'])
    write(generator.context['folder_tree'])
    navigators.write(generator, writer)
    writer.write_file('search/index.html', generator.get_template('search'), generator.context, relative_urls=False)
    writer.write_file('tags/index.html', generator.get_template('tags'), generator.context, relative_urls=False)
    for tag in generator.context['browse_tags']:
        # A collision-free identifier also keeps punctuation out of disk paths.
        folder = dict(path=tag['name'], articles=tag['articles'])
        writer.write_file(tag['url'] + 'index.html', generator.get_template('folder'),
                          dict(generator.context, folder=folder), relative_urls=False)
    records = [dict(title=BeautifulSoup(a.title, 'html.parser').get_text(' ', strip=True),
                    url='/' + a.url, section=a.source_folder.split('/')[0],
                    tags=[str(t) for t in getattr(a, 'tags', [])],
                    text=BeautifulSoup(a.content, 'html.parser').get_text(' ', strip=True))
               for a in generator.articles]
    output = Path(generator.settings['OUTPUT_PATH']) / 'search-index.json'
    output.write_text(json.dumps(records, ensure_ascii=False), encoding='utf-8')


def register():
    signals.readers_init.connect(add_reader)
    signals.article_generator_finalized.connect(prepare_folders)
    signals.article_writer_finalized.connect(write_folders)
