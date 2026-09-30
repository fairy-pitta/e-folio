import fs from "fs"
import path from "path"
import matter from "gray-matter"

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
  featured?: boolean
  order?: number
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
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
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
      date = buildUtcDate(Number(monthFirst[3]), MONTHS[monthFirst[1].slice(0, 3).toLowerCase()], Number(monthFirst[2]))
    } else if (dayFirst) {
      date = buildUtcDate(Number(dayFirst[3]), MONTHS[dayFirst[2].slice(0, 3).toLowerCase()], Number(dayFirst[1]))
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
  return readMarkdownFiles<ProjectFrontmatter>(projectsDirectory)
}

export function getFeaturedProjects(limit = 4): Project[] {
  return getAllProjects()
    .filter((project) => project.frontmatter.featured === true)
    .sort((a, b) => (a.frontmatter.order ?? Infinity) - (b.frontmatter.order ?? Infinity))
    .slice(0, limit)
}

export function projectLinks(frontmatter: ProjectFrontmatter): { label: "Code" | "Live"; href: string }[] {
  const links: { label: "Code" | "Live"; href: string }[] = []
  if (frontmatter.githubUrl?.trim()) links.push({ label: "Code", href: frontmatter.githubUrl.trim() })
  if (frontmatter.liveUrl?.trim()) links.push({ label: "Live", href: frontmatter.liveUrl.trim() })
  return links
}
