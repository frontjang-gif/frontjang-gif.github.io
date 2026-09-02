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
  $preserved_frontmatter.each do |path, metadata|
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
      return metadata
    end
  end
  nil
end

def existing_composer_page(name)
  $preserved_frontmatter.each do |path, metadata|
    next unless path.match?(%r{/_generated/composers/}) && File.basename(path, ".md") != "composers"

    aliases = Array(metadata["aliases"])
    old_slug = File.basename(path, ".md")
    return metadata if ([metadata["title"], *aliases].include?(name) || old_slug == slug(name))
  end
  nil
end
def page_link(path, label)
  "- [#{label}](\u007b\u007b site.baseurl \u007d\u007d#{path})"
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
  category = metadata["music_category"]
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
    elsif composer && (match = line.match(/^\s*\d+\.\s+(.+)$/))
      item = match[1].strip
      if work
        work[:movements] << item
      else
        works << { composer: composer, title: item, movements: [], metadata: {} }
      end
    elsif line.match?(/^###?\s/)
      work = nil
    end
  end

  artist_records = artist.map(&:to_s).map(&:strip).reject(&:empty?).map do |name|
    saved = existing_artist_page(name)
    { name: saved ? saved["title"] : display_name(name), original_name: name }
  end
  { title: title, artist: artist, artist_names: artist_records.map { |record| record[:name] }, artist_records: artist_records, year: year, category: category, works: works, path: path }
end

def parse_movie(path)
  source = File.read(path)
  frontmatter = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  metadata = frontmatter ? (YAML.safe_load(frontmatter[1], permitted_classes: [Date, Time]) || {}) : {}
  { title: metadata["title"] || File.basename(path, ".md"), year: metadata["year"], directors: Array(metadata["directors"]), cast: Array(metadata["cast"]), genres: Array(metadata["genres"]), path: path }
end

def existing_work_page(composer, title)
  $preserved_frontmatter.each do |path, metadata|
    next unless path.match?(%r{/_generated/composers/})

    aliases = Array(metadata["aliases"])
    old_slug = File.basename(path, ".md")
    old_slug = File.basename(File.dirname(path)) if old_slug == "index"
    same_composer = person_surname(metadata["composer"]) == person_surname(composer)
    return metadata if same_composer && (([metadata["title"]] + aliases).include?(title) || old_slug == slug(title))
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
  metadata.delete("permalink")
  metadata.merge!("layout" => "page", "title" => title)
  File.write(path, <<~MARKDOWN)
    ---
    #{metadata.to_yaml.sub("---\n", "").strip}
    ---

    #{body[:content]}
  MARKDOWN
end

$preserved_frontmatter = {}
Dir[File.join(OUTPUT_ROOT, "**", "*.md")].each do |path|
  content = File.read(path)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  $preserved_frontmatter[path] = YAML.safe_load(match[1]) || {} if match
end

albums = Dir[File.join(SOURCE_ROOT, "_posts", "music", "**", "*.md")].map do |path|
  parse_album(path)
end
movies = Dir[File.join(SOURCE_ROOT, "_posts", "movie", "*.md")].map { |path| parse_movie(path) }
works = albums.flat_map { |album| album[:works] }.uniq { |work| [work[:composer], work[:title]] }
composers = works.group_by { |work| work[:composer] }
artists = albums.flat_map do |album|
  album[:artist_names].map { |artist| [artist, album] }
end.group_by(&:first).transform_values { |entries| entries.map(&:last).uniq }
categories = albums.reject { |album| album[:category].to_s.empty? }.group_by { |album| album[:category] }
artist_original_names = albums.flat_map { |album| album[:artist_records] }.each_with_object({}) do |record, names|
  names[record[:name]] ||= record[:original_name]
end

FileUtils.rm_rf(OUTPUT_ROOT)
FileUtils.mkdir_p(OUTPUT_ROOT)

movie_path = ->(movie) { "/movies/#{slug(movie[:title])}/" }
movie_groups = {
  "directors" => movies.flat_map { |movie| movie[:directors].map { |value| [value, movie] } },
  "cast" => movies.flat_map { |movie| movie[:cast].map { |value| [value, movie] } },
  "genres" => movies.flat_map { |movie| movie[:genres].map { |value| [value, movie] } },
  "years" => movies.map { |movie| ["#{movie[:year].to_i / 10 * 10}s", movie] }
}.transform_values { |entries| entries.group_by(&:first).transform_values { |items| items.map(&:last).uniq } }

movie_groups.each do |group, values|
  group_content = values.keys.sort.map do |value|
    links = values[value].sort_by { |movie| movie[:title] }.map { |movie| page_link(movie_path.call(movie), movie[:title]) }
    "## #{value}\n\n#{links.join("\n")}"
  end.join("\n\n")
  write_page(File.join(OUTPUT_ROOT, "movies", "#{group}.md"), "Movie #{group.capitalize}", content: group_content)

  values.each do |value, value_movies|
    links = value_movies.sort_by { |movie| movie[:title] }.map { |movie| page_link(movie_path.call(movie), movie[:title]) }
    write_page(File.join(OUTPUT_ROOT, "movies", group, "#{slug(value)}.md"), value, content: links.join("\n"))
  end
end

category_content = categories.keys.sort.map do |category|
  albums_in_category = categories[category].sort_by { |album| album[:title] }
  "## #{category}\n\n" + albums_in_category.map do |album|
    album_path = album[:path].sub(SOURCE_ROOT, "").sub(%r{^/_posts/music/}, "/albums/").sub(/\.md$/, "/")
    page_link(album_path, album[:title])
  end.join("\n")
end.join("\n\n")
write_page(File.join(OUTPUT_ROOT, "albums", "categories.md"), "Music Categories", content: category_content)

categories.each do |category, category_albums|
  content = "[All music categories](\u007b\u007b site.baseurl \u007d\u007d/albums/categories/)\n\n"
  content += category_albums.sort_by { |album| album[:title] }.map do |album|
    album_path = album[:path].sub(SOURCE_ROOT, "").sub(%r{^/_posts/music/}, "/albums/").sub(/\.md$/, "/")
    page_link(album_path, album[:title])
  end.join("\n")
  category_path = File.join(OUTPUT_ROOT, "albums", slug(category) + ".md")
  write_page(category_path, category, content: content, metadata: { "category" => category })
end

composer_links = composers.keys.sort.map do |composer|
    page_link("/composers/#{slug(composer)}/", composer)
end
write_page(File.join(OUTPUT_ROOT, "composers.md"), "Composers", content: composer_links.join("\n"))

composers.each do |composer, composer_works|
  links = composer_works.sort_by { |work| work[:title] }.map do |work|
    page_link("/composers/#{slug(composer)}/#{slug(work[:title])}/", work[:title])
  end
  content = "[All composers](\u007b\u007b site.baseurl \u007d\u007d/composers/)\n\n" + links.join("\n")
  saved_composer = existing_composer_page(composer)
  composer_metadata = { "wiki" => "", "born" => "", "original_name" => composer }
  composer_metadata.merge!(saved_composer) if saved_composer
  write_page(File.join(OUTPUT_ROOT, "composers", "#{slug(composer)}.md"), composer, content: content, metadata: composer_metadata)

  composer_works.each do |work|
    references = albums.select { |album| album[:works].any? { |candidate| candidate[:title] == work[:title] } }
    movements = work[:movements].map { |movement| "1. #{movement.sub(/^\d+\.\s*/, "")}" }
    content = ""
    content += "#{movements.join("\n")}\n\n" unless movements.empty?
    content += "## Referenced by\n\n"
    content += references.map { |album| page_link("#{album[:path].sub(SOURCE_ROOT, "").sub(%r{^/_posts/music/}, "/albums/").sub(/\.md$/, "/")}", album[:title]) }.join("\n")
    work_path = File.join(OUTPUT_ROOT, "composers", "#{slug(composer)}", "#{slug(work[:title])}.md")
    metadata = { "composer" => composer, "imslp" => "" }.merge(work[:metadata] || {})
    write_page(work_path, work[:title], content: content, metadata: metadata)
  end
end

artist_links = artists.keys.sort.map { |artist| page_link("/artists/#{slug(artist)}/", artist) }
write_page(File.join(OUTPUT_ROOT, "artists.md"), "Artists", content: artist_links.join("\n"))

artists.each do |artist, artist_albums|
  grouped = artist_albums.group_by { |album| album[:year] || "Unknown" }
  content = "[All artists](\u007b\u007b site.baseurl \u007d\u007d/artists/)\n\n"
  grouped.keys.sort.reverse.each do |year|
    content += "## #{year}\n\n"
    content += grouped[year].sort_by { |album| album[:title] }.map do |album|
      album_path = album[:path].sub(SOURCE_ROOT, "").sub(%r{^/_posts/music/}, "/albums/").sub(/\.md$/, "/")
      page_link(album_path, album[:title])
    end.join("\n") + "\n\n"
  end
  metadata = { "wiki" => "", "born" => "", "original_name" => artist_original_names[artist] || artist }
  write_page(File.join(OUTPUT_ROOT, "artists", "#{slug(artist)}.md"), artist, content: content, metadata: metadata)
end
