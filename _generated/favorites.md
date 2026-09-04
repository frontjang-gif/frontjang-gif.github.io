---
layout: page
title: Favorite Albums
---

## Favorite Albums

<div class="posts favorite-albums">
{% assign albums = site.posts | where: 'favorite', true | sort: 'date' | reverse %}
{% for post in albums %}
{% include post-card.html %}
{% endfor %}
</div>

## Favorite Works
