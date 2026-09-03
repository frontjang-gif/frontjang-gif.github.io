---
layout: page
permalink: /categories/
title: Categories
---
<div id="archives">
{% for category in site.categories %}
  <section class="archive-group">
    {% capture category_name %}{{ category | first }}{% endcapture %}
    <div id="{{ category_name | slugize }}"></div>
    <h3 class="category-head">{{ category_name }}</h3>
    <div class="posts category-posts">
    {% for post in site.categories[category_name] %}
      {% include post-card.html %}
    {% endfor %}
    </div>
  </section>
{% endfor %}
</div>
