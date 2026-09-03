require "cgi"
require "date"
require "fileutils"
require "yaml"

SOURCE_ROOT = File.expand_path("..", __dir__)
OUTPUT_ROOT = File.join(SOURCE_ROOT, "_generated")


def slug(value)
  value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}/, "").downcase
    .gsub(/[^a-z0-9]+/, "-")
    .gsub(/^-|-$/, "")
end

def normalized_name(value)
  value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}/, "").downcase
end

def display_name(value)
  value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}/, "").gsub(/[^A-Za-z0-9;&,.-]+/, " ").strip
end

def artist_surname(value)
  normalized = normalized_name(value)
  normalized.include?(",") ? normalized.split(",", 2).first.strip : normalized.split.last
end

def person_surname(value)
  normalized = normalized_name(value)
  normalized.include?(",") ? normalized.split(",", 2).first.strip : normalized.split.last
end

def existing_artist_page(name)
  $preserved_pages.each do |path, page|
    metadata = page[:metadata]
    next unless path.match?(%r{/_generated/artists/})

    aliases = Array(metadata["aliases"])
    old_slug = File.basename(path, ".md")
    matches_name = ([metadata["title"]] + aliases).include?(name) || old_slug == slug(name)
    matches_full_name = metadata["title"].to_s != "" && normalized_name(name).end_with?(" #{normalized_name(metadata["title"])}")
    matches_surname = artist_surname(name) == artist_surname(metadata["title"])
    if matches_name || matches_full_name || matches_surname
      metadata = metadata.dup
      previous_title = metadata["title"]
      metadata["title"] = name if matches_full_name || matches_surname
      metadata["aliases"] = ([previous_title, *aliases, File.basename(path, ".md")]).compact.uniq
      metadata["_generated_content"] = page[:content]
      return metadata
    end
  end
  nil
end

def existing_composer_page(name)
  $preserved_frontmatter.each do |path, metadata|
    next unless File.dirname(path) == File.join(OUTPUT_ROOT, "composers")

    aliases = Array(metadata["aliases"])
    old_slug = File.basename(path, ".md")
    same_surname = person_surname(metadata["title"]) == person_surname(name)
    exact_match = [metadata["title"], *aliases].include?(name) || old_slug == slug(name)
    next unless exact_match || same_surname

    metadata = metadata.dup
    if same_surname && !exact_match
      metadata["aliases"] = (aliases + [name]).uniq
      $preserved_frontmatter[path]["aliases"] = metadata["aliases"]
    end
    return metadata
  end
  nil
end
def page_link(path, label)
  "- [#{label}](\u007b\u007b site.baseurl \u007d\u007d#{path})"
end

def music_sidebar_tree(albums)
  tree = {}
  albums.each do |album|
    relative = album[:path].delete_prefix(File.join(SOURCE_ROOT, "_posts", "Music") + File::SEPARATOR)
    folders = relative.split(File::SEPARATOR)[0...-1]
    node = tree
    folders.each { |folder| node = (node[folder] ||= {}) }
    (node["_albums"] ||= []) << album
  end
  tree
end

def sidebar_album_count(node)
  node.fetch("_albums", []).size + node.values.grep(Hash).sum { |child| sidebar_album_count(child) }
end

def music_sidebar_folder_url(folders)
  return "/albums/#{slug(folders.first)}/" if folders.size == 1
  return "/labels/" if folders[1] == "Labels" && folders.size == 2
  return "/labels/#{slug(folders.last)}/" if folders[1] == "Labels"
  return "/artists/" if folders[1] == "Pianists" && folders.size == 2
  return "/artists/#{slug(folders.last)}/" if folders[1] == "Pianists"

  "/albums/"
end

