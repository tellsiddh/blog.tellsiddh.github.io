---
layout: home
title: "Welcome to My Blog"
author_profile: true
excerpt: "Sharing my thoughts on tech, life, and code."
---

{%- comment -%} Skip hero if no image {%- endcomment -%}
{% if page.header and page.header.image %}
  {% include page__hero.html %}
{% endif %}

{% assign feature_row_intro = site.posts | where_exp:"item","item.tags contains 'jekyll'" | slice: 0,3 %}
{% include feature_row items=feature_row_intro %}
