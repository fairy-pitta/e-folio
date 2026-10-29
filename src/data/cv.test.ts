import { describe, it, expect } from 'vitest'
import { cv, linkHref } from './cv'
import { findForbidden } from '../lib/public-safety'

// The three projects of the current job, shown as nested accordions under it.
const projects = cv.experience[0].projects ?? []

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
    expect(findForbidden(JSON.stringify(cv), [])).not.toContain('email address')
    expect(JSON.stringify(cv)).not.toMatch(/mailto:/i)
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
    expect(cv.summary.startsWith('Software engineer and project manager in Singapore.')).toBe(true)
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

  it('test_read_current_job_projects_returns_three_with_every_part_filled', () => {
    expect(projects).toHaveLength(3)
    for (const study of projects) {
      for (const field of [study.title, study.summary, study.problem, study.role, study.outcome]) {
        expect(field.trim(), study.title).not.toBe('')
      }
      expect(study.tags.length, study.title).toBeGreaterThan(0)
      expect(study.decisions.length, study.title).toBeGreaterThan(0)
      study.decisions.forEach((decision) => expect(decision.trim(), study.title).not.toBe(''))
    }
  })

  it('test_read_projects_only_under_current_job_returns_one_owner', () => {
    expect(cv.experience.slice(1).every((job) => !job.projects)).toBe(true)
  })

  it('test_read_current_job_bullets_without_project_roles_returns_no_repeat', () => {
    // Each project's role is told once, inside its accordion, not again as a bullet.
    const bullets = cv.experience[0].bullets.join(' ').toLowerCase()
    for (const phrase of ['financial management saas', 'document-revision', 'operations platform']) {
      expect(bullets, phrase).not.toContain(phrase)
    }
  })

  it('test_read_project_summaries_returns_single_lines', () => {
    for (const study of projects) {
      expect(study.summary, study.title).not.toMatch(/\n/)
      expect(study.summary.length, study.title).toBeLessThanOrEqual(110)
    }
  })

  it('test_read_projects_contains_no_volume_metrics', () => {
    const text = JSON.stringify(projects)
    expect(text).not.toMatch(/\b\d[\d,]*\s+(tests?|commits?|tables?|lines)\b/i)
    expect(text).not.toMatch(/% of (the )?code/i)
  })

  it('test_read_finance_saas_project_says_launch_is_planned_not_shipped', () => {
    const agent = projects[0]
    expect(agent.title).toBe('Financial reporting SaaS with an LLM agent')
    expect(agent.outcome).toContain('planned for April 2027')
    expect(JSON.stringify(agent)).not.toMatch(/\bshipped\b|\blaunched\b|\bin production\b/i)
  })

  it('test_read_tuition_platform_project_keeps_field_results', () => {
    const platform = projects[2]
    expect(platform.outcome).toContain('around 100 invoices a month')
    expect(platform.outcome).toContain('about five hours')
    expect(platform.outcome).toContain('roughly 10% to near zero')
  })

  it('test_read_frameworks_returns_only_the_ones_used', () => {
    expect(cv.skills.find((group) => group.label === 'Frameworks')?.items).toEqual(['Django', 'React', 'Next.js', 'Hono'])
  })

  it('test_read_certifications_returns_the_six_on_the_cv_in_order', () => {
    expect(cv.certifications.map((certification) => certification.name)).toEqual([
      'AWS Certified Solutions Architect – Professional',
      'AWS Certified Generative AI Developer – Professional',
      'AWS Certified Solutions Architect – Associate',
      'IPA Database Specialist',
      'IPA Applied Information Technology Engineer',
      'IPA Fundamental Information Technology Engineer',
    ])
  })

  it('test_read_skills_without_licence_group_returns_engineering_skills_only', () => {
    expect(cv.skills.map((group) => group.label)).not.toContain('Licence')
  })

  it('test_read_current_job_title_returns_lead_engineer', () => {
    expect(cv.experience[0].role).toBe('Lead Engineer & Project Manager')
    expect(JSON.stringify(cv)).not.toMatch(/principal engineer/i)
  })

  it('test_read_first_degree_returns_cv_wording', () => {
    expect(cv.education[0].degree).toBe('BSc (Honours), First Class')
  })

  it('test_read_pitch_returns_one_sentence', () => {
    expect(cv.pitch.trim()).toMatch(/^[^.]+\.$/)
  })

  it('test_read_client_projects_returns_unique_ids_and_short_card_lines', () => {
    const all = cv.experience.flatMap((job) => job.projects ?? [])
    expect(all).toHaveLength(3)
    expect(new Set(all.map((project) => project.id)).size).toBe(all.length)
    for (const project of all) {
      expect(project.id, project.title).toMatch(/^[a-z0-9-]+$/)
      expect(project.roleLabel.trim(), project.title).toBeTruthy()
      expect(project.highlight.length, project.title).toBeLessThanOrEqual(80)
    }
  })
})
