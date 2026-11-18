---
kind: internal
title: "Operations platform for a tuition centre"
summary: "Member records, monthly invoices and messaging in one system, replacing invoicing in Excel."
highlight: "About 100 invoices a month, with errors down from 10% to almost none"
tags: ["Cloudflare", "Hono"]
job: "lead-engineer"
order: 3
roleLabel: "Sole engineer & operator"
team: "Just me"
status: "In use, about 100 invoices a month"
case:
  problem: "The company runs a tuition centre, which made its monthly invoices by hand in Excel. This took hours every month, and about one invoice in ten had a mistake."
  role: "I am the only engineer. I built the system and still run it."
  decisions:
    - "Member records, invoices and messages are kept in one system. Each invoice is made from the same member record that the message is sent to, so nothing is copied between spreadsheets."
    - "Email, WhatsApp and SMS are sent from the same place, so each family gets messages on the channel it uses."
  outcome: "The system sends around 100 invoices a month. It saves about five hours of manual work each month, and invoice errors went from roughly 10% to near zero. The centre uses it for its day-to-day work."
---
