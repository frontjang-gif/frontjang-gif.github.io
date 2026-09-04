---
layout: page
title: Rice & Beans Orchestra
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/65-rice-beans-orchestra-cross-over/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/66-rice-beans-orchestra-rice-beans-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
