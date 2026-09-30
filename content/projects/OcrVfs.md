---
title: "OCR-VFS — Visual Fidelity Scorer for OCR-to-Word Pipelines"
description: "A research PoC that scores how well OCR-to-Word pipelines preserve the layout of scanned documents, and rebuilds layout-faithful DOCX files."
date: "9 May, 2026"
coverImage: ""
tags: ["Python", "OCR", "Azure Document Intelligence", "Claude", "OOXML"]
featured: true
order: 3
liveUrl: ""
githubUrl: "https://github.com/fairy-pitta/ocr-vfs"
---

## Overview

OCR engines are judged on text accuracy (CER/WER), but for old printed documents the text is usually fine — what breaks is the layout: headings, paragraphs, tables and where things sit on the page. OCR-VFS measures that. It renders a pipeline's Word output back to an image and scores it against the original scan.

## How it scores

- **Position score** — how closely each block lands where it was on the scan
- **Reading-order score** — longest-common-subsequence agreement with the original order
- A composite of the two explains *why* a page scores low, not just that it does

## What I found

- The same OCR output can score **about 15× differently** depending on the pipeline that turns it into Word. Converting Markdown through pandoc loses the layout; placing each line as an absolutely positioned OOXML frame keeps it
- A 0.42° scan skew inflates bounding boxes by 30–45%. Computing line heights from the polygon's side edges instead of an axis-aligned box removes the overlaps

## Engineering

- Several interchangeable pipelines: structural rebuilds from Azure Document Intelligence and Surya OCR, and LLM-assisted variants using Claude with a structured schema
- DOCX generation directly in OOXML (`framePr`, tables) with python-docx
- Python 3.11, strict mypy and pytest
