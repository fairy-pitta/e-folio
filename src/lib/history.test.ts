import { describe, it, expect } from 'vitest'
import { buildHistory, periodStart } from './history'
import { cv } from '../data/cv'

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

describe('buildHistory', () => {
  const history = buildHistory(cv.experience, cv.education)

  it('test_merge_cv_returns_every_job_and_school', () => {
    expect(history).toHaveLength(cv.experience.length + cv.education.length)
  })

  it('test_merge_cv_returns_entries_newest_first', () => {
    for (let i = 1; i < history.length; i++) {
      expect(periodStart(history[i - 1].period).getTime()).toBeGreaterThanOrEqual(periodStart(history[i].period).getTime())
    }
    expect(history[0].kind).toBe('Work')
    expect(history.at(-1)?.org).toContain('United World College')
  })

  it('test_merge_cv_marks_only_the_present_job_current_with_its_start_year', () => {
    expect(history.filter((entry) => entry.current)).toEqual([history[0]])
    expect(history[0].year).toBe(periodStart(history[0].period).getUTCFullYear())
  })

  it('test_merge_cv_keeps_client_projects_on_the_current_job', () => {
    expect(history[0].projects).toHaveLength(3)
  })
})
