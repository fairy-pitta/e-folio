---
title: "Does the Frontend Need Clean Architecture?"
date: "April 4, 2026"
excerpt: "I tried slapping the full onion onto a frontend codebase. It didn't go well. Here's why feature-sliced thinking beats layered abstractions for most UI work."
coverImage: "/og/blog-clean-architecture-frontend.png"
readTime: "7 min read"
tags: ["Architecture", "Frontend", "React", "Clean Architecture"]
---

## An Onion That Won't Peel

I read Uncle Bob's Clean Architecture. I watched twada's [2025 JSConf.jp talk](https://speakerdeck.com/twada/why-the-clean-architecture-does-not-fit-with-web-frontend) on why it doesn't fit web frontends. Then I ignored both and tried to apply the full onion to a client project's Vue.js frontend anyway, because I'm that kind of person.

The backend loved it. Domain, Application, Infrastructure, Presentation — each layer had clear responsibilities, dependency inversion worked beautifully, and repository interfaces gave me that warm architectural glow. Real business logic deserves real boundaries.

The frontend? Not so much.

## It's a Category Error

twada's core argument is sharp: Clean Architecture exists to separate **business logic** from its surroundings. But most frontend code doesn't *have* business logic. It's presentation, state management, and API calls. That's it.

He goes further — frontend complexity comes from device constraints, network instability, and UI state management, not from domain rules. Modern frameworks like React deliberately moved toward functional programming and immutable data because those concerns demand different tools than what layered OOP architectures provide. You can't solve a state-synchronization problem with a dependency-inversion diagram.

On my project, the frontend "domain layer" ended up basically empty. Entities were TypeScript types mirroring the API response. "Use cases" were thin wrappers around fetch calls. I'd built four layers of indirection for what amounted to: fetch data, show data. Brilliant.

Meanwhile, the component layer — which Clean Architecture treats as the outermost, *least important* ring — was where all the actual complexity lived. The hierarchy was upside down.

## Three Ways It Hurt

### DTOs That Wouldn't Stay Dead

I caught data transfer objects respawning in the backend despite being removed in an earlier refactor. Each layer gave developers a convenient excuse to think "I need a transformation here" without realizing it was already handled two layers away. Layers don't just add indirection — they hide duplication behind directory boundaries.

### Import Paths From Hell

Four layers plus strict dependency rules meant every feature touched `@/domain/entities/Transaction`, `@/application/usecases/GetTransactions`, `@/infrastructure/api/TransactionApi`, and `@/presentation/components/TransactionList`. Navigating the codebase felt like finding the lobby by walking through every floor of a hotel. One feature, four directories, zero joy.

### Refactoring Became Surgery

When I eventually migrated the frontend (Pinia to TanStack Query, ESLint to Biome, new folder structure), the layered architecture fought back hard. Every change cascaded through multiple layers. Existing PRs needed extensive rework. Dan Abramov's ["Goodbye, Clean Code"](https://overreacted.io/goodbye-clean-code/) essay kept echoing in my head — I'd traded the ability to change requirements for architectural purity, and that wasn't a good trade.

## What Actually Works

### Vertical Slices Over Horizontal Layers

Instead of organizing by technical layer (domain / application / infrastructure / presentation), organize by **feature**. Each feature owns its components, API calls, types, and state. Colocate what changes together.

[Feature-Sliced Design](https://feature-sliced.design/) (FSD) formalizes this with seven standardized layers — App, Pages, Widgets, Features, Entities, Shared — where modules can only import from layers strictly below them. It's opinionated but flexible, and the unidirectional dependency rule gives you most of what Clean Architecture promises without the ceremony.

[Bulletproof React](https://github.com/alan2207/bulletproof-react) takes a lighter approach: a `features/` directory where each feature encapsulates its own API hooks, components, and types. No cross-feature imports (enforced via ESLint), unidirectional flow from shared to features to app. Honestly, for most React projects this is the right starting point.

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

Kent C. Dodds calls this the [colocation principle](https://kentcdodds.com/blog/colocation): place code as close to where it's relevant as possible. Things that change together should live together. It sounds obvious. It wasn't obvious to me when I was drawing onion diagrams.

### Keep the Frontend Thin

Business rules belong in the backend. The frontend's job is to fetch, display, and collect input. Duplicating domain logic client-side creates two sources of truth, and the frontend copy is always the one that goes stale first.

### Steal the Principles, Skip the Structure

The *ideas* in Clean Architecture still matter:
- **Dependency direction** — shared code shouldn't depend on feature code
- **Separation of concerns** — API calls don't belong inside components
- **Testability** — pure functions for data transformation

You don't need concentric circles to follow these principles. A flat features directory with clear import rules gets you there.

## When the Onion Actually Fits

There's one case where full Clean Architecture earns its keep on the frontend: **genuine client-side domain logic**. Offline-first apps, complex form validation with real business rules, or heavy client-side computation.

I built a [browser-based spectrogram tool](https://spectrogram.fairy-pitta.net/) where DSP algorithms run entirely in the client. That's real domain logic — math that exists independent of any UI framework — and it deserves isolation. The onion works there because there's actually something worth putting at the center.

## The Short Version

Clean Architecture is a backend pattern. When it shows up in frontend codebases, it's usually cargo-culted in by someone (hi, past me) who liked the diagram more than they understood the constraints.

If your frontend mostly fetches and displays data, go with feature-sliced organization and thin layers. Save the onion for backends with real business logic — or the rare frontend where the domain layer isn't just a mirror of your API types.
