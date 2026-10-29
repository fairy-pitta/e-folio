import { describe, it, expect } from 'vitest'
import { HOME, INDEX_PAGES, absoluteUrl, blogEntries, indexablePages, projectEntries } from './site-map'

const SITE = 'https://fairy-pitta.net'

describe('absoluteUrl', () => {
  it('test_resolve_path_against_site_returns_absolute_url', () => {
    expect(absoluteUrl('/projects/Portree/', SITE)).toBe('https://fairy-pitta.net/projects/Portree/')
  })
})

describe('projectEntries', () => {
  it('test_read_projects_returns_slug_paths_with_trailing_slash', () => {
    const entries = projectEntries()
    expect(entries.length).toBeGreaterThan(0)
    for (const entry of entries) {
      expect(entry.path, entry.title).toMatch(/^\/projects\/[^/]+\/$/)
    }
  })

  it('test_read_projects_returns_title_and_description_for_each', () => {
    for (const entry of projectEntries()) {
      expect(entry.title.trim(), entry.path).not.toBe('')
      expect(entry.description.trim(), entry.path).not.toBe('')
    }
  })
})

describe('blogEntries', () => {
  it('test_read_posts_returns_slug_paths_with_trailing_slash', () => {
    for (const entry of blogEntries()) {
      expect(entry.path, entry.title).toMatch(/^\/blog\/[^/]+\/$/)
    }
  })
})

describe('indexablePages', () => {
  it('test_read_pages_returns_home_and_index_pages', () => {
    const paths = indexablePages().map((entry) => entry.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/about/')
    expect(paths).toContain('/contact/')
    expect(paths).not.toContain('/projects/')
    expect(paths).toContain('/blog/')
  })

  it('test_read_pages_returns_no_duplicate_paths', () => {
    const paths = indexablePages().map((entry) => entry.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('test_read_pages_returns_only_rooted_paths', () => {
    for (const entry of indexablePages()) {
      expect(entry.path, entry.title).toMatch(/^\//)
    }
  })
})

describe('HOME', () => {
  it('test_read_home_description_names_the_project_list', () => {
    expect(HOME.description).toContain('personal project')
    expect(HOME.description.toLowerCase()).not.toContain('case stud')
  })
})

describe('INDEX_PAGES', () => {
  it('test_read_about_description_names_history_and_job_project_details', () => {
    const about = INDEX_PAGES.find((entry) => entry.path === '/about/')
    expect(about?.description).toContain('history')
    expect(about?.description).toContain('details of projects from my job')
  })
})
