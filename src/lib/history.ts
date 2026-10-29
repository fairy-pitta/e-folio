// The About page shows jobs and schooling as one timeline, newest first, so
// overlapping years (research during university) sit next to each other.

import type { CvEducation, CvExperience, CvProject } from "../data/cv"
import { monthIndex } from "./months"

export interface HistoryEntry {
  kind: "Work" | "Study"
  title: string
  org: string
  period: string
  bullets: string[]
  projects?: CvProject[]
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

type EntryFields = Omit<HistoryEntry, "year" | "current">

function withDates(entry: EntryFields): HistoryEntry {
  return {
    ...entry,
    year: periodStart(entry.period).getUTCFullYear(),
    current: /present/i.test(entry.period),
  }
}

export function buildHistory(experience: CvExperience[], education: CvEducation[]): HistoryEntry[] {
  const jobs: EntryFields[] = experience.map((job) => ({
    kind: "Work",
    title: job.role,
    org: job.org,
    period: job.period,
    bullets: job.bullets,
    projects: job.projects,
  }))
  const schools: EntryFields[] = education.map((edu) => ({
    kind: "Study",
    title: edu.degree,
    org: `${edu.school}, ${edu.country}`,
    period: edu.period,
    bullets: edu.bullets ?? [],
  }))
  return [...jobs, ...schools]
    .sort((a, b) => periodStart(b.period).getTime() - periodStart(a.period).getTime())
    .map(withDates)
}
