---
layout: archive
title: "All Posts"
permalink: /posts/
pagination:
  enabled: true
---

{% for post in paginator.posts %}
  <article>
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <p class="page__meta">{{ post.date | date: "%B %d, %Y" }}</p>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}

