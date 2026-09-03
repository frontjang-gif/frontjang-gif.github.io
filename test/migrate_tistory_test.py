import importlib.util
import pathlib
import sys
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).parents[1] / "scripts" / "migrate_tistory.py"
sys.path.insert(0, str(SCRIPT.parent))
SPEC = importlib.util.spec_from_file_location("migrate_tistory", SCRIPT)
migration = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(migration)


SITEMAP = """<?xml version='1.0'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
  <url><loc>https://example.tistory.com/12</loc></url>
  <url><loc>https://example.tistory.com/category/Music</loc></url>
  <url><loc>https://example.tistory.com/13?category=1</loc></url>
</urlset>"""


class MigrateTistoryTest(unittest.TestCase):
    def test_sitemap_keeps_only_numeric_post_urls(self):
        self.assertEqual(
            ["https://example.tistory.com/12", "https://example.tistory.com/13?category=1"],
            migration.sitemap_post_urls(SITEMAP, "https://example.tistory.com"),
        )

    def test_manifest_marks_existing_source_as_imported(self):
        manifest = migration.build_manifest("https://example.tistory.com", SITEMAP, {"13"})
        self.assertEqual(1, manifest["pending"])
        self.assertEqual("imported", manifest["posts"][1]["status"])

    def test_imported_ids_accept_markdown_link_punctuation(self):
        with tempfile.TemporaryDirectory() as temporary:
            posts = pathlib.Path(temporary)
            (posts / "post.md").write_text("[source](https://example.tistory.com/13)", encoding="utf-8")
            self.assertEqual({"13"}, migration.imported_post_ids(posts, "https://example.tistory.com"))

    def test_extracts_tistory_category(self):
        page = 'window.T.entryInfo = {"entryId":12,"categoryId":827025,"categoryLabel":"Music/Classical"};'
        self.assertEqual({"id": 827025, "label": "Music/Classical"}, migration.entry_category(page))

    def test_draft_is_marked_for_review(self):
        record = {
            "id": "12",
            "url": "https://example.tistory.com/12",
            "title": "Example",
            "published": "2022-11-01T01:00:00+09:00",
            "tistory_category": {"id": 1, "label": "Music"},
            "article_text": "Original text",
        }
        draft = migration.render_draft(record)
        self.assertIn("migration_status: review_required", draft)
        self.assertIn("Original text", draft)


if __name__ == "__main__":
    unittest.main()
