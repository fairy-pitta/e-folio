import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { SHORT_MONTHS, monthIndex } from "./months"

const blogDirectory = path.join(process.cwd(), "content", "blog")
const projectsDirectory = path.join(process.cwd(), "content", "projects")

export interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  coverImage?: string
  readTime?: string
  tags: string[]
  // Drafts stay in the repo but are not built into any page, feed or image.
  draft?: boolean
}

export interface ProjectFrontmatter {
  title: string
  description: string
  date: string
  coverImage?: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  gallery?: string[]
  // Where the project is distributed, such as npm. Not a demo, so it never earns a LIVE stamp.
  packageUrl?: string
  // One line on the card: an outcome where there is one, otherwise the engineering choice.
  highlight?: string
  // Older or retired work, listed briefly below the main grid.
  earlier?: boolean
  // A write-up hosted elsewhere, such as a Qiita article.
  articleUrl?: string
  articleLabel?: string
  // What it runs on, for the specimen label: "Browser · Rust/WASM".
  stack?: string
}

export interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
  date: Date
}

export interface Project {
  slug: string
  frontmatter: ProjectFrontmatter
  content: string
  date: Date
  // Catalogue number in the order the projects were made, oldest first, so
  // adding a project never renumbers the ones already listed.
  number: number
}

function buildUtcDate(year: number, month: number | undefined, day: number): Date | null {
  if (month === undefined) return null
  const date = new Date(Date.UTC(year, month, day))
  return date.getUTCMonth() === month && date.getUTCDate() === day ? date : null
}

// Frontmatter dates come in several formats ("April 5, 2026", "13 Jan, 2026", "2025-05-18")
// and unquoted ISO dates arrive from YAML as Date objects.
export function parseContentDate(value: unknown, source: string): Date {
  let date: Date | null = null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  } else if (typeof value === "string") {
    const text = value.trim()
    const monthFirst = text.match(/^([A-Za-z]+)\.? (\d{1,2}),? (\d{4})$/)
    const dayFirst = text.match(/^(\d{1,2}) ([A-Za-z]+)\.?,? (\d{4})$/)
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (monthFirst) {
      date = buildUtcDate(Number(monthFirst[3]), monthIndex(monthFirst[1]), Number(monthFirst[2]))
    } else if (dayFirst) {
      date = buildUtcDate(Number(dayFirst[3]), monthIndex(dayFirst[2]), Number(dayFirst[1]))
    } else if (iso) {
      date = buildUtcDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    }
  }

  if (!date) {
    throw new Error(`Invalid date in ${source}: ${String(value)}`)
  }
  return date
}

const pad = (n: number) => String(n).padStart(2, "0")

export function formatYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

export function formatDate(date: Date): string {
  return `${formatYearMonth(date)}-${pad(date.getUTCDate())}`
}

function readMarkdownFiles<T extends { date: string; tags: string[] }>(directory: string) {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const { data, content } = matter(fs.readFileSync(path.join(directory, fileName), "utf8"))
      const date = parseContentDate(data.date, fileName)
      const frontmatter = { ...data, tags: Array.isArray(data.tags) ? data.tags : [] } as T
      return { slug, frontmatter, content, date }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function getAllBlogPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): BlogPost[] {
  const posts = readMarkdownFiles<BlogFrontmatter>(blogDirectory)
  return includeDrafts ? posts : posts.filter((post) => post.frontmatter.draft !== true)
}

export function getAllProjects(): Project[] {
  const projects = readMarkdownFiles<ProjectFrontmatter>(projectsDirectory)
  return projects.map((project, i) => ({ ...project, number: projects.length - i }))
}

export function formatCatalogueNumber(number: number): string {
  return String(number).padStart(3, "0")
}

export function formatMonthYear(date: Date): string {
  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export type ProjectStatus = "LIVE" | "OSS" | "ARCHIVED"

// The stamp on a specimen card: something to try, only code to read, or neither.
export function projectStatus(frontmatter: ProjectFrontmatter): ProjectStatus {
  if (frontmatter.liveUrl?.trim()) return "LIVE"
  if (frontmatter.githubUrl?.trim()) return "OSS"
  return "ARCHIVED"
}

export type ProjectLinkKind = "live" | "code" | "package" | "article"

export interface ProjectLink {
  kind: ProjectLinkKind
  label: string
  href: string
}

// In display order: the demo first, since trying it is what most readers came for.
export function projectLinks(frontmatter: ProjectFrontmatter): ProjectLink[] {
  const candidates: [ProjectLinkKind, string, string | undefined][] = [
    ["live", "Try the live demo", frontmatter.liveUrl],
    ["code", "Source code", frontmatter.githubUrl],
    ["package", "Package on npm", frontmatter.packageUrl],
    ["article", frontmatter.articleLabel?.trim() || "Article", frontmatter.articleUrl],
  ]
  return candidates
    .filter(([, , href]) => href?.trim())
    .map(([kind, label, href]) => ({ kind, label, href: href!.trim() }))
}
