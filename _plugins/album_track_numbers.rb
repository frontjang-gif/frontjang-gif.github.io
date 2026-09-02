require "nokogiri"

Jekyll::Hooks.register :posts, :post_render do |post|
  next unless post.path.include?("/_posts/music/")

  document = Nokogiri::HTML::Document.parse(post.output)
  track_number = 0
  tracklists = document.css(".album-entry ol")

  tracklists.each do |list|
    work_heading = list.previous_element
    has_movements = work_heading && work_heading.name == "h5"
    rows = Nokogiri::XML::NodeSet.new(document)

    list.xpath("./li").each_with_index do |track, movement_index|
      track_number += 1
      row = document.create_element("div")
      number = has_movements ? "#{track_number}. #{movement_index + 1}. " : "#{track_number}. "
      row.add_child(document.create_text_node(number))
      track.children.each { |child| row.add_child(child.dup) }
      rows << row
    end

    list.add_previous_sibling(rows)
    list.remove
  end

  post.output = document.to_html
end
