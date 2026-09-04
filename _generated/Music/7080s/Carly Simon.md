---
layout: page
title: Carly Simon
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/751-carly-simon-carly-simon/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/1254-carly-simon-the-very-best-of-carly-simon-nobody-does-it-better/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
