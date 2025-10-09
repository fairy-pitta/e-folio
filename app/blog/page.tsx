import { getAllBlogPosts, getAllTags } from "@/lib/content"
import BlogClient from "@/components/blog-client"
import ScrollToTop from "@/components/scroll-to-top"

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const tags = getAllTags()

  return (
    <ScrollToTop>
      <BlogClient initialPosts={posts} initialTags={tags} />
    </ScrollToTop>
  )
}
