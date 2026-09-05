# Derive Blog URLs from physical folders, independently of topic categories.
Jekyll::Hooks.register :posts, :post_init do |post|
  path = post.relative_path.sub(%r{\A/}, "")
  next unless path.start_with?("_posts/Blog/")
  next if post.data["permalink"]

  folder = File.dirname(path).delete_prefix("_posts/")
  post.data["permalink"] = "/#{folder}/:title/"
end
