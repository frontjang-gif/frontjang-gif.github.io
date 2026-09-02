---
layout: page
permalink: /movies/
title: Movies
---

<div class="posts movie-archive">
  {% assign movies = site.posts | where_exp: "post", "post.path contains '_posts/movie/'" | sort: "date" | reverse %}
  {% for movie in movies %}
    {% assign post = movie %}
    {% include post-card.html %}
  {% endfor %}
</div>
