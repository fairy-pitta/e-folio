---
title: "CC Account Switcher"
description: "A shell CLI that keeps several Claude Code accounts on one machine and switches between them."
date: "20 Jun, 2026"
coverImage: "/projects/cc-account-switcher/demo.mp4"
tags: ["CLI Tool", "Bash", "Claude Code", "Homebrew", "npm"]
stack: "Terminal · Bash"
highlight: "A single Bash script, released on Homebrew and npm"
githubUrl: "https://github.com/fairy-pitta/cc-account-switcher"
packageUrl: "https://www.npmjs.com/package/@fairy-pitta/cc-account-switcher"
gallery: [
  "/projects/cc-account-switcher/install.mp4"
]
---

## Background

Claude Code keeps one signed-in account per machine. I use a work account and a personal account on the same laptop, and switching meant signing out and back in each time.

CC Account Switcher stores several accounts and switches between them. Themes, settings and history stay as they are. It started as a fork of [ming86/cc-account-switcher](https://github.com/ming86/cc-account-switcher). I now maintain it and wrote most of the current code.

## What it does

- Add, remove and list accounts, and switch by number, email or a profile name such as `work`
- Switch automatically when you `cd` into a directory mapped to an account
- Switch automatically when a usage limit is hit, using a Claude Code hook
- Show what a switch would change with `--dry-run`
- The CLI and docs are also available in Japanese

## Design

It is one script that runs on Bash 3.2, the version that ships with macOS, so it needs nothing else installed.

If a switch fails partway through, it restores the previous account.

Credentials are kept in the macOS keychain. On Linux and WSL they are kept in files that only the user can read.

Tests are written with [bats](https://github.com/bats-core/bats-core) and run in GitHub Actions. They cover concurrent runs, keeping accounts separate, and differences between platforms.

## Install

```bash
brew install fairy-pitta/tap/ccswitch
# or
npx @fairy-pitta/cc-account-switcher --help
```
