---
layout: page
title: Argerich, Martha
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/chopin-preludes-piano-concerto-no-2-argerich-rostropovich-national-symphony-orchestra-washington/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/chopin-the-legendary-1965-recording-martha-argerich/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
