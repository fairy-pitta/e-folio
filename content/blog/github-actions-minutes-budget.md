---
title: "Surviving on 3,000 GitHub Actions Minutes per Month"
date: "March 31, 2026"
excerpt: "Our team nearly burned through the entire monthly Actions budget in three weeks. Here's how we optimized CI to stay under the limit."
coverImage: "/new-favicon.png"
readTime: "6 min read"
tags: ["CI/CD", "GitHub Actions", "DevOps", "Performance"]
---

## The Budget

GitHub Teams plan: 3,000 Actions minutes per month. Two active repositories (a Django/Vue accounting app and a Next.js stress check app). Six to eight developers submitting PRs daily. CodeRabbit running automated reviews on every PR.

By day 20, we'd used 2,843 minutes. Ten days left. I started watching the counter like a stock ticker.

## Where the Minutes Went

Each push triggered:
1. Backend linter (flake8/ruff)
2. Frontend linter (ESLint, later Biome)
3. Backend tests
4. Frontend tests
5. CodeRabbit review

These ran **sequentially** in a single workflow. A typical run: 3–4 minutes. With 8 developers pushing multiple commits per PR, we were burning 100+ minutes per day.

The worst offender: **me**. In one particularly productive day, I submitted 21 PRs and single-handedly exhausted the remaining minutes.

## Optimization 1: Parallelize Linters

The simplest win. Backend and frontend linters have zero dependencies on each other.

```yaml
# Before: sequential
jobs:
  lint:
    steps:
      - run: ruff check .
      - run: npm run lint

# After: parallel jobs
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

Wall-clock time dropped by ~40%. But **minutes consumed stayed the same** — parallel jobs still bill separately. What it *did* help was developer experience: faster feedback loops meant fewer "push and pray" cycles.

My colleague pointed this out immediately: "Parallel doesn't save minutes, does it?" Correct. But it reduces the number of retry pushes, which indirectly saves minutes.

## Optimization 2: Shallow Clone

```yaml
# Before
- uses: actions/checkout@v4

# After
- uses: actions/checkout@v4
  with:
    fetch-depth: 10
```

`fetch-depth: 0` (full history) was unnecessary for linting and testing. Switching to `fetch-depth: 10` saved a few seconds per run. Small per run, but it adds up across hundreds of runs.

## Optimization 3: Don't Cache What Can't Be Cached

I spent three hours trying to make npm caching work before discovering the issue: **`npm ci` deletes `node_modules` before installing**, which defeats the purpose of caching `node_modules`.

The cache action was downloading cached packages, only for `npm ci` to delete them and reinstall from scratch. We were paying for the cache download time *and* the full install time.

Options:
- Switch to `npm install` (loses the deterministic install guarantee)
- Cache the npm global cache directory instead of `node_modules`
- Accept the install time

We went with caching the global npm cache, which at least avoids re-downloading packages from the registry.

## Optimization 4: Pre-commit Hooks

Shift linting left. If developers run linters locally before pushing, the CI linter becomes a safety net rather than the primary check.

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

This doesn't eliminate CI linting (someone will inevitably skip pre-commit), but it reduces the number of "fix lint error" follow-up commits.

## Optimization 5: Strategic CI Suspension

When we were at 2,950/3,000 minutes with a week left, I made the call to temporarily disable linters in CI for the less active repository. Not ideal, but pragmatic. Pre-commit hooks were still running locally.

## What I'd Do Differently

**Start with a minutes budget from day one.** We didn't think about minutes until we were almost out. If I'd tracked usage from week one, we'd have optimized earlier.

**One commit = one minute** is a useful mental model. If your team makes 100 commits per day across all PRs, that's 100 minutes. At that rate, 3,000 minutes lasts exactly 30 days — with zero margin.

**Consider self-hosted runners** for high-volume repositories. They don't count against the minutes budget. The overhead of maintaining them might be worth it if you're consistently hitting limits.

## The Spreadsheet

I ended up tracking daily usage manually:

| Date | Used | Remaining | Days Left |
|------|------|-----------|-----------|
| Jan 5 | 450 | 2,550 | 26 |
| Jan 12 | 1,200 | 1,800 | 19 |
| Jan 19 | 2,100 | 900 | 12 |
| Jan 21 | 2,454 | 546 | 10 |
| Jan 29 | 2,950 | 50 | 2 |

The pattern is obvious in retrospect: usage accelerated as more developers joined and PR volume increased. Linear extrapolation would have predicted the crunch two weeks earlier.

## Takeaway

3,000 minutes sounds like a lot until it isn't. The main levers are: parallelize for speed (not savings), cache correctly, lint locally, and track usage before it becomes a crisis.

And maybe don't submit 21 PRs in one day.
