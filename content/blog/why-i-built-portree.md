---
title: "Why I Built portree: A Love Letter to Git Worktrees (and a Breakup Letter to Port Conflicts)"
date: "February 6, 2026"
excerpt: "The frustration of managing multiple dev servers across git worktrees led me to build portree."
coverImage: "/blogs/portree-cover.gif"
readTime: "5 min read"
tags: ["Developer Tools", "Go", "Git"]
---

## The Dream of Parallel Development

Git worktrees are amazing. The ability to have multiple branches checked out simultaneously, each in its own directory, feels like a superpower. You can work on a feature, switch to review a PR, hotfix something in production—all without stashing, committing half-done work, or losing your mental context.

I fell in love with worktrees the moment I discovered them.

But then reality hit.

---

## The Nightmare Begins

Picture this: I'm working on a monorepo with a React frontend and a Python backend. I have three worktrees open—`main`, `feature/auth`, and `hotfix/login-bug`. Each needs its own frontend server. Each needs its own backend server.

That's six dev servers.

**"Port 3000 is already in use."**

Okay, I'll use 3001 for the feature branch.

**"Port 3001 is already in use."**

Right, I forgot I left something running. Let me find a free port... 3002? 3003?

Now my frontend on `feature/auth` is running on port 3003. But wait—my backend is on 8000, but which backend? The one for `main`? Or was that 8001?

I open my browser. `localhost:3003`. Nothing. Oh, I stopped that server to restart the other one. Let me check which ports are actually running...

```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :8000
lsof -i :8001
```

This is madness.

---

## The Breaking Point

The final straw came when I spent 20 minutes debugging why my frontend couldn't reach the backend, only to realize I was running `feature/auth` frontend against `main` backend. The ports were mixed up. My environment variables were wrong. I had no idea which process belonged to which branch.

I had a Notion page—a NOTION PAGE—just to track which ports I was using for which worktree.

This wasn't sustainable. This wasn't the dream of parallel development. This was chaos with extra steps.

---

## What I Wanted

I wanted something simple:

1. **Automatic ports** — Don't make me think about port numbers. Just pick one that's free and remember it.
2. **Consistent URLs** — I want `feature-auth.localhost:3000` to always point to my auth branch's frontend. Not localhost:3007. Not "whatever port I wrote down last Tuesday."
3. **One command** — `portree up` and everything starts. `portree down` and everything stops. No hunting for PIDs.
4. **Service discovery** — My frontend should automatically know where its backend is, without me hardcoding `localhost:8003` into seventeen different config files.

---

## Building the Solution

So I built portree.

The core insight was simple: use a hash function. Given a branch name and service name, compute a deterministic port number. `FNV32("feature/auth:frontend") % 100 + 3100` always gives the same port. No conflicts (well, rarely—and when there are, linear probing handles it). No tracking. No Notion pages.

Then I added a reverse proxy. One process listens on port 3000 and routes `main.localhost:3000` to wherever `main`'s frontend is actually running, and `feature-auth.localhost:3000` to the auth branch's frontend. Modern browsers resolve `*.localhost` automatically—no `/etc/hosts` editing needed.

Environment variables get injected automatically. `$PORT` tells your server which port to bind. `$PT_BACKEND_URL` tells your frontend where the backend lives. Services discover each other without configuration.

And for those moments when you want to see everything at a glance—a TUI dashboard. Start, stop, restart services with a keypress. See what's running, what's crashed, what's waiting.

![portree TUI dashboard](/blogs/portree-tui.gif)

---

## The Result

Now my workflow looks like this:

```bash
# Create a new worktree
git worktree add ../my-project-feature feature/new-thing

# Start everything
portree up --all

# Open the dashboard
portree dash
```

That's it. Six services across three worktrees, all running, all accessible via predictable URLs, all manageable from one terminal.

`main.localhost:3000` — main frontend
`main.localhost:8000` — main backend
`feature-auth.localhost:3000` — auth feature frontend
`feature-auth.localhost:8000` — auth feature backend

![portree workflow](/blogs/portree-workflow.gif)

No port conflicts. No confusion. No Notion pages.

---

## The Emotional Payoff

There's something deeply satisfying about solving your own problem. Every time I type `portree up` and watch my services spin up automatically, I feel a small spark of joy. Every time I open `feature-auth.localhost:3000` and it just works, I remember the hours I used to spend juggling ports.

portree isn't a groundbreaking innovation. It's just a tool that removes friction from a workflow I love. Git worktrees are still amazing. Now I can actually enjoy using them.

If you've ever maintained a spreadsheet of port numbers, if you've ever killed the wrong process and had to restart everything, if you've ever wondered "wait, which backend am I hitting?"—maybe portree can help you too.

---

## Try It

```bash
brew install fairy-pitta/tap/portree
```

Or check it out on [GitHub](https://github.com/fairy-pitta/portree).

The dream of parallel development is real. You just need the right tools.
