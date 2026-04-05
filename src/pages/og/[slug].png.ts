import type { APIContext, GetStaticPaths } from 'astro'
import { getAllBlogPosts, getAllProjects } from '../../lib/content'
import { generateOgImage } from '../../lib/og-image'

export const getStaticPaths: GetStaticPaths = () => {
  const posts = getAllBlogPosts()
  const projects = getAllProjects()

  return [
    ...posts.map((post) => ({
      params: { slug: `blog-${post.slug}` },
      props: { title: post.frontmatter.title, tags: post.frontmatter.tags },
    })),
    ...projects.map((project) => ({
      params: { slug: `project-${project.slug}` },
      props: { title: project.frontmatter.title, tags: project.frontmatter.tags },
    })),
  ]
}

export async function GET({ props }: APIContext) {
  const png = await generateOgImage(props.title as string, props.tags as string[])

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
