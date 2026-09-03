#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "fileutils"
require "json"
require "yaml"

# Keep album titles useful in navigation while leaving the full canonical work
# names in the body, where the generated work pages use them.
module MusicTitleLengths
  DEFAULT_MAX_LENGTH = 140

  module_function

  def slug(value)
    value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}/, "").downcase
      .gsub(/[^a-z0-9]+/, "-")
      .gsub(/^-|-$/, "")
  end

  def shortened_title(title)
    # Catalogue identifiers distinguish works in a track listing, but make a
    # multi-work album title needlessly hard to scan.
    title.gsub(/,\s*(?:Op\.|S\.|FWV|M\.)\s*\d+(?:[A-Za-z.\/-]*)/, "")
  end

  def albums(root)
    Dir[File.join(root, "_posts", "Music", "**", "*.md")].sort.filter_map do |path|
      content = File.read(path)
      front_matter = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
      next unless front_matter

      metadata = YAML.safe_load(front_matter[1], permitted_classes: [Date, Time]) || {}
      title = metadata["title"].to_s.strip
      next if title.empty?

      { path: path, content: content, title: title }
    end
  end

  def apply_shortening(album)
    title = shortened_title(album[:title])
    return album if title == album[:title]

    updated = album[:content].sub(/^title:\s*.*$/, "title: #{JSON.generate(title)}")
    File.write(album[:path], updated)

    date = File.basename(album[:path])[/\A\d{4}-\d{2}-\d{2}/]
    target = File.join(File.dirname(album[:path]), "#{date}-#{slug(title.sub(/\s+\(\d{4}\)\z/, ""))}.md")
    if target != album[:path]
      raise "Target already exists: #{target}" if File.exist?(target)

      FileUtils.mv(album[:path], target)
    end

    album.merge(path: target, content: updated, title: title)
  end

  def run(root:, max_length:, apply: false, output: $stdout)
    changed = 0
    records = albums(root).map do |album|
      updated = apply && album[:title].length > max_length ? apply_shortening(album) : album
      changed += 1 if updated[:title] != album[:title]
      updated
    end

    too_long = records.select { |album| album[:title].length > max_length }
    too_long.each do |album|
      suggestion = shortened_title(album[:title])
      output.puts "#{album[:path]}: #{album[:title].length} characters (max #{max_length})"
      output.puts "  suggested: #{suggestion}" if suggestion != album[:title]
    end
    output.puts "Shortened #{changed} album title(s)." if apply && changed.positive?
    return true if too_long.empty?

    output.puts "Run `ruby scripts/check_music_title_lengths.rb --apply` to apply safe catalogue-number omissions."
    false
  end
end

if $PROGRAM_NAME == __FILE__
  apply = ARGV.delete("--apply")
  abort "Usage: ruby scripts/check_music_title_lengths.rb [--apply]" unless ARGV.empty?

  root = File.expand_path("..", __dir__)
  max_length = Integer(ENV.fetch("MUSIC_TITLE_MAX_LENGTH", MusicTitleLengths::DEFAULT_MAX_LENGTH.to_s))
  exit(MusicTitleLengths.run(root: root, max_length: max_length, apply: apply) ? 0 : 1)
end
