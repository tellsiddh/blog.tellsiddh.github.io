---
layout: post
title: "Hello, World!"
date: 2025-05-26
categories: [personal]
tags: [jekyll, meta]
toc: true
---

Welcome to my blog. I'm Siddharth, a software engineer who loves to build, experiment, and learn new things. I've created this blog as a way to document my journey, share what I learn, and hopefully help others who are on a similar path.

<!--more-->

## What You'll Find Here

This blog is my digital notebook. I'll be writing about things I'm working on, learning, or thinking about. Topics will include:

- **Thoughts on tech and engineering**: insights, opinions, or breakdowns of tools and processes I find useful
- **Beginner-friendly tutorials**: step-by-step guides for solving real problems (the kind I wish I had found when I was learning)
- **Personal stories**: my experiences in tech, career milestones, mistakes made, and lessons learned
- **Ideas and experiments**: side projects, coding challenges, or just "what if?" scenarios I'm tinkering with

Whether you're new to programming or a seasoned developer, I hope there's something here for you.

## Why I Chose Jekyll

When starting a blog, I had a choice: use a platform like Medium or WordPress, or build something myself. I chose [Jekyll](https://jekyllrb.com/), a static site generator, because:

- **Speed**: Jekyll builds a static website, so it's fast and doesn't need a database
- **Simplicity**: I write posts in Markdown, which is clean and distraction-free
- **Customizable**: I can tweak the layout, design, and features just the way I want
- **Fun to tinker with**: I enjoy diving into the internals and learning how things work

I started out on the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) theme to get going quickly. The site has since moved to a small hand-written theme: one CSS file, one JS file, no theme gem.

## Running Jekyll Locally

Before publishing your blog online, it's a good idea to see what it looks like on your own computer. Here's how I run my Jekyll blog locally:

```bash
bundle exec jekyll serve
```

This starts a local web server. Open `http://localhost:4000` in a browser to see the blog as it will appear when live. It rebuilds automatically when you save a file.

*Tip:* You need Ruby and Bundler installed for this to work. Run `bundle install` once to pull in Jekyll and the plugins.

## My Jekyll Configuration (Explained)

Here's a peek at my `_config.yml` file, the brain of the blog setup. Each line controls part of how the blog behaves:

```yaml
title: "tellsiddh's blog"                # The blog title shown in the browser
url: "https://blog.tellsiddh.com"        # The actual URL of the site
baseurl: ""                              # Used if the blog lives in a subfolder (blank for root)

permalink: /:categories/:title/          # URL format, e.g. /personal/hello-world/
excerpt_separator: "<!--more-->"         # Marks where the home page summary ends

markdown: kramdown                       # Markdown engine
highlighter: rouge                       # Syntax highlighting for code blocks
kramdown:
  input: GFM                             # GitHub-flavoured Markdown

plugins:                                 # Extra features, all on the GitHub Pages whitelist
  - jekyll-feed                          # Generates an RSS feed
  - jekyll-sitemap                       # Adds a sitemap for search engines
  - jekyll-seo-tag                       # Adds meta tags for search and social previews
  - jekyll-redirect-from                 # Lets a post keep old URLs when it moves

defaults:                                # Every file in _posts/ gets layout: post
  - scope:
      path: ""
      type: posts
    values:
      layout: post
```

*Don't worry if this looks complicated. Once you get the hang of it, customizing your blog becomes second nature.*

## What's Next?

Now that the blog is live, here's what you can expect from future posts:

- In-depth guides on tools like Git, VS Code, Jekyll, and more
- Breakdowns of side projects I'm building
- Thoughts on working in tech, growing as a developer, and building a career
- Possibly some random nerdy stuff I just couldn't resist writing about

If you've read this far, thank you. I'm truly excited to share this space with you.

Want to connect or follow along?

- [GitHub](https://github.com/tellsiddh)
- [Twitter](https://twitter.com/tellsiddh)

Stay curious,
**Siddharth**
