---
title: "SG Bird Observation Map"
description: "Pick a period and a species, then play bird sightings back over time on a map of Singapore."
date: "15 May, 2025"
coverImage: "/projects/sgbirdsmap/map_top.webp"
tags: ["Web App", "Next.js", "Cloudflare Workers", "D1", "eBird"]
stack: "Browser · Cloudflare Workers, D1"
highlight: "About 497,000 observations of 553 species since 2003, updated daily"
liveUrl: "https://sgbirdsmap.fairy-pitta.net"
githubUrl: "https://github.com/fairy-pitta/SGBirdMap"
gallery: [
  "/projects/sgbirdsmap/map1.webp",
  "/projects/sgbirdsmap/map2.webp",
  "/projects/sgbirdsmap/map3.webp"
]
---

## Background

eBird has more than twenty years of bird records for Singapore. Its own pages are good for checking recent sightings at one place. I wanted to choose a species and a period and see where it had been recorded over time.

The map plays the sightings back over the chosen period, and can also show a heatmap. It holds about 497,000 observations of 553 species, from 1 January 2003 to today.

## How it works

```
sgbirdsmap.fairy-pitta.net
  └─ Cloudflare Worker
       ├─ static assets   Next.js static export
       ├─ /api/*          reads from D1
       │                    /api/species
       │                    /api/observations   filtered by period and species
       └─ cron, daily     fetches recent eBird observations into D1
```

The site is a Next.js static export. One Cloudflare Worker serves those files and a small read-only API under `/api/*`.

The observations are stored in Cloudflare D1, so searching by species and date does not call the eBird API.

Every morning a scheduled job fetches the last seven days from eBird and saves them. Each row is keyed on the eBird checklist ID and species code, so running the job again does not create duplicates.

The first version used Supabase and AWS Amplify. I later moved the data to D1 and the site to a single Worker.

## Limitation

The eBird endpoints I use return only the latest record of each species. So the map has at most one record per species per day for the whole of Singapore. That is enough to see how sightings move over time, but it is not every eBird record.

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Leaflet with OpenStreetMap tiles, Cloudflare Workers, D1 and Cron Triggers. The Worker is tested with Vitest.
