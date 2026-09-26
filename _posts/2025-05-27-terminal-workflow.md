---
layout: post
title: "My Terminal Workflow"
date: 2025-05-27
categories: [tech]
tags: [terminal, fish, git, macos]
toc: true
---

I've collected and used thousands of terminal commands through actual DevOps, AI/ML, data science, full-stack web development, and cloud engineering work.

This post captures the most frequently used, most impactful, and uniquely powerful commands from that experience. Each one has been battle-tested in real engineering environments.

<!--more-->

## Setup & Shell Enhancements

### Switch to the `fish` shell (Friendly Interactive Shell)

```bash
brew install fish
which fish
sudo sh -c 'echo /opt/homebrew/bin/fish >> /etc/shells'
chsh -s /opt/homebrew/bin/fish
fish
```

Fish gives you autosuggestions, syntax highlighting, and sane defaults out of the box.

### Install Core Tools

```bash
brew install git htop jq wget tree curl tmux
```

These are the essentials for terminal power users.

### Add to `PATH` in `fish`

```fish
fish_add_path /opt/homebrew/bin/
```

`fish_add_path` stores the path in a universal variable, so it persists across sessions without touching `config.fish`.

### Use `alias` for shortcuts

```fish
alias gs="git status"
alias ll="ls -lah"
alias gc="git commit -m"
alias gco="git checkout"
```

Save these to `~/.config/fish/config.fish` so they load in every new shell:

```bash
nano ~/.config/fish/config.fish
```

## Git: Daily Driver for Projects

These are the git commands that show up repeatedly across dev workflows:

```bash
git clone git@github.com:user/project.git
git checkout -b feature/my-branch
git switch branch-name
git commit -m "meaningful message"
git push --set-upstream origin branch-name
git stash
git stash pop
git reset HEAD~1
git log --oneline --graph --all
```

Create and jump to a new feature branch:

```bash
git checkout -b fix/critical-issue
```

View status or the working diff:

```bash
git status
git diff
```

## Python Development Workflows

Create isolated environments with `conda`:

```bash
conda create -n myenv python=3.10
conda activate myenv
conda install numpy pandas jupyter
```

Run scripts:

```bash
python my_script.py
python -m http.server
```

Profile performance:

```bash
python -m cProfile -s cumulative script.py
```

Use `tuna` to visualize import times:

```bash
pip install tuna
python -X importtime script.py 2> import.log
tuna import.log
```

## Networking, SSH & System Tools

### SSH with custom keys

```bash
ssh -i ~/.ssh/id_rsa user@host
```

Copy your public key to a host:

```bash
ssh-copy-id user@host
```

### Diagnose DNS, IP, Connectivity

```bash
ping google.com
dig example.com
nslookup example.com
ifconfig | grep broadcast
```

Find your local IP on macOS:

```bash
ipconfig getifaddr en0
```

### Scan network devices

```bash
sudo nmap -sn 192.168.1.0/24
```

## Package Managers

### Homebrew (macOS)

```bash
brew install wget git jq
brew update
brew upgrade
```

### pip & Python packages

```bash
pip install package-name
pip uninstall package-name
pip freeze > requirements.txt
pip install -r requirements.txt
```

## File and Text Utilities

### Search history

```bash
history | grep "ssh"
```

### Grep for content in files

```bash
grep -r "keyword" .
grep "error" logs.txt
```

### Recursive file ops

```bash
find . -name "*.py"
find . -type f -exec cat {} +
```

### Disk space

```bash
df -h
du -sh *
```

### Clear the terminal

```bash
clear
```

Or press `Ctrl + L`.

## System Monitoring

### htop

```bash
htop
```

Better than `top`: it shows processes, memory, swap, threads, and more. It's already installed from the core tools step above (`sudo apt install htop` on Debian/Ubuntu).

### Check ports

```bash
lsof -i :8000
sudo lsof -i -P | grep ':8080'
```

Kill a process by PID:

```bash
kill -9 <PID>
```

## Automation Scripts

Make a Python file executable:

```bash
chmod +x script.py
./script.py
```

Zip a folder:

```bash
zip -r archive.zip folder/
```

Unzip:

```bash
unzip file.zip
```

## APIs & Web Tools

### curl with headers

```bash
curl -X POST https://api.example.com/endpoint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Upload to a pre-signed S3 URL

```bash
curl -X PUT "$SIGNED_S3_URL" \
  -H "Content-Type: application/pdf" \
  --upload-file ./file.pdf
```

## Audio Tools (AI & Speech)

### TTS using llama.cpp

This needs a working `llama.cpp` build; the `llama-tts` binary does the rest.

```bash
llama-tts --tts-out-default -p "Hello world" && ffplay output.wav -nodisp -autoexit
```

Stream via a Flask API:

```bash
curl -X POST http://localhost:5000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Welcome to the demo"}' \
  --output output.wav
```

## Infrastructure & Cloud

### Terraform

```bash
terraform init
terraform plan -out=tfplan
terraform apply tfplan
terraform destroy
```

Target specific modules:

```bash
terraform apply -target=module.my_module
```

### AWS CLI

```bash
aws configure
aws s3 ls
aws lambda invoke --function-name my-func out.txt
```

Run LocalStack for local AWS emulation:

```bash
LOCALSTACK_AUTH_TOKEN=dummy localstack start
```

## High-impact One-liners

### Re-run the last command with `sudo`

In bash or zsh:

```bash
sudo !!
```

`!!` doesn't work in fish because fish has no history expansion. Use the history variable instead, or press `Alt + S` to prepend `sudo` to the previous command:

```fish
sudo $history[1]
```

### View the last 100 commands

```bash
history | tail -n 100
```

### Git reset & clean

Throws away all uncommitted changes and untracked files, so be sure before you run it:

```bash
git reset --hard HEAD
git clean -fd
```

## Miscellaneous Yet Powerful

### Serve the current directory over HTTP

```bash
python3 -m http.server 8000
```

### Set environment variables

```bash
export AWS_PROFILE=default
export OPENAI_API_KEY=your-key
```

In fish, use `set -x` instead:

```fish
set -x AWS_PROFILE default
```

### Decode a JWT payload

```bash
echo "<JWT_PART_2>" | base64 --decode
```

## Final Words

These commands reflect months of actual engineering activity, not just tutorials. If you found this useful:

- Follow [@tellsiddh](https://twitter.com/tellsiddh)
- Star [my GitHub](https://github.com/tellsiddh)
- Check out [blog.tellsiddh.com](https://blog.tellsiddh.com)

Stay curious and keep building!
**Siddharth**
