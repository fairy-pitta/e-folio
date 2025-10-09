import Link from "next/link"
import { CalendarIcon, ClockIcon, ArrowLeftIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBlogPostsByTag, getAllTags } from "@/lib/content"
import ScrollToTop from "@/components/scroll-to-top"

export function generateMetadata({ params }: { params: { tag: string } }) {
  const tag = params.tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `Articles tagged with ${tag} | SingBirds`,
    description: `All articles related to ${tag}`,
  }
}

export function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: tag.toLowerCase().replace(/\s+/g, "-"),
  }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tagFormatted = params.tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const posts = getBlogPostsByTag(tagFormatted)

  return (
    <ScrollToTop>
      <div className="min-h-screen bg-background">
        {/* ナビバーの高さを考慮したパディング */}
        <div className="pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <Button variant="ghost" className="mb-6" asChild>
                <Link href="/blog">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Articles tagged with <span className="text-sky-600">"{tagFormatted}"</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mb-12">Browse all articles related to {tagFormatted}.</p>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">There are no articles with this tag yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/blog">View all articles</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Card key={post.slug} className="h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.frontmatter.coverImage || "/placeholder.svg"}
                          alt={post.frontmatter.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-6 flex-grow">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {post.frontmatter.date}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {post.frontmatter.readTime}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{post.frontmatter.title}</h2>
                        <p className="text-muted-foreground mb-4">{post.frontmatter.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {post.frontmatter.tags.map((postTag) => (
                            <Link href={`/blog/tag/${postTag.toLowerCase().replace(/\s+/g, "-")}`} key={postTag}>
                              <Badge
                                variant={postTag === tagFormatted ? "default" : "outline"}
                                className={`cursor-pointer ${postTag === tagFormatted ? "bg-sky-500" : "hover:bg-sky-50"}`}
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {postTag}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button variant="ghost" className="p-0 h-auto text-sky-500 hover:text-sky-600" asChild>
                          <Link href={`/blog/${post.slug}`}>Read more</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollToTop>
  )
}
