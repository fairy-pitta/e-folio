// The canonical list of indexable pages, shared by sitemap.xml and llms.txt so
// the two can never drift apart. Paths carry the trailing slash that the built
// pages and their canonical links use.

import { getAllBlogPosts, getAllProjects } from "./content"

export interface SiteEntry {
  path: string
  title: string
  description: string
  date?: Date
}

export const HOME: SiteEntry = {
  path: "/",
  title: "Shuna Maekawa",
  description: "Experience, education, certifications, awards and skills.",
}

export const INDEX_PAGES: SiteEntry[] = [
  { path: "/projects/", title: "Projects", description: "Index of project write-ups." },
  { path: "/blog/", title: "Writing", description: "Notes on software engineering." },
]

// Boilerplate an agent can skip; llms.txt puts these under "Optional".
export const SECONDARY_PAGES: SiteEntry[] = [
  { path: "/privacy/", title: "Privacy", description: "How the contact form handles your data." },
  { path: "/terms/", title: "Terms", description: "Terms of use for this site." },
]

export function projectEntries(): SiteEntry[] {
  return getAllProjects().map((project) => ({
    path: `/projects/${project.slug}/`,
    title: project.frontmatter.title,
    description: project.frontmatter.description,
    date: project.date,
  }))
}

export function blogEntries(): SiteEntry[] {
  return getAllBlogPosts().map((post) => ({
    path: `/blog/${post.slug}/`,
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    date: post.date,
  }))
}

export function indexablePages(): SiteEntry[] {
  return [HOME, ...INDEX_PAGES, ...projectEntries(), ...blogEntries(), ...SECONDARY_PAGES]
}

export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href
}
