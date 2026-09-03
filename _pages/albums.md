---
layout: page
permalink: /albums/
title: Album Archive
---

<div class="posts album-archive">
  {% assign albums = site.posts | where_exp: "post", "post.path contains '_posts/Music/'" | sort: "date" | reverse %}
  {% for album in albums %}
    {% assign post = album %}
    {% include post-card.html %}
  {% else %}
    <p>아직 기록된 앨범이 없습니다.</p>
  {% endfor %}
</div>
