import { describe, it, expect } from 'vitest'
import { cv, linkHref } from './cv'
import { findForbidden } from '../lib/public-safety'

describe('cv', () => {
  it('has_required_top_level_fields', () => {
    expect(cv.name).toBe('Shuna Maekawa')
    expect(cv.handle).toBe('fairy-pitta')
    expect(cv.headline).toBeTruthy()
    expect(cv.summary).toBeTruthy()
    expect(cv.experience.length).toBeGreaterThan(0)
    expect(cv.education.length).toBeGreaterThan(0)
    expect(cv.certifications.length).toBeGreaterThan(0)
    expect(cv.skills.length).toBeGreaterThan(0)
  })

  it('test_serialise_cv_contains_no_forbidden_strings', () => {
    expect(findForbidden(JSON.stringify(cv))).toEqual([])
  })

  it('test_read_current_job_org_returns_anonymised_employer', () => {
    expect(cv.experience[0].org).toBe('A software company in Singapore, part of a Japanese group')
  })

  it.each(['automated tests', 'largest contributor', 'commits', 'lines of code'])(
    'test_serialise_cv_without_volume_metric_%s_returns_no_match',
    (metric) => {
      expect(JSON.stringify(cv).toLowerCase()).not.toContain(metric)
    },
  )

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

  it('gives_every_job_details_to_expand', () => {
    for (const job of cv.experience) {
      expect(job.bullets.length, `${job.role} — ${job.org}`).toBeGreaterThan(0)
    }
  })

  it('test_read_education_entries_returns_school_country_degree_and_period', () => {
    for (const edu of cv.education) {
      expect(edu.school && edu.country && edu.degree && edu.period, edu.school).toBeTruthy()
    }
  })

  it('test_read_education_bullets_when_present_returns_non_empty_lines', () => {
    for (const edu of cv.education) {
      if (!edu.bullets) continue
      expect(edu.bullets.length, edu.school).toBeGreaterThan(0)
      edu.bullets.forEach((bullet) => expect(bullet.trim(), edu.school).not.toBe(''))
    }
  })

  it('test_read_tagline_returns_one_line_under_the_search_result_limit', () => {
    expect(cv.tagline.trim()).not.toBe('')
    expect(cv.tagline).not.toMatch(/\n/)
    expect(cv.tagline.length).toBeLessThanOrEqual(155)
  })

  it('test_read_headline_carries_no_location_separator', () => {
    // The location is its own field; the markup joins them.
    expect(cv.headline).not.toContain('·')
    expect(cv.location.trim()).not.toBe('')
  })

  it('test_read_certifications_returns_name_year_and_https_link', () => {
    expect(cv.certifications.length).toBeGreaterThan(0)
    for (const certification of cv.certifications) {
      expect(certification.name.trim(), certification.name).not.toBe('')
      expect(certification.year, certification.name).toMatch(/^\d{4}$/)
      expect(certification.href, certification.name).toMatch(/^https:\/\//)
    }
  })

  it('test_read_awards_returns_title_and_period_for_each', () => {
    expect(cv.awards.length).toBeGreaterThan(0)
    for (const award of cv.awards) {
      expect(award.title.trim(), award.title).not.toBe('')
      expect(award.period.trim(), award.title).not.toBe('')
    }
  })

  it('test_read_header_links_returns_linkedin_and_github_over_https', () => {
    expect(cv.links.map((link) => link.label)).toEqual(['LinkedIn', 'GitHub'])
    for (const link of cv.links) {
      expect(link.href, link.label).toMatch(/^https:\/\//)
    }
  })

  it('test_serialise_cv_contains_no_email_address_or_mailto', () => {
    expect('email' in cv).toBe(false)
    expect(JSON.stringify(cv)).not.toMatch(/shuna120700|mailto:/i)
  })

  it('test_look_up_link_href_by_label_returns_the_url', () => {
    expect(linkHref('LinkedIn')).toBe('https://www.linkedin.com/in/shunamaekawa')
  })

  it('test_look_up_link_href_with_unknown_label_throws', () => {
    expect(() => linkHref('Fax')).toThrow(/Fax/)
  })

  it('test_read_strengths_returns_three_non_empty_lines', () => {
    expect(cv.strengths).toHaveLength(3)
    cv.strengths.forEach((line) => expect(line.trim()).not.toBe(''))
  })

  it('test_read_availability_returns_month_and_year', () => {
    expect(cv.availability).toBe('Available from April 2027')
  })

  it('test_read_summary_without_employer_opens_with_role_and_place', () => {
    expect(cv.summary.startsWith('Solutions architect and software engineer in Singapore.')).toBe(true)
  })

  it('test_serialise_cv_contains_no_contractions', () => {
    // Possessive 's is fine; contractions are not (house style).
    const contraction = /\b\w+(n['’]t|['’](ll|re|ve|m|d))\b|\b(it|that|there|here|what|who|he|she)['’]s\b/i
    expect(JSON.stringify(cv)).not.toMatch(contraction)
  })

  it.each(['passionate', 'leverage', 'seamless', 'the part I enjoy most', 'cutting-edge'])(
    'test_serialise_cv_without_stock_phrase_%s_returns_no_match',
    (phrase) => {
      expect(JSON.stringify(cv).toLowerCase()).not.toContain(phrase.toLowerCase())
    },
  )

  it('test_read_case_studies_returns_three_with_every_part_filled', () => {
    expect(cv.caseStudies).toHaveLength(3)
    for (const study of cv.caseStudies) {
      for (const field of [study.title, study.summary, study.problem, study.role, study.outcome]) {
        expect(field.trim(), study.title).not.toBe('')
      }
      expect(study.tags.length, study.title).toBeGreaterThan(0)
      expect(study.decisions.length, study.title).toBeGreaterThan(0)
      study.decisions.forEach((decision) => expect(decision.trim(), study.title).not.toBe(''))
    }
  })

  it('test_read_case_study_summaries_returns_single_lines', () => {
    for (const study of cv.caseStudies) {
      expect(study.summary, study.title).not.toMatch(/\n/)
      expect(study.summary.length, study.title).toBeLessThanOrEqual(110)
    }
  })

  it('test_read_case_studies_contains_no_volume_metrics', () => {
    const text = JSON.stringify(cv.caseStudies)
    expect(text).not.toMatch(/\b\d[\d,]*\s+(tests?|commits?|tables?|lines)\b/i)
    expect(text).not.toMatch(/% of (the )?code/i)
  })

  it('test_read_llm_agent_case_study_says_launch_is_planned_not_shipped', () => {
    const agent = cv.caseStudies[0]
    expect(agent.title).toBe('LLM agent for a financial management SaaS')
    expect(agent.outcome).toContain('planned for April 2027')
    expect(JSON.stringify(agent)).not.toMatch(/\bshipped\b|\blaunched\b|\bin production\b/i)
  })

  it('test_read_tuition_platform_case_study_keeps_field_results', () => {
    const platform = cv.caseStudies[2]
    expect(platform.outcome).toContain('around 100 invoices a month')
    expect(platform.outcome).toContain('about five hours')
    expect(platform.outcome).toContain('roughly 10% to near zero')
  })

  it.each([
    'Tampines',
    '520297',
    'Employment Pass',
    '(EP',
    'PR pending',
    'GPA',
    '4.52',
    'Forval',
    'Crossgear',
    'Haseko',
    'Hasegawa',
    '1000 users',
    '9-person',
  ])(
    'does_not_publish_%s',
    (secret) => {
      expect(JSON.stringify(cv)).not.toContain(secret)
    },
  )
})
