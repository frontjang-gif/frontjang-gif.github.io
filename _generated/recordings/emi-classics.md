---
layout: page
title: EMI Classics
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-the-legendary-1965-recording-martha-argerich/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
