---
layout: page
title: Labels
---

## Decca

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-complete-works-for-piano-orchestra-paik-wit/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>

## Mercury Living Presence

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/bachauer-the-mercury-masters/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>

## Sony Classical Masters

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/murray-perahia-plays-chopin/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
