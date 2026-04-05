---
title: "Three Kinds of 'Month' — How Accounting Date Logic Broke Everything"
date: "April 5, 2026"
excerpt: "Calendar month, fiscal month, relative month. In accounting systems, 'month' means three different things, and confusing them cost me weeks of rework."
coverImage: "/og/blog-fiscal-month-hell.png"
readTime: "10 min read"
tags: ["Architecture", "Domain Design", "Django", "Backend"]
---

## "Just Grab the Month"

I was building a journal entry feature for an accounting system — import CSV transactions, aggregate by month, render a transition table. Straightforward, right? Grab `.month` off the date column and group. I've done this a hundred times.

Turns out "month" doesn't mean what I thought it meant. Not in accounting.

## The Word "Month" Is Lying to You

There are at least three things people mean when they say "month" in a financial context:

```
Calendar month       → January = 1. The one you know.
Fiscal month         → Counted from fiscal year start. If FY starts April, then April = 1.
Relative month       → Offset from the closing month. Entirely context-dependent.
```

I built everything on calendar months. Two weeks in, the requirement changed: "Oh, we need fiscal month aggregation." That wasn't a small change. That wasn't a config tweak. That was a rewrite.

## Everything Broke

And I mean *everything*. Transaction import parsing. Monthly rollups. Category aggregations. Duplicate detection. The transition table itself. Every single piece of logic that touched a date had a `.month` call baked into it, and every single one was now wrong.

This is what Noah Sussman's famous ["Falsehoods Programmers Believe About Time"](https://infiniteundo.com/post/25326999628/falsehoods-programmers-believe-about-time) list doesn't quite prepare you for. It's not just time zones and leap seconds — it's that domain-specific "time" can diverge from physical time in ways that infect your entire data model.

## The Bugs Were Subtle

The obvious stuff I caught fast. The subtle stuff ate days.

One that really got me: I was querying for "month 13" (the closing month) and getting back zero rows. Couldn't figure out why. Stared at the SQL for a while before it clicked — the closing month is a *relative* month, not a calendar month. There is no calendar month 13. I'd also mixed up "fiscal year start month" and "closing month" in my head. The database stored the start month; I was treating it as the closing month. Off by one, but in the fiscal calendar sense, which made the error wildly non-obvious.

Then there was the classic frontend/backend mismatch. All my Django unit tests passed because the backend was internally consistent with its new fiscal logic. But the API contract had silently changed — month `1` now meant April, not January — and the frontend was still interpreting it as calendar. No integration tests caught it. Of course not. I hadn't written any.

```python
# This innocent code is a landmine
def get_month(transaction_date):
    return transaction_date.month  # ← calendar month, always

# What you actually need
def get_fiscal_month(transaction_date, fiscal_start_month):
    return (transaction_date.month - fiscal_start_month) % 12 + 1
```

That modular arithmetic looks simple in isolation. Now imagine it copy-pasted into six different modules with slight variations, some of which have an off-by-one because someone wasn't sure if the start month itself is month 0 or month 1. That was my codebase.

## What I Should Have Done (and What I Do Now)

**Make the type system do the work.** The root cause was using bare `int` for three semantically different things. A fiscal month of `4` and a calendar month of `4` are *not the same value*, but Python happily lets you pass one where the other is expected.

```python
@dataclass(frozen=True)
class CalendarMonth:
    value: int  # 1-12

@dataclass(frozen=True)
class FiscalMonth:
    value: int  # 1-12, where 1 = fiscal year start

@dataclass(frozen=True)
class RelativeMonth:
    value: int  # offset from closing month
```

With distinct types, `mypy` (or your linter of choice) catches the mismatch before you even run the code. It's a tiny amount of boilerplate that would've saved me weeks. In a typed language you'd use newtypes or branded types for the same effect — the principle is universal.

**Don't reinvent fiscal date math.** I wrote my own conversion logic because the requirement seemed simple. It wasn't. Python has [`fiscalyear`](https://github.com/adamjstewart/fiscalyear), a small library that extends `datetime` with `FiscalYear`, `FiscalQuarter`, and `FiscalMonth` classes. You configure the start month once and it handles the rest — including edge cases around year boundaries that I got wrong twice.

```python
import fiscalyear

fiscalyear.START_MONTH = 4  # April start

d = fiscalyear.FiscalDate(2026, 6, 15)
d.fiscal_year   # 2027 (if FY ends March)
d.quarter       # Q1
```

Pandas has this built-in too. Its `Period` type supports anchored fiscal frequencies — `Q-MAR` for a fiscal year ending in March, for example. The `qyear` attribute gives you the fiscal year rather than the calendar year. If you're doing any kind of time-series aggregation in pandas, this is the way.

```python
import pandas as pd

period = pd.Period("2026-06", freq="Q-MAR")
period.qyear   # 2027 (fiscal year)
period.quarter  # 1
```

In the Ruby world, Rails doesn't ship with fiscal year support, but the [`fiscali`](https://github.com/asanghi/fiscali) gem patches `Date` and `Time` with fiscal-aware methods. Django's ORM has `TruncMonth` and `ExtractMonth` for calendar dates, but nothing fiscal-aware — you're on your own there, which is exactly how I ended up with conversion logic scattered across six files.

**Push it to the database when you can.** For the transition table, I eventually moved the fiscal month calculation into PostgreSQL. Doing the conversion in SQL meant the aggregation query itself was correct by construction, instead of relying on Python to pre-process dates before grouping.

```sql
-- Fiscal month from a transaction date, given fiscal year starts in April (4)
SELECT
    date,
    amount,
    ((EXTRACT(MONTH FROM date) - 4 + 12)::int % 12) + 1 AS fiscal_month
FROM transactions
WHERE fiscal_year = 2026;

-- Generate a complete fiscal year series for left-joining sparse data
SELECT generate_series(1, 12) AS fiscal_month;
```

This won't win beauty contests, but it's one authoritative place where the conversion lives. No Python ↔ SQL disagreements.

**Write the integration test first.** My unit tests were a false safety net. Each layer was internally correct but spoke a different dialect of "month." A single end-to-end test — import a CSV with known dates, verify the transition table output — would've caught the break in minutes. I write those first now, even if they're slow. Especially if they're slow. Slow tests that catch real bugs beat fast tests that don't.

**Ask "which month?" before writing any code.** When someone on an accounting project says "aggregate by month," stop and ask: calendar month or fiscal month? The answer is almost always fiscal. Five minutes of clarification would have prevented my entire rewrite. I keep a checklist now for any date-adjacent feature: what's the epoch, what's the period boundary, and who defines it — the calendar or the business?

## Dates Are a Domain Problem

Most programmers have run into date-related bugs at some point. Usually it's time zones or daylight saving or that one server that was secretly in UTC-5. Fiscal dates are a different category. They're not about physical time at all — they're about how a business *models* time, and that model can be totally disconnected from the Gregorian calendar.

If you're building anything that touches accounting, assume "month" is ambiguous until proven otherwise. Wrap it in a type. Use a library. Test the boundaries. And for the love of all that is holy, don't just call `.month`.
