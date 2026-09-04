---
layout: page
title: Gwen McCrae
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/11-gwen-mccrae-on-my-way/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/63-gwen-mccrae-soul-from-miami-usa/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
