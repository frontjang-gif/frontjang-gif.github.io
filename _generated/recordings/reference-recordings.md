---
layout: page
title: Reference Recordings
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/liszt-mephisto-waltz-no-1-piano-sonata-minoru-nojima/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-miroirs-gaspard-de-la-nuit-minoru-nojima/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
