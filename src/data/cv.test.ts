import { describe, it, expect } from 'vitest'
import { cv } from './cv'

describe('cv', () => {
  it('has_required_top_level_fields', () => {
    expect(cv.name).toBe('Shuna Maekawa')
    expect(cv.handle).toBe('fairy-pitta')
    expect(cv.headline).toBeTruthy()
    expect(cv.summary).toBeTruthy()
    expect(cv.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/)
    expect(cv.experience.length).toBeGreaterThan(0)
    expect(cv.education.length).toBeGreaterThan(0)
    expect(cv.certifications.length).toBeGreaterThan(0)
    expect(cv.skills.length).toBeGreaterThan(0)
  })

  it('has_no_empty_entries', () => {
    for (const job of cv.experience) {
      expect(job.role && job.org && job.period).toBeTruthy()
      job.bullets.forEach((b) => expect(b.trim()).not.toBe(''))
    }
    for (const group of cv.skills) {
      expect(group.label).toBeTruthy()
      expect(group.items.length).toBeGreaterThan(0)
    }
  })

  it('links_use_https_or_mailto', () => {
    for (const link of cv.links) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/)
    }
  })

  it.each(['Tampines', '520297', 'Employment Pass', '(EP', 'PR pending', 'GPA', '4.52'])(
    'does_not_publish_%s',
    (secret) => {
      expect(JSON.stringify(cv)).not.toContain(secret)
    },
  )
})
