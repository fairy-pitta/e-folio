---
title: "Pseudocode Converter: Convert Code to IB‑Compliant Pseudocode"
description: "A web tool that converts Python or Java code into IB‑compliant pseudocode for Computer Science courses and examinations."
date: "Oct 13, 2025"
coverImage: "/projects/Pseudocode/pseudocode.png"
tags: ["Web App", "Python", "Java", "IB", "Computer Science"]
liveUrl: "https://pseudocode-converter.fairy-pitta.net/"
githubUrl: "https://github.com/fairy-pitta/pseudocode-converter"
gallery: [
  "/projects/Pseudocode/fizzbuzz.png"
]
---

## Overview

Pseudocode Converter is a web application that transforms source code into standardized, IB‑compliant pseudocode suitable for teaching, assignments, and exam preparation in Computer Science. It helps students and instructors quickly produce clear, consistent pseudocode from familiar programming languages.

---

## Features

- IB‑style pseudocode conversion for Python and Java
- Standardized keywords and block structure for readability and assessment
- Coverage for core control flow: conditionals, loops (FOR / WHILE / REPEAT–UNTIL)
- Procedures/functions, arrays/lists, and boolean expressions
- Instant output ready to copy into reports, worksheets, or exam responses

---

## Tech Stack

- Next.js (UI) + TypeScript
- AST‑based conversion pipeline that analyzes code structure
- Fully serverless: static hosting on Cloudflare Pages; no backend; conversion runs client‑side in the browser
- Modular, self‑authored npm libraries for language support:
  - java2ib — Java → IB‑style pseudocode (MIT)
  - python2ib — Python → IB‑style pseudocode (MIT)
- Cloudflare Pages deployment for fast, reliable delivery

---

## Design & Architecture

- Uses AST (Abstract Syntax Tree) analysis to understand control flow, declarations, and expressions before mapping them to IB‑compliant pseudocode
- All parsing and conversion runs entirely in the browser (client‑side); input code is never sent to any server
- Parsers are split into independent npm libraries to keep the main repo lean and extensible:
  - java2ib: converts Java AST to IB‑style pseudocode
  - python2ib: converts Python AST to IB‑style pseudocode
- Both parser libraries are self‑authored in TypeScript and published under the MIT license
- Why separate libraries?
  - Extensibility: add new languages in the future without bloating the core project
  - Maintainability: version, test, and release each parser independently
  - Reusability: others can import the libraries directly in their own projects
  - Licensing: both libraries are published under MIT for open use

---

## How It Works

1. Paste Python or Java code into the editor.
2. Click Convert to generate IB‑style pseudocode via AST‑based parsing powered by the language libraries.
3. Review the output and copy it directly into your assignment or notes.
4. If something looks off, report the case so it can be improved.

---

## IB Pseudocode Alignment

- Follows widely used IB Computer Science pseudocode conventions (keywords, block structure, indentation)
- Emphasizes clear naming and language‑agnostic constructs
- Conservative handling of edge cases to avoid ambiguity
- School‑specific differences can be accommodated over time

---

## Links

- Live: https://pseudocode-converter.fairy-pitta.net/
- GitHub: https://github.com/fairy-pitta/pseudocode-converter
- npm (Java → IB pseudocode): https://www.npmjs.com/package/java2ib
- npm (Python → IB pseudocode): https://www.npmjs.com/package/python2ib

---

// Remove mistakenly added gallery block at the end
// (No content here after Links section; gallery is defined in frontmatter above)