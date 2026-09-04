---
layout: page
title: LSO Live
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-gergiev-london-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
