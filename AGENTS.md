# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

A personal blog (`blog.tellsiddh.com`) built with Jekyll and served by GitHub Pages.
No custom build pipeline: GitHub Pages builds from `main` using the `github-pages` gem.
There is no test suite. Verification means building the site locally and checking the output.

## Stack

- Jekyll 3.x via the `github-pages` gem (see `Gemfile`, `Gemfile.lock`)
- Markdown: kramdown with GFM input, Rouge syntax highlighting
- Plugins: `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-redirect-from`
- Custom theme, hand-written. No theme gem. Styles live in a single file: `assets/css/main.css`
- Vanilla JS only, one file: `assets/js/post.js` (heading anchors and table of contents)

## Commands

```sh
bundle install                 # first time, or after Gemfile changes
bundle exec jekyll serve       # local dev at http://localhost:4000, rebuilds on change
bundle exec jekyll build       # one-shot build into _site/
```

Use `bundle exec jekyll build` to verify changes; `serve` is long-running and should be run by the user.
`_site/` is build output and is gitignored. Never edit it or commit it.

## Layout of the repo

```
_config.yml          site settings, author info, plugins, permalink, defaults
_data/navigation.yml masthead nav links
_includes/           head, masthead, footer, post-list-item partials
_layouts/            default > home | page | post | categories; single is a thin alias for page
_posts/              blog posts, YYYY-MM-DD-slug.md
archive/             pages kept out of the post stream (not listed on the home page)
assets/css/main.css  all styles
assets/js/post.js    heading anchors + TOC behaviour
assets/images/       post images and profile photo
index.md             home page (layout: home)
about.md, categories.md, 404.md
```

`_archive.tags.md` and `_archive.year-archive.md` are leftovers from an older theme. Jekyll
ignores underscore-prefixed files, and the layouts they reference no longer exist. Leave them
alone unless asked to clean up.

## Writing a post

File name: `_posts/YYYY-MM-DD-short-slug.md`. The date in the filename is the publish date.

Front matter pattern used across existing posts:

```yaml
---
layout: post
title: "Post Title"
date: 2025-10-31
categories: [database]
tags: [optional, lowercase, hyphenated]
toc: true
---
```

- `layout: post` is already the default for `_posts/`, but posts include it explicitly. Match that.
- `categories` is a single-element list. Existing categories: `personal`, `tech`, `database`, `homelab`.
  Reuse one where it fits; a new category becomes a new URL segment.
- Permalink is `/:categories/:title/`, so changing a title or category changes the URL.
  If you must rename, add the old URL under `redirect_from:` (see the Jellyfin post for an example).
- `toc: true` enables the sidebar table of contents. It only renders when the post has 3 or more
  `h2`/`h3` headings, and it is built client-side by `post.js`.
- Put `<!--more-->` after the opening paragraph. It controls the excerpt shown on the home page.
- Images go in `assets/images/` and are referenced as `/assets/images/name.png`.
- Fenced code blocks with a language tag get Rouge highlighting. Prefer them over indented code.

Tone: first person, plain, technical, incident-log style. Titles for incident posts start with the
date ("Oct 31st – ..."). Don't rewrite the author's voice when editing existing posts.

## Editing the theme

- All CSS is in `assets/css/main.css`. Design tokens are CSS custom properties on `:root` at the
  top of the file (colours, fonts, `--measure`, `--shell`, `--step`, `--radius`). Use them rather
  than hard-coding values.
- Class naming is BEM-ish (`post__header`, `entry__title`, `toc__list`). Follow it.
- Layouts use `relative_url` for every internal link and asset. Keep doing that.
- Accessibility matters: skip link, `aria-current` in nav, `aria-label` on generated anchors,
  `<time datetime>` on dates. Preserve these when touching markup.
- `post.js` is an IIFE, `'use strict'`, ES5-compatible, no dependencies. Keep it that way.

## Things to avoid

- Don't add a theme gem, a bundler, npm, or a CSS preprocessor. The site is intentionally plain.
- Don't add plugins outside the GitHub Pages whitelist; the Pages build will silently drop them.
- Don't change `permalink` in `_config.yml` without adding redirects for every existing post.
- Don't touch `CNAME`.
- Don't commit `_site/`, `out.txt`, or `*.lock` beyond what is already tracked.

## Git

Commit messages follow a loose conventional-commit style: `chore: ...`, `fix: ...`.
Work happens directly on `main`; there is no PR workflow for this repo.
