require "nokogiri"

Jekyll::Hooks.register :posts, :post_render do |post|
  next unless post.path.include?("/_posts/Music/")

  document = Nokogiri::HTML::Document.parse(post.output)
  document.css(".album-entry").each do |entry|
    track_number = 0
    multi_disc = false

    entry.css("h3, h4, h5").each do |heading|
      case heading.name
      when "h3"
        multi_disc = heading.text.strip.match?(/^CD\d+$/)
        heading["class"] = multi_disc ? "album-disc" : "album-composer"
      when "h4"
        heading["class"] = multi_disc ? "album-composer" : "album-work"
      when "h5"
        heading["class"] = "album-work"
      end
    end

    entry.xpath(".//h3 | .//ol[not(ancestor::ol)]").each do |element|
      if element.name == "h3"
        track_number = 0 if element.text.strip.match?(/^CD\d+$/)
        next
      end

      list = element
      unless list.xpath("./li/ol").any?
        track_number += list.xpath("./li").size
        next
      end

      rows = Nokogiri::XML::NodeSet.new(document)
      movement_number = 0
      list.xpath("./li").each do |track|
        nested = track.xpath("./ol").first
        unless nested
          track_number += 1
          row = document.create_element("div")
          row["class"] = "track-work-break" if movement_number.positive?
          row.add_child(document.create_text_node("#{track_number}. "))
          track.children.each { |child| row.add_child(child.dup) }
          rows << row
          movement_number = 0
          next
        end

        nested.xpath("./li").each do |movement|
          track_number += 1
          movement_number += 1
          row = document.create_element("div")
          row.add_child(document.create_text_node("#{track_number}. #{movement_number}. "))
          movement.children.each { |child| row.add_child(child.dup) }
          rows << row
        end
      end

      list.add_previous_sibling(rows)
      list.remove
    end
  end

  post.output = document.to_html
end
