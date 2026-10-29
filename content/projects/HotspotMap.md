---
title: "Held–Karp TSP Visualizer"
description: "Plans the best order to visit birding hotspots, solving the TSP exactly on traffic-aware travel times."
date: "13 Oct, 2025"
coverImage: "/projects/held-karp/hk.webp"
tags: ["Web App", "Next.js", "TypeScript", "Cloudflare Workers", "Algorithms", "TSP"]
stack: "Browser · Next.js, Cloudflare Workers"
highlight: "Finds the exact shortest route using real driving times"
earlier: true
githubUrl: "https://github.com/fairy-pitta/hotspot_map"
gallery: [
  "/projects/held-karp/hk-2.webp",
  "/projects/held-karp/hk-3.webp"
]
---

## Background

On a birding morning I often visit several hotspots, and the order makes a big difference to the time spent driving. I wanted the best order for a few hotspots, based on actual travel times rather than distance on the map.

You choose the places, and it shows the best order to visit them and the total travel time.

## How it works

1. Travel times between every pair of places are fetched from a distance matrix API, in driving mode with a departure time, so traffic is taken into account.
2. The Held–Karp algorithm finds the best order.
3. The route and total time are drawn on the map.

The API allows at most 100 elements per request when traffic is included. The full matrix is built from one request per starting point, then cached.

## Why Held–Karp

Held–Karp gives the exact answer. Its running time grows exponentially, but a morning's birding has only a handful of stops, so it is fast enough. The exact answer is also useful for checking faster approximate methods.

`DP[S, j]` is the shortest time to start at `s`, visit every place in the set `S`, and end at `j`. Sets are stored as bitmasks.

- Start: `DP[{s}, s] = 0`
- Step: `DP[S, j] = min over i in S \ {j} of DP[S \ {j}, i] + cost[i][j]`
- Round trip: `min over j of DP[All, j] + cost[j][s]`. One-way: `min over j of DP[All, j]`
- Time `O(n² · 2ⁿ)`, memory `O(n · 2ⁿ)`

## Stack

Next.js, TypeScript and Tailwind CSS, with the calculation running on Cloudflare Workers. There is no public demo at the moment.
