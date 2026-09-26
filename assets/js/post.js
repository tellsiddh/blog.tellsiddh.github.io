(function () {
  'use strict';

  var article = document.querySelector('[data-article]');
  if (!article) return;

  var headings = Array.prototype.slice.call(article.querySelectorAll('h2[id], h3[id]'));
  var titles = headings.map(function (heading) {
    return heading.textContent.trim();
  });

  // Hover anchor beside every linkable heading.
  headings.forEach(function (heading, i) {
    var anchor = document.createElement('a');
    anchor.className = 'anchor';
    anchor.href = '#' + heading.id;
    anchor.textContent = '#';
    anchor.setAttribute('aria-label', 'Permalink to ' + titles[i]);
    heading.appendChild(anchor);
  });

  var toc = document.querySelector('[data-toc]');
  var box = document.querySelector('[data-toc-box]');
  if (!toc || !box || headings.length < 3) return;

  var list = document.createElement('ol');
  list.className = 'toc__list';
  var links = {};

  headings.forEach(function (heading, i) {
    var item = document.createElement('li');
    if (heading.tagName === 'H3') item.className = 'toc__sub';

    var link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = titles[i];
    links[heading.id] = link;

    item.appendChild(link);
    list.appendChild(item);
  });

  box.appendChild(list);
  toc.hidden = false;

  // Open by default only where the sticky right rail has room.
  var wide = window.matchMedia('(min-width: 78rem)');
  box.open = wide.matches;

  function syncOpen(event) {
    box.open = event.matches;
  }

  if (wide.addEventListener) wide.addEventListener('change', syncOpen);
  else if (wide.addListener) wide.addListener(syncOpen);

  if (!('IntersectionObserver' in window)) return;

  var visible = [];
  var current = null;

  function markCurrent(id) {
    if (id === current) return;
    if (current && links[current]) links[current].removeAttribute('aria-current');
    current = id;
    if (current) {
      links[current].setAttribute('aria-current', 'true');
      keepInView(links[current]);
    }
  }

  // Scroll the rail only when the active link sits outside it.
  function keepInView(link) {
    if (toc.scrollHeight <= toc.clientHeight) return;
    var box = link.getBoundingClientRect();
    var rail = toc.getBoundingClientRect();
    if (box.top < rail.top || box.bottom > rail.bottom) {
      toc.scrollTop += box.top - rail.top - toc.clientHeight / 3;
    }
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var index = visible.indexOf(entry.target.id);
        if (entry.isIntersecting && index === -1) visible.push(entry.target.id);
        if (!entry.isIntersecting && index !== -1) visible.splice(index, 1);
      });

      if (visible.length === 0) return;

      var order = headings.map(function (h) {
        return h.id;
      });
      visible.sort(function (a, b) {
        return order.indexOf(a) - order.indexOf(b);
      });
      markCurrent(visible[0]);
    },
    { rootMargin: '-10% 0px -70% 0px' }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
})();
