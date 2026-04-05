---
title: "Does the Frontend Need Clean Architecture?"
date: "April 4, 2026"
excerpt: "After applying Clean Architecture to both backend and frontend in a production app, I'm convinced: the onion diagram doesn't fit the frontend. Here's what works instead."
coverImage: "/og/blog-clean-architecture-frontend.png"
readTime: "7 min read"
tags: ["Architecture", "Frontend", "React", "Clean Architecture"]
---

## The Onion That Doesn't Peel

I read Robert Martin's Clean Architecture. I watched twada's talk on why it doesn't fit web frontends. I applied the full onion to a Django backend and tried to do the same on a Vue.js frontend. Here's what happened.

The backend loved it. Domain → Application → Infrastructure → Presentation. Each layer has clear responsibilities. Repository interfaces in the domain, implementations in infrastructure. Dependency inversion works beautifully when your domain has real business logic.

The frontend? Not so much.

## Why It Doesn't Fit

twada's [talk](https://speakerdeck.com/twada/why-the-clean-architecture-does-not-fit-with-web-frontend) nails the core issue: Clean Architecture is about separating **business logic** from its surroundings. But most frontend code has almost no business logic. It's presentation, state management, and API calls.

In our project, the frontend "domain layer" ended up with almost nothing in it. The entities were just TypeScript types mirroring the API response. The "use cases" were thin wrappers around fetch calls. We'd created four layers of indirection for what was essentially: fetch data → show data.

Meanwhile, the component layer — which Clean Architecture treats as the outermost, least important ring — was where all the actual complexity lived.

## What Went Wrong in Practice

### DTOs Resurrecting Themselves

At one point I noticed DTOs had respawned in the backend despite being removed in a previous refactor. The layered structure made it easy for each developer to think "I need a data transfer object here" without realizing the same transformation was already handled elsewhere.

### Import Paths From Hell

With four layers and strict dependency rules, import paths became nightmarish. We had `@/domain/entities/Transaction`, `@/application/usecases/GetTransactions`, `@/infrastructure/api/TransactionApi`, `@/presentation/components/TransactionList` — all for a single feature. Navigating the codebase felt like walking through a hotel to find the lobby.

### Refactoring Resistance

When we did a major frontend refactor (Pinia → TanStack Query, ESLint → Biome, FSD architecture), the Clean Architecture layers made the migration significantly harder. Every change propagated through multiple layers, and existing PRs needed extensive rework to match the new structure.

## What Works Instead

After the refactor, we landed on a simpler approach:

### Feature-Sliced Design (FSD)

Instead of horizontal layers (domain/application/infrastructure/presentation), organize by **vertical slices** (features). Each feature owns its components, API calls, types, and state:

```
features/
├── journal/
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
├── user/
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
└── shared/
    ├── ui/
    └── lib/
```

### Keep the Frontend Thin

Business rules live in the backend. The frontend's job is to fetch, display, and collect input. Trying to duplicate domain logic in the frontend creates two sources of truth.

### Apply Clean Architecture Principles, Not Structure

The valuable ideas from Clean Architecture still apply:
- **Dependency direction**: shared code shouldn't depend on feature code
- **Separation of concerns**: API calls shouldn't live inside components
- **Testability**: pure functions for data transformation

You don't need the onion diagram to follow these principles.

## When the Onion Does Work on Frontend

There's one case where full Clean Architecture makes sense on the frontend: **when you have genuine domain logic running client-side**. Think offline-first apps, complex form validation with business rules, or client-side calculations.

Our [Printable Spectrogram](https://spectrogram.fairy-pitta.net/) project — a client-side audio processing tool — actually benefits from Clean Architecture because the DSP logic is real domain logic that deserves isolation from the UI.

## Takeaway

Clean Architecture is a backend pattern that sometimes gets cargo-culted into frontends. If your frontend is mostly fetching and displaying data, you're better off with feature-sliced organization and thin layers.

Save the onion for where it belongs: backends with real business logic.
