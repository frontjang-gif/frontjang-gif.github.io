---
layout: page
title: Music Categories
---

## 7080s

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/the-essential-teddy-pendergrass-teddy-pendergrass/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>

## Classical

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

## Jazz

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/anne-sofie-von-otter-brad-mehldau-love-songs/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/brad-mehldau-introducing-brad-mehldau/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
