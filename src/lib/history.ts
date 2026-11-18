// The About page shows jobs and schooling as two timelines, each newest first.

import type { CvEducation, CvExperience } from "../data/cv"
import type { JobWork } from "./content"
import { monthIndex } from "./months"

export interface HistoryEntry {
  kind: "Work" | "Study"
  title: string
  org: string
  period: string
  bullets: string[]
  // Projects from content/work done in this job.
  projects?: JobWork[]
  // Year the entry started, for the timeline's left column.
  year: number
  current: boolean
}

// "Dec 2023 – Present" → Dec 2023; "2013 – 2017" → Jan 2013.
export function periodStart(period: string): Date {
  const match = period.trim().match(/^(?:([A-Za-z]{3})[a-z]* )?(\d{4})/)
  if (!match) throw new Error(`Unreadable period: ${period}`)
  const month = match[1] ? monthIndex(match[1]) : 0
  if (month === undefined) throw new Error(`Unreadable month in period: ${period}`)
  return new Date(Date.UTC(Number(match[2]), month, 1))
}

// A job with no projects has no projects list at all, as before.
const withProjects = (projects: JobWork[]) => (projects.length > 0 ? projects : undefined)

type EntryFields = Omit<HistoryEntry, "year" | "current">

function withDates(entry: EntryFields): HistoryEntry {
  return {
    ...entry,
    year: periodStart(entry.period).getUTCFullYear(),
    current: /present/i.test(entry.period),
  }
}

const newestFirst = (a: EntryFields, b: EntryFields) => periodStart(b.period).getTime() - periodStart(a.period).getTime()

export function jobHistory(experience: CvExperience[], work: JobWork[] = []): HistoryEntry[] {
  return experience
    .map((job): EntryFields => ({
      kind: "Work",
      title: job.role,
      org: job.org,
      period: job.period,
      bullets: job.bullets,
      projects: job.id ? withProjects(work.filter((project) => project.data.job === job.id)) : undefined,
    }))
    .sort(newestFirst)
    .map(withDates)
}

export function studyHistory(education: CvEducation[]): HistoryEntry[] {
  return education
    .map((edu): EntryFields => ({
      kind: "Study",
      title: edu.degree,
      org: `${edu.school}, ${edu.country}`,
      period: edu.period,
      bullets: edu.bullets ?? [],
    }))
    .sort(newestFirst)
    .map(withDates)
}
