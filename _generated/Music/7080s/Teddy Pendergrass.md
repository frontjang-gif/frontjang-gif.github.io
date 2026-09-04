---
layout: page
title: Teddy Pendergrass
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/1278-teddy-pendergrass-the-essential-teddy-pendergrass/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/the-essential-teddy-pendergrass-teddy-pendergrass/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
