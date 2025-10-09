import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getBlogPost, getAllBlogSlugs } from "@/lib/content"
import { markdownToHtml } from "@/lib/markdown"
import BlogNewsletter from "@/components/blog-newsletter"
import ScrollToTop from "@/components/scroll-to-top"

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Article Not Found | SingBirds",
      description: "The article you're looking for could not be found.",
    }
  }

  return {
    title: `${post.frontmatter.title} | SingBirds`,
    description: post.frontmatter.excerpt,
  }
}

export function generateStaticParams() {
  return getAllBlogSlugs()
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = params
  const post = await getBlogPost(slug)

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Article Not Found</h1>
          <p>The article you're looking for doesn't exist or may have been moved.</p>
          <Button asChild className="mt-4">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  const contentHtml = await markdownToHtml(post.content)

  return (
    <ScrollToTop>
      <div className="min-h-screen bg-background">
        {/* ナビバーの高さを考慮したパディング */}
        <div className="pt-14 md:pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <Button variant="ghost" className="mb-6" asChild>
                <Link href="/blog">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.frontmatter.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {post.frontmatter.date}
                </span>
                <span className="flex items-center text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {post.frontmatter.readTime}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {post.frontmatter.tags.map((tag: string) => (
                  <Link href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`} key={tag}>
                    <Badge variant="outline" className="hover:bg-sky-50 cursor-pointer">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="mb-8">
                <img
                  src={post.frontmatter.coverImage || "/placeholder.svg"}
                  alt={post.frontmatter.title}
                  className="w-full rounded-lg"
                />
              </div>

              <div className="prose prose-sky prose-img:rounded-xl prose-headings:scroll-mt-8 prose-a:text-sky-600 max-w-none sm:prose-lg" dangerouslySetInnerHTML={{ __html: contentHtml }} />

              <div className="my-12">
                <BlogNewsletter />
              </div>

            </div>
          </div>
        </div>
      </div>
    </ScrollToTop>
  )
}
