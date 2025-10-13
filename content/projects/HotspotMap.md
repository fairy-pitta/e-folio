---
title: "Optimizing Bird Race Routes: hotspot_map"
description: "A TSP-based route optimizer that orders birding hotspots by realistic travel time using Held–Karp and a distance matrix API."
date: "13 Oct, 2025"
coverImage: "/placeholder.svg"
tags: ["Web App", "Next.js", "TypeScript", "Cloudflare Workers", "Algorithms", "TSP"]
liveUrl: ""
githubUrl: "https://github.com/fairy-pitta/hotspot_map"
gallery: [
]
---

## Overview

**hotspot_map** helps bird racers plan the most efficient order to visit multiple hotspots by solving the Traveling Salesperson Problem (TSP) with real-world, traffic-aware travel times. Instead of relying on straight-line distance, it uses a distance matrix API to compute pairwise travel time and solves the exact TSP using the **Held–Karp** dynamic programming algorithm.

The result is a ranked visit sequence and total travel time that better reflects on-the-ground conditions.

---

## Features

* Compute optimal hotspot visit order (minimize total travel time)
* Traffic-aware costs via distance matrix API
* Choose start/end points and include/exclude hotspots
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

1. User inputs hotspot coordinates (lat/lon) and options (start point, minimize time vs distance).
2. The app fetches a pairwise **distance/time matrix** from the distance matrix API.
3. The **Held–Karp** algorithm computes the exact TSP route over the matrix.
4. Results (visit order, total travel time) are returned to the UI.

This approach provides correctness (exact TSP on the given matrix) and realism (costs based on road networks and traffic).

---

## Algorithm: Held–Karp

Held–Karp solves TSP exactly via dynamic programming over subsets, storing best partial paths for each subset and terminal node. It avoids brute force by reusing sub-solutions, though complexity grows exponentially with the number of hotspots. For typical bird race planning sizes, this method is practical and guarantees optimality with the provided cost matrix.

---

## Future Work

* Time-of-day aware travel times (rush hour)
* Weather effects and road incidents
* Map visualization with mobile-first UX
* Multi-objective optimization (e.g., hotspot priority, expected species yield)

---

## Links

* Live Demo: TBA
* GitHub: https://github.com/fairy-pitta/hotspot_map