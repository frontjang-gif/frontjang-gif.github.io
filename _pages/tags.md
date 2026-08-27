---
layout: page
permalink: /tags/
title: Tags
---

<div id="archives">
{% for tag in site.tags %}
  {% capture tag_name %}{{ tag | first }}{% endcapture %}
  <div class="archive-group" id="{{ tag_name | slugize }}">
    <h3 class="category-head">{{ tag_name }}</h3>
    {% for post in site.tags[tag_name] %}
    <article class="archive-item">
      <h4><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h4>
    </article>
    {% endfor %}
  </div>
{% endfor %}
</div>
