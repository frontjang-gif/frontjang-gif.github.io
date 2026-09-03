---
layout: page
permalink: /Music/
title: Album Archive
---

<div class="media-catalog-controls" data-catalog-controls="albums">
  <label>Search <input type="search" data-filter="query" placeholder="Title, artist, composer, work"></label>
  <label>Artist <select data-filter="artists"><option value="">All</option></select></label>
  <label>Composer <select data-filter="composers"><option value="">All</option></select></label>
  <label>Recording <select data-filter="recording"><option value="">All</option></select></label>
  <label>Category <select data-filter="category"><option value="">All</option></select></label>
  <button type="button" data-filter-reset>Reset</button>
  <p class="media-catalog-status" aria-live="polite"></p>
</div>

<div class="posts album-archive media-catalog" data-catalog="albums" data-catalog-url="{{ site.baseurl }}/data/albums.json" data-list-view="preview">
  {% assign albums = site.posts | where_exp: "post", "post.path contains '_posts/Music/'" | sort: "date" | reverse %}
  {% for album in albums %}
    {% assign post = album %}
    {% include post-card.html %}
  {% else %}
    <p>아직 기록된 앨범이 없습니다.</p>
  {% endfor %}
</div>

<script src="{{ site.baseurl }}/assets/media-catalog.js" defer></script>
