require "nokogiri"

Jekyll::Hooks.register :documents, :post_render do |document|
  next unless document.collection.label == "albums"

  fragment = Nokogiri::HTML::DocumentFragment.parse(document.output)
  track_number = 0

  fragment.xpath(".//ol[not(ancestor::ol)]").each do |list|
    work_heading = list.previous_element
    has_movements = work_heading && work_heading.name == "h5"
    rows = Nokogiri::XML::NodeSet.new(list.document)

    list.xpath("./li").each_with_index do |track, movement_index|
      track_number += 1
      row = track.document.create_element("div")
      row.content = if has_movements
        "#{track_number}. #{movement_index + 1}. "
      else
        "#{track_number}. "
      end
      track.children.each { |child| row.add_child(child.dup) }
      rows << row
    end

    list.add_previous_sibling(rows)
    list.remove
  end

  document.output = fragment.to_html
end
