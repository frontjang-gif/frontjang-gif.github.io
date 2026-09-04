---
layout: page
title: First Choice
---

<div class="posts album-list">
{% assign post = site.posts | where: "url", "/albums/872-first-choice-armed-and-extremely-dangerous/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/877-first-choice-breakaway/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/875-first-choice-delusions/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/876-first-choice-hold-your-horses/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/871-first-choice-it-s-not-over-the-greatest-hits-of/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/874-first-choice-so-let-us-entertain-you/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
{% assign post = site.posts | where: "url", "/albums/873-first-choice-the-player/" | first %}
{% if post %}{% include post-card.html %}{% endif %}
</div>
