import importlib.util
import pathlib
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).parents[1] / "scripts" / "process_classical_files.py"
SPEC = importlib.util.spec_from_file_location("process_classical_files", SCRIPT)
processor = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(processor)


def post(artist, cover, cover_width=None, sources="- [Original](https://frontjang1.tistory.com/1)\n- [Official](https://label.example/release)\n- [Cover image source](https://label.example/release)", confirmed=False):
    width_line = f"coverWidth: {cover_width}\n" if cover_width else ""
    confirmed_line = f"confirmed: {str(confirmed).lower()}\n"
    return f'''---
title: "Example"
date: 2020-01-01
artist:
{artist}
cover: {cover}
coverSource: https://label.example/release
{width_line}{confirmed_line}frontmatterVersion: 2
---

## Album

### Composer, Example
1. Work

## Sources

{sources}
'''


class ClassicalPromotionTest(unittest.TestCase):
    def test_parses_three_level_original_opus_number(self):
        self.assertEqual(
            ("10", "1", "No. 10."),
            processor.parse_album_track("10. 1. No. 10. La Cathedrale Engloutie"),
        )

    def test_recognizes_composer_descriptor_title_separator(self):
        self.assertTrue(processor.has_composer_descriptor_separator("Bach, Mozart: Salzburg Recital - Gould"))

    def validate(self, content):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "album.md"
            path.write_text(content, encoding="utf-8")
            return processor.ClassicalFileProcessor(path).validate_front_matter()

    def test_rejects_surname_only_artist(self):
        valid, message = self.validate(post("  - Nojima", "https://label.example/cover.jpg", 1200))
        self.assertFalse(valid)
        self.assertIn("surname-only", message)

    def test_rejects_placeholder_cover(self):
        valid, message = self.validate(post("  - Nojima, Minoru", "https://i.discogs.com/[image-url].jpg"))
        self.assertFalse(valid)
        self.assertIn("placeholder", message)

    def test_rejects_cover_without_size_evidence(self):
        valid, message = self.validate(post("  - Nojima, Minoru", "https://label.example/cover.jpg"))
        self.assertFalse(valid)
        self.assertIn("coverWidth", message)

    def test_requires_explicit_confirmation_state(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200)
        valid, message = self.validate(content.replace("confirmed: false\n", ""))
        self.assertFalse(valid)
        self.assertIn("Missing confirmed", message)

    def test_accepts_user_confirmed_entry(self):
        valid, message = self.validate(
            post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200, confirmed=True)
        )
        self.assertTrue(valid, message)

    def test_accepts_matching_cd_count(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200).replace(
            "frontmatterVersion: 2\n", "cdCount: 2\nfrontmatterVersion: 2\n"
        ).replace("### Composer, Example\n1. Work", "### CD1\n1. Work\n\n### CD2\n1. Work")
        valid, message = self.validate(content)
        self.assertTrue(valid, message)

    def test_accepts_cd_count_with_disc_descriptions(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200).replace(
            "frontmatterVersion: 2\n", "cdCount: 2\nfrontmatterVersion: 2\n"
        ).replace("### Composer, Example\n1. Work", "### CD1 - Studio recording\n1. Work\n\n### CD2 - Live recording\n1. Work")
        valid, message = self.validate(content)
        self.assertTrue(valid, message)

    def test_rejects_mismatched_cd_count(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200).replace(
            "frontmatterVersion: 2\n", "cdCount: 3\nfrontmatterVersion: 2\n"
        ).replace("### Composer, Example\n1. Work", "### CD1\n1. Work\n\n### CD2\n1. Work")
        valid, message = self.validate(content)
        self.assertFalse(valid)
        self.assertIn("does not match", message)

    def test_requires_gap_before_new_composer(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200).replace(
            "### Composer, Example\n1. Work", "#### Composer, First\n1. Work\n#### Composer, Second\n2. Work"
        )
        valid, message = self.validate(content)
        self.assertFalse(valid)
        self.assertIn("needs a blank line", message)

    def test_upgrades_legacy_media_folder(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200)
        legacy = content.replace(
            "frontmatterVersion: 2\n",
            "musicFolder: Artist/Nojima\nfrontmatterVersion: 1\n",
        )
        instance = processor.ClassicalFileProcessor(self.write_temp(legacy))
        self.assertEqual("Artist/Nojima", instance.metadata["folder"])
        self.assertEqual(2, instance.metadata["frontmatterVersion"])

    def test_rejects_unknown_future_schema(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200)
        future = content.replace("frontmatterVersion: 2\n", "frontmatterVersion: 99\n")
        with self.assertRaisesRegex(ValueError, "Unsupported frontmatterVersion"):
            processor.ClassicalFileProcessor(self.write_temp(future))

    def write_temp(self, content):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        path = pathlib.Path(directory.name) / "album.md"
        path.write_text(content, encoding="utf-8")
        return path

    def test_accepts_full_credits_and_verified_apple_cover(self):
        valid, message = self.validate(
            post(
                "  - Yablonskaya, Oxana\n  - Yablonsky, Dmitry\n  - Moscow Symphony Orchestra",
                "https://is1-ssl.mzstatic.com/image/thumb/Music/x.jpg/1200x1200bb.jpg",
            )
        )
        self.assertTrue(valid, message)

    def test_accepts_verified_600px_cover(self):
        valid, message = self.validate(
            post("  - Nojima, Minoru", "https://label.example/cover.jpg", 600)
        )
        self.assertTrue(valid, message)

    def test_dry_run_does_not_overwrite_file(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200)
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "album.md"
            path.write_text(content, encoding="utf-8")
            success, _message = processor.process_file(path)
            self.assertTrue(success)
            self.assertEqual(content, path.read_text(encoding="utf-8"))

    def test_preserves_gap_between_compact_discs(self):
        content = post("  - Nojima, Minoru", "https://label.example/cover.jpg", 1200).replace(
            "### Composer, Example\n1. Work",
            "### CD1\n#### Composer, Example\n##### Work\n1. 1. Allegro\n\n### CD2\n##### Work\n1. 2. Adagio",
        )
        instance = processor.ClassicalFileProcessor(self.write_temp(content))
        instance.fix_formatting()
        self.assertIn("1. 1. Allegro\n\n### CD2", instance.body_section)


if __name__ == "__main__":
    unittest.main()
