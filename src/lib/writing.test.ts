import { describe, it, expect } from 'vitest'
import { toWritingItems } from './writing'
import type { BlogPost } from './content'

const post = (slug: string, iso: string): BlogPost => ({
  slug,
  frontmatter: { title: `Post ${slug}`, date: iso, excerpt: '', tags: [] },
  content: '',
  date: new Date(`${iso}T00:00:00Z`),
})

describe('toWritingItems', () => {
  it('merges_own_posts_and_qiita_newest_first', () => {
    const items = toWritingItems(
      [post('old', '2025-01-01'), post('new', '2026-04-01')],
      [{ title: 'Q', url: 'https://qiita.com/Pitta/items/q', createdAt: new Date('2025-06-01T00:00:00Z') }],
    )

    expect(items).toEqual([
      { title: 'Post new', href: '/blog/new', date: new Date('2026-04-01T00:00:00Z'), external: false },
      { title: 'Q', href: 'https://qiita.com/Pitta/items/q', date: new Date('2025-06-01T00:00:00Z'), external: true },
      { title: 'Post old', href: '/blog/old', date: new Date('2025-01-01T00:00:00Z'), external: false },
    ])
  })

  it('works_with_no_qiita_items', () => {
    expect(toWritingItems([post('a', '2025-01-01')], [])).toHaveLength(1)
  })
})
