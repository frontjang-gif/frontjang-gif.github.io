---
category: Classical
layout: page
title: Classical
---

[All music categories]({{ site.baseurl }}/albums/categories/)

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/bachauer-the-mercury-masters/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/debussy-piano-music-osborne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/debussy-preludes-books-i-ii-osborne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/khachaturian-violin-concerto-in-d-minor-bartok-violin-concerto-no-2-haendel-muller-kray-radio-sinfonieorchester-stuttgart/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/murray-perahia-plays-chopin/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
