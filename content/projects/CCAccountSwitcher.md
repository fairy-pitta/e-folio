---
title: "CC Account Switcher — Multi-Account Switcher for Claude Code"
description: "A shell CLI that manages and switches between multiple Claude Code accounts on macOS, Linux and WSL, distributed via Homebrew and npm."
date: "20 Jun, 2026"
coverImage: "/projects/cc-account-switcher/demo.gif"
tags: ["CLI Tool", "Bash", "Claude Code", "Homebrew", "npm"]
featured: true
order: 2
liveUrl: "https://www.npmjs.com/package/@fairy-pitta/cc-account-switcher"
githubUrl: "https://github.com/fairy-pitta/cc-account-switcher"
gallery: [
  "/projects/cc-account-switcher/install.gif"
]
---

## Overview

CC Account Switcher manages several Claude Code accounts on one machine and switches between them without touching themes, settings or history. It started as a fork of [ming86/cc-account-switcher](https://github.com/ming86/cc-account-switcher); I now maintain it and wrote most of the current code.

## What it does

- Add, remove and list accounts; switch by number, email or a named profile such as `work` or `personal`
- Map directories to accounts and switch automatically on `cd`
- Switch accounts automatically when a usage limit is hit, using a Claude Code hook
- Preview a switch with `--dry-run`, and roll back automatically if a switch fails halfway
- Store credentials in the macOS keychain, or in protected files on Linux and WSL

## Engineering

- A single Bash 3.2+ script, so it runs on the stock macOS shell without extra dependencies
- 85 [bats](https://github.com/bats-core/bats-core) tests covering concurrency, isolation and platform differences, run in GitHub Actions
- Release pipeline that publishes to GitHub Releases, a Homebrew tap and npm
- Japanese localisation of the CLI and docs

## Install

```bash
brew install fairy-pitta/tap/ccswitch
# or
npx @fairy-pitta/cc-account-switcher --help
```
