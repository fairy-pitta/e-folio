import type { APIContext, GetStaticPaths } from 'astro'
import { getAllBlogPosts, getAllProjects, getJobWork } from '../../lib/collections'
import { generateOgImage } from '../../lib/og-image'

export const getStaticPaths: GetStaticPaths = async () => [
  ...(await getAllBlogPosts()).map((post) => ({
    params: { slug: `blog-${post.slug}` },
    props: { title: post.data.title },
  })),
  ...(await getJobWork()).map((project) => ({
    params: { slug: `work-${project.id}` },
    props: { title: project.data.title },
  })),
  ...(await getAllProjects()).map((project) => ({
    params: { slug: `project-${project.slug}` },
    props: { title: project.data.title },
  })),
]

export async function GET({ props }: APIContext) {
  const png = await generateOgImage(props.title as string)

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
