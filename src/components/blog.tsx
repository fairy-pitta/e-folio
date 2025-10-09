"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, ArrowRightIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"

// 型定義を追加
export interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  coverImage: string
  readTime: string
  tags: string[]
}

export interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
}

interface BlogProps {
  posts: BlogPost[]
}

export default function Blog({ posts = [] }: BlogProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const isMobile = useMobile()

  // モバイル表示用に表示する記事数を制限
  const displayedPosts = isMobile ? posts.slice(0, 3) : posts

  // スクロール位置を監視して矢印の表示/非表示を制御
  useEffect(() => {
    if (isMobile) return // モバイルではスクロール監視不要

    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

        // 左端（最新の記事）にいるかどうか
        setCanScrollLeft(scrollLeft > 0)

        // 右端（最古の記事）にいるかどうか
        // 少しのマージンを考慮（1px）して、ほぼ右端に達したかを確認
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    // 初期チェック
    checkScroll()

    // スクロールイベントリスナーを追加
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll)

      // クリーンアップ関数
      return () => {
        scrollContainer.removeEventListener("scroll", checkScroll)
      }
    }
  }, [posts, isMobile]) // postsが変更されたときに再評価

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-sky-800">Latest Articles</h2>
          <p className="text-sky-600 max-w-2xl mx-auto">
            Thoughts, insights, and explorations at the intersection of environmental science and technology.
          </p>
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading articles...</p>
          </div>
        ) : isMobile ? (
          // モバイル表示: 縦に並べる
          <div className="grid grid-cols-1 gap-6">
            {displayedPosts.map((post) => (
              <motion.div
                key={post.slug}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="hover-card h-full flex flex-col bg-white/85 backdrop-blur-sm border-transparent">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.frontmatter.coverImage || "/placeholder.svg?height=400&width=600&query=nature blog"}
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
                    <a href={`/blog/${post.slug}`} className="hover:text-sky-600 transition-colors">
                      <h3 className="text-xl font-semibold mb-2">{post.frontmatter.title}</h3>
                    </a>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{post.frontmatter.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {post.frontmatter.tags.slice(0, 2).map((tag) => (
                        <a href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`} key={tag}>
                          <Badge variant="outline" className="hover:bg-sky-50 cursor-pointer">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        </a>
                      ))}
                      {post.frontmatter.tags.length > 2 && (
                        <Badge variant="outline">+{post.frontmatter.tags.length - 2}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button variant="ghost" className="p-0 h-auto text-sky-500 hover:text-sky-600" asChild>
                      <a href={`/blog/${post.slug}`}>
                        Read more <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          // デスクトップ表示: 横スクロールカルーセル
          <div className="relative px-12 md:px-16">
            {/* スクロールボタン - 左 */}
            {posts.length > 3 && canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            )}

            {/* 横スクロール可能なコンテナ */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {posts.map((post) => (
                <motion.div
                  key={post.slug}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex-shrink-0 w-full md:w-[350px] px-3 snap-start"
                >
                  <Card className="hover-card h-full flex flex-col bg-white/85 backdrop-blur-sm border-transparent">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={post.frontmatter.coverImage || "/placeholder.svg?height=400&width=600&query=nature blog"}
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
                      <a href={`/blog/${post.slug}`} className="hover:text-sky-600 transition-colors">
                        <h3 className="text-xl font-semibold mb-2">{post.frontmatter.title}</h3>
                      </a>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{post.frontmatter.excerpt}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {post.frontmatter.tags.slice(0, 2).map((tag) => (
                          <a href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`} key={tag}>
                            <Badge variant="outline" className="hover:bg-sky-50 cursor-pointer">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          </a>
                        ))}
                        {post.frontmatter.tags.length > 2 && (
                          <Badge variant="outline">+{post.frontmatter.tags.length - 2}</Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0">
                      <Button variant="ghost" className="p-0 h-auto text-sky-500 hover:text-sky-600" asChild>
                        <a href={`/blog/${post.slug}`}>
                          Read more <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* スクロールボタン - 右 */}
            {posts.length > 3 && canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            )}

            {/* スクロールインジケーター */}
            <div className="flex justify-center mt-6 gap-2">
              {posts.length > 0 &&
                Array.from({ length: Math.ceil(posts.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === 0 ? "bg-sky-500 w-4" : "bg-sky-200 hover:bg-sky-300"
                    }`}
                    onClick={() => {
                      if (scrollContainerRef.current) {
                        const containerWidth = scrollContainerRef.current.clientWidth
                        scrollContainerRef.current.scrollTo({
                          left: containerWidth * index,
                          behavior: "smooth",
                        })
                      }
                    }}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <a href="/blog">View All Articles</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
