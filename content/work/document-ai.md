---
kind: client
title: "Document AI for revising condominium bylaws"
summary: "OCR and an LLM turn scanned bylaws into a revised draft in Word."
highlight: "OCR, revision and export run as three services that can be retried separately"
tags: ["Next.js", "Python", "GCP", "Azure"]
job: "lead-engineer"
order: 2
roleLabel: "Architect & code reviewer"
status: "In use"
case:
  problem: "A Japanese property-management group updates condominium bylaws so that they follow the standard bylaws. The bylaws it starts from are scans of paper documents."
  role: "Architect. I also review the code that the delivery engineers write."
  decisions:
    - "The work has three steps: read the scans with OCR, compare the text with the standard bylaws using an LLM, and export the result to Word. Each step is slow and fails in its own way, so each runs as a separate service, and the services pass files to each other in an agreed format. When one step fails, it can be run again without repeating the steps before it."
    - "OCR and LLM output is sometimes partly wrong, so I designed the flow so that a person checks it before it is used."
  outcome: "The system is in use. It turns a scanned set of bylaws into a revised draft in Word, which a person checks before use. I still review the delivery engineers' code."
---
