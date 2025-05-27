---
layout: home
title: "Welcome to My Blog"
author_profile: true
excerpt: "Sharing my thoughts on tech, life, and code."
header:
  image: /assets/images/hero.avif
  alt: "A welcoming banner image"
---

{% include feature_row id="intro" type="center" %}

{% assign feature_row_intro = site.posts | where_exp:"item","item.tags contains 'jekyll'" | slice: 0,3 %}
{% include feature_row items=feature_row_intro %}
