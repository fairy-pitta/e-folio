import { describe, it, expect } from 'vitest'
import { jobHistory, periodStart, studyHistory } from './history'
import { cv } from '../data/cv'
import { readJobWork } from './content-files'

const utc = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1))

describe('periodStart', () => {
  it.each([
    ['Dec 2023 – Present', utc(2023, 12)],
    ['Aug 2019 – May 2023', utc(2019, 8)],
    ['2013 – 2017', utc(2013, 1)],
  ])('test_read_period_%s_returns_start_month', (period, expected) => {
    expect(periodStart(period).getTime()).toBe(expected.getTime())
  })

  it('test_read_period_without_year_throws', () => {
    expect(() => periodStart('Present')).toThrow(/Present/)
  })
})

describe('jobHistory', () => {
  const history = jobHistory(cv.experience, readJobWork())

  it('test_list_jobs_returns_every_job_newest_first', () => {
    expect(history).toHaveLength(cv.experience.length)
    expect(history.every((entry) => entry.kind === 'Work')).toBe(true)
    for (let i = 1; i < history.length; i++) {
      expect(periodStart(history[i - 1].period).getTime()).toBeGreaterThanOrEqual(periodStart(history[i].period).getTime())
    }
  })

  it('test_list_jobs_marks_only_the_present_job_current_with_its_start_year', () => {
    expect(history.filter((entry) => entry.current)).toEqual([history[0]])
    expect(history[0].year).toBe(periodStart(history[0].period).getUTCFullYear())
  })

  it('test_list_jobs_keeps_client_projects_on_the_current_job', () => {
    expect(history[0].projects?.map((project) => project.id)).toEqual(['finance-saas', 'document-ai', 'tuition-ops'])
    expect(history.slice(1).every((entry) => entry.projects === undefined)).toBe(true)
  })

  it('test_list_jobs_without_work_leaves_jobs_without_projects', () => {
    expect(jobHistory(cv.experience).every((entry) => entry.projects === undefined)).toBe(true)
  })
})

describe('studyHistory', () => {
  it('test_list_schools_returns_every_school_newest_first', () => {
    const study = studyHistory(cv.education)
    expect(study).toHaveLength(cv.education.length)
    expect(study.every((entry) => entry.kind === 'Study' && !entry.current)).toBe(true)
    expect(study[0].org).toContain('Yale-NUS College')
    expect(study.at(-1)?.org).toContain('United World College')
  })
})
