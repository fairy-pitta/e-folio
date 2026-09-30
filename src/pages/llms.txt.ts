// https://llmstxt.org/ — a curated Markdown index an agent can read instead of
// scraping the rendered pages. It serves inference, not training, and grants no
// permissions: robots.txt remains the place for access rules.

import type { APIContext } from "astro"
import {
  HOME,
  INDEX_PAGES,
  SECONDARY_PAGES,
  absoluteUrl,
  blogEntries,
  projectEntries,
  type SiteEntry,
} from "../lib/site-map"

const SUMMARY =
  "Portfolio and CV of Shuna Maekawa (fairy-pitta), a full-stack software engineer in Singapore working across React, TypeScript and Python. Holds the CV, write-ups of personal projects, and notes on software engineering."

function link(entry: SiteEntry, site: URL | string): string {
  const url = absoluteUrl(entry.path, site)
  return entry.description ? `- [${entry.title}](${url}): ${entry.description}` : `- [${entry.title}](${url})`
}

function section(heading: string, entries: SiteEntry[], site: URL | string): string[] {
  if (entries.length === 0) return []
  return [`## ${heading}`, "", ...entries.map((entry) => link(entry, site)), ""]
}

export function GET(context: APIContext) {
  const site = context.site!

  const lines = [
    `# ${HOME.title}`,
    "",
    `> ${SUMMARY}`,
    "",
    ...section("Pages", [HOME, ...INDEX_PAGES], site),
    ...section("Projects", projectEntries(), site),
    ...section("Writing", blogEntries(), site),
    ...section("Optional", SECONDARY_PAGES, site),
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
