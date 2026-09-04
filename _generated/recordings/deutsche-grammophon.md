---
layout: page
title: Deutsche Grammophon
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/elgar-violin-concerto-the-lark-ascending-hahn-davis-london-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/higdon-tchaikovsky-violin-concertos-hahn-petrenko-royal-liverpool-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-abbado-berliner-philharmoniker/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mahler-symphony-no-7-dudamel-simon-bolivar-symphony-orchestra-of-venezuela/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mozart-violin-concerto-no-5-vieuxtemps-violin-concerto-no-4-hahn-jarvi-deutsche-kammerphilharmonie-bremen/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/paganini-violin-concerto-no-1-spohr-violin-concerto-no-8-hahn-oue-swedish-radio-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
