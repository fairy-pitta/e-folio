---
title: "UUID vs Integer Primary Keys — Just Pick One Already"
date: "April 2, 2026"
excerpt: "I've been through this debate on multiple projects now. Here's what I've learned, what I'd pick today, and why UUIDv7 changes everything."
coverImage: "/og/blog-uuid-vs-int-primary-key.png"
readTime: "9 min read"
tags: ["Database", "PostgreSQL", "Architecture", "Backend"]
---

Look, if you've worked on any B2B web app for more than six months, you've had this argument. UUID or integer primary keys. Everyone's got an opinion. I've been on both sides, and I've got scars from both.

Here's how it usually starts. You're building something — say, a multi-tenant accounting system on Django + PostgreSQL. Everything's fine with auto-increment IDs until you hit a polymorphic association. A permissions table where one column references multiple entity types: companies, regions, departments. With integers, an ID of `42` could be company #42 *or* region #42. You've got a `type` discriminator column, sure, but it feels fragile. One bad JOIN and you're granting someone access to the wrong thing.

That's the moment someone says "we should've used UUIDs." And then the room splits.

## The usual camps

The pro-UUID argument is straightforward: no collision risk across tables, safe to expose in APIs, better for distributed systems. The polymorphic reference problem just... goes away, because every ID is globally unique.

The pro-integer crowd fires back: simpler to debug (`id=42` beats `id=a3f8b2c1-7d4e-...`), smaller indexes, sequential inserts are faster, and "we're not building Google — collisions aren't a real risk for a B2B app."

Both sides are right. That's what makes it annoying.

Then there's always that one person who read a database textbook that says primary keys should carry business meaning. Honestly? That advice hasn't aged well. Surrogate keys won a long time ago.

## The Supabase vs Django thing that drove me nuts

Here's something that genuinely frustrated me. Supabase defaults to UUID primary keys. Django defaults to `AutoField` — auto-incrementing integers. If you're working across both (and I was, on different projects at the same time), you end up with completely inconsistent ID strategies across your stack.

It's not just an aesthetic problem. Your API contracts diverge. Your frontend has to handle both `number` and `string` ID types. Your test fixtures look different. It's a thousand tiny papercuts.

And it reveals something about the frameworks' philosophies. Supabase is betting that you'll need UUIDs eventually — for Row Level Security, for client-side ID generation, for multi-tenancy. Django is optimizing for simplicity out of the box. Both are defensible choices, but when you live in both worlds, you start to resent the inconsistency.

The [Supabase blog post on choosing a Postgres primary key](https://supabase.com/blog/choosing-a-postgres-primary-key) is a solid overview if you haven't read it — they benchmark everything from `bigint` to ULIDs to KSUIDs. Their conclusion isn't prescriptive, but their platform defaults tell you where they actually landed.

## The real performance story

Let's talk numbers, because this is where the debate gets interesting.

UUIDs are 16 bytes. Bigints are 8. That's double the storage per row, and it compounds fast. UUID indexes end up roughly 40% larger in B-tree leaf pages. And here's the part people miss: every secondary index in PostgreSQL stores the primary key value too. So if you've got three indexes on a table, those extra 8 bytes show up in four places.

For UUIDv4 specifically, it's worse. Random values mean inserts scatter across the entire B-tree instead of appending to the rightmost leaf page. That causes page splits, blows out your buffer cache, and generates way more WAL traffic. [Brandur wrote about this](https://brandur.org/nanoglyphs/026-ids) — his team brought in an expensive DBA who blamed UUIDs for their performance issues and pushed them to convert to sequences. (He later questioned whether that diagnosis was even correct, which I find very relatable.)

Benchmarks on a million-row insert show UUIDv4 at around 375 seconds versus 290 for bigint. Not catastrophic, but not nothing either. The gap widens as tables grow into the hundreds of millions of rows.

But — and this is key — **UUIDv7 benchmarks at basically the same speed as bigint** for inserts. 290 seconds versus 290 seconds in the same tests. Because UUIDv7 is time-ordered, it gets the same sequential insert pattern as auto-increment. You keep the global uniqueness without paying the performance tax.

## UUIDv7 changes everything

Spoiler: this is the answer now.

[RFC 9562](https://www.rfc-editor.org/rfc/rfc9562), published May 2024, defines UUIDv7 as a timestamp-first UUID format. The most significant 48 bits are a Unix epoch millisecond timestamp. The remaining 74 bits (after version and variant markers) are random. This means:

- **Naturally sortable by creation time** — no more "UUIDs can't be ordered" complaints
- **Globally unique** — generate them anywhere, no coordination needed
- **Sequential insert pattern** — B-tree friendly, minimal WAL amplification
- **~4 million generations per second** before any collision risk

It's the best of both worlds. Honestly, it makes most of the UUID-vs-integer debate moot.

**PostgreSQL 18 ships with native `uuidv7()` support.** No extensions needed. The implementation uses sub-millisecond precision in the timestamp portion, and within a single process, values are guaranteed monotonically increasing.

If you're on PostgreSQL 13–17, the [`pg_uuidv7`](https://pgxn.org/dist/pg_uuidv7/) extension gives you the same functionality today. It's tiny, well-maintained, and works exactly how you'd expect:

```sql
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

No more `uuid-ossp`, no more `gen_random_uuid()` with its random scatter pattern.

## The polymorphic reference thing

The concrete problem that usually triggers this debate:

```sql
-- permissions table with polymorphic scope
scope_type  | scope_id
-----------+---------
company    | 42
region     | 42       -- Same number. Different table. Legal, but scary.
```

With UUIDs:

```sql
scope_type  | scope_id
-----------+--------------------------------------
company    | 019078a1-b3d4-7f5a-9b2c-1234567890ab
region     | 019078a2-c7e6-7098-7654-abcdef012345
```

The composite `(scope_type, scope_id)` is unique either way. But with UUIDs, even if someone drops the type column by accident, you still can't confuse a company with a region. Defense in depth isn't sexy, but it saves you at 3am.

## Sequential IDs leak information

This one's simple and I don't think it's discussed enough.

If your API returns `/api/invoices/10847`, anyone can estimate you've got roughly 10,847 invoices. They can enumerate backwards. They can monitor growth rate. For a B2B SaaS, that's competitive intelligence you're giving away for free.

The "just use integer PKs internally and expose UUIDs as a secondary column" approach technically works, but now every API lookup hits the UUID column instead of the primary key, and you need a unique index on it. You've basically recreated the UUID-as-PK pattern with extra steps and worse ergonomics.

## Migrating Django from integers to UUIDs — don't

I mean, you *can*. But I wouldn't recommend it on an existing production system unless you absolutely have to. Here's what's involved:

1. Add a new `UUIDField` to every model (not as primary key yet)
2. Write a data migration to populate UUIDs for all existing rows
3. Update *every* foreign key on *every* related model — including M2M through tables
4. Drop old FK constraints, swap the primary key, recreate constraints
5. Update all API serializers, URL patterns, and frontend code
6. Hope nothing references the old integer IDs anywhere

Each step needs its own migration. Schema changes and data changes can't share a transaction in PostgreSQL. Foreign keys make the dependency graph a nightmare — you can't drop a PK constraint while FKs reference it.

There's a library called [`django-uuid-migration`](https://github.com/Afaneor/django-uuid-migration) that automates some of this, but honestly? If you're starting a new Django project, just set it up right from day one:

```python
import uuid
from django.db import models

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
```

Or better yet, use a UUIDv7 library like `uuid7` and set `default=uuid7.create`.

## What I'd actually pick today

For any new project on PostgreSQL: **UUIDv7 primary keys, no question.**

The performance gap with bigint is effectively zero. You get global uniqueness, safe API exposure, time-ordering, and no migration regret later. If you're on Postgres 18+, it's a single `DEFAULT uuidv7()`. On older versions, `pg_uuidv7` is one `CREATE EXTENSION` away.

For existing projects on integer PKs: **leave them alone** unless you have a concrete problem. The migration cost almost never justifies the architectural purity.

The worst option — the one I've done, the one I regret — is starting with integers and "planning to migrate later." That migration doesn't happen. Or it happens two years later under enormous time pressure, and it's painful.

Make the decision on day one. Stick with it. And if a database textbook from 2015 tells you primary keys should carry business meaning: respectfully skip that chapter.
