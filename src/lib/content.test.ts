import { describe, it, expect } from 'vitest'
import {
  parseContentDate,
  formatYearMonth,
  formatDate,
  getAllBlogPosts,
  getAllProjects,
  getFeaturedProjects,
  projectLinks,
  type ProjectFrontmatter,
} from './content'

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))

describe('parseContentDate', () => {
  it.each([
    ['April 5, 2026', utc(2026, 4, 5)],
    ['May 18, 2025', utc(2025, 5, 18)],
    ['Oct 13, 2025', utc(2025, 10, 13)],
    ['13 Jan, 2026', utc(2026, 1, 13)],
    ['6 Feb, 2026', utc(2026, 2, 6)],
    ['2025-05-18', utc(2025, 5, 18)],
  ])('parses_%s', (input, expected) => {
    expect(parseContentDate(input, 'test.md').getTime()).toBe(expected.getTime())
  })

  it('accepts_date_objects_from_unquoted_yaml', () => {
    const fromYaml = new Date('2025-05-18T00:00:00.000Z')
    expect(parseContentDate(fromYaml, 'test.md').getTime()).toBe(utc(2025, 5, 18).getTime())
  })

  it.each(['', 'Smarch 5, 2026', 'Feb 30, 2026', 'yesterday', 42])('rejects_%s', (input) => {
    expect(() => parseContentDate(input, 'bad.md')).toThrow(/bad\.md/)
  })
})

describe('formatters', () => {
  it('formats_year_month_and_full_date_in_utc', () => {
    expect(formatYearMonth(utc(2026, 4, 5))).toBe('2026-04')
    expect(formatDate(utc(2026, 4, 5))).toBe('2026-04-05')
  })
})

describe('getAllBlogPosts', () => {
  it('returns_posts_sorted_newest_first_with_tags_arrays', () => {
    const posts = getAllBlogPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date.getTime()).toBeGreaterThanOrEqual(posts[i].date.getTime())
    }
    for (const post of posts) {
      expect(post.slug).toBeTruthy()
      expect(post.frontmatter.title).toBeTruthy()
      expect(Array.isArray(post.frontmatter.tags)).toBe(true)
    }
  })
})

describe('getAllProjects', () => {
  it('returns_projects_sorted_newest_first', () => {
    const projects = getAllProjects()
    expect(projects.length).toBeGreaterThan(0)
    for (let i = 1; i < projects.length; i++) {
      expect(projects[i - 1].date.getTime()).toBeGreaterThanOrEqual(projects[i].date.getTime())
    }
  })
})

describe('getFeaturedProjects', () => {
  it('returns_the_four_featured_projects_in_order', () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual([
      'Portree',
      'PRViewer',
      'PrintableSpectrogram',
      'CodeAnnotator',
    ])
  })

  it('respects_the_limit', () => {
    expect(getFeaturedProjects(2)).toHaveLength(2)
  })
})

describe('projectLinks', () => {
  const base: ProjectFrontmatter = { title: 't', description: 'd', date: '2025-01-01', tags: [] }

  it('omits_empty_and_missing_urls', () => {
    expect(projectLinks({ ...base, githubUrl: '', liveUrl: '  ' })).toEqual([])
    expect(projectLinks(base)).toEqual([])
  })

  it('returns_code_then_live', () => {
    expect(projectLinks({ ...base, githubUrl: 'https://github.com/x', liveUrl: 'https://x.dev' })).toEqual([
      { label: 'Code', href: 'https://github.com/x' },
      { label: 'Live', href: 'https://x.dev' },
    ])
  })
})
