---
title: "How I Blew Through 3,000 GitHub Actions Minutes in Three Weeks"
date: "March 31, 2026"
excerpt: "I burned through 21 PRs in a single day and killed the CI budget. Here's what I learned about GitHub Actions billing the hard way."
coverImage: "/og/blog-github-actions-minutes-budget.png"
readTime: "7 min read"
tags: ["CI/CD", "GitHub Actions", "DevOps", "Performance"]
---

## 3,000 Minutes Sounds Like a Lot

It isn't.

Here's what I was working with: GitHub Team plan, 3,000 Actions minutes per month, a couple of production apps with CI pipelines, and CodeRabbit running automated reviews on every PR. For context, GitHub Free gives you 2,000 minutes, Team/Pro gives you 3,000, and Enterprise gets a cushy 50,000. I was firmly in the "should be enough for a small operation" tier.

By day 20, I'd burned through 2,843 minutes. Ten days left in the billing cycle. I started refreshing the usage page like it was a stock ticker during a crash.

## The Death-by-a-Thousand-Cuts Pipeline

Every push kicked off the full circus:

1. Backend linter (ruff)
2. Frontend linter (ESLint, later Biome)
3. Backend tests
4. Frontend tests
5. CodeRabbit review

All **sequential**. One big workflow, step after step. A typical run chewed through 3-4 minutes. Doesn't sound bad until you realize that every push to a PR branch triggers the whole thing. Push a typo fix? 4 minutes. Push the actual fix? 4 more minutes. Force-push because you forgot to stage a file? That's another 4.

Across multiple PRs a day, it adds up terrifyingly fast.

And the worst offender? Me. I had one of those days where everything clicked and I was shipping like a maniac. **21 PRs in a single day.** I felt like a productivity god right up until I checked the usage dashboard and realized I'd personally murdered the remaining budget.

That was the "oh no" moment.

## Split the Linters, Save Your Sanity (But Not Your Minutes)

First thing I tried: run backend and frontend linters in parallel instead of sequentially.

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

Wall-clock time dropped ~40%. Felt great. Then I realized: **parallel jobs still bill separately.** Two jobs running for 2 minutes each = 4 billed minutes, same as one job running for 4 minutes. GitHub doesn't care about your clever concurrency — they bill per runner-minute.

So why bother? Because faster feedback means developers don't context-switch as hard, which means fewer "let me push another fix" commits, which *indirectly* saves minutes. It's a second-order effect, but it's real.

## Stop Cloning the Entire Universe

This one's almost embarrassingly simple:

```yaml
# Before: downloads your entire git history
- uses: actions/checkout@v4

# After: just the last 10 commits
- uses: actions/checkout@v4
  with:
    fetch-depth: 10
```

The default `actions/checkout` doesn't clone full history anymore (it defaults to `fetch-depth: 1`), but if you've ever set `fetch-depth: 0` for some reason and forgotten about it, you're downloading every commit since the dawn of your repo on every single run. For linting and tests, you don't need any of that. A shallow clone with `fetch-depth: 1` or `fetch-depth: 10` is fine. Saves a few seconds per run, and across hundreds of runs a month, those seconds aren't nothing.

## The npm ci Cache Trap (A Classic Footgun)

This one cost me three hours of my life that I'll never get back.

I set up `actions/cache` to cache `node_modules`, feeling very clever about it. Runs kept taking the same amount of time. I added debug logging. I verified the cache was being saved and restored. Everything looked right, but installs were still slow.

Then I actually read what `npm ci` does: **it deletes `node_modules` before installing.** Every. Single. Time. That's the whole point of `npm ci` — it guarantees a clean, deterministic install from your lockfile. Which is great for reproducibility and terrible for caching.

So my workflow was: download cached `node_modules` (30 seconds) → `npm ci` immediately deletes it → reinstall everything from scratch (60 seconds). I was *adding* time by caching.

