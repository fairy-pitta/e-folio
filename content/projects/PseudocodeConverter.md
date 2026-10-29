---
title: "Pseudocode Converter"
description: "Converts Python or Java into IB, AP CSP, Cambridge IGCSE or A Level pseudocode as you type."
date: "Oct 13, 2025"
coverImage: "/projects/Pseudocode/converter-demo.mp4"
tags: ["Web App", "TypeScript", "Python", "Java", "Compilers", "Computer Science"]
stack: "Browser · TypeScript, Lezer"
highlight: "Supports four exam boards through one intermediate representation"
liveUrl: "https://pseudocode-converter.fairy-pitta.net/"
githubUrl: "https://github.com/fairy-pitta/pseudocode-converter"
gallery: [
  "/projects/Pseudocode/fizzbuzz.webp"
]
---

## Background

Computer Science exams ask students to write algorithms in pseudocode, and each exam board uses its own notation. Students usually write their programs in Python or Java first.

Pseudocode Converter shows a Python or Java program in the notation of IB, AP Computer Science Principles, Cambridge IGCSE (0478) or Cambridge International A Level (9618). The output updates as you type, and any source language can be converted to any of the four.

For each combination the site also has a rules page. It explains how each construct is converted and links to the exam board's reference document.

## How it works

1. The code is parsed with [Lezer](https://lezer.codemirror.net/) (`@lezer/python`, `@lezer/java`).
2. The syntax tree is turned into a small intermediate representation that does not depend on the source language.
3. Constructs that a standard does not have, such as `for` over a range or `+=`, are rewritten.
4. A printer for each standard writes out the pseudocode.

```ts
const { pseudocode, diagnostics } = convert("for i in range(3):\n    print(i)", { from: "python", to: "igcse" })
```

![FizzBuzz in Python and IB pseudocode](/projects/Pseudocode/fizzbuzz.webp)

## Design

Because every language goes through the same intermediate representation, adding a language means writing one new parser frontend, and adding an exam board means writing one new printer.

When a line cannot be converted, the converter reports it next to the output and carries on with the rest.

Everything runs in the browser and no code is sent anywhere, so the site is served as static files.

## Stack

Next.js 15 (static export), React 18, TypeScript, Tailwind CSS, shadcn/ui, Monaco Editor and Lezer. The converter is tested with Vitest. Hosted on Cloudflare Pages, with tests and a build run by GitHub Actions on each pull request.
