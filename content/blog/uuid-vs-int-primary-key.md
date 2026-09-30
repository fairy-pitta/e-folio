---
title: "UUID vs Integer Primary Keys — Just Pick One Already"
date: "April 2, 2026"
excerpt: "I've been through this debate on multiple projects now. Here's what I've learned, what I'd pick today, and why UUIDv7 changes everything."
coverImage: "/og/blog-uuid-vs-int-primary-key.png"
readTime: "9 min read"
tags: ["Database", "PostgreSQL", "Architecture", "Backend"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- UUID 16 bytes vs bigint 8 bytes; "double the storage per row"
- UUID indexes "roughly 40% larger" in B-tree leaf pages
- Every secondary index stores the PK value (3 indexes -> extra 8 bytes in four places)
- UUIDv4 random inserts: page splits, buffer cache blowout, more WAL traffic
- Brandur's nanoglyphs 026 anecdote (DBA blamed UUIDs, pushed sequences; later doubted) — link https://brandur.org/nanoglyphs/026-ids
- Benchmarks: 1M-row insert UUIDv4 ~375 s vs bigint ~290 s vs UUIDv7 ~290 s (no source given); gap widens at hundreds of millions of rows
- "~4 million UUIDv7 generations per second before any collision risk"
- "Minimal WAL amplification" for UUIDv7; "performance gap with bigint is effectively zero"
- Supabase blog "choosing a Postgres primary key" benchmarks (bigint to ULID to KSUID) — https://supabase.com/blog/choosing-a-postgres-primary-key
- Supabase defaults to UUID PK / Django defaults to AutoField (check current defaults) and the "philosophy" claims (RLS, client-side ID gen)
- PostgreSQL 18 uuidv7(): sub-millisecond timestamp precision, monotonic within a process; `pg_uuidv7` extension works on PG 13-17
- Sequential IDs leak info (enumeration, growth rate); "internal int + external UUID column" recreates UUID-as-PK
- Django int-to-UUID migration steps (6 steps), "schema and data changes can't share a transaction in PostgreSQL", `django-uuid-migration` library
- `uuid7` Python library with `default=uuid7.create`; `BaseModel` with `uuid.uuid4` default
- "Leave existing int-PK projects alone" and "starting with ints and migrating later never happens" (opinion; did I live this? check)
- Claim that database textbooks say PKs should carry business meaning
-->

## Context
- Multi-tenant accounting system, Django + PostgreSQL, auto-increment integer IDs
- Permissions table with a polymorphic reference: `scope_type` + `scope_id`, one column pointing at companies, regions, departments
- Also working on Supabase and Django projects at the same time; different default ID types (check exact defaults), so ID strategy inconsistent across projects

## What happened
- With integers, `scope_id = 42` can be company 42 or region 42; only the `scope_type` discriminator tells them apart
- Concern: one bad JOIN grants access to the wrong entity
- Cross-project inconsistency: API contracts diverge, frontend handles both `number` and `string` IDs, test fixtures differ

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

- `(scope_type, scope_id)` unique either way; with UUIDs a dropped type column still cannot confuse company with region

## Decision
- New projects on PostgreSQL: UUIDv7 primary keys
- Decide on day one; do not plan to "migrate later" (check: did I go through this myself?)
- Existing integer-PK projects: leave alone unless a concrete problem (check)

```sql
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

```python
import uuid
from django.db import models

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
```

## Facts supporting the decision
- UUIDv7 is standardised: RFC 9562 (May 2024); top 48 bits are Unix epoch milliseconds, so time-sortable
- PostgreSQL 18 has native `uuidv7()`

## Takeaway
- Same ID type across all projects/stack matters more than the type itself for me
- Polymorphic references are where integer IDs hurt most

## Links
- https://www.rfc-editor.org/rfc/rfc9562
- https://www.postgresql.org/docs/18/functions-uuid.html (check URL)
