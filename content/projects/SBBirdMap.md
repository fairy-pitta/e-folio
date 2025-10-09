---
title: "Mapping Singapore's Avian Life: Inside the Singapore Bird Observation Map"
description: "An interative map of Singapore Birds in the past 23 years."
date: "15 May, 2025"
coverImage: "/projects/sgbirdsmap/map_top.png"
tags: ["Web App", "Next.js", "Cloudflare", "Amplify"]
liveUrl: "https://sgbirdsmap.singbirds.net"
githubUrl: "https://github.com/fairy-pitta/SGBirdMap"
gallery: [
  "/projects/sgbirdsmap/map1.png",
  "/projects/sgbirdsmap/map2.png",
  "/projects/sgbirdsmap/map3.png"
]
---

## Overview

The **Singapore Bird Observation Map** is a web-based interactive tool designed to help users explore the rich avian diversity of Singapore. Built on real-time data from the **eBird API**, this app allows you to discover **where and when** specific bird species have been observed across the island. Whether you're a casual birdwatcher, a researcher, or just curious about local wildlife, this map provides an engaging way to visualize bird activity in Singapore.

Users can filter observations by **date range** and **species**, switch between a **point map** and a **heatmap**, and zoom in on precise locations for detailed insight. All sightings are mapped using coordinates provided by eBird checklists, with the data updated **daily** via automated backend processes.

---

## Features

* 🌏 **Singapore-wide Heatmap**: See a density map of bird observations across Singapore.
* 📅 **Date Range Filters**: Select a specific time window to view seasonal activity patterns.
* 🐦 **Species Filter**: Explore sightings of individual species.
* 📍 **Point Observations**: Click on individual observations to view location details.
* 🔁 **Daily Updates**: Fresh data synced from eBird every night at 11:50 PM.

---

## Tech Stack

### Frontend

* [Next.js](https://nextjs.org/) (App Router)
* Deployed on [AWS Amplify](https://aws.amazon.com/amplify/)
* [Tailwind CSS](https://tailwindcss.com/) for UI styling

### Backend & Data

* [Supabase](https://supabase.com/) for PostgreSQL database and API access
* Scheduled data syncing with **GitHub Actions** (cron jobs)
* eBird API as the primary data source

> There is no dedicated server — all logic runs serverlessly using frontend fetches and GitHub Actions.

---

## Data Sources

* **eBird API**:

  * Provides historical bird observation data for Singapore
  * Powers species and checklist metadata

* **Supabase**:

  * Stores observation data with relational references (e.g., species, location)
  * Enables fast querying and filtering by date and species

---

## Closing Thoughts

Singapore is home to a vibrant array of bird species, both resident and migratory. This map makes it easier than ever to track their presence and movements across the island. Whether you're spotting a hornbill in Changi or a plover in Sungei Buloh, the Singapore Bird Observation Map helps you **connect data to the land** — and learn a little more about the feathered lives around you.

Made with 🐦 & ❤️ for Singapore's birding community.
