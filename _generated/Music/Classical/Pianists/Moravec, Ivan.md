---
layout: page
title: Moravec, Ivan
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/beethoven-piano-concerto-no-4-franck-symphonic-variations-ravel-piano-concerto-moravec-belohlavek-prague-philharmonia/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/beethoven-piano-sonatas-nos-8-14-26-27-32-variations-ivan-moravec/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/chopin-piano-sonata-no-2-berceuse-ballade-no-4-mazurkas-fantaisie-ivan-moravec/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/chopin-scherzi-etudes-mazurkas-ivan-moravec/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mozart-piano-concertos-nos-14-23-25-moravec-vlach-czech-chamber-orchestra-czech-philharmonic-orchestra/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mozart-piano-concertos-nos-20-23-moravec-marriner-academy-of-st-martin-in-the-fields/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
