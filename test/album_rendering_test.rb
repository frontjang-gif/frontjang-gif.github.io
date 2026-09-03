require "nokogiri"

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
assert(!work_break.next_element&.key?("class"), "the boundary should occur only before the first following standalone work")

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

puts "Album rendering conventions passed"
