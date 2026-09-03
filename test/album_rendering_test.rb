require "nokogiri"
require "json"

ROOT = File.expand_path("..", __dir__)

def assert(condition, message)
  abort "Album rendering regression: #{message}" unless condition
end

album_path = File.join(ROOT, "_site", "albums", "murray-perahia-plays-chopin", "index.html")
assert(File.file?(album_path), "expected built Perahia album page")

document = Nokogiri::HTML(File.read(album_path))
composer = document.at_css(".album-entry .album-composer")
work = document.at_css(".album-entry .album-work")
assert(composer&.name == "h4", "multi-disc composer headings should be identified semantically")
assert(work&.name == "h5", "multi-disc work headings should be identified semantically")
disc_two = document.at_xpath("//h3[normalize-space(.)='CD2']")
assert(disc_two&.next_element&.text&.include?("Piano Sonata No. 2"), "a work should follow CD2 without a repeated composer heading")
work_break = document.at_css(".album-entry .track-work-break")
assert(work_break, "standalone work following a movement list needs a visible boundary")
assert(work_break.text.strip.start_with?("25. Prelude in C-sharp minor, Op. 45"), "track 25 should begin the standalone work")
assert(work_break.previous_element&.text&.strip&.start_with?("24. 24. No. 24 in D minor"), "the boundary should follow movement 24 of Op. 28")
assert(!work_break.next_element&.classes&.include?("track-work-break"), "the boundary should occur only before the first following standalone work")

standalone_work = File.join(ROOT, "_generated", "composers", "chopin-frederic", "prelude-in-c-sharp-minor-op-45-sostenuto.md")
assert(File.file?(standalone_work), "track 25 should be indexed as a separate work")
assert(File.read(standalone_work).include?("Murray Perahia plays Chopin"), "the separate work should reference its album")

perahia_source = File.read(File.join(ROOT, "_posts", "Music", "Classical", "Labels", "Sony Classical Masters", "2025-05-22-murray-perahia-plays-chopin.md"))
assert(perahia_source.scan(/^#### Chopin, Frederic$/).one?, "an unchanged composer should be declared only once across CDs")

wild_album = File.join(ROOT, "_posts", "Music", "Classical", "Pianists", "Wild, Earl", "2022-11-03-chopin-piano-concerto-no-1-faure-ballade-liszt-piano-concerto-no-1-wild-sargent-gerhardt.md")
wild_source = File.read(wild_album)
assert(!wild_source.match?(/^### (?!CD).+\n\n(?:#### |\d)/), "composer headings should have no empty line before their work or first track")
assert(!wild_source.match?(/^#### .+\n\n\d/), "work headings should have no empty line before their first track")

liszt_page = File.join(ROOT, "_generated", "composers", "liszt-franz.md")
assert(File.file?(liszt_page), "a fuller composer name should replace a surname-only canonical page")
liszt_source = File.read(liszt_page)
assert(liszt_source.include?("title: Liszt, Franz"), "the fuller composer name should be canonical")
assert(liszt_source.match?(/aliases:\s*\n- Liszt/), "the former surname-only name should remain an alias")
assert(!File.exist?(File.join(ROOT, "_generated", "composers", "liszt.md")), "the obsolete surname-only composer page should not be regenerated")

paik_album = File.join(ROOT, "_posts", "Music", "Classical", "Pianists", "Paik, Kun-Woo", "2022-11-02-chopin-complete-works-for-piano-orchestra-paik-wit-warsaw-philharmonic-orchestra.md")
assert(File.file?(paik_album), "an album identified by its recording company should not be filed as a label series")
album_catalog = JSON.parse(File.read(File.join(ROOT, "data", "albums.json"))).fetch("albums")
paik_catalog_entry = album_catalog.find { |album| album["title"] == "Chopin: Complete Works for Piano & Orchestra - Paik, Wit, Warsaw Philharmonic Orchestra" }
assert(paik_catalog_entry&.fetch("recording") == "Decca", "the recording company should remain in recording metadata")
assert(paik_catalog_entry&.fetch("label").nil?, "a recording company should not be exposed as a label series")
assert(!File.exist?(File.join(ROOT, "_generated", "labels", "decca.md")), "a recording company should not generate a label-series page")

paik_page = File.join(ROOT, "_site", "albums", "chopin-complete-works-for-piano-orchestra-paik-wit-warsaw-philharmonic-orchestra", "index.html")
assert(File.file?(paik_page), "expected built Paik album page")
paik_document = Nokogiri::HTML(File.read(paik_page))
paik_entry = paik_document.at_css(".album-entry")
assert(paik_entry.css("ol").empty?, "album tracks should render as plain text rather than ordered lists")
paik_composer = paik_entry.at_xpath(".//h4[normalize-space(.)='Chopin, Frederic']")
paik_first_track = paik_composer&.next_element
assert(paik_first_track&.matches?("div.album-track"), "the first plain-text track should immediately follow its composer heading")
assert(paik_first_track&.text&.strip == "1. Krakowiak in F major, Op. 14", "plain-text tracks should preserve their visible track numbers")

walton_work = File.join(ROOT, "_generated", "composers", "walton-william", "cello-concerto.md")
assert(File.file?(walton_work), "the imported Walton concerto should generate a work page")
walton_source = File.read(walton_work)
assert(walton_source.include?("6. Rapsodicamente"), "lettered movement numbers should be normalized sequentially on work pages")

goldberg_work = File.join(ROOT, "_generated", "composers", "bach-johann-sebastian", "goldberg-variations-bwv-988.md")
assert(File.file?(goldberg_work), "the imported Goldberg Variations should generate a work page")
assert(File.read(goldberg_work).include?("30. Variation 29 a 1 ovvero 2 Clav."), "a previously empty generated work page should accept new movements")

puts "Album rendering conventions passed"
