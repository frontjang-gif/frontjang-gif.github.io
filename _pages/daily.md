---
layout: page
permalink: /daily/
title: Daily
---

<div class="posts">
  {% assign posts = site.posts | where_exp: "post", "post.path contains '_posts/Blog/Daily/'" %}
  {% for post in posts %}
    {% include post-card.html %}
  {% endfor %}
</div>
