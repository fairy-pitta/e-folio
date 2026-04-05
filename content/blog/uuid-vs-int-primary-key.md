---
title: "UUID vs Integer Primary Keys — A Decision That Split the Team"
date: "April 2, 2026"
excerpt: "When we debated primary key strategy for a B2B accounting system, every engineer had a different opinion. Here's what we considered and what we chose."
coverImage: "/og/blog-uuid-vs-int-primary-key.png"
readTime: "7 min read"
tags: ["Database", "PostgreSQL", "Architecture", "Backend"]
---

## The Debate

We were building an accounting system on Django + PostgreSQL. One day, the `role_grants` table started causing problems. Its `scope_id` column referenced multiple tables — companies, regions, departments — using integer foreign keys. With integer IDs, a `scope_id` of 42 could mean company #42 *or* region #42. We had a `scope_type` column to disambiguate, but the collision risk felt wrong.

I brought up switching to UUIDs. The team split.

## The Positions

**Pro-UUID camp** (myself and one colleague):
- No collision risk across tables
- Safe to expose in URLs and APIs
- Better for distributed systems and future multi-tenancy
- `scope_id` becomes globally unique — no `scope_type` needed for uniqueness

**Pro-integer camp** (another colleague):
- Simpler to read and debug (`id=42` vs `id=a3f8b2c1-...`)
- Better index performance (smaller, sequential)
- Auto-increment is straightforward
- "For a B2B app with limited users, collisions aren't a real risk"

**The book's position** (a database design book I'd read):
- Primary keys should have business meaning, not be surrogate
- This advice felt dated for modern web applications

## What We Actually Investigated

### Supabase vs Django Defaults

Interesting observation: Supabase defaults to UUID for primary keys. Django defaults to auto-incrementing integers. If you use both (we were using Supabase for another project), you end up with inconsistent ID strategies across your stack.

### PostgreSQL UUID Support

At the time, PostgreSQL's stable version didn't support timestamp-ordered UUIDs (UUIDv7) natively. UUIDv4 is random, which means:
- No natural ordering
- Index fragmentation on inserts
- Slightly worse performance for range scans

UUIDv7 (time-sorted) would have been ideal — sequential like integers but globally unique like UUIDs. But it required extensions or application-level generation.

### The `scope_id` Problem

The concrete issue that started the debate:

```sql
-- role_grants table
scope_type  | scope_id
-----------+---------
company    | 42
region     | 42       -- Same ID, different table. Legal but uncomfortable.
```

With UUIDs:

```sql
scope_type  | scope_id
-----------+--------------------------------------
company    | a3f8b2c1-7d4e-4f5a-9b2c-1234567890ab
region     | f7e6d5c4-3b2a-1098-7654-abcdef012345  -- No ambiguity.
```

The `scope_type` + `scope_id` composite is unique either way, but UUIDs make it *accidentally* unique too. Defense in depth.

### The Integer Exposure Problem

Multiple sources advised against exposing integer IDs to clients. Sequential integers leak information:
- Total record count is trivially estimated
- Enumeration attacks are straightforward
- Competitor intelligence ("they have 50,000 users")

One option: use integer PKs internally, expose UUIDs as a secondary identifier. But then every lookup goes through the UUID column, which negates the performance benefit of integer PKs.

## What We Chose

For the accounting system, we kept integer PKs with a plan to migrate critical tables to UUIDs incrementally. Pragmatic reasons:

1. **Django's ORM** is deeply integrated with auto-increment integers. Switching everything at once would have been a massive migration.
2. **The team was small** and we were on a deadline. Architecture purity lost to shipping.
3. **We added the `scope_type` + `scope_id` unique constraint** as a safety net.

For new projects (like the stress check app), we started with UUIDs from day one.

## My Current Thinking

| Factor | Integer | UUID |
|--------|---------|------|
| Simplicity | Win | — |
| Performance (inserts) | Win | Slight overhead |
| API safety | — | Win |
| Multi-table references | — | Win |
| Distributed systems | — | Win |
| Debug readability | Win | — |

For B2B apps with moderate scale: **UUID from the start**. The performance difference is negligible, and you avoid the "should we migrate?" conversation later.

For high-throughput systems (millions of inserts/second): integer PKs with UUID as a secondary column might still make sense.

The worst option is what we did — starting with integers and planning to migrate later. That migration never happens cleanly.

## Takeaway

There's no universally correct answer, but the decision should be made on day one, not after `scope_id` collisions start causing bugs. If you're on PostgreSQL and can use UUIDv7, that's probably the best of both worlds — globally unique and naturally sortable.

And if a database design book from 2015 tells you primary keys should have business meaning: respectfully ignore it. Surrogate keys won.
