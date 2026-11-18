// The canonical list of indexable pages, shared by sitemap.xml and llms.txt so
// the two can never drift apart. Paths carry the trailing slash that the built
// pages and their canonical links use.

import { cv } from "../data/cv"
import type { BlogPost, JobWork, Project } from "./content"

export interface SiteEntry {
  path: string
  title: string
  description: string
  date?: Date
}

export const HOME: SiteEntry = {
  path: "/",
  title: cv.name,
  description:
    "Work: selected projects from my job, each told as a case study, and personal projects, each with a short label and a link to the full write-up.",
}

export const INDEX_PAGES: SiteEntry[] = [
  {
    path: "/about/",
    title: "About",
    description: "Strengths, certifications, skills, a history of jobs with links to the projects from my job, education and awards.",
  },
  { path: "/contact/", title: "Contact", description: "Contact form." },
  { path: "/blog/", title: "Writing", description: "Notes on software engineering." },
]

// Boilerplate an agent can skip; llms.txt puts these under "Optional".
export const SECONDARY_PAGES: SiteEntry[] = [
  { path: "/privacy/", title: "Privacy", description: "How the contact form handles your data." },
  { path: "/terms/", title: "Terms", description: "Terms of use for this site." },
]

// Projects from the job: no dates of their own, so no lastmod.
export function workEntries(work: JobWork[]): SiteEntry[] {
  return work.map((project) => ({
    path: `/work/${project.id}/`,
    title: project.data.title,
    description: project.data.summary,
  }))
}

export function projectEntries(projects: Project[]): SiteEntry[] {
  return projects.map((project) => ({
    path: `/projects/${project.slug}/`,
    title: project.data.title,
    description: project.data.summary,
    date: project.date,
  }))
}

export function blogEntries(posts: BlogPost[]): SiteEntry[] {
  return posts.map((post) => ({
    path: `/blog/${post.slug}/`,
    title: post.data.title,
    description: post.data.excerpt,
    date: post.date,
  }))
}

export function indexablePages(work: JobWork[], projects: Project[], posts: BlogPost[]): SiteEntry[] {
  return [HOME, ...INDEX_PAGES, ...workEntries(work), ...projectEntries(projects), ...blogEntries(posts), ...SECONDARY_PAGES]
}

export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href
}
