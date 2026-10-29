import { describe, it, expect } from 'vitest'
import {
  parseContentDate,
  formatYearMonth,
  formatDate,
  getAllBlogPosts,
  getAllProjects,
  formatCatalogueNumber,
  formatMonthYear,
  projectStatus,
  projectLinks,
  type ProjectFrontmatter,
} from './content'
import { findForbidden } from './public-safety'

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
  it('leaves_out_drafts_by_default', () => {
    for (const post of getAllBlogPosts()) {
      expect(post.frontmatter.draft).not.toBe(true)
    }
  })

  it('includes_drafts_when_asked', () => {
    const all = getAllBlogPosts({ includeDrafts: true })
    expect(all.length).toBeGreaterThan(getAllBlogPosts().length)
  })

  it('returns_posts_sorted_newest_first_with_tags_arrays', () => {
    const posts = getAllBlogPosts({ includeDrafts: true })
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

describe('project catalogue', () => {
  it('test_number_projects_by_date_gives_oldest_number_one', () => {
    const projects = getAllProjects()
    expect(projects.map((p) => p.number)).toEqual(projects.map((_, i) => projects.length - i))
    expect(projects.at(-1)?.slug).toBe('SGBirdCall')
  })

  it('test_read_projects_returns_stack_and_one_line_highlight_for_each', () => {
    for (const project of getAllProjects()) {
      expect(project.frontmatter.stack?.trim(), project.slug).toBeTruthy()
      expect(project.frontmatter.highlight?.trim(), project.slug).toBeTruthy()
      expect(project.frontmatter.highlight!.length, project.slug).toBeLessThanOrEqual(80)
    }
  })

  it('test_format_catalogue_number_pads_to_three_digits', () => {
    expect(formatCatalogueNumber(7)).toBe('007')
    expect(formatCatalogueNumber(123)).toBe('123')
  })

  it('test_format_month_year_returns_short_month_and_year_in_utc', () => {
    expect(formatMonthYear(utc(2026, 2, 6))).toBe('Feb 2026')
  })

  it.each([
    [{ liveUrl: 'https://example.com', githubUrl: 'https://github.com/x/y' }, 'LIVE'],
    [{ liveUrl: ' ', githubUrl: 'https://github.com/x/y' }, 'OSS'],
    [{ liveUrl: '', githubUrl: '' }, 'ARCHIVED'],
    [{ packageUrl: 'https://www.npmjs.com/package/x', githubUrl: 'https://github.com/x/y' }, 'OSS'],
  ])('test_derive_status_from_links_%#_returns_stamp', (links, expected) => {
    const frontmatter = { title: 't', description: 'd', date: '2026-01-01', tags: [], ...links } as ProjectFrontmatter
    expect(projectStatus(frontmatter)).toBe(expected)
  })
})

describe('projectLinks', () => {
  const base: ProjectFrontmatter = { title: 't', description: 'd', date: '2025-01-01', tags: [] }

  it('test_build_links_with_every_url_returns_live_code_package_then_article', () => {
    expect(
      projectLinks({
        ...base,
        githubUrl: 'https://github.com/x',
        liveUrl: 'https://x.dev',
        packageUrl: 'https://www.npmjs.com/package/x',
        articleUrl: 'https://qiita.com/x/items/1',
        articleLabel: 'Article on Qiita (Japanese)',
      }),
    ).toEqual([
      { kind: 'live', label: 'Try the live demo', href: 'https://x.dev' },
      { kind: 'code', label: 'Source code', href: 'https://github.com/x' },
      { kind: 'package', label: 'Package on npm', href: 'https://www.npmjs.com/package/x' },
      { kind: 'article', label: 'Article on Qiita (Japanese)', href: 'https://qiita.com/x/items/1' },
    ])
  })

  it('test_build_links_with_article_url_but_no_label_uses_article', () => {
    expect(projectLinks({ ...base, articleUrl: 'https://example.com/post' })).toEqual([
      { kind: 'article', label: 'Article', href: 'https://example.com/post' },
    ])
  })

  it('test_build_links_with_empty_or_missing_urls_returns_nothing', () => {
    expect(projectLinks({ ...base, githubUrl: '', liveUrl: '  ' })).toEqual([])
    expect(projectLinks(base)).toEqual([])
  })
})

describe('project content', () => {
  it('test_read_projects_excludes_withdrawn_ocr_vfs', () => {
    expect(getAllProjects().map((project) => project.slug)).not.toContain('OcrVfs')
  })

  it('test_read_project_files_contains_no_forbidden_strings', () => {
    for (const project of getAllProjects()) {
      const text = JSON.stringify(project.frontmatter) + project.content
      expect(findForbidden(text), project.slug).toEqual([])
    }
  })

  it('test_read_bird_map_frontmatter_returns_demo_and_repo_and_fixed_typo', () => {
    const map = getAllProjects().find((project) => project.slug === 'SBBirdMap')!
    expect(map.frontmatter.githubUrl).toBe('https://github.com/fairy-pitta/SGBirdMap')
    expect(map.frontmatter.liveUrl).toBe('https://sgbirdsmap.fairy-pitta.net')
    expect(map.frontmatter.description).not.toContain('interative')
  })

  it('test_read_portree_frontmatter_returns_qiita_article_link', () => {
    const portree = getAllProjects().find((project) => project.slug === 'Portree')!
    expect(portree.frontmatter.articleUrl).toBe('https://qiita.com/Pitta/items/4a6537a3450aa6f8f050')
    expect(portree.frontmatter.articleLabel).toBe('Article on Qiita (Japanese)')
  })

  it('test_read_project_content_contains_no_test_counts', () => {
    for (const project of getAllProjects()) {
      expect(project.content, project.slug).not.toMatch(/\b\d+\s+(\[[^\]]+\]\([^)]+\)\s+)?tests\b/i)
    }
  })
})
