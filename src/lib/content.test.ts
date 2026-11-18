import { describe, it, expect } from 'vitest'
import {
  parseContentDate,
  jobWhen,
  formatYearMonth,
  formatDate,
  formatCatalogueNumber,
  formatMonthYear,
  projectStatus,
  statusLabel,
  projectLinks,
  folderName,
  runsInTerminal,
  screenTitle,
  toBlogPosts,
  toProjects,
  type ContentEntry,
} from './content'
import { findForbidden } from './public-safety'
import { readBlogPosts, readContentFiles, readProjects } from './content-files'
import type { PersonalWorkData } from './schema'

// The same files and the same builders the pages use, read from disk.
const getAllBlogPosts = readBlogPosts
const getAllProjects = readProjects

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
      expect(post.data.draft).not.toBe(true)
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
      expect(post.data.title).toBeTruthy()
      expect(Array.isArray(post.data.tags)).toBe(true)
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
      expect(project.data.stack?.trim(), project.slug).toBeTruthy()
      expect(project.data.highlight.trim(), project.slug).toBeTruthy()
      expect(project.data.highlight.length, project.slug).toBeLessThanOrEqual(80)
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
    [{ live: 'https://example.com', code: 'https://github.com/x/y' }, 'LIVE'],
    [{ code: 'https://github.com/x/y' }, 'OSS'],
    [{}, 'ARCHIVED'],
    [{ package: 'https://www.npmjs.com/package/x', code: 'https://github.com/x/y' }, 'OSS'],
  ])('test_derive_status_from_links_%#_returns_stamp', (links, expected) => {
    expect(projectStatus(links)).toBe(expected)
  })

  it.each([
    ['LIVE', 'Live'],
    ['OSS', 'Open source'],
    ['ARCHIVED', 'Archived'],
  ] as const)('test_label_status_%s_returns_sentence_case_%s', (status, label) => {
    expect(statusLabel(status)).toBe(label)
  })
})

describe('projectLinks', () => {
  it('test_build_links_with_every_url_returns_live_code_package_then_article', () => {
    expect(
      projectLinks({
        code: 'https://github.com/x',
        live: 'https://x.dev',
        package: 'https://www.npmjs.com/package/x',
        article: { url: 'https://qiita.com/x/items/1', label: 'Article on Qiita (Japanese)' },
      }),
    ).toEqual([
      { kind: 'live', label: 'Try the live demo', href: 'https://x.dev' },
      { kind: 'code', label: 'Source code', href: 'https://github.com/x' },
      { kind: 'package', label: 'Package on npm', href: 'https://www.npmjs.com/package/x' },
      { kind: 'article', label: 'Article on Qiita (Japanese)', href: 'https://qiita.com/x/items/1' },
    ])
  })

  it('test_build_links_with_no_urls_returns_nothing', () => {
    expect(projectLinks({})).toEqual([])
  })
})

describe('project content', () => {
  it('test_read_projects_excludes_withdrawn_ocr_vfs', () => {
    expect(getAllProjects().map((project) => project.slug)).not.toContain('OcrVfs')
  })

  it('test_read_work_files_contains_no_forbidden_strings', () => {
    // Every file under content/work, personal or from the job, as written:
    // front matter and body. Labels are numbered, so a failure names no term.
    const files = readContentFiles('work')
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      expect(findForbidden(file.text), file.id).toEqual([])
    }
  })

  it('test_read_bird_map_frontmatter_returns_demo_and_repo_and_fixed_typo', () => {
    const map = getAllProjects().find((project) => project.slug === 'SBBirdMap')!
    expect(map.data.links.code).toBe('https://github.com/fairy-pitta/SGBirdMap')
    expect(map.data.links.live).toBe('https://sgbirdsmap.fairy-pitta.net')
    expect(map.data.summary).not.toContain('interative')
  })

  it('test_read_portree_frontmatter_returns_qiita_article_link', () => {
    const portree = getAllProjects().find((project) => project.slug === 'Portree')!
    expect(portree.data.links.article).toEqual({
      url: 'https://qiita.com/Pitta/items/4a6537a3450aa6f8f050',
      label: 'Article on Qiita (Japanese)',
    })
  })

  it('test_read_project_content_contains_no_test_counts', () => {
    for (const project of getAllProjects()) {
      expect(project.content, project.slug).not.toMatch(/\b\d+\s+(\[[^\]]+\]\([^)]+\)\s+)?tests\b/i)
    }
  })
})