This is a well-known footgun, by the way. The `actions/setup-node` action has a built-in `cache` parameter that handles this correctly — it caches the global npm/yarn/pnpm store, not `node_modules`. So the packages don't need to be re-downloaded from the registry, but `npm ci` can still do its clean install thing:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

If you're using pnpm, it's even simpler — `pnpm/action-setup` plus `cache: 'pnpm'` in `setup-node` handles everything. pnpm's content-addressable store plays much nicer with caching than npm's flat `node_modules` anyway.

**Hot take**: if you're still on npm in CI and you care about speed, consider switching to pnpm. The install times aren't *dramatically* different on a warm cache, but pnpm's store-based architecture means cache hits are more effective. And if you're running a monorepo, Turborepo's remote caching can skip entire build steps that haven't changed — that's where the real savings are.

## Lint Before You Push, You Animals

The cheapest CI minute is the one you never use. Pre-commit hooks catch lint errors before they ever hit the pipeline.

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

Does this eliminate CI linting? No. Someone's always going to `--no-verify` their way past hooks. But it cuts down on the "oops, forgot a trailing comma" follow-up commits, and those add up fast.

## The Panic Button

When I hit 2,950 out of 3,000 minutes with a week left in the cycle, I did what any responsible engineer would do: I panicked. Then I disabled the CI linters on the less active repo. Not proud of it, but pre-commit hooks were still running locally, so it wasn't *total* anarchy.

Sometimes pragmatism beats purity.

## What I'd Actually Do Next Time

**Track minutes from day one.** I didn't even know there was a limit until I was almost over it. GitHub buries the usage page under Settings → Billing → Actions, and it doesn't exactly send you push notifications at 80%.

**Budget it like money.** A useful mental model: one push ≈ one minute. If you're making 100 pushes a day across all PRs, that's 100 minutes. At that rate, 3,000 minutes lasts exactly 30 days — with zero margin for a "21 PRs in one day" incident.

**Know your OS multipliers.** All my runners were Linux (`ubuntu-latest`), which is the cheapest at $0.008/min on the standard 2-core runner. Windows costs about 2x more. macOS? Roughly **10x** the cost of Linux. If you've got a macOS build in your pipeline, that's where your budget is actually going. One 10-minute macOS job eats as many dollars as a 100-minute Linux job.

**Look at runner alternatives.** Self-hosted runners don't count against your minutes at all — you just pay for your own compute. If you're consistently bumping against limits, that's the move. There are also managed alternatives like [Depot](https://depot.dev/) (claims 30% faster CPUs at half the cost of GitHub runners) and [Namespace](https://namespace.so/) (fancy AMD EPYC and Apple M4 runners with built-in caching). BuildJet used to be the go-to recommendation here, but they shut down — so it goes.

## The Spreadsheet of Shame

I ended up tracking usage manually because apparently I enjoy suffering:

| Date | Used | Remaining | Days Left |
|------|------|-----------|-----------|
| Jan 5 | 450 | 2,550 | 26 |
| Jan 12 | 1,200 | 1,800 | 19 |
| Jan 19 | 2,100 | 900 | 12 |
| Jan 21 | 2,454 | 546 | 10 |
| Jan 29 | 2,950 | 50 | 2 |

See that jump between Jan 19 and Jan 21? That's the 21-PR day. Two days, 354 minutes. Just me, vibing, destroying the budget.

The trend was obvious in hindsight. If I'd been plotting this from week one, I'd have seen the crunch coming two weeks early. But nobody ever thinks they need a spreadsheet until they need a spreadsheet.

## The Moral

3,000 minutes sounds generous until you actually use CI the way it's meant to be used. The real levers are: cache *correctly* (not the `npm ci` way), lint locally, track your usage before it becomes an emergency, and maybe think twice before submitting 21 PRs in one day.

Actually, no. Ship the 21 PRs. Just make sure you've optimized first.
