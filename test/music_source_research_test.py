import importlib.util
import pathlib
import sys
import unittest


SCRIPT = pathlib.Path(__file__).parents[1] / "scripts" / "music_source_research.py"
sys.path.insert(0, str(SCRIPT.parent))
SPEC = importlib.util.spec_from_file_location("music_source_research", SCRIPT)
research = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(research)


class MusicSourceResearchTest(unittest.TestCase):
    def test_extracts_tistory_metadata_and_numbered_tracks(self):
        page = """
        <meta property="og:title" content="Example album - Artist">
        <meta property="og:image" content="https://example.test/cover.jpg">
        <meta property="article:published_time" content="2022-11-03T13:44:11+09:00">
        <div class="entry-content"><p>1. 1. Allegro<br>2. 2. Adagio</p></div>
        """
        result = research.parse_page("https://example.tistory.com/1", page)
        self.assertEqual("Example album - Artist", result["title"])
        self.assertEqual("https://example.test/cover.jpg", result["cover"])
        self.assertEqual(["1. 1. Allegro", "2. 2. Adagio"], result["tracks"])
        self.assertEqual("original", result["kind"])

    def test_prefers_music_album_json_ld_tracks(self):
        page = """
        <script type="application/ld+json">{"@type":"MusicAlbum","name":"Album","byArtist":{"name":"Artist"},"track":[{"name":"First"},{"name":"Second"}]}</script>
        """
        result = research.parse_page("https://label.example/album", page)
        self.assertEqual("Album", result["title"])
        self.assertEqual(["Artist"], result["artists"])
        self.assertEqual(["First", "Second"], result["tracks"])

    def test_recognizes_recording_company_domains(self):
        self.assertEqual(
            "recording_company",
            research.source_kind("https://www.universalmusic.it/musica-classica/album/example/"),
        )

    def test_builtin_plugins_enrich_matching_sources(self):
        plugins = research.discover()
        result = research.parse_page(
            "https://frontjang1.tistory.com/1",
            '<meta property="og:title" content="Example">',
            plugins,
        )
        self.assertEqual(["tistory"], result["plugins"])

    def test_extracts_movie_json_ld(self):
        page = """
        <script type="application/ld+json">{"@type":"Movie","name":"Example Film","director":{"name":"Director"},"actor":[{"name":"Actor One"},{"name":"Actor Two"}],"genre":["Drama","Mystery"],"duration":"PT120M"}</script>
        """
        result = research.parse_page("https://www.imdb.com/title/example", page, media_type="movie")
        self.assertEqual("Example Film", result["title"])
        self.assertEqual(["Director"], result["directors"])
        self.assertEqual(["Actor One", "Actor Two"], result["cast"])
        self.assertEqual(["Drama", "Mystery"], result["genres"])
        self.assertEqual("movie_database", result["kind"])

    def test_tmdb_plugin_extracts_movie_page_details(self):
        page = """
        <span class="release">10/14/1994 (US)</span>
        <span class="genres"><a href="/genre/18-drama/movie">Drama</a> and <a href="/genre/80-crime/movie">Crime</a></span>
        <span class="runtime">2h 22m</span>
        <ol><li class="profile"><p><a href="/person/1">Frank Darabont</a></p><p class="character">Director, Screenplay</p></li></ol>
        <meta property="og:image" content="https://media.themoviedb.org/t/p/w500/poster.jpg">
        """
        result = research.parse_page(
            "https://www.themoviedb.org/movie/278-example", page, research.discover(), media_type="movie"
        )
        self.assertEqual("10/14/1994 (US)", result["published"])
        self.assertEqual(["Drama", "Crime"], result["genres"])
        self.assertEqual("2h 22m", result["runtime"])
        self.assertEqual(["Frank Darabont"], result["directors"])
        self.assertEqual("https://media.themoviedb.org/t/p/w1280/poster.jpg", result["cover"])
        self.assertEqual(["tmdb"], result["plugins"])

    def test_catalogue_plugins_preserve_source_specific_identifiers(self):
        plugins = research.discover()
        amazon = research.parse_page("https://www.amazon.com/dp/B000000000", "", plugins)
        self.assertEqual("B000000000", amazon["asin"])
        apple = research.parse_page(
            "https://music.apple.com/us/album/example/1452191547",
            '<meta property="og:image" content="https://is1-ssl.mzstatic.com/image/thumb/Music/x.jpg/1200x630bb.jpg">',
            plugins,
        )
        self.assertEqual("1452191547", apple["catalogue_id"])
        self.assertIn("1200x1200bb.jpg", apple["cover_candidates"][0])
        naxos = research.parse_page("https://www.naxos.com/CatalogueDetail/?id=C621061A", "", plugins)
        self.assertEqual("C621061A", naxos["catalogue_number"])
        self.assertEqual("catalogue", naxos["kind"])

    def test_deutsche_grammophon_plugin_marks_primary_recording_source(self):
        page = '<script>{"upc":"00028945903729"}</script>'
        result = research.parse_page(
            "https://www.deutschegrammophon.com/en/catalogue/products/example", page, research.discover()
        )
        self.assertEqual("recording_company", result["kind"])
        self.assertEqual("Deutsche Grammophon", result["recording_company"])
        self.assertEqual("00028945903729", result["upc"])
        self.assertEqual(["deutsche_grammophon"], result["plugins"])

    def test_eloquence_classics_plugin_marks_decca_and_uses_large_cover(self):
        page = 'https://www.eloquenceclassics.com/wp-content/uploads/sites/1141/2016/05/4565632-1024x1024.jpg'
        result = research.parse_page(
            "https://www.eloquenceclassics.com/releases-archive/liszt-piano-concertos-4565632/",
            page,
            research.discover(),
        )
        self.assertEqual("recording_company", result["kind"])
        self.assertEqual("Decca", result["recording_company"])
        self.assertEqual("4565632", result["catalogue_number"])
        self.assertEqual(page, result["cover_candidates"][0])
        self.assertEqual(["eloquence_classics"], result["plugins"])

    def test_warner_classics_plugin_extracts_barcode_and_cover_candidate(self):
        page = '''<span>Barcode: 0190296697487</span><img src="/sites/default/files/styles/release_and_playlist_cover_756_x_756_2x_webp/public/cover.jpg.webp">'''
        result = research.parse_page(
            "https://www.warnerclassics.com/release/example", page, research.discover()
        )
        self.assertEqual("Warner Classics", result["recording_company"])
        self.assertEqual("0190296697487", result["barcode"])
        self.assertEqual(
            "https://www.warnerclassics.com/sites/default/files/styles/release_and_playlist_cover_756_x_756_2x_webp/public/cover.jpg.webp",
            result["cover_candidates"][0],
        )


if __name__ == "__main__":
    unittest.main()
