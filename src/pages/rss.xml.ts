import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllBlogPosts } from '../lib/collections'
import { cv } from '../data/cv'

export async function GET(context: APIContext) {
  return rss({
    title: `${cv.name} — Writing`,
    description: `Notes on software engineering by ${cv.name}.`,
    site: context.site!.toString(),
    items: (await getAllBlogPosts()).map((post) => ({
      title: post.data.title,
      pubDate: post.date,
      description: post.data.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: '<language>en</language>',
  })
}
