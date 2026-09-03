---
layout: page
title: Hanssler Classic
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/khachaturian-violin-concerto-in-d-minor-bartok-violin-concerto-no-2-haendel-muller-kray-radio-sinfonieorchester-stuttgart/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
