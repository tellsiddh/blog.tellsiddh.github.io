---
layout: archive
title: "All Posts"
permalink: /posts/
---

<div class="pagination">
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path | relative_url }}">← Newer Posts</a>
  {% endif %}
  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path | relative_url }}">Older Posts →</a>
  {% endif %}
</div>

