require "uri"

module PostFolderNavigation
  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      site.data["post_folders"] = folders(site, File.join(site.source, "_posts"), [])
    end

    def folders(site, directory, ancestors)
      Dir.children(directory).sort.filter_map do |name|
        path = File.join(directory, name)
        next unless File.directory?(path)

        parts = ancestors + [name]
        prefix = "_posts/#{parts.join('/')}/"
        posts = site.posts.docs.select do |post|
          post.relative_path.sub(%r{\A/}, "").start_with?(prefix)
        end.sort_by(&:date).reverse
        url = "/folders/" + parts.map { |part| URI.encode_www_form_component(part).gsub("+", "%20") }.join("/") + "/"
        node = { "name" => name, "url" => url, "posts" => posts,
                 "top_level" => ancestors.empty?, "children" => folders(site, path, parts) }
        page = Jekyll::PageWithoutAFile.new(site, site.source, "folders/#{parts.join('/')}", "index.html")
        page.data.merge!("layout" => "page", "title" => parts.join(" / "), "folder_posts" => posts)
        page.content = '<div class="posts">{% for post in page.folder_posts %}{% include post-card.html %}{% endfor %}</div>'
        site.pages << page
        node
      end
    end
  end
end
