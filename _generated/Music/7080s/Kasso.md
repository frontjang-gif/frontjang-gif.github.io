---
layout: page
title: Kasso
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/311-kasso-kasso/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/312-kasso-kasso-2/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
