---
layout: page
title: The O'Jays
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/951-the-o-jays-back-on-top-expanded-edition/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/949-the-o-jays-comin-through/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/950-the-o-jays-soul-sounds/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/952-the-o-jays-the-o-jays-in-philadelphia/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
