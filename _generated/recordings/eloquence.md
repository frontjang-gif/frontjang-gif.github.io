---
layout: page
title: Eloquence
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/bachauer-the-mercury-masters/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
