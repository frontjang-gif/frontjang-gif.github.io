---
layout: page
title: Favorite Albums
---

## Favorite Albums

{% assign albums = site.posts | where: 'favorite', true | sort: 'date' | reverse %}
{% for post in albums %}
{% include post-card.html %}
{% endfor %}

## Favorite Works

- [Chopin, Frederic: Fantaisie in F minor, Op. 49]({{ site.baseurl }}/composers/chopin-frederic/fantaisie-in-f-minor-op-49/)
- [Chopin, Frederic: Piano Concerto No. 1 in E minor, Op. 11]({{ site.baseurl }}/composers/chopin-frederic/piano-concerto-no-1-in-e-minor-op-11/)
