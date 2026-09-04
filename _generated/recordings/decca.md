---
layout: page
title: Decca
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-complete-works-for-piano-orchestra-paik-wit-warsaw-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/grieg-piano-concerto-in-a-minor-chopin-piano-concerto-no-2-in-f-minor-thibaudet-gergiev-rotterdam-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/liszt-piano-concerto-no-1-piano-concerto-no-2-3-etudes-de-concert-arrau-davis-london-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-the-symphonies-solti-chicago-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-piano-works-vol-1-fevrier-tacchino/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-piano-works-vol-2-fevrier-tacchino-ambrosini/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
