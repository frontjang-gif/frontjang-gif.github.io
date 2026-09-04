---
layout: page
title: Chaka Khan
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/603-chaka-khan-c-k/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/597-chaka-khan-chaka/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/600-chaka-khan-chaka-khan/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/602-chaka-khan-destiny/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/601-chaka-khan-i-feel-for-you/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/598-chaka-khan-naughty/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/599-chaka-khan-what-cha-gonna-do-for-me/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