def render_music_sidebar(node, ancestors = [])
  node.keys.reject { |key| key == "_albums" }.sort.flat_map do |folder|
    children = node[folder]
    folders = ancestors + [folder]
    descendant_count = sidebar_album_count(children)
    url = music_sidebar_folder_url(folders)
    content = []
    content << "<details class=\"sidebar-subgroup sidebar-folder\"#{ancestors.empty? ? " open" : ""}>"
    content << "  <summary><a href=\"{{ site.baseurl }}#{url}\">#{folder} <span>#{descendant_count}</span></a></summary>"
    content += render_music_sidebar(children, folders).map { |line| "  #{line}" }
    content << "</details>"
    content
  end
end

RATING_LABELS = {
  "5" => "★★★★★ 인생작 (손가락 안에 꼽는)",
  "4.5" => "★★★★☆ 아쉽게도 미끄러진 인생작",
  "4" => "★★★★ 명작 (영화 이름이 기억에 남는, 종종 보고 싶은)",
  "3.5" => "★★★☆ 수작 (추천할 만한, 가끔 볼 만한)",
  "3" => "★★★ 괜찮게 만든, 3번은 볼 수 있는",
  "2.5" => "★★☆ 그저 그런, 2번만 볼",
  "2" => "★★ 1번만 보고 기억에서 사라질",
  "1.5" => "★☆ 1번 보기도 아까운",
  "1" => "★ 투자자가 불쌍한 괴작",
  "0.5" => "☆ 널리 알려져 있을 정도의 데이터 낭비"
}.freeze

def rating_label(value)
  RATING_LABELS[value.to_s] || value.to_s
end

def count_label(name, count)
  "#{name} (#{count})"
end

def album_url(album)
  filename = File.basename(album[:path], ".md").sub(/^\d{4}-\d{2}-\d{2}-/, "")
  "/albums/#{slug(filename)}/"
end

def escape_yaml(value)
  value.to_s.gsub('"', '\\"')
end

