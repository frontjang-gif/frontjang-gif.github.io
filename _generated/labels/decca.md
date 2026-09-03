---
layout: page
title: Decca
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-complete-works-for-piano-orchestra-paik-wit/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
