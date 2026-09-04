---
layout: page
title: Pianists
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/b-tchaikovsky-piano-concerto-clarinet-concerto-signs-of-the-zodiac-solovieva-mynbaev-russian-academy-of-music-chamber-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/bach-goldberg-variations-fazil-say/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/chopin-complete-works-for-piano-orchestra-paik-wit-warsaw-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/chopin-piano-concerto-no-1-faure-ballade-liszt-piano-concerto-no-1-wild-sargent-gerhardt/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/elgar-cello-concerto-in-e-minor-walton-cello-concerto-muller-schott-previn-oslo-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/khachaturian-piano-concerto-concert-rhapsody-yablonskaya-yablonsky-moscow-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/khachaturian-piano-concerto-concerto-rhapsody-simonian-raiskin-staatsorchester-rheinische-philharmonie/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/liszt-mephisto-waltz-no-1-piano-sonata-minoru-nojima/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-miroirs-gaspard-de-la-nuit-minoru-nojima/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-piano-works-vol-1-fevrier-tacchino/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/ravel-piano-works-vol-2-fevrier-tacchino-ambrosini/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
