---
layout: page
permalink: /albums/
title: Album Archive
---

<div class="posts album-archive">
  {% assign albums = site.posts | where_exp: "post", "post.path contains '_posts/music/'" | sort: "date" | reverse %}
  {% for album in albums %}
    <article class="post">
      <a href="{{ site.baseurl }}{{ album.url }}">
        <h2>{{ album.title }}</h2>
        {% if album.artist %}<p class="post_date">{{ album.artist }}{% if album.year %} · {{ album.year }}{% endif %}</p>{% endif %}
      </a>
      <div class="entry">
        {{ album.excerpt | strip_html | truncatewords: 40 }}
      </div>
      <a href="{{ site.baseurl }}{{ album.url }}" class="read-more">Read More</a>
    </article>
  {% else %}
    <p>아직 기록된 앨범이 없습니다.</p>
  {% endfor %}
</div>
