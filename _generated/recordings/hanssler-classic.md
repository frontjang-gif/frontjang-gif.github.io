---
layout: page
title: Hanssler Classic
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/khachaturian-violin-concerto-bartok-violin-concerto-no-2-haendel-muller-kray-radio-sinfonieorchester-stuttgart-des-swr/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/mozart-piano-concertos-nos-20-23-moravec-marriner-academy-of-st-martin-in-the-fields/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
