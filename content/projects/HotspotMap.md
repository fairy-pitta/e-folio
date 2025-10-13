---
title: "Held–Karp TSP Visualizer: hotspot_map"
description: "A Held–Karp TSP visualizer that uses realistic travel-time cost matrices; birding hotspots are shown as an example dataset."
date: "13 Oct, 2025"
coverImage: "/projects/held-karp/hk.png"
tags: ["Web App", "Next.js", "TypeScript", "Cloudflare Workers", "Algorithms", "TSP"]
liveUrl: ""
githubUrl: "https://github.com/fairy-pitta/hotspot_map"
gallery: [
  "/projects/held-karp/hk.png",
  "/projects/held-karp/hk-2.png",
  "/projects/held-karp/hk-3.png"
]
---

## Overview

**hotspot_map** is a general TSP visualizer that solves the Traveling Salesperson Problem (TSP) exactly using the **Held–Karp** dynamic programming algorithm over a realistic, traffic-aware travel-time matrix. As a simple example, it visualizes how to efficiently visit birding hotspots, but bird race scenarios are not the main focus.

The result is a ranked visit sequence and total travel time that better reflects on-the-ground conditions.

---

## Features

* Compute optimal visit order (minimize total travel time)
* Traffic-aware costs via distance matrix API
* Choose start/end points and include/exclude locations
* Visualize route order and total cost
* Server-side computation on Cloudflare Workers

---

## Tech Stack

### Frontend
* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS** (planned)

### Runtime & API
* **Cloudflare Workers** for server-side execution
* **Distance Matrix API** for realistic travel time/distance

---

## How It Works

1. User inputs coordinates (lat/lon) and options (start point, minimize time vs distance).
2. The app fetches a pairwise **distance/time matrix** from the distance matrix API.
3. The **Held–Karp** algorithm computes the exact TSP route over the matrix.
4. Results (visit order, total travel time) are returned to the UI.

This approach provides correctness (exact TSP on the given matrix) and realism (costs based on road networks and traffic).

---

## Algorithm Details: Held–Karp DP

Held–Karp solves TSP exactly using dynamic programming over subsets:

- State representation:
  - Let n be the number of nodes and pick a start node s.
  - Represent a subset S of nodes (including s) as a bitmask; a state is (S, j) meaning the best cost to start at s, visit all nodes in S, and finish at node j.

- Base case:
  - DP[{s}, s] = 0 and DP[{s}, j] = ∞ for j ≠ s.

- Recurrence:
  - For |S| ≥ 2 and j ∈ S, j ≠ s:
  - DP[S, j] = min over i ∈ S \ {j} of (DP[S \ {j}, i] + cost[i][j]).
  - Here cost[i][j] comes from the distance/time matrix (traffic-aware).

- Tour closure (classic TSP):
  - Optimal tour cost = min over j ≠ s of (DP[AllNodes, j] + cost[j][s]).
  - Reconstruct the cycle by backtracking the chosen predecessors.

- Open path (fixed start, free end):
  - If you want a path from s that doesn’t need to return to s, use:
  - Optimal path cost = min over j of DP[AllNodes, j].
  - Backtracking reconstructs the path end j and the ordered sequence.

- Complexity:
  - Time: O(n^2 · 2^n) due to n · 2^n states and n transitions.
  - Space: O(n · 2^n) to store DP states and predecessors for route reconstruction.

- Practical notes:
  - Use integer bitmasks for fast subset operations; index nodes 0..n-1.
  - Precompute and cache cost[i][j] from the distance matrix API to avoid repeated calls.
  - For small-to-medium n (e.g., typical hotspot counts), Held–Karp is practical and yields a provably optimal route on the provided matrix.
  - If constraints grow (e.g., time windows or very large n), consider heuristic/approximate methods layered on top of the same matrix.

---

## Future Work

* Time-of-day aware travel times (rush hour)
* Weather effects and road incidents
* Map visualization with mobile-first UX
* Multi-objective optimization (e.g., location priority, expected species yield)

---

## Links

* Live Demo: TBA
* GitHub: https://github.com/fairy-pitta/hotspot_map