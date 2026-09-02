require "nokogiri"

Jekyll::Hooks.register :documents, :post_render do |document|
  next unless document.collection.label == "albums"

  fragment = Nokogiri::HTML::DocumentFragment.parse(document.output)
  track_number = 0
  fragment.xpath(".//ol[not(ancestor::ol)]").each do |list|
    has_movements = list.previous_element&.name == "h5"
    list.xpath("./li").each_with_index do |track, movement_index|
      track_number += 1
      number = has_movements ? "#{track_number}. #{movement_index + 1}. " : "#{track_number}. "
      track.children.first ? track.children.first.add_previous_sibling(track.document.create_text_node(number)) : track.content = number
    end
  end
  document.output = fragment.to_html
end
