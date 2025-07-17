---
layout: single
title: "Setting up a Jellyfin server with Tailscale on Raspberry Pi"
date: 2025-07-04
author: siddharth
categories: [media, raspberry-pi, tailscale, jellyfin]
read_time: true
comments: true
share: true
related: true
toc: true
toc_sticky: true
---

In this post, I will guide you through the process of setting up a Jellyfin media server on a Raspberry Pi and accessing it securely using Tailscale. This setup allows you to stream your media content from anywhere while ensuring that your connection is secure and private.

<!--more-->

## Prerequisites
Before we begin, ensure you have the following:
- A Raspberry Pi (preferably Raspberry Pi 4 or later)
- A microSD card with Raspberry Pi OS installed
- Basic knowledge of using the terminal
- An internet connection for your Raspberry Pi

## Step 1: Update Your Raspberry Pi
First, make sure your Raspberry Pi is up to date. Open a terminal and run the following commands:
```bash
sudo apt update
sudo apt upgrade -y
```

I installed the Ubuntu server version on my Raspberry Pi, but you can use any Raspberry Pi OS variant. I selected this version because I wanted a minimal setup without a desktop environment I can access via SSH.

## Step 2: Install Jellyfin
Next, we will install Jellyfin. Run the following commands in your terminal:
```bash
sudo curl https://repo.jellyfin.org/install-debuntu.sh | sudo bash
sudo ufw allow 8096/tcp
```

The below links provide additional information on installing Jellyfin. They are discussion threads that can help you troubleshoot any issues you might encounter during the installation process.
You can also find the official installation guide on the Jellyfin website.

https://github.com/jellyfin/jellyfin/discussions/7460

https://gist.github.com/aslafy-z/dce9fd98bbe42f21095eb231687ae4f5

That's it! Jellyfin is now installed on your Raspberry Pi. You can access the Jellyfin web interface by navigating to `http://<your-raspberry-pi-ip>:8096` in your web browser.

Add your jellyfin user in your user group to allow all access needed:
```bash
sudo usermod -aG $USER jellyfin
```

Commands to check status and restart Jellyfin:
```bash
sudo systemctl status jellyfin
sudo systemctl restart jellyfin
```

Make sure your content folder has the correct permissions:
```bash
chmod o+x /home/raspberrypi/Content
```

## Step 3: Install Tailscale
Now, we will install Tailscale to securely access your Jellyfin server from anywhere. Run the following commands:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

To check the status of Tailscale, you can use:
```bash
tailscale status
```

Once you login to Tailscale, you will need to download the tailscale client on your devices (laptop, phone, etc.) to access the Jellyfin server. You can find the Tailscale client for various platforms on their [official website](https://tailscale.com/download).

## Step 4: Accessing Jellyfin via Tailscale
After installing Tailscale on your devices, you can access your Jellyfin server by navigating to `http://<tailscale-ip>:8096` in your web browser. The Tailscale IP can be found in the Tailscale admin console or by running `tailscale status` on your Raspberry Pi.

You can also use the local IP address of your Raspberry Pi if you want. It can be accessed locally and via Tailscale. The local IP address can be found by running:
```bash
hostname -I
```

## Note

On my iPhone, I added the Tailscale client and was able to access the Jellyfin server without any issues. The streaming quality was excellent, and I could browse my media library seamlessly. I had to configure the VPN but it was straightforward. I also set up the Jellyfin app on my iPhone, which allowed me to stream content directly from the app without needing to use a web browser. I use FinAmp, a Jellyfin client for iOS, which provides a great user experience for streaming audio.

## Conclusion
You have successfully set up a Jellyfin media server on your Raspberry Pi and secured it with Tailscale. Now you can enjoy your media content from anywhere, securely and privately.

**– Siddharth**
