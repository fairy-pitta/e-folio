---
title: "portree"
description: "A CLI that runs a separate set of dev servers for each git worktree, with stable ports and branch-name URLs."
date: "6 Feb, 2026"
coverImage: "/projects/portree/portree_main.mp4"
tags: ["CLI Tool", "Go", "Git Worktree", "TUI", "Developer Tools"]
stack: "Terminal · Go"
highlight: "Each branch gets the same ports every time, from a hash of its name"
githubUrl: "https://github.com/fairy-pitta/portree"
gallery: [
  "/projects/portree/portree_tui.mp4",
  "/projects/portree/portree_init.mp4"
]
articleUrl: "https://qiita.com/Pitta/items/4a6537a3450aa6f8f050"
articleLabel: "Article on Qiita (Japanese)"
---

## Background

With git worktrees I can have several branches checked out at once. Each one needs its own frontend and backend running, and I kept running into the same problems: two branches trying to use the same port, environment variables to set for each copy, and forgetting which branch was on which port.

portree starts and stops the services for each worktree, gives them ports that do not clash, and lets me open a branch at `branch-name.localhost`.

![portree workflow demo](/projects/portree/portree_main.mp4)

## Design

Ports are calculated as `FNV32(branch:service) % range`. A branch always gets the same ports, so its URLs can be bookmarked, and there is no shared list of ports to keep in sync.

Browsers resolve `*.localhost` to `127.0.0.1` (RFC 6761). A small reverse proxy in portree reads the `Host` header and forwards the request to the right worktree, so `/etc/hosts` never needs editing.

Each service receives `$PORT`, `$PT_BRANCH` and `$PT_BACKEND_URL` as environment variables, so the frontend can find its backend without a hard-coded port.

The state file is locked while it is written, so several portree processes can run at once. Leftover PIDs from crashed processes are cleaned up.

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│  git repository                                             │
│                                                             │
│  main worktree          feature/auth worktree               │
│  ┌───────────────┐      ┌───────────────┐                   │
│  │ frontend :3100│      │ frontend :3117│                   │
│  │ backend  :8100│      │ backend  :8104│                   │
│  └───────────────┘      └───────────────┘                   │
│         │                      │                            │
└─────────┼──────────────────────┼────────────────────────────┘
          │                      │
    ┌─────▼──────────────────────▼─────┐
    │     portree reverse proxy        │
    │                                  │
    │  :3000  ←  *.localhost:3000      │
    │  :8000  ←  *.localhost:8000      │
    └──────────────────────────────────┘
          │                      │
          ▼                      ▼
  main.localhost:3000    feature-auth.localhost:3000
  main.localhost:8000    feature-auth.localhost:8000
```

Services run as child processes in their own process groups. Logs go to `.portree/logs/`.

![portree init demo](/projects/portree/portree_init.mp4)

```bash
portree init          # set up the project
portree up --all      # start services for every worktree
portree proxy start   # start the reverse proxy
portree dash          # open the dashboard
```

The dashboard runs in the terminal and can start, stop and restart each service.

![portree TUI dashboard](/projects/portree/portree_tui.mp4)

## Stack

Go, Cobra, Bubble Tea and Lip Gloss, with TOML for configuration. Released with GoReleaser to Homebrew and GitHub Releases. Works on macOS and Linux; Windows support is experimental.

```bash
brew install fairy-pitta/tap/portree
```
