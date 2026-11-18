import { SHORT_MONTHS, monthIndex } from "./months"
import type { BlogData, JobWorkData, PersonalWorkData, WorkData } from "./schema"

// One content file as the collections hand it over: the file name without
// ".md" as its id, the parsed front matter and the Markdown body.
export interface ContentEntry<T> {
  id: string
  data: T
  body?: string
}

export interface BlogPost {
  slug: string
  data: BlogData
  content: string
  date: Date
}

export interface Project {
  slug: string
  data: PersonalWorkData
  content: string
  date: Date
  // Catalogue number in the order the projects were made, oldest first, so
  // adding a project never renumbers the ones already listed.
  number: number
}

// A project from the job, told as a case study on its own page, /work/<id>.
export interface JobWork {
  id: string
  data: JobWorkData
  content: string
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

// Newest first; files with the same date keep the order of their names, as
// the directory listing gave them before the collections existed.
function newestFirst<T extends { id: string; date: Date }>(a: T, b: T): number {
  return b.date.getTime() - a.date.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

export function toBlogPosts(
  entries: ContentEntry<BlogData>[],
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): BlogPost[] {
  return entries
    .filter((entry) => includeDrafts || entry.data.draft !== true)
    .map((entry) => ({ id: entry.id, date: entry.data.date, entry }))
    .sort(newestFirst)
    .map(({ entry, date }) => ({ slug: entry.id, data: entry.data, content: entry.body ?? "", date }))
}

function isPersonal(entry: ContentEntry<WorkData>): entry is ContentEntry<PersonalWorkData> {
  return entry.data.kind === "personal"
}

function isJobWork(entry: ContentEntry<WorkData>): entry is ContentEntry<JobWorkData> {
  return entry.data.kind === "client" || entry.data.kind === "internal"
}

export function toProjects(entries: ContentEntry<WorkData>[]): Project[] {
  const projects = entries
    .filter(isPersonal)
    .map((entry) => ({ id: entry.id, date: entry.data.date, entry }))
    .sort(newestFirst)
  return projects.map(({ entry, date }, i) => ({
    slug: entry.id,
    data: entry.data,
    content: entry.body ?? "",
    date,
    number: projects.length - i,
  }))
}

// In the order of the jobs in the CV, then each job's own order.
export function toJobWork(entries: ContentEntry<WorkData>[], jobIds: string[]): JobWork[] {
  const rank = (job: string) => jobIds.indexOf(job)
  return entries
    .filter(isJobWork)
    .sort((a, b) => rank(a.data.job) - rank(b.data.job) || a.data.order - b.data.order)
    .map((entry) => ({ id: entry.id, data: entry.data, content: entry.body ?? "" }))
}

// The When row of a project from the job. Projects carry no dates of their
// own, so this is the period of the job they were done in.
export function jobWhen(period: string): string {
  const current = period.match(/^(.+?)\s*[–-]\s*present$/i)
  return current ? `Current job, since ${current[1]}` : `During the job, ${period}`
}

export function formatCatalogueNumber(number: number): string {
  return String(number).padStart(3, "0")
}

export function formatMonthYear(date: Date): string {
  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export type ProjectStatus = "LIVE" | "OSS" | "ARCHIVED"

type ProjectLinks = PersonalWorkData["links"]

// A personal project's status: something to try, only code to read, or neither.
export function projectStatus(links: ProjectLinks): ProjectStatus {
  if (links.live) return "LIVE"
  if (links.code) return "OSS"
  return "ARCHIVED"
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  LIVE: "Live",
  OSS: "Open source",
  ARCHIVED: "Archived",
}

// The status as it is shown: sentence case, spelled out.
export function statusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status]
}

export type ProjectLinkKind = "live" | "code" | "package" | "article"

export interface ProjectLink {
  kind: ProjectLinkKind
  label: string
  href: string
}

// In display order: the demo first, since trying it is what most readers came for.
export function projectLinks(links: ProjectLinks): ProjectLink[] {
  const candidates: [ProjectLinkKind, string, string | undefined][] = [
    ["live", "Try the live demo", links.live],
    ["code", "Source code", links.code],
    ["package", "Package on npm", links.package],
    ["article", links.article?.label ?? "", links.article?.url],
  ]
  return candidates
    .filter((candidate): candidate is [ProjectLinkKind, string, string] => Boolean(candidate[2]))
    .map(([kind, label, href]) => ({ kind, label, href }))
}

// A project's slug as a folder name, for the home page's tree and the path
// above each project: "CCAccountSwitcher" → "cc-account-switcher".
export function folderName(slug: string): string {
  return slug
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

// Terminal tools are shown in a drawn monitor, so a recording of a shell reads
// as a screen rather than a black box.
export function runsInTerminal(data: { stack?: string }): boolean {
  return /^terminal\b/i.test(data.stack ?? '')
}

// What a project's window shows in its title bar: the shell for a terminal
// tool, otherwise the address it is served from, or its name if it has none.
export function screenTitle(slug: string, data: { stack?: string; links?: { live?: string } }): string {
  if (runsInTerminal(data)) return `zsh — ${folderName(slug)}`
  const live = data.links?.live
  if (live) {
    try {
      const url = new URL(live)
      return (url.host + url.pathname).replace(/\/$/, '')
    } catch {
      // Not a URL: fall through to the name.
    }
  }
  return folderName(slug)
}
