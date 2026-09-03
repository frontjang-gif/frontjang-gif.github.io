require "nokogiri"

Jekyll::Hooks.register :posts, :post_render do |post|
  next unless post.path.include?("/_posts/Music/")

  document = Nokogiri::HTML::Document.parse(post.output)
  document.css(".album-entry ol").each do |list|
    next unless list.xpath("./li/ol").any?

    start = list["start"].to_i
    start = 1 if start.zero?
    rows = Nokogiri::XML::NodeSet.new(document)

    list.xpath("./li").each_with_index do |track, track_index|
      nested = track.xpath("./ol").first
      next unless nested

      movement_start = nested["start"].to_i
      movement_start = 1 if movement_start.zero?
      nested.xpath("./li").each_with_index do |movement, movement_index|
        row = document.create_element("div")
        row.add_child(document.create_text_node("#{start + track_index}. #{movement_start + movement_index}. "))
        movement.children.each { |child| row.add_child(child.dup) }
        rows << row
      end
    end

    list.add_previous_sibling(rows)
    list.remove
  end

  post.output = document.to_html
end
