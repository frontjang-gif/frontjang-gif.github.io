---
layout: page
title: Say, Fazil
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/bach-goldberg-variations-fazil-say/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
