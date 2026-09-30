---
title: "Three Kinds of 'Month' — How Accounting Date Logic Broke Everything"
date: "April 5, 2026"
excerpt: "Calendar month, fiscal month, relative month. In accounting systems, 'month' means three different things, and confusing them cost me weeks of rework."
coverImage: "/og/blog-fiscal-month-hell.png"
readTime: "10 min read"
tags: ["Architecture", "Domain Design", "Django", "Backend"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- Noah Sussman's "Falsehoods Programmers Believe About Time" (link dropped as tangent; re-add if it shaped the design)
- Python `fiscalyear` library (adamjstewart/fiscalyear): FiscalYear/FiscalQuarter/FiscalMonth classes, START_MONTH config, and its example output (fiscal_year 2027, Q1). Not clear I used it (check)
- pandas `Period` with `Q-MAR` and `qyear` for fiscal years (not my experience)
- Ruby `fiscali` gem for Rails (not used)
- Django ORM `TruncMonth` / `ExtractMonth` are calendar-only, nothing fiscal-aware
- "The answer is almost always fiscal" (accounting projects)
- "Five minutes of clarification would have prevented the whole rewrite" and "checklist I keep now" (epoch, period boundary, who defines it) — confirm I actually keep one
- Did I really wrap months in dataclasses / run mypy? Draft says "should have done" (check)
-->

## Context
- Journal entry feature in an accounting system: import CSV transactions, aggregate by month, render a transition table
- Started with `.month` off the date column, grouped on it (calendar month)
- Two weeks in, requirement changed: fiscal month aggregation needed

## What happened
- Three meanings of "month":

```
Calendar month       → January = 1. The one you know.
Fiscal month         → Counted from fiscal year start. If FY starts April, then April = 1.
Relative month       → Offset from the closing month. Entirely context-dependent.
```

- Not a config tweak: rewrite. Everything with a `.month` call was wrong: transaction import parsing, monthly rollups, category aggregations, duplicate detection, the transition table
- Bug 1: querying "month 13" (the closing month) returned zero rows. Closing month is a relative month; no calendar month 13
- Bug 2: mixed up "fiscal year start month" and "closing month". DB stored the start month; I treated it as the closing month. Off by one in fiscal-calendar terms, hard to spot
- Bug 3: backend/frontend mismatch. Django unit tests passed (backend internally consistent), but API contract silently changed: month `1` now meant April; frontend still read it as calendar. No integration tests existed
- Conversion logic ended up copy-pasted in six modules with slight variations (some unsure whether start month is 0 or 1)

```python
# This innocent code is a landmine
def get_month(transaction_date):
    return transaction_date.month  # ← calendar month, always

# What you actually need
def get_fiscal_month(transaction_date, fiscal_start_month):
    return (transaction_date.month - fiscal_start_month) % 12 + 1
```

## Cause
- Bare `int` used for three semantically different things
- Requirement assumed to be calendar month; nobody asked "which month?"
- Date conversion scattered across modules instead of one place
- Unit tests per layer, no end-to-end test

## Fix
- Distinct types per meaning (check whether applied):

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

- Moved fiscal month calculation for the transition table into PostgreSQL, so the aggregation query is correct by construction and conversion lives in one place (no Python/SQL disagreement)

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

- Integration test first: import CSV with known dates, verify transition table output

## Takeaway
- Ask "calendar month or fiscal month?" before writing any date code on an accounting project
- One authoritative place for the conversion; wrap month in a type
- Write the end-to-end test first

## Links
- none kept
