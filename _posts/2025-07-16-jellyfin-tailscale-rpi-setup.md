---
layout: post
title: "Setting up a Jellyfin server with Tailscale on Raspberry Pi"
date: 2025-07-16
categories: [homelab]
tags: [raspberry-pi, tailscale, jellyfin]
toc: true
redirect_from:
  - /media/raspberry-pi/tailscale/jellyfin/setting-up-a-jellyfin-server-with-tailscale-on-raspberry-pi/
---

In this post, I will walk through setting up a Jellyfin media server on a Raspberry Pi and accessing it securely from anywhere using Tailscale. Nothing gets exposed to the public internet; every device talks to the Pi over the Tailscale network.

<!--more-->

## Prerequisites

Before we begin, make sure you have the following:

- A Raspberry Pi (preferably a Raspberry Pi 4 or later)
- A microSD card with an OS installed. I used Ubuntu Server because I wanted a minimal setup with no desktop environment, managed entirely over SSH. Any Raspberry Pi OS variant will work too.
- Basic familiarity with the terminal
- An internet connection for your Raspberry Pi

## Step 1: Update Your Raspberry Pi

First, make sure your Raspberry Pi is up to date. Open a terminal and run:

```bash
sudo apt update
sudo apt upgrade -y
```

## Step 2: Install Jellyfin

Next, install Jellyfin using the official install script, then open its port in the firewall:

```bash
curl https://repo.jellyfin.org/install-debuntu.sh | sudo bash
sudo ufw allow 8096/tcp
```

That's it. Jellyfin is now installed. You can reach the web interface at `http://<your-raspberry-pi-ip>:8096` in your browser.

If you run into trouble, these two threads helped me, alongside the [official installation guide](https://jellyfin.org/docs/general/installation/linux):

- [jellyfin/jellyfin discussion #7460](https://github.com/jellyfin/jellyfin/discussions/7460)
- [Installing Jellyfin on a Raspberry Pi (gist)](https://gist.github.com/aslafy-z/dce9fd98bbe42f21095eb231687ae4f5)

Add the `jellyfin` service user to your own group so it can read your media:

```bash
sudo usermod -aG $USER jellyfin
```

Make sure your content folder is traversable by other users (adjust the path to wherever your media lives):

```bash
chmod o+x /home/raspberrypi/Content
```

Useful commands to check on and restart Jellyfin:

```bash
sudo systemctl status jellyfin
sudo systemctl restart jellyfin
```

## Step 3: Install Tailscale

Now install Tailscale so you can reach the Jellyfin server securely from anywhere:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

`tailscale up` prints a login URL. Open it, authenticate, and the Pi joins your tailnet. To check its status:

```bash
tailscale status
```

Then install the Tailscale client on the devices you want to stream from (laptop, phone, etc.). Clients for every platform are on the [Tailscale download page](https://tailscale.com/download).

## Step 4: Access Jellyfin via Tailscale

With Tailscale running on both ends, open `http://<tailscale-ip>:8096` in your browser. The Pi's Tailscale IP is shown in the Tailscale admin console or in the output of `tailscale status` on the Pi.

You can still use the Pi's local IP when you're on the same network. Find it with:

```bash
hostname -I
```

## Notes from My Setup

On my iPhone, I added the Tailscale client and could access the Jellyfin server without any issues. Streaming quality was excellent and browsing the library was smooth. Configuring the VPN profile took a minute but was straightforward. I also set up the Jellyfin app on my iPhone, which streams directly without a browser. For music I use [Finamp](https://github.com/jmshrv/finamp), a Jellyfin client for iOS that's great for audio.

## Conclusion

You now have a Jellyfin media server running on your Raspberry Pi, reachable from anywhere over Tailscale without opening a single port to the internet. Enjoy your media, securely and privately.

**– Siddharth**
