---
layout: page
title: Conductors
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-abbado-berliner-philharmoniker/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-ashkenazy-sydney-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-bernstein-new-york-philharmonic/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-dudamel-simon-bolivar-symphony-orchestra-of-venezuela/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-gergiev-london-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-stenz-gurzenich-orchestra-cologne/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-kindertotenlieder-norman-ozawa-boston-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-the-symphonies-solti-chicago-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
