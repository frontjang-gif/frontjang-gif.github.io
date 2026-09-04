---
layout: page
title: Barry White
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/852-barry-white-barry-white-sings-for-someone-you-love/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/850-barry-white-can-t-get-enough/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/849-barry-white-i-ve-got-so-much-to-give/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/851-barry-white-let-the-music-play/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/848-barry-white-stone-gon/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
