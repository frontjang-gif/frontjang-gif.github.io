---
layout: page
title: Delos
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/b-tchaikovsky-piano-concerto-clarinet-concerto-signs-of-the-zodiac-solovieva-mynbaev-russian-academy-of-music-chamber-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
