---
title: "How I Blew Through 3,000 GitHub Actions Minutes in Three Weeks"
date: "March 31, 2026"
excerpt: "I burned through 21 PRs in a single day and killed the CI budget. Here's what I learned about GitHub Actions billing the hard way."
coverImage: "/og/blog-github-actions-minutes-budget.png"
readTime: "7 min read"
tags: ["CI/CD", "GitHub Actions", "DevOps", "Performance"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- Free plan = 2,000 min, Team/Pro = 3,000, Enterprise = 50,000 (link to GitHub billing docs if re-added)
- Parallel jobs bill separately (2 x 2 min = 4 billed min) (docs link if re-added)
- Parallel linters cut wall-clock ~40% (own number? check)
- Faster feedback indirectly saves minutes (opinion)
- `actions/checkout` defaults to `fetch-depth: 1`
- `npm ci` deletes `node_modules` before installing (kept as behaviour I observed; cache restore ~30s then reinstall ~60s: check my numbers)
- `setup-node` `cache` caches the global package store, not `node_modules`
- pnpm caches better than npm; Turborepo remote caching skips unchanged builds
- Linux runner $0.008/min (2-core); Windows ~2x; macOS ~10x
- Self-hosted runners don't count against minutes
- Depot (30% faster CPUs at half cost), Namespace (AMD EPYC / Apple M4 runners), BuildJet shut down
- GitHub sends no notification at 80%; usage page is at Settings -> Billing -> Actions
- Table dates say Jan but post is dated March 31 and says "three weeks" / "day 20" (check dates)
-->

## Context
- GitHub Team plan, 3,000 Actions minutes/month
- A couple of production apps with CI pipelines, plus CodeRabbit reviewing every PR
- By day 20: 2,843 minutes used, 10 days left in the cycle
- Hit 2,950 of 3,000 with a week left (check: conflicts with day-20 figure timeline)

## What happened
- Every push ran, sequentially in one workflow: backend linter (ruff), frontend linter (ESLint, later Biome), backend tests, frontend tests, CodeRabbit review
- A typical run: 3-4 minutes; typo fix, real fix and force-push each re-ran it
- 21 PRs in a single day used up the remaining budget

Usage log:

| Date | Used | Remaining | Days Left |
|------|------|-----------|-----------|
| Jan 5 | 450 | 2,550 | 26 |
| Jan 12 | 1,200 | 1,800 | 19 |
| Jan 19 | 2,100 | 900 | 12 |
| Jan 21 | 2,454 | 546 | 10 |
| Jan 29 | 2,950 | 50 | 2 |

- Jan 19 -> Jan 21 jump (354 minutes in two days) is the 21-PR day

## Changes tried and effect
- Split linters into parallel jobs: wall-clock time dropped (~40%, check); billed minutes unchanged

```yaml
# Before: one slow conga line
jobs:
  lint:
    steps:
      - run: ruff check .
      - run: npm run lint

# After: two jobs running at the same time
jobs:
  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - run: ruff check .
  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
```

- Shallow checkout:

```yaml
# Before: downloads your entire git history
- uses: actions/checkout@v4

# After: just the last 10 commits
- uses: actions/checkout@v4
  with:
    fetch-depth: 10
```

  - effect: saves a few seconds per run (check)
- Cached `node_modules` with `actions/cache`: no speedup; took about 3 hours to find out why
  - Cause: `npm ci` deletes `node_modules` first; restore (~30s) then reinstall (~60s) made it slower
  - Fix: `setup-node` built-in cache ([docs](https://github.com/actions/setup-node#caching-global-packages-data)):

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

- Pre-commit hooks (ruff, biome) to catch lint errors before push:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
  - repo: local
    hooks:
      - id: biome
        name: biome check
        entry: npx biome check --write
        language: system
        types: [ts, tsx, vue]
```

  - CI linting is not replaced; hooks can be bypassed with `--no-verify`
- At 2,950/3,000 with a week left: disabled CI linters on the less active repo (hooks still ran locally)

## Takeaway
- Track minutes from day one; I didn't know about the limit until nearly over
- Budget it: one push ~ one minute; 100 pushes/day = 3,000 min in 30 days, no room for a 21-PR day
- All my runners were `ubuntu-latest` (Linux)
- Considered self-hosted / managed runners as next step (unverified, see removed claims)

## Links
- [GitHub Actions billing](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)
- [setup-node caching](https://github.com/actions/setup-node#caching-global-packages-data)
