---
layout: page
title: Favorite Albums
---

{% assign albums = site.posts | where: 'favorite', true | sort: 'date' | reverse %}
{% for post in albums %}
{% include post-card.html %}
{% endfor %}
