module MediaFolderPaths
  WINDOWS_INVALID_CHARACTERS = /[<>:"\\|?*\x00-\x1f]/

  def derived_music_folder(post_path, title)
    normalized_path = post_path.to_s.tr("\\", "/")
    relative_path = normalized_path.sub(%r{\A.*?_posts/Music/}, "")
    parent_path = File.dirname(relative_path)
    folder_name = title.to_s.gsub(WINDOWS_INVALID_CHARACTERS, "")
                       .gsub(/\s+/, " ")
                       .strip
                       .sub(/[. ]+\z/, "")

    raise ArgumentError, "Cannot derive a music folder from an empty title" if folder_name.empty?

    [parent_path == "." ? nil : parent_path, folder_name].compact.join("/")
  end
end

Liquid::Template.register_filter(MediaFolderPaths)
