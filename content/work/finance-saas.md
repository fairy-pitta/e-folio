---
kind: client
title: "Financial reporting SaaS with an LLM agent"
summary: "A reporting platform I designed and built from scratch, with an agent that answers finance questions."
highlight: "Platform and agent designed from the data model up"
tags: ["Vue", "Django", "PostgreSQL", "AWS"]
job: "lead-engineer"
order: 1
roleLabel: "Designed and built it from scratch; led a team of 9"
team: "9 engineers"
status: "In development; launch planned for April 2027"
case:
  problem: "A client asked for a reporting platform that turns yearly P&L statements into figures a business can act on. It also needed an agent that answers finance questions from each customer's accounting data. The agent calls tools to fetch that data. When a tool returns nothing, or the wrong thing, a model will still write an answer that sounds sure."
  role: "Lead engineer and project manager. I designed the platform from scratch and built it, including the agent. I led a team of nine engineers, answered the client's technical questions directly and reviewed the team's code."
  decisions:
    - "Each tool returns one of three results: valid, empty or invalid. The agent answers only from a valid result. When a result is empty or invalid, the agent says so instead of treating it as data."
    - "A fixed set of questions with known answers is run after every change to a prompt or model. If the answers get worse, we see it before release."
  outcome: "The platform, including the agent, is in development. Its launch is planned for April 2027."
---
