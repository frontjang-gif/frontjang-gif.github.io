---
layout: page
permalink: /tech/
title: Tech
---

<div class="posts">
  {% assign posts = site.posts | where_exp: "post", "post.path contains '_posts/Tech/'" %}
  {% for post in posts %}
    {% include post-card.html %}
  {% endfor %}
</div>