describe('folderName', () => {
  it('splits_camel_case_and_acronyms_into_lowercase_words', () => {
    expect(folderName('CCAccountSwitcher')).toBe('cc-account-switcher')
    expect(folderName('SBBirdMap')).toBe('sb-bird-map')
    expect(folderName('PseudocodeConverter')).toBe('pseudocode-converter')
    expect(folderName('Portree')).toBe('portree')
  })
})

describe('runsInTerminal', () => {
  it('is_true_only_for_stacks_that_start_with_terminal', () => {
    expect(runsInTerminal({ stack: 'Terminal · Go' })).toBe(true)
    expect(runsInTerminal({ stack: 'Browser · Next.js' })).toBe(false)
    expect(runsInTerminal({ stack: 'Browser · runs a terminal emulator' })).toBe(false)
    expect(runsInTerminal({})).toBe(false)
  })
})

describe('screenTitle', () => {
  it('names_the_shell_for_terminal_tools_and_the_address_for_web_apps', () => {
    expect(screenTitle('Portree', { stack: 'Terminal · Go' })).toBe('zsh — portree')
    expect(screenTitle('GameOfLife', { stack: 'Browser', links: { live: 'https://fairy-pitta.github.io/Game-Of-Life/' } })).toBe(
      'fairy-pitta.github.io/Game-Of-Life',
    )
    expect(screenTitle('HotspotMap', { stack: 'Browser' })).toBe('hotspot-map')
  })
})

describe('toProjects and toBlogPosts', () => {
  const work = (id: string, date: string, kind: 'personal' | 'client' = 'personal') =>
    ({ id, data: { kind, date: new Date(date) } as PersonalWorkData, body: `# ${id}` }) as ContentEntry<PersonalWorkData>

  it('test_build_projects_with_equal_dates_orders_them_by_file_name', () => {
    const projects = toProjects([work('Zeta', '2025-10-13'), work('Alpha', '2025-10-13'), work('New', '2026-01-01')])
    expect(projects.map((project) => [project.slug, project.number])).toEqual([
      ['New', 3],
      ['Alpha', 2],
      ['Zeta', 1],
    ])
  })

  it('test_build_projects_leaves_out_work_from_the_job_and_keeps_the_body', () => {
    const projects = toProjects([work('Mine', '2025-01-01'), work('job-thing', '2026-01-01', 'client')])
    expect(projects.map((project) => project.slug)).toEqual(['Mine'])
    expect(projects[0].content).toBe('# Mine')
  })

  it('test_build_posts_leaves_out_drafts_unless_asked', () => {
    const entry = (id: string, draft?: boolean) => ({
      id,
      data: { title: id, date: new Date('2026-01-01'), excerpt: 'x', tags: [], draft },
      body: '',
    })
    expect(toBlogPosts([entry('a'), entry('b', true)]).map((post) => post.slug)).toEqual(['a'])
    expect(toBlogPosts([entry('a'), entry('b', true)], { includeDrafts: true })).toHaveLength(2)
  })
})

describe('jobWhen', () => {
  it('test_format_current_job_period_returns_since_start', () => {
    expect(jobWhen('Dec 2023 – Present')).toBe('Current job, since Dec 2023')
  })

  it('test_format_past_job_period_returns_the_period', () => {
    expect(jobWhen('May 2022 – Apr 2023')).toBe('During the job, May 2022 – Apr 2023')
  })
})
