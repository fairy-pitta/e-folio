"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ClockIcon, TagIcon, SearchIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import BlogNewsletter from "@/components/blog-newsletter"
import type { BlogPost } from "./blog"

interface BlogClientProps {
  initialPosts: BlogPost[]
  initialTags: string[]
}

export default function BlogClient({ initialPosts, initialTags }: BlogClientProps) {
  const [posts] = useState(initialPosts)
  const [tags] = useState(initialTags)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 12

  // Toggle tag selection/deselection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
    // タグが変更されたら最初のページに戻す
    setCurrentPage(1)
  }

  // Filter posts by search query and tags
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.frontmatter.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => post.frontmatter.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  // ページネーション用の計算
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  // ページ変更ハンドラー
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 検索クエリが変更されたら最初のページに戻す
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      {/* ナビバーの高さを考慮したヒーローセクション */}
      <div className="pt-14 md:pt-16">
        <div className="relative overflow-hidden">
          {/* 鳥の背景画像を更新 */}
          <div className="absolute inset-0 z-0">
            <img src="/article_hero.webp" alt="Bird perched on grass" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            {/* ヘッダー部分の背景グラデーションを緑色に調整 */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-800/70 via-green-700/60 to-green-600/50"></div>
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Blog</h1>
                  <p className="text-green-100 max-w-xl">
                    Thoughts and discoveries at the intersection of environmental science and technology.
                  </p>
                </div>

                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-200 h-4 w-4 z-10" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-10 py-2 text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-green-200 rounded-md w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-200 hover:text-white"
                      onClick={() => setSearchQuery("")}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium py-1">Filter by tags:</span>
              {tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-green-500" : "hover:bg-green-50"}`}
                  onClick={() => toggleTag(tag)}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedTags([])}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.frontmatter.coverImage || "/placeholder.svg"}
                          alt={post.frontmatter.title}
                          loading="lazy"
                          decoding="async"
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
                        <a href={`/blog/${post.slug}`} className="hover:text-green-600 transition-colors">
                          <h2 className="text-xl font-semibold mb-2">{post.frontmatter.title}</h2>
                        </a>
                        <p className="text-muted-foreground mb-4">{post.frontmatter.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {post.frontmatter.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "outline"}
                              className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-green-500" : "hover:bg-green-50"}`}
                              onClick={() => toggleTag(tag)}
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        <a href={`/blog/${post.slug}`} className="text-green-500 hover:text-green-600">
                          Read more
                        </a>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-green-200 text-green-600"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <Button
                          key={number}
                          variant={currentPage === number ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(number)}
                          className={currentPage === number ? "bg-green-500" : "border-green-200 text-green-600"}
                        >
                          {number}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-green-200 text-green-600"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Newsletter Section */}
          <div className="mt-16">
            <BlogNewsletter />
          </div>
        </div>
      </div>
    </div>
  )
}
