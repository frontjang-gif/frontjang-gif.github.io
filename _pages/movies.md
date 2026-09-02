---
layout: page
permalink: /movies/
title: Movies
---

<div class="posts movie-archive">
  {% assign movies = site.posts | where_exp: "post", "post.path contains '_posts/movie/'" | sort: "date" | reverse %}
  {% for movie in movies %}
    <article class="post">
      <a href="{{ site.baseurl }}{{ movie.url }}"><h2>{{ movie.title }}</h2></a>
      {% if movie.titleKo %}<p class="post_date">{{ movie.titleKo }} · {{ movie.year }}</p>{% endif %}
      <div class="entry">{{ movie.excerpt }}</div>
    </article>
  {% endfor %}
</div>
