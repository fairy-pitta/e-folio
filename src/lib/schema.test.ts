import { describe, it, expect } from 'vitest'
import matter from 'gray-matter'
import { blogSchema, workSchema } from './schema'
import { readContentFiles } from './content-files'

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))

describe('every content file', () => {
  it.each(readContentFiles('work').map((file) => [file.id, file] as const))(
    'test_validate_work_file_%s_against_schema_succeeds',
    (_id, file) => {
      const result = workSchema.safeParse(matter(file.text).data)
      expect(result.success ? [] : result.error.issues).toEqual([])
    },
  )

  it.each(readContentFiles('blog').map((file) => [file.id, file] as const))(
    'test_validate_blog_file_%s_against_schema_succeeds',
    (_id, file) => {
      const result = blogSchema.safeParse(matter(file.text).data)
      expect(result.success ? [] : result.error.issues).toEqual([])
    },
  )
})

const personal = {
  kind: 'personal',
  title: 'Thing',
  summary: 'Does a thing.',
  highlight: 'One line',
  date: '6 Feb, 2026',
  media: { cover: '/og-default.png' },
  links: { code: 'https://github.com/x/y' },
}

const client = {
  kind: 'client',
  title: 'Platform',
  summary: 'A platform.',
  highlight: 'One line',
  tags: ['Vue'],
  job: 'lead-engineer',
  roleLabel: 'Lead',
  order: 1,
  case: { problem: 'p', role: 'r', decisions: ['d'], outcome: 'o' },
}

describe('workSchema', () => {
  it.each([
    ['6 Feb, 2026', utc(2026, 2, 6)],
    ['Oct 13, 2025', utc(2025, 10, 13)],
    ['April 5, 2026', utc(2026, 4, 5)],
    ['2025-05-18', utc(2025, 5, 18)],
    [new Date('2025-05-18T00:00:00Z'), utc(2025, 5, 18)],
  ])('test_parse_personal_date_%s_returns_utc_day', (date, expected) => {
    const data = workSchema.parse({ ...personal, date })
    expect(data.kind === 'personal' && data.date.getTime()).toBe(expected.getTime())
  })

  it('test_parse_personal_fills_defaults_for_tags_gallery_and_links', () => {
    const data = workSchema.parse({ kind: 'personal', title: 't', summary: 's', highlight: 'h', date: '2025-01-01' })
    expect(data).toMatchObject({ tags: [], media: { gallery: [] }, links: {} })
  })

  it.each([
    ['an unreadable date', { ...personal, date: 'Feb 30, 2026' }],
    ['a missing media file', { ...personal, media: { cover: '/projects/nope/missing.webp' } }],
    ['a relative media path', { ...personal, media: { gallery: ['shot.webp'] } }],
    ['an unknown key', { ...personal, liveUrl: 'https://x.dev' }],
    ['an article without a label', { ...personal, links: { article: { url: 'https://x.dev' } } }],
    ['a highlight over 80 characters', { ...personal, highlight: 'x'.repeat(81) }],
    ['an unknown kind', { ...personal, kind: 'side' }],
  ])('test_parse_personal_with_%s_fails', (_label, data) => {
    expect(workSchema.safeParse(data).success).toBe(false)
  })

  it('test_parse_client_and_internal_succeed', () => {
    expect(workSchema.parse(client).kind).toBe('client')
    expect(workSchema.parse({ ...client, kind: 'internal' }).kind).toBe('internal')
  })

  it.each([
    ['no case study', { ...client, case: undefined }],
    ['an empty decision list', { ...client, case: { ...client.case, decisions: [] } }],
    ['links', { ...client, links: { live: 'https://x.dev' } }],
    ['media', { ...client, media: { gallery: [] } }],
    ['an unknown job', { ...client, job: 'astronaut' }],
    ['no order', { ...client, order: undefined }],
  ])('test_parse_client_with_%s_fails', (_label, data) => {
    expect(workSchema.safeParse(data).success).toBe(false)
  })
})

describe('blogSchema', () => {
  it('test_parse_post_allows_a_generated_og_cover_and_defaults_tags', () => {
    const data = blogSchema.parse({ title: 't', date: 'April 1, 2026', excerpt: 'e', coverImage: '/og/blog-x.png' })
    expect(data.tags).toEqual([])
    expect(data.date.getTime()).toBe(utc(2026, 4, 1).getTime())
  })

  it('test_parse_post_with_unknown_key_fails', () => {
    expect(blogSchema.safeParse({ title: 't', date: '2026-04-01', excerpt: 'e', author: 'x' }).success).toBe(false)
  })
})
