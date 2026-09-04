---
layout: page
title: Philips Classics
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-kindertotenlieder-norman-ozawa-boston-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
