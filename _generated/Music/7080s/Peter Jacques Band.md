---
layout: page
title: Peter Jacques Band
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/486-peter-jacques-band-fire-night-dance-original-album-and-rare-tracks/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/488-peter-jacques-band-walking-on-music-greatest-hits-special-price/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/302-the-very-best-of-peter-jacques-band/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
