---
layout: page
title: VOX
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-piano-sonata-no-2-berceuse-ballade-no-4-mazurkas-fantaisie-ivan-moravec/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