def parse_album(path)
  lines = File.readlines(path)
  source = File.read(path)
  frontmatter = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  metadata = frontmatter ? (YAML.safe_load(frontmatter[1], permitted_classes: [Date, Time]) || {}) : {}
  title = metadata["title"] || File.basename(path, ".md")
  artist = metadata["artist"]
  artist = [artist] unless artist.is_a?(Array)
  year = metadata["year"]
  music_root = File.join(SOURCE_ROOT, "_posts", "Music") + File::SEPARATOR
  relative_path = path.delete_prefix(music_root).split(File::SEPARATOR)
  category = relative_path.length > 1 ? relative_path.first : nil
  favorite = metadata["favorite"]
  recording = metadata["recording"]
  label = relative_path[1] == "Labels" ? relative_path[2] : nil
  composer = nil
  work = nil
  works = []

  lines.each do |line|
    if (match = line.match(/^#### ([^#].*)$/))
      composer = match[1].strip
      saved_composer = existing_composer_page(composer)
      composer = saved_composer["title"] if saved_composer && saved_composer["title"]
      work = nil
    elsif (match = line.match(/^##### ([^#].*)$/)) && composer
      raw_title = match[1].strip
      saved = existing_work_page(composer, raw_title)
      work = { composer: composer, title: saved ? saved["title"] : raw_title, movements: [], metadata: saved || {} }
      works << work
    elsif (match = line.match(/^\s*\d+[A-Za-z]?\.\s+\*\*([^*]+)\*\*\s+-\s+(.+)$/))
      work_composer = match[1].strip
      saved_composer = existing_composer_page(work_composer)
      work_composer = saved_composer["title"] if saved_composer && saved_composer["title"]
      work = { composer: work_composer, title: match[2].strip, movements: [], metadata: {} }
      works << work
    elsif composer && (match = line.match(/^\s*\d+[A-Za-z]?\.\s+\d+\.\s+(.+)$/))
      work[:movements] << match[1].strip if work
    elsif composer && (match = line.match(/^\s*\d+[A-Za-z]?\.\s+(.+)$/))
      item = match[1].strip
      if work && work[:movements].empty?
        work[:movements] << item
      else
        saved = existing_work_page(composer, item)
        works << { composer: composer, title: saved ? saved["title"] : item, movements: [], metadata: saved || {} }
        work = works.last
      end
    elsif line.match?(/^###?\s/)
      work = nil
    end
  end

  artist_records = artist.map(&:to_s).map(&:strip).reject(&:empty?).map do |name|
    saved = existing_artist_page(name)
    { name: saved ? saved["title"] : display_name(name), original_name: name }
  end
  { title: title, artist: artist, artist_names: artist_records.map { |record| record[:name] }, artist_records: artist_records, year: year, category: category, favorite: favorite, recording: recording, label: label, works: works, path: path }
end

def parse_movie(path)
  source = File.read(path)
  frontmatter = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  metadata = frontmatter ? (YAML.safe_load(frontmatter[1], permitted_classes: [Date, Time]) || {}) : {}
  { title: metadata["title"] || File.basename(path, ".md"), year: metadata["year"], rating: metadata["rating"], directors: Array(metadata["directors"]), cast: Array(metadata["cast"]), genres: Array(metadata["genres"]), path: path }
end

def existing_work_page(composer, title)
  $preserved_pages.each do |path, page|
    metadata = page[:metadata]
    next unless path.match?(%r{/_generated/composers/})

    aliases = Array(metadata["aliases"])
    old_slug = File.basename(path, ".md")
    old_slug = File.basename(File.dirname(path)) if old_slug == "index"
    same_composer = person_surname(metadata["composer"]) == person_surname(composer)
    if same_composer && (([metadata["title"]] + aliases).include?(title) || old_slug == slug(title))
      metadata = metadata.dup
      metadata["_generated_content"] = page[:content]
      return metadata
    end
  end
  nil
end

def existing_frontmatter(path)
  return $preserved_frontmatter[path] if $preserved_frontmatter.key?(path)
  return {} unless File.file?(path)

  content = File.read(path)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  match ? (YAML.safe_load(match[1]) || {}) : {}
end

def write_page(path, title, body)
  FileUtils.mkdir_p(File.dirname(path))
  metadata = (body[:metadata] || {}).merge(existing_frontmatter(path))
  content = metadata.delete("_generated_content") || body[:content]
  content = content.to_s.rstrip
  metadata.delete("permalink")
  metadata.merge!("layout" => "page", "title" => title)
  File.write(path, <<~MARKDOWN)
    ---
    #{metadata.to_yaml.sub("---\n", "").strip}
    ---

    #{content}
  MARKDOWN
end

$preserved_frontmatter = {}
$preserved_pages = {}
Dir[File.join(OUTPUT_ROOT, "**", "*.md")].each do |path|
  content = File.read(path)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  if match
    metadata = YAML.safe_load(match[1]) || {}
    $preserved_frontmatter[path] = metadata
    $preserved_pages[path] = { metadata: metadata, content: content[match.end(0)..] }
  end
end

albums = Dir[File.join(SOURCE_ROOT, "_posts", "Music", "**", "*.md")].map do |path|
  parse_album(path)
end
movies = Dir[File.join(SOURCE_ROOT, "_posts", "Movie", "*.md")].map { |path| parse_movie(path) }
works = albums.flat_map { |album| album[:works] }.uniq { |work| [work[:composer], work[:title]] }
composers = works.group_by { |work| work[:composer] }
artists = albums.flat_map do |album|
  album[:artist_names].map { |artist| [artist, album] }
end.group_by(&:first).transform_values { |entries| entries.map(&:last).uniq }
categories = albums.reject { |album| album[:category].to_s.empty? }.group_by { |album| album[:category] }
recordings = albums.reject { |album| album[:recording].to_s.empty? }.group_by { |album| album[:recording] }
labels = albums.reject { |album| album[:label].to_s.empty? }.group_by { |album| album[:label] }
artist_original_names = albums.flat_map { |album| album[:artist_records] }.each_with_object({}) do |record, names|
  names[record[:name]] ||= record[:original_name]
end

FileUtils.rm_rf(OUTPUT_ROOT)
FileUtils.mkdir_p(OUTPUT_ROOT)

sidebar_content = ["<a href=\"{{ site.baseurl }}/albums/\">All <span>#{albums.size}</span></a>"]
sidebar_content += render_music_sidebar(music_sidebar_tree(albums))
File.write(File.join(SOURCE_ROOT, "_includes", "generated-music-sidebar.html"), sidebar_content.join("\n") + "\n")

movie_path = ->(movie) { "/movies/#{slug(movie[:title])}/" }
movie_groups = {
  "directors" => movies.flat_map { |movie| movie[:directors].map { |value| [value, movie] } },
  "cast" => movies.flat_map { |movie| movie[:cast].map { |value| [value, movie] } },
  "genres" => movies.flat_map { |movie| movie[:genres].map { |value| [value, movie] } },
  "ratings" => movies.reject { |movie| movie[:rating].nil? }.map { |movie| [movie[:rating].to_s, movie] },
  "years" => movies.map { |movie| ["#{movie[:year].to_i / 10 * 10}s", movie] }
}.transform_values { |entries| entries.group_by(&:first).transform_values { |items| items.map(&:last).uniq } }

movie_groups.each do |group, values|
  rating_values = group == "ratings" ? values.keys.sort_by(&:to_f).reverse : values.keys.sort_by { |value| [-values[value].size, value] }
  group_content = rating_values.map do |value|
    links = values[value].sort_by { |movie| movie[:title] }.map { |movie| page_link(movie_path.call(movie), movie[:title]) }
    heading = group == "ratings" ? "#{value} - #{rating_label(value)} (#{values[value].size})" : count_label(value, values[value].size)
    "## #{heading}\n\n#{links.join("\n")}"
  end.join("\n\n")
  write_page(File.join(OUTPUT_ROOT, "movies", "#{group}.md"), "Movie #{group.capitalize}", content: group_content)

  values.each do |value, value_movies|
    links = value_movies.sort_by { |movie| movie[:title] }.map { |movie| page_link(movie_path.call(movie), movie[:title]) }
    page_title = group == "ratings" ? "#{value} - #{rating_label(value)}" : value
    write_page(File.join(OUTPUT_ROOT, "movies", group, "#{slug(value)}.md"), page_title, content: links.join("\n"))
  end
end

category_content = categories.keys.sort.map do |category|
  albums_in_category = categories[category].sort_by { |album| album[:title] }
  "## #{category}\n\n" + albums_in_category.map do |album|
    page_link(album_url(album), album[:title])
  end.join("\n")
end.join("\n\n")
write_page(File.join(OUTPUT_ROOT, "albums", "categories.md"), "Music Categories", content: category_content)

favorite_content = "## Favorite Albums\n\n{% assign albums = site.posts | where: 'favorite', true | sort: 'date' | reverse %}\n{% for post in albums %}\n{% include post-card.html %}\n{% endfor %}\n\n## Favorite Works\n\n"
favorite_works = works.select { |work| work[:metadata]["favorite"] == true }.sort_by { |work| [work[:composer], work[:title]] }
favorite_content += favorite_works.map do |work|
  page_link("/composers/#{slug(work[:composer])}/#{slug(work[:title])}/", "#{work[:composer]}: #{work[:title]}")
end.join("\n")
write_page(File.join(OUTPUT_ROOT, "favorites.md"), "Favorite Albums", content: favorite_content)

categories.each do |category, category_albums|
  links = category_albums.sort_by { |album| album[:title] }.map do |album|
    page_link(album_url(album), album[:title])
  end
  content = "[All music categories](\u007b\u007b site.baseurl \u007d\u007d/albums/categories/)\n\n" + links.join("\n")
  category_path = File.join(OUTPUT_ROOT, "albums", slug(category) + ".md")
  write_page(category_path, category, content: content, metadata: { "category" => category })
end

{ "recordings" => recordings, "labels" => labels }.each do |group, entries|
  links = entries.keys.sort_by { |value| [-entries[value].size, value] }.map do |value|
    page_link("/#{group}/#{slug(value)}/", count_label(value, entries[value].size))
  end
  write_page(File.join(OUTPUT_ROOT, "#{group}.md"), group.capitalize, content: links.join("\n"))

  entries.each do |value, value_albums|
    album_links = value_albums.sort_by { |album| album[:title] }.map do |album|
      page_link(album_url(album), album[:title])
    end
    write_page(File.join(OUTPUT_ROOT, group, "#{slug(value)}.md"), value, content: album_links.join("\n"))
  end
end

composer_keys = composers.keys.sort_by { |composer| [-composers[composer].size, composer] }
composer_links = composer_keys.map do |composer|
  page_link("/composers/#{slug(composer)}/", count_label(composer, composers[composer].size))
end
write_page(File.join(OUTPUT_ROOT, "composers.md"), "Composers", content: composer_links.join("\n"))

composers.each do |composer, composer_works|
  links = composer_works.sort_by { |work| work[:title] }.map do |work|
    page_link("/composers/#{slug(composer)}/#{slug(work[:title])}/", work[:title])
  end
  content = "[All composers](\u007b\u007b site.baseurl \u007d\u007d/composers/)\n\n" + links.join("\n")
  saved_composer = existing_composer_page(composer)
  composer_metadata = { "wiki" => "", "born" => "", "original_name" => composer, "aliases" => [] }
  composer_metadata.merge!(saved_composer) if saved_composer
  write_page(File.join(OUTPUT_ROOT, "composers", "#{slug(composer)}.md"), composer, content: content, metadata: composer_metadata)

  composer_works.each do |work|
    references = albums.select { |album| album[:works].any? { |candidate| candidate[:title] == work[:title] } }
    movements = work[:movements].each_with_index.map do |movement, index|
      "#{index + 1}. #{movement.sub(/^\d+[A-Za-z]?\.\s*/, "")}"
    end
    content = ""
    content += "#{movements.join("\n")}\n\n" unless movements.empty?
    content += "## Referenced by\n\n"
    content += references.map { |album| page_link(album_url(album), album[:title]) }.join("\n")
    work_path = File.join(OUTPUT_ROOT, "composers", "#{slug(composer)}", "#{slug(work[:title])}.md")
    metadata = { "composer" => composer, "imslp" => "", "favorite" => false }.merge(work[:metadata] || {})
    write_page(work_path, work[:title], content: content, metadata: metadata)
  end
end

artist_keys = artists.keys.sort_by { |artist| [-artists[artist].size, artist] }
artist_links = artist_keys.map { |artist| page_link("/artists/#{slug(artist)}/", count_label(artist, artists[artist].size)) }
write_page(File.join(OUTPUT_ROOT, "artists.md"), "Artists", content: artist_links.join("\n"))

artists.each do |artist, artist_albums|
  grouped = artist_albums.group_by { |album| album[:year] || "Unknown" }
  content = "[All artists](\u007b\u007b site.baseurl \u007d\u007d/artists/)\n\n"
  grouped.keys.sort.reverse.each do |year|
    content += "## #{year}\n\n"
    content += grouped[year].sort_by { |album| album[:title] }.map do |album|
      page_link(album_url(album), album[:title])
    end.join("\n") + "\n\n"
  end
  metadata = { "wiki" => "", "born" => "", "original_name" => artist_original_names[artist] || artist }
  write_page(File.join(OUTPUT_ROOT, "artists", "#{slug(artist)}.md"), artist, content: content, metadata: metadata)
end
