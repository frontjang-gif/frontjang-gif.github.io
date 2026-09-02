---
layout: page
permalink: /tech/
title: Tech
---

<div class="posts">
  {% assign posts = site.posts | where_exp: "post", "post.path contains '_posts/tech/'" %}
  {% for post in posts %}
    <article class="post">
      <a href="{{ site.baseurl }}{{ post.url }}"><h2>{{ post.title }}</h2></a>
      <p class="post_date">{{ post.date | date: "%B %e, %Y" }}</p>
      <div class="entry">{{ post.excerpt }}</div>
    </article>
  {% endfor %}
</div>
