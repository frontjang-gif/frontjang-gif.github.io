---
layout: page
title: Violinists
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/barber-meyer-violin-concertos-hahn-wolff-saint-paul-chamber-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/brahms-stravinsky-violin-concertos-hahn-marriner-academy-of-st-martin-in-the-fields/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/elgar-violin-concerto-the-lark-ascending-hahn-davis-london-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/higdon-tchaikovsky-violin-concertos-hahn-petrenko-royal-liverpool-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/lalo-symphonie-espagnole-saint-saens-violin-concerto-no-3-ravel-tzigane-vengerov-pappano-philharmonia-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mozart-violin-concerto-no-5-vieuxtemps-violin-concerto-no-4-hahn-jarvi-deutsche-kammerphilharmonie-bremen/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/paganini-violin-concerto-no-1-spohr-violin-concerto-no-8-hahn-oue-swedish-radio-symphony-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
