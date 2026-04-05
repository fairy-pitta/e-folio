---
title: "Three Kinds of 'Month' — How Accounting Date Logic Broke Everything"
date: "April 5, 2026"
excerpt: "Calendar month, fiscal month, relative month. In accounting systems, 'month' means three different things, and confusing them cost me weeks of rework."
coverImage: "/new-favicon.png"
readTime: "8 min read"
tags: ["Architecture", "Domain Design", "Django", "Backend"]
---

## Dates Are Easy, Right?

I was building a journal entry feature for an accounting system. Import CSV transactions, aggregate by month, display in a transition table. Just grab the month from the date column. Easy.

Except in accounting, "month" means three different things.

## Three Kinds of Month

```
Calendar month       → January is 1. Simple.
Fiscal month         → Counted from the fiscal year start. If FY starts in April, then April = month 1.
Relative month       → Position relative to the closing month.
```

I started with calendar months. Then halfway through development: "We need fiscal month aggregation." This meant rewriting nearly every piece of logic that touched dates.

## The Blast Radius

Switching from calendar months to fiscal months affected:

- Transaction import parsing
- Monthly aggregation logic
- Sub-category rollups
- Large account category calculations
- Duplicate detection
- The entire transition table display

In other words, **almost everything** in the journal subsystem.

## The Cascade of Bugs

During the migration, things went wrong in subtle ways.

**The closing month is a relative month, so searching by calendar month 13 returns nothing.** It took me an embarrassingly long time to realize this. I'd also confused "fiscal year start month" with "closing month" — the database stored one, I assumed it stored the other.

Backend tests passed. The frontend broke anyway. The backend had changed its contract, but the frontend hadn't caught up. Unit tests passed; integration failed. A classic.

```python
# This innocent code is a landmine
def get_month(transaction_date):
    return transaction_date.month  # ← This is the "calendar" month

# What you actually need
def get_fiscal_month(transaction_date, fiscal_start_month):
    return (transaction_date.month - fiscal_start_month) % 12 + 1
```

## What I Learned

### 1. Distinguish Month Types at the Type Level

The root cause was using plain `int` for all three month types. They should be distinct types or value objects.

```python
@dataclass(frozen=True)
class CalendarMonth:
    value: int  # 1-12

@dataclass(frozen=True)
class FiscalMonth:
    value: int  # 1-12, where 1 = fiscal year start

@dataclass(frozen=True)
class RelativeMonth:
    value: int  # relative to closing month
```

With this, passing a calendar month to a function expecting a fiscal month becomes a type error — caught at lint time, not three weeks into debugging.

### 2. Centralize Conversion Logic

Month conversion was scattered across the codebase. A single `fiscal_utils` module that owns all conversions would have prevented a dozen copy-paste bugs.

### 3. Write Integration Tests Early

Unit tests didn't catch the front-to-back contract mismatch. An end-to-end test covering import → aggregation → display would have flagged the break immediately.

### 4. Ask "Which Month?" on Day One

When someone says "aggregate by month," ask: calendar month or fiscal month? In accounting systems, the answer is almost always fiscal. Confirming this upfront would have saved the entire rework.

## Takeaway

Dates look simple until you hit a domain where "month" has multiple meanings. In accounting, this is the norm, not the exception.

Use types to distinguish them. Centralize conversions. Write integration tests. And above all, ask the domain expert "which month do you mean?" before writing a single line of code.

It's boring advice. It would have saved me weeks.
