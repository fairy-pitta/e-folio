import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllBlogPosts } from '../lib/content'

export function GET(context: APIContext) {
  return rss({
    title: 'Shuna Maekawa — Writing',
    description: 'Notes on software engineering by Shuna Maekawa.',
    site: context.site!.toString(),
    items: getAllBlogPosts().map((post) => ({
      title: post.frontmatter.title,
      pubDate: post.date,
      description: post.frontmatter.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.frontmatter.tags,
    })),
    customData: '<language>en</language>',
  })
}
