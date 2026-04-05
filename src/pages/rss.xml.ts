import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllBlogPosts } from '../lib/content'

export function GET(context: APIContext) {
  const posts = getAllBlogPosts()

  return rss({
    title: 'Fairy Pitta Blog',
    description: 'Articles on bioacoustics, education technology, and software engineering.',
    site: context.site!.toString(),
    items: posts.map((post) => ({
      title: post.frontmatter.title,
      pubDate: new Date(post.frontmatter.date),
      description: post.frontmatter.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.frontmatter.tags,
    })),
    customData: '<language>en</language>',
  })
}
