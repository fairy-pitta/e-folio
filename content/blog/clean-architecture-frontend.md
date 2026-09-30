---
title: "Does the Frontend Need Clean Architecture?"
date: "April 4, 2026"
excerpt: "I tried slapping the full onion onto a frontend codebase. It didn't go well. Here's why feature-sliced thinking beats layered abstractions for most UI work."
coverImage: "/og/blog-clean-architecture-frontend.png"
readTime: "7 min read"
tags: ["Architecture", "Frontend", "React", "Clean Architecture"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- twada's argument: CA separates business logic, frontends mostly lack it; complexity comes from device/network/UI state; React moved to functional/immutable (kept as one link below)
- Dan Abramov "Goodbye, Clean Code" summary (kept as one link)
- FSD description: "seven standardized layers" (draft lists six: App, Pages, Widgets, Features, Entities, Shared — count is wrong/unclear); import only from layers below
- Bulletproof React description: features/ dir, no cross-feature imports enforced via ESLint, unidirectional flow
- Kent C. Dodds colocation principle (link dropped)
- Generic advice: "business rules belong in backend; duplicated client logic goes stale first"
- "Steal the principles" list (dependency direction, separation of concerns, testability)
- "Read Uncle Bob's Clean Architecture" (fine if true, check)
- "Backend loved it": four layers Domain/Application/Infrastructure/Presentation on backend, repository interfaces — is this my own backend? (check)
- "DTOs respawning in the backend" — draft says backend, but section is about frontend (check which)
- Spectrogram tool as case where onion fits (client-side DSP): confirm I actually applied clean architecture there (check)
- "Clean Architecture is a backend pattern" as general claim
-->

## Context
- Client project, Vue.js frontend
- Applied full Clean Architecture despite having read Clean Architecture and seen twada's talk
- Four layers: Domain, Application, Infrastructure, Presentation

## What happened
- Domain layer ended up basically empty: entities were TypeScript types mirroring API responses; "use cases" were thin wrappers around fetch calls
- Component layer (outermost in CA) is where the real complexity lived
- DTOs reappeared despite being removed in an earlier refactor; each layer made "I need a transformation here" look reasonable while it was already handled elsewhere (check: backend or frontend)
- Import paths across four layers for one feature:
  - `@/domain/entities/Transaction`
  - `@/application/usecases/GetTransactions`
  - `@/infrastructure/api/TransactionApi`
  - `@/presentation/components/TransactionList`
- Later frontend migration: Pinia to TanStack Query, ESLint to Biome, new folder structure. Changes cascaded through layers; existing PRs needed extensive rework

## Cause
- Frontend had almost no business logic to protect, so layers were indirection only

## Fix
- Moved to feature-based folders (each feature owns components, API, types, state):

```
features/
├── transactions/
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
├── users/
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
└── shared/
    ├── ui/
    └── lib/
```

- Kept only: shared code does not depend on feature code; API calls not inside components; pure functions for data transformation (check)
- Business rules stay in backend

## Takeaway
- Frontend that mostly fetches and displays: feature-sliced organisation, thin layers
- Full layering only if real client-side domain logic exists; example: browser spectrogram tool with client-side DSP (check)

## Links
- twada, JSConf.jp 2025: https://speakerdeck.com/twada/why-the-clean-architecture-does-not-fit-with-web-frontend
- Dan Abramov, "Goodbye, Clean Code": https://overreacted.io/goodbye-clean-code/
- Feature-Sliced Design: https://feature-sliced.design/
- Bulletproof React: https://github.com/alan2207/bulletproof-react
- Spectrogram tool: https://spectrogram.fairy-pitta.net/
