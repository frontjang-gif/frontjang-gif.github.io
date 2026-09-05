from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'pelican_trial'))
PATH = str(ROOT)
OUTPUT_PATH = str(ROOT / '_site_pelican')
THEME = str(ROOT / 'pelican_trial/theme')
PLUGIN_PATHS = [str(ROOT / 'pelican_trial')]
PLUGINS = ['folder_content']
SITENAME = "frontjang's archive"
AUTHOR = 'frontjang'
SITEURL = ''
TIMEZONE = 'UTC'
DEFAULT_LANG = 'ko'
ARTICLE_PATHS = ['_posts']
PAGE_PATHS = []
STATIC_PATHS = ['images', 'fonts']
READERS = {'html': None}
ARTICLE_URL = '{slug}/'
ARTICLE_SAVE_AS = '{slug}/index.html'
DEFAULT_PAGINATION = False
SUMMARY_MAX_LENGTH = 40
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_SAVE_AS = CATEGORY_SAVE_AS = TAG_SAVE_AS = ARCHIVES_SAVE_AS = ''
AUTHORS_SAVE_AS = CATEGORIES_SAVE_AS = TAGS_SAVE_AS = ''
DIRECT_TEMPLATES = ['index']
LOAD_CONTENT_CACHE = False
CACHE_CONTENT = False
DELETE_OUTPUT_DIRECTORY = True
