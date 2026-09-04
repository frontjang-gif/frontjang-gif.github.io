---
layout: page
title: Patrice Rushen
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/912-patrice-rushen-before-the-dawn/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/910-patrice-rushen-patrice/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/911-patrice-rushen-prelusion/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
