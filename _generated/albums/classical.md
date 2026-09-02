---
category: Classical
layout: page
title: Classical
---

[All music categories]({{ site.baseurl }}/albums/categories/)

{% assign albums = site.posts | where: 'music_category', page.category | sort: 'date' | reverse %}
{% for post in albums %}
{% include post-card.html %}
{% endfor %}
