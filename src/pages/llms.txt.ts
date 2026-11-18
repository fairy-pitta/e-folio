// https://llmstxt.org/ — a curated Markdown index an agent can read instead of
// scraping the rendered pages. It serves inference, not training, and grants no
// permissions: robots.txt remains the place for access rules.

import type { APIContext } from "astro"
import { cv } from "../data/cv"
import {
  HOME,
  INDEX_PAGES,
  SECONDARY_PAGES,
  absoluteUrl,
  blogEntries,
  projectEntries,
  workEntries,
  type SiteEntry,
} from "../lib/site-map"
import { getAllBlogPosts, getAllProjects, getJobWork } from "../lib/collections"

const CONTENTS =
  "Holds case studies of projects from my job, write-ups of personal projects, an About page with the CV, and notes on software engineering."

function link(entry: SiteEntry, site: URL | string): string {
  const url = absoluteUrl(entry.path, site)
  return entry.description ? `- [${entry.title}](${url}): ${entry.description}` : `- [${entry.title}](${url})`
}

function section(heading: string, entries: SiteEntry[], site: URL | string): string[] {
  if (entries.length === 0) return []
  return [`## ${heading}`, "", ...entries.map((entry) => link(entry, site)), ""]
}

export async function GET(context: APIContext) {
  const site = context.site!

  const lines = [
    `# ${HOME.title}`,
    "",
    `> ${cv.tagline} ${CONTENTS}`,
    "",
    ...section("Pages", [HOME, ...INDEX_PAGES], site),
    ...section("Work", workEntries(await getJobWork()), site),
    ...section("Projects", projectEntries(await getAllProjects()), site),
    ...section("Writing", blogEntries(await getAllBlogPosts()), site),
    ...section("Optional", SECONDARY_PAGES, site),
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
