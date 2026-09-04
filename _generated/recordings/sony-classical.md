---
layout: page
title: Sony Classical
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/barber-meyer-violin-concertos-hahn-wolff-saint-paul-chamber-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/brahms-stravinsky-violin-concertos-hahn-marriner-academy-of-st-martin-in-the-fields/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-bernstein-new-york-philharmonic/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/murray-perahia-plays-chopin/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
