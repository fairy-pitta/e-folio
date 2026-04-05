---
title: "Dependency Injection: Why I Kept Forgetting It and How It Finally Clicked"
date: "April 3, 2026"
excerpt: "I looked up dependency injection at least five times before it stuck. Here's the mental model that finally made it permanent."
coverImage: "/og/blog-dependency-injection-explained.png"
readTime: "6 min read"
tags: ["Architecture", "Design Patterns", "Python", "Backend"]
---

## The Loop

Every few months, I'd encounter a code review comment like "the dependency is inverted here, use an interface." I'd nod, look it up, understand it for about 20 minutes, implement something, and promptly forget why it mattered.

This happened at least five times.

The problem wasn't that DI is complicated — it's that every explanation starts with the *mechanism* (interfaces, constructors, containers) instead of the *problem* it solves.

## The Problem, Simply

You have a service that talks to a database:

```python
class JournalService:
    def get_entries(self, company_id: str):
        db = PostgresConnection()
        return db.query("SELECT * FROM journals WHERE company_id = %s", company_id)
```

This works. But `JournalService` is now **welded** to Postgres. You can't test it without a running database. You can't swap Postgres for SQLite. You can't mock the data layer. The high-level business logic depends on a low-level implementation detail.

## The Fix

Make `JournalService` depend on an **abstraction** instead of a concrete database:

```python
from abc import ABC, abstractmethod

class JournalRepository(ABC):
    @abstractmethod
    def find_by_company(self, company_id: str) -> list[Journal]:
        ...

class PostgresJournalRepository(JournalRepository):
    def find_by_company(self, company_id: str) -> list[Journal]:
        # actual Postgres query here
        ...

class JournalService:
    def __init__(self, repo: JournalRepository):
        self.repo = repo

    def get_entries(self, company_id: str):
        return self.repo.find_by_company(company_id)
```

Now `JournalService` doesn't know or care whether it's talking to Postgres, SQLite, or a mock. The dependency is **injected** from outside.

## Why I Kept Forgetting

The concept is simple. What confused me was the phrasing "dependency inversion." People say "the dependency is inverted, so create an interface to un-invert it." That sounds like the interface *does* something to the dependency direction.

It doesn't. The interface is a **boundary** that lets the high-level module define *what it needs*, and the low-level module *conforms to that definition*.

Before: `Service → Database` (service depends on database)
After: `Service → Repository Interface ← DatabaseImpl` (both depend on the abstraction)

The arrow between Service and Database **didn't flip**. A new arrow was introduced. The interface sits in the service's layer, not the database's layer. That's the inversion — the abstraction belongs to the consumer, not the provider.

## The Mental Model That Stuck

Think of it as a **power outlet**.

Your laptop (high-level) doesn't contain a hardcoded wire to the power plant (low-level). Instead, there's a standardized outlet interface. Any power source that conforms to the outlet spec can power your laptop.

- The outlet spec (interface) is defined by the consumer's needs
- The power company (implementation) conforms to it
- You can swap power sources without rewiring the laptop

```python
# The "outlet" — defined in the domain layer
class JournalRepository(ABC): ...

# The "power source" — lives in infrastructure
class PostgresJournalRepository(JournalRepository): ...

# Plugging it in — done at startup
service = JournalService(repo=PostgresJournalRepository())
```

## When to Actually Use It

Not everything needs DI. My rule of thumb after working on two production codebases:

**Use DI when:**
- The dependency crosses a system boundary (database, external API, file system)
- You need to test the logic without the dependency
- You might realistically swap the implementation

**Skip DI when:**
- It's internal utility code that won't change
- The "abstraction" would have exactly one implementation forever
- You're on a frontend where the API client is the only external dependency

Over-abstracting is just as bad as tight coupling. One of the projects I worked on had repository interfaces for everything, including code that would never, ever have a second implementation. That's ceremony, not architecture.

## Takeaway

Dependency injection is just: **don't hardcode your dependencies, accept them from outside.**

The "inversion" part means: the abstraction belongs to the layer that *uses* it, not the layer that *implements* it.

Once I started thinking "power outlet, not hardcoded wire," it never left my head.
