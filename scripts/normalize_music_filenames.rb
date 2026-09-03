require "date"
require "fileutils"
require "yaml"

SOURCE_ROOT = File.expand_path("..", __dir__)


def slug(value)
  value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}/, "").downcase
    .gsub(/[^a-z0-9]+/, "-")
    .gsub(/^-|-$/, "")
end

Dir[File.join(SOURCE_ROOT, "_posts", "Music", "**", "*.md")].each do |path|
  content = File.read(path)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  next unless match

  metadata = YAML.safe_load(match[1], permitted_classes: [Date, Time]) || {}
  title = metadata["title"].to_s.strip
  date = File.basename(path)[/\A\d{4}-\d{2}-\d{2}/]
  next if title.empty? || date.nil?

  target = File.join(File.dirname(path), "#{date}-#{slug(title)}.md")
  next if path == target
  raise "Target already exists: #{target}" if File.exist?(target)

  FileUtils.mv(path, target)
end
