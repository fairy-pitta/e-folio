---
title: "Why I Built portree — Git Worktree Server Manager"
date: "February 6, 2026"
excerpt: "Managing multiple dev servers across git worktrees was annoying, so I built a CLI to automate it."
coverImage: "/blogs/portree-cover.mp4"
readTime: "7 min read"
tags: ["Developer Tools", "Go", "Git"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- "Thirty minutes later you don't remember which port belongs to which branch" (invented timing?)
- "spend 20 minutes debugging" after running feature/auth frontend against main backend (real incident or hypothetical?)
- "Three branches ... six dev servers" (example says two `git worktree add` plus main)
- Found portless "the day before" finishing portree
- portless facts: proxy over already-running servers, no lifecycle management, no worktree concept, random port allocation, auto-certs HTTPS, no TUI, TypeScript, example `myapp.localhost:1355`
- Next.js SWC compiler as example of child processes spawned by dev servers
- Vite and webpack HMR use SSE with persistent connections, so a write deadline kills the stream
- "Everything except that last line can be automated" (opinion, kept only as the motivation)
-->

## Problem
- Tweet that triggered it: "you should use worktrees — you just have to npm install in the worktree, reinstall pre-commit hooks, copy env files, not use the same ports" ([@_colemurray](https://x.com/_colemurray/status/2025170703448985849))
- Monorepo: React frontend on `:3000`, Python backend on `:8000`
- Worktrees let several branches be checked out at once, so each needs its own frontend + backend
- Port 3000 can be used only once

```bash
git worktree add ../myapp-feature-auth feature/auth
git worktree add ../myapp-fix-header fix/header
```

- Manual workaround: offset ports (3001, 3002, ...), update env vars and backend URLs in frontend config on every context switch
- Failure mode: frontend of `feature/auth` running against `main` backend without noticing (check)

## Existing options
- portless (Vercel Labs): [github.com/vercel-labs/portless](https://github.com/vercel-labs/portless)
  - found after portree was nearly done
  - replaces port numbers with named `.localhost` URLs
  - scope differs: no worktree concept, no server lifecycle (check)
- What I wanted: add a worktree, all services start on the right ports, reachable by branch name
  - needs port allocation + process management + service discovery in one tool

| | portless | portree |
|---|---|---|
| Philosophy | Replace ports with names | Manage dev environments per worktree |
| Process management | None (proxy only) | Full lifecycle (start/stop/restart) |
| Port allocation | Random | Deterministic (FNV32 hash) |
| Named URLs | Yes | Yes (`branch-name.localhost`) |
| Worktree support | No | Core feature |
| HTTPS | Yes (auto-certs) | In progress |
| TUI | No | Yes |
| Language | TypeScript | Go (single binary) |

## What portree does
- [portree](https://github.com/fairy-pitta/portree): port + tree, Git Worktree Server Manager, written in Go
- Install: `brew install fairy-pitta/tap/portree`

```bash
portree init          # Initialize
portree up --all      # Start all services across all worktrees
portree open          # → http://main.localhost:3000
```

- Three parts: port allocation, lifecycle management, branch-name routing

## Design details

### Deterministic port allocation
- Branch name + service name -> FNV32 hash -> port
- Same branch + service always gets the same port
- On hash collision: linear probing to next free port

```
FNV32("main:frontend") % 100 + 3100 → 3100
FNV32("feature/auth:frontend") % 100 + 3100 → 3117
```

### Lifecycle management
- Services defined once in `.portree.toml`, same config for every worktree

```toml
[services.frontend]
command = "pnpm run dev"
dir = "frontend"
port_range = { min = 3100, max = 3199 }
proxy_port = 3000

[services.backend]
command = "python manage.py runserver 0.0.0.0:$PORT"
dir = "backend"
port_range = { min = 8100, max = 8199 }
proxy_port = 8000
```

- `portree up --all` / `portree down --all`
- Processes managed as groups: SIGTERM first, SIGKILL after timeout; no orphaned children

### Branch-name routing
- `portree proxy start` = reverse proxy routing on `Host` header subdomain

```
http://main.localhost:3000          → frontend (main)
http://feature-auth.localhost:3000  → frontend (feature/auth)
http://main.localhost:8000          → backend (main)
http://feature-auth.localhost:8000  → backend (feature/auth)
```

- `*.localhost` resolves to 127.0.0.1 per [RFC 6761](https://tools.ietf.org/html/rfc6761); no `/etc/hosts` edit
- Env vars injected: `$PORT` (port to bind), `$PT_BACKEND_URL` (where the backend is)

### TOCTOU in port allocation
- Gap between checking a port is free and the service binding it
- `flock` file lock prevents races between concurrent portree invocations
- External collisions: clear error message

### Process groups
- Killing only the parent leaves child processes orphaned

```go
cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
```

- `Setpgid: true` creates a process group; on shutdown `syscall.Kill(-pgid, syscall.SIGTERM)` kills the whole group

### WriteTimeout = 0
- Proxy's `http.Server` deliberately has no `WriteTimeout`; reason: HMR streams (Vite/webpack, SSE) must stay open (check)

```go
srv := &http.Server{
    ReadTimeout:       30 * time.Second,
    ReadHeaderTimeout: 10 * time.Second,
    IdleTimeout:       120 * time.Second,
    // WriteTimeout intentionally 0: don't kill HMR SSE streams
}
```

### TUI dashboard
- Built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) + [Lip Gloss](https://github.com/charmbracelet/lipgloss)
- Keys: `s` start, `x` stop, `r` restart, `o` open in browser, `q` quit
- Shows worktree, service, port, status, PID

```
╭─ portree dashboard ────────────────────────────────╮
│                                                     │
│  WORKTREE        SERVICE    PORT   STATUS    PID    │
│ ▸ main           frontend   3100   ● running 12345  │
│   main           backend    8100   ● running 12346  │
│   feature/auth   frontend   3117   ○ stopped —      │
│                                                     │
│  [s] start  [x] stop  [r] restart  [q] quit        │
╰─────────────────────────────────────────────────────╯
```

![portree TUI dashboard](/blogs/portree-tui.mp4)

![portree workflow](/blogs/portree-workflow.mp4)

## Takeaway
- WriteTimeout = 0: chose fitting the use case (local dev tool) over the default hardening advice
- Should have searched for existing tools before building (found portless late) (check)

## Links
- [portree](https://github.com/fairy-pitta/portree)
- [portless](https://github.com/vercel-labs/portless)
- [RFC 6761](https://tools.ietf.org/html/rfc6761)
