import type { BlogPost } from "./content"
import type { QiitaItem } from "./qiita"

export interface WritingItem {
  title: string
  href: string
  date: Date
  external: boolean
}

export function toWritingItems(posts: BlogPost[], qiita: QiitaItem[]): WritingItem[] {
  const own = posts.map((post) => ({
    title: post.frontmatter.title,
    href: `/blog/${post.slug}`,
    date: post.date,
    external: false,
  }))
  const external = qiita.map((item) => ({
    title: item.title,
    href: item.url,
    date: item.createdAt,
    external: true,
  }))
  return [...own, ...external].sort((a, b) => b.date.getTime() - a.date.getTime())
}
