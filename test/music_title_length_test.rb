require "minitest/autorun"
require "stringio"
require "tmpdir"
require_relative "../scripts/check_music_title_lengths"

class MusicTitleLengthTest < Minitest::Test
  def with_album(title)
    Dir.mktmpdir do |root|
      directory = File.join(root, "_posts", "Music", "Classical")
      FileUtils.mkdir_p(directory)
      path = File.join(directory, "2022-11-01-example.md")
      File.write(path, "---\ntitle: #{title.to_json}\n---\n")
      yield root, path
    end
  end

  def test_suggests_catalogue_number_omissions
    title = "Grieg: Piano Concerto in A minor, Op. 16; Chopin: Piano Concerto No. 2 in F minor, Op. 21 - Thibaudet, Gergiev, Rotterdam Philharmonic Orchestra"
    assert_equal(
      "Grieg: Piano Concerto in A minor; Chopin: Piano Concerto No. 2 in F minor - Thibaudet, Gergiev, Rotterdam Philharmonic Orchestra",
      MusicTitleLengths.shortened_title(title)
    )
  end

  def test_apply_shortens_title_and_renames_file
    with_album("Chopin: Piano Concerto No. 1 in E minor, Op. 11 - Argerich") do |root, _path|
      assert MusicTitleLengths.run(root: root, max_length: 55, apply: true, output: StringIO.new)
      renamed = File.join(root, "_posts", "Music", "Classical", "2022-11-01-chopin-piano-concerto-no-1-in-e-minor-argerich.md")
      assert_path_exists renamed
      assert_includes File.read(renamed), 'title: "Chopin: Piano Concerto No. 1 in E minor - Argerich"'
    end
  end

  def test_apply_leaves_short_title_unchanged
    with_album("Chopin: Preludes, Op. 28 - Argerich") do |root, path|
      assert MusicTitleLengths.run(root: root, max_length: 80, apply: true, output: StringIO.new)
      assert_path_exists path
      assert_includes File.read(path), 'title: "Chopin: Preludes, Op. 28 - Argerich"'
    end
  end

  def test_reports_unshortenable_title
    with_album("A" * 141) do |root, _path|
      refute MusicTitleLengths.run(root: root, max_length: 140, output: StringIO.new)
    end
  end
end
