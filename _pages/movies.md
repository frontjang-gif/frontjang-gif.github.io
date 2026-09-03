---
layout: page
permalink: /movies/
title: Movies
---

<div class="media-catalog-controls" data-catalog-controls="movies">
  <label>Search <input type="search" data-filter="query" placeholder="Title, director, cast"></label>
  <label>Director <select data-filter="directors"><option value="">All</option></select></label>
  <label>Genre <select data-filter="genres"><option value="">All</option></select></label>
  <label>Decade <select data-filter="decade"><option value="">All</option></select></label>
  <label>Rating <select data-filter="rating"><option value="">All</option></select></label>
  <button type="button" data-filter-reset>Reset</button>
  <p class="media-catalog-status" aria-live="polite"></p>
</div>

<div class="posts movie-archive media-catalog" data-catalog="movies" data-catalog-url="{{ site.baseurl }}/data/movies.json" data-list-view="preview">
  {% assign movies = site.posts | where_exp: "post", "post.path contains '_posts/Movie/'" | sort: "date" | reverse %}
  {% for movie in movies %}
    {% assign post = movie %}
    {% include post-card.html %}
  {% endfor %}
</div>

<script src="{{ site.baseurl }}/assets/media-catalog.js" defer></script>
