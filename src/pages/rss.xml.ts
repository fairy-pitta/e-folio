import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllBlogPosts } from '../lib/content'
import { cv } from '../data/cv'

export function GET(context: APIContext) {
  return rss({
    title: `${cv.name} — Writing`,
    description: `Notes on software engineering by ${cv.name}.`,
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
