---
title: "Dependency Injection: Why I Kept Forgetting It and How It Finally Clicked"
date: "April 3, 2026"
excerpt: "I looked up dependency injection at least five times before it stuck. Here's the mental model that finally made it permanent."
coverImage: "/og/blog-dependency-injection-explained.png"
readTime: "8 min read"
tags: ["Architecture", "Design Patterns", "Python", "Backend"]
---

## I Have Looked This Up Five Times

I'm not proud of this. Every few months I'd hit a code review comment — "the dependency is inverted here, use an interface" — and I'd nod, Google it, understand it for about 20 minutes, implement something, and then completely forget why it mattered.

Five times. At least.

The sixth time, it finally stuck. And I think the reason it didn't stick before is that every explanation leads with the *mechanism* — interfaces, constructors, containers, frameworks — instead of the *problem*. So here's the problem first.

## Your Code Is Welded to the Wall

Say you've got a service that fetches some records:

```python
class OrderService:
    def get_orders(self, user_id: str):
        db = PostgresConnection()
        return db.query("SELECT * FROM orders WHERE user_id = %s", user_id)
```

This works fine. Ship it.

Except now `OrderService` is **welded** to Postgres. Want to test it? Spin up a database. Want to swap Postgres for SQLite in dev? Rewrite the class. Want to mock the data layer? Tough luck. Your high-level business logic is hardcoded to a low-level implementation detail, and that's exactly the kind of coupling that makes codebases brittle over time.

This is what the **D** in [SOLID](https://en.wikipedia.org/wiki/SOLID) — the Dependency Inversion Principle — warns you about: *high-level modules shouldn't depend on low-level modules; both should depend on abstractions.*

## Unplug the Wire, Add an Outlet

Here's the fix, and it's dead simple. Make `OrderService` accept its dependency from outside instead of creating it internally:

```python
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    def find_by_user(self, user_id: str) -> list[Order]:
        ...

class PostgresOrderRepository(OrderRepository):
    def find_by_user(self, user_id: str) -> list[Order]:
        # actual Postgres query here
        ...

class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo

    def get_orders(self, user_id: str):
        return self.repo.find_by_user(user_id)
```

Now `OrderService` doesn't know or care whether it's talking to Postgres, SQLite, or a fake in-memory store you wrote in 30 seconds for a test. The dependency is **injected** from outside. That's it. That's dependency injection.

Martin Fowler [coined the term back in 2004](https://martinfowler.com/articles/injection.html) because "Inversion of Control" was too vague — it could mean anything. "Dependency Injection" says exactly what's happening: you're injecting the dependency instead of letting the class create its own.

## Why "Inversion" Kept Throwing Me Off

Here's the part that tripped me up every single time. People say "the dependency is inverted" and I'd think the arrow between Service and Database somehow *flipped direction*. It doesn't. A new arrow gets introduced.

Before: `Service → Database` (service directly depends on database)

After: `Service → Repository Interface ← DatabaseImpl` (both point at the abstraction)

The interface sits in the service's layer, not the database's. That's what's "inverted" — the abstraction belongs to the consumer, not the provider. The high-level module defines what it needs, and the low-level module conforms to that contract.

Once I stopped trying to visualize arrows flipping and started thinking about *who owns the contract*, the penny dropped. Fowler's [article on DIP in the Wild](https://martinfowler.com/articles/dipInTheWild.html) explains this ownership angle really well if you want to go deeper.

## Power Outlets, Not Hardcoded Wires

The mental model that finally made DI permanent in my brain: **power outlets**.

Your laptop doesn't have a wire soldered directly to the power plant. That'd be impractical — you couldn't move it, you couldn't switch power sources, and testing it would require firing up an actual coal plant. Instead, there's a standardized outlet. The laptop defines what kind of plug it needs. The power company conforms to that spec. You can plug into a wall socket, a portable battery, or a solar panel. The laptop doesn't care.

That's DI.

- The **outlet spec** (interface) is defined by the consumer
- The **power company** (implementation) conforms to it
- You can **swap power sources** without rewiring your laptop
- When testing, you use a **bench power supply** — a simple, controlled mock

```python
# The "outlet" — defined in the domain layer
class OrderRepository(ABC): ...

# The "power source" — lives in infrastructure
class PostgresOrderRepository(OrderRepository): ...

# Plugging it in — done at app startup
service = OrderService(repo=PostgresOrderRepository())

# Testing? Use a bench supply.
service = OrderService(repo=FakeOrderRepository())
```

I literally think "outlet, not wire" every time now. Hasn't left my head since.

## How Frameworks Handle This

Different ecosystems have wildly different opinions on DI, and it's worth knowing the spectrum.

**Spring (Java)** goes all in. It has a full IoC container that manages object creation, lifecycle, and wiring. You annotate classes with `@Component` or `@Service` and Spring figures out the dependency graph. It's powerful but can feel like magic when you're debugging why something didn't get injected.

**NestJS (TypeScript)** borrowed Spring's approach almost wholesale. Decorators, providers, modules — DI is the backbone of the framework. If you're coming from Angular, this'll feel familiar.

**Django (Python)** takes the opposite stance. No DI container. No special decorators. You just... import things and wire them manually. Django's philosophy is that Python's dynamic nature and module system are enough. For most Django apps, honestly, it is.

**FastAPI (Python)** hits a sweet spot that I really like. Its `Depends` function gives you DI without the ceremony:

```python
from fastapi import Depends, FastAPI

app = FastAPI()

# The dependency — a plain function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# The repository, injected with its own dependency
def get_order_repo(db: Session = Depends(get_db)) -> OrderRepository:
    return PostgresOrderRepository(db)

# The route — declares what it needs, FastAPI wires it up
@app.get("/orders/{user_id}")
def read_orders(
    user_id: str,
    repo: OrderRepository = Depends(get_order_repo),
):
    return repo.find_by_user(user_id)
```

The beauty here is that `Depends` is just a function call. No decorators on your classes, no container configuration files, no XML (looking at you, early Spring). And when testing, you can [override any dependency](https://fastapi.tiangolo.com/advanced/testing-dependencies/) with `app.dependency_overrides` — swap the real database for a fake in one line.

## When It's Worth the Hassle (and When It Isn't)

Not everything needs DI. I've seen codebases where every single class had a corresponding interface, even internal helpers that would never, ever have a second implementation. That's ceremony, not architecture.

**DI earns its keep when:**
- The dependency crosses a boundary — database, external API, file system, clock
- You need to test business logic without dragging in infrastructure
- There's a realistic chance you'll swap the implementation

**Skip it when:**
- It's internal utility code with one implementation, now and forever
- The "abstraction" would be a 1:1 mirror of the concrete class
- Adding an interface makes the code harder to follow, not easier

Mark Seemann and Steven van Deursen's book [*Dependency Injection Principles, Practices, and Patterns*](https://www.manning.com/books/dependency-injection-principles-practices-patterns) goes deep on these trade-offs. Seemann's blog at [blog.ploeh.dk](https://blog.ploeh.dk) is also excellent — he's been writing about DI patterns (and anti-patterns) for over a decade.

## The One-Sentence Version

Dependency injection is: **don't create your dependencies, receive them.**

The "inversion" part means the abstraction belongs to the layer that *uses* it, not the layer that *implements* it.

Or if you prefer: your laptop shouldn't contain a hardcoded wire to the power plant. Give it an outlet.
