---
layout: page
title: CPO
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/khachaturian-cello-concerto-concerto-rhapsody-thedeen-raiskin-staatsorchester-rheinische-philharmonie/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/khachaturian-piano-concerto-concerto-rhapsody-simonian-raiskin-staatsorchester-rheinische-philharmonie/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
