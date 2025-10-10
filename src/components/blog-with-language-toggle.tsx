"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, TagIcon, ExternalLinkIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"

// 型定義
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

export interface QiitaArticle {
  id: string
  title: string
  url: string
  created_at: string
  likes_count: number
  tags: Array<{ name: string }>
  user: {
    id: string
    profile_image_url: string
  }
}

interface BlogWithLanguageToggleProps {
  englishPosts: BlogPost[]
  qiitaArticles: QiitaArticle[]
}

type LanguageFilter = 'japanese' | 'english' | 'both'

export default function BlogWithLanguageToggle({ 
  englishPosts = [], 
  qiitaArticles = [] 
}: BlogWithLanguageToggleProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('both')
  const isMobile = useMobile()

  // 記事の型定義
  interface FilteredArticle {
    type: 'blog' | 'qiita'
    title: string
    date: string
    excerpt: string
    readTime: string
    tags: string[]
    slug: string
    language: 'english' | 'japanese'
    url: string
    likes?: number
  }

  // 言語フィルターに基づいて記事をフィルタリング
  const getFilteredArticles = (): FilteredArticle[] => {
    const allArticles: FilteredArticle[] = []

    // 英語記事を追加
    if (languageFilter === 'english' || languageFilter === 'both') {
      englishPosts.forEach(post => {
        allArticles.push({
          type: 'blog' as const,
          title: post.frontmatter.title,
          date: post.frontmatter.date,
          excerpt: post.frontmatter.excerpt,
          readTime: post.frontmatter.readTime,
          tags: post.frontmatter.tags,
          slug: post.slug,
          language: 'english' as const,
          url: `/blog/${post.slug}`
        })
      })
    }

    // Qiita記事（日本語）を追加
    if (languageFilter === 'japanese' || languageFilter === 'both') {
      qiitaArticles.forEach(article => {
        allArticles.push({
          type: 'qiita' as const,
          title: article.title,
          date: new Date(article.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          excerpt: `Qiita記事 - ${article.likes_count} いいね`,
          readTime: '',
          tags: article.tags.map(tag => tag.name),
          slug: article.id,
          language: 'japanese' as const,
          url: article.url,
          likes: article.likes_count
        })
      })
    }

    // 日付でソート（新しい順）
    return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredArticles = getFilteredArticles()
  const displayedArticles = filteredArticles

  // スクロール位置を監視
  useEffect(() => {
    if (isMobile) return

    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [isMobile, filteredArticles])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Blog & Articles
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Technical insights and research findings in bioacoustics and software engineering
          </p>

          {/* 言語切り替えボタン */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={languageFilter === 'japanese' ? 'default' : 'outline'}
              onClick={() => setLanguageFilter('japanese')}
              className="px-4 py-2"
            >
              日本語
            </Button>
            <Button
              variant={languageFilter === 'english' ? 'default' : 'outline'}
              onClick={() => setLanguageFilter('english')}
              className="px-4 py-2"
            >
              English
            </Button>
            <Button
              variant={languageFilter === 'both' ? 'default' : 'outline'}
              onClick={() => setLanguageFilter('both')}
              className="px-4 py-2"
            >
              Both
            </Button>
          </div>
        </motion.div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found for the selected language.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedArticles.map((article, index) => (
              <motion.div
                key={`${article.type}-${article.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {article.type === 'qiita' && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                            Qiita
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(article.date)}</span>
                        </div>
                        {article.readTime && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                        )}
                        {article.type === 'qiita' && article.likes !== undefined && (
                          <div className="flex items-center gap-1">
                            <span>❤️ {article.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-sky-600 transition-colors">
                      {article.type === 'qiita' ? (
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          {article.title}
                          <ExternalLinkIcon className="h-4 w-4 ml-2 flex-shrink-0" />
                        </a>
                      ) : (
                        <a href={article.url}>
                          {article.title}
                        </a>
                      )}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 5).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}