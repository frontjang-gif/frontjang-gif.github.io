---
layout: page
title: Dan Hartman
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/756-dan-hartman-i-can-dream-about-you/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/755-dan-hartman-instant-replay/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/754-dan-hartman-keep-the-fire-burnin/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
