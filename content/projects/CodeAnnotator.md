---
title: "Code Annotator"
description: "Paste code, attach notes to any part of it, arrange them on a canvas and export a PNG."
date: "22 Mar, 2026"
coverImage: "/projects/code-annotator/screenshot.webp"
tags: ["Web App", "JavaScript", "Cloudflare Workers", "Prism.js", "Canvas"]
stack: "Browser · Cloudflare Workers"
highlight: "Runs entirely in the browser, including the PNG export"
liveUrl: "https://annotator.fairy-pitta.net/"
githubUrl: "https://github.com/fairy-pitta/code-annotator"
gallery: [
  "/projects/code-annotator/demo.mp4",
  "/projects/code-annotator/example-output.webp"
]
---

## Background

I often need a picture of some code with notes pointing at parts of it, for teaching and for documentation. Doing that in an image editor loses the syntax highlighting, and slide tools do not handle code well. The annotation tools I found needed an account or uploaded the code to a server.

Code Annotator lets me paste code, select part of it, write a note and export the result as a PNG.

![Code Annotator demo](/projects/code-annotator/demo.mp4)

## How it works

1. Paste or type code. Prism.js highlights it, with 19 languages supported.
2. Select part of the code to attach a note to it.
3. Write the note. Bold, italic, lists and colours are available.
4. Move and resize the code, the notes and the arrows on the canvas.
5. Preview the image and download it as a PNG.

![Example annotated code output](/projects/code-annotator/example-output.webp)

## Design

Nothing is sent to a server, so code from a private repository can be used. There are no accounts.

The image is drawn on an HTML5 Canvas, which gives the same output in every browser.

Each note is attached to the selected text rather than to a position on the screen, so it stays next to the code it refers to.

## Stack

JavaScript, Prism.js, HTML5 Canvas and a small rich-text editor I wrote for the notes. Served from Cloudflare Workers.
