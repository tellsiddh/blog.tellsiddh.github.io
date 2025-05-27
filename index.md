---
layout: home
title: "Welcome to My Blog"
author_profile: true
excerpt: "Sharing my thoughts on tech, life, and code."
---

{% for post in paginator.posts %}
  <article>
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <p class="page__meta">{{ post.date | date: "%B %d, %Y" }}</p>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}

