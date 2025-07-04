---
layout: single
title: "Hello, World!"
date: 2025-05-26
author: siddharth
categories: [personal]
read_time: true
comments: true
share: true
related: true
toc: true
toc_sticky: true
---

Welcome to my blog!  
I'm **Siddharth**, a software engineer who loves to build, experiment, and learn new things. I’ve created this blog as a way to document my journey, share what I learn, and hopefully help others who are on a similar path.

---

## What You’ll Find Here

This blog is my digital notebook. I’ll be writing about things I’m working on, learning, or thinking about. Topics will include:

- **Thoughts on tech and engineering** – insights, opinions, or breakdowns of tools and processes I find useful
- **Beginner-friendly tutorials** – step-by-step guides for solving real problems (the kind I wish I found when I was learning!)
- **Personal stories** – my experiences in tech, career milestones, mistakes made, and lessons learned
- **Ideas and experiments** – side projects, coding challenges, or just “what if?” scenarios I’m tinkering with

Whether you’re new to programming or a seasoned developer, I hope there’s something here for you.

---

## Why I Chose Jekyll

When starting a blog, I had a choice: use a platform like Medium or WordPress, or build something myself. I chose [**Jekyll**](https://jekyllrb.com/), a static site generator, because:

- **Speed** – Jekyll builds a static website, meaning it's fast and doesn’t need a database
- **Simplicity** – I write posts using Markdown (plain text with formatting), which is clean and distraction-free
- **Customizable** – I can tweak the layout, design, and features just the way I want
- **Fun to tinker with** – I enjoy diving into the internals and learning how things work

To make things look good and reduce setup time, I’m using the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) theme – a beautiful and flexible theme designed for Jekyll blogs.

---

## Running Jekyll Locally

Before publishing your blog online, it’s a good idea to see what it looks like on your own computer. Here’s how I run my Jekyll blog locally:

```bash
bundle exec jekyll server
```

This command tells Jekyll to start a local web server. You can then open a browser and go to `http://localhost:4000` to see your blog as it will appear when live.

*Tip:* You need to have Ruby, Bundler, and Jekyll installed for this to work. Don’t worry – I’ll write a step-by-step guide soon!

---

## My Jekyll Configuration (Explained)

Here’s a peek at my `_config.yml` file – the brain of the blog setup. Each line controls part of how the blog behaves:

```yaml
title: tellsiddh's blog                # The blog title shown in the browser
description: A simple blog powered by Jekyll
url: "https://blog.tellsiddh.com"     # The actual URL of your site
baseurl: ""                            # Used if your blog is in a subfolder (leave blank for root)

permalink: /:categories/:title/       # Controls the URL format (e.g. /personal/hello-world/)

remote_theme: "mmistakes/minimal-mistakes@4.27.1"   # The theme used
minimal_mistakes_skin: "dark"         # Theme style (others: default, air, neon...)

excerpt_separator: "<!--more-->"      # Marks where a summary ends and the full post continues

plugins:                              # Adds extra features to the blog
  - jekyll-feed                       # Generates an RSS feed
  - jekyll-sitemap                    # Adds a sitemap for better SEO
  - jekyll-seo-tag                    # Helps improve search engine visibility
  - jekyll-include-cache              # Optimizes page includes for speed

author: siddharth                      # My author name for posts

category_archive:
  type: liquid
  path: /categories/                  # Enables viewing posts by category

tag_archive:
  type: liquid
  path: /tags/                        # Enables viewing posts by tag

twitter_username: tellsiddh           # Links to my Twitter
github_username: tellsiddh            # Links to my GitHub
```

*Don't worry if this looks complicated – once you get the hang of it, customizing your blog becomes second nature.*

---

## What’s Next?

Now that the blog is live, here’s what you can expect from future posts:

- In-depth guides on tools like Git, VS Code, Jekyll, and more
- Breakdowns of side projects I’m building
- Thoughts on working in tech, growing as a developer, and building a career
- Possibly some random nerdy stuff I just couldn’t resist writing about

---

If you’ve read this far, thank you
I’m truly excited to share this space with you.

Want to connect or follow along?

[GitHub](https://github.com/tellsiddh)  
[Twitter](https://twitter.com/tellsiddh)

Stay curious,  
**Siddharth**
