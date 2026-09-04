---
layout: page
title: Oehms Classics
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-stenz-gurzenich-orchestra-cologne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
