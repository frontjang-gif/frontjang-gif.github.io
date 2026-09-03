---
layout: page
title: Jazz
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/anne-sofie-von-otter-brad-mehldau-love-songs/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/brad-mehldau-introducing-brad-mehldau/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
