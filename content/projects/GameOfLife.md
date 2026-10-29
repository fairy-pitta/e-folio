---
title: "Game of Life"
description: "An interactive Game of Life: draw cells, then start, pause and speed up the simulation."
date: "19 May, 2025"
coverImage: "/projects/gameoflife/gameoflife-top.webp"
tags: ["Web App", "Next.js"]
stack: "Browser · Next.js"
highlight: "A small React project, hosted on GitHub Pages"
earlier: true
liveUrl: "https://fairy-pitta.github.io/Game-Of-Life/"
githubUrl: "https://github.com/fairy-pitta/Game-Of-Life"
gallery: [
  "/projects/gameoflife/gameoflife-gif.mp4",
]
---

## About

A browser version of Conway's Game of Life. Click cells to turn them on or off, then start the simulation and change its speed.

Each cell is alive or dead. On every step, a live cell with two or three live neighbours stays alive, and a dead cell with exactly three live neighbours comes to life. Every other cell is dead in the next step.

## How it works

The grid is a 2D array. A timer runs one step at a time: for each cell it counts the eight neighbours, builds the next grid from the rules, and React redraws it.

## Stack

Next.js (App Router), TypeScript and Tailwind CSS. The first layout was generated with v0.dev and shadcn/ui and then adjusted by hand. Hosted on GitHub Pages.
