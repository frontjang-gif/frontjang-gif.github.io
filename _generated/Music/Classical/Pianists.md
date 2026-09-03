---
layout: page
title: Pianists
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/debussy-piano-music-osborne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/debussy-preludes-books-i-ii-osborne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
