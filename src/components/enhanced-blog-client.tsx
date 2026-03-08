"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchQiitaArticles, type QiitaArticle, type QiitaTag } from "../lib/qiita"
import type { BlogPost } from "@/lib/content"
import ArticleCard, { type UnifiedArticle } from "./article-card"

type LanguageFilter = 'japanese' | 'english' | 'both'

interface EnhancedBlogClientProps {
  englishPosts: BlogPost[]
  mode?: 'home' | 'index'
}

export default function EnhancedBlogClient({ englishPosts = [], mode = 'index' }: EnhancedBlogClientProps) {
  const [qiitaArticles, setQiitaArticles] = useState<QiitaArticle[]>([])
  const [loading, setLoading] = useState(mode === 'home' ? false : true)
  const [error, setError] = useState<string | null>(null)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(mode === 'home' ? 'english' : 'both')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const isHome = mode === 'home'
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const postsPerPage = 5

  // Qiita記事を取得（ホームでは言語選択や可視時にのみフェッチ）
  useEffect(() => {
    if (isHome) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { rootMargin: '200px' }
      )
      if (containerRef.current) observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [isHome])

  useEffect(() => {
    const loadQiitaArticles = async () => {
      setLoading(true)
      const result = await fetchQiitaArticles()
      setQiitaArticles(result.articles)
      setError(result.error)
      setLoading(false)
    }

    if (isHome) {
      if ((languageFilter === 'japanese' || languageFilter === 'both') && inView) {
        loadQiitaArticles()
      }
    } else {
      loadQiitaArticles()
    }
  }, [isHome, languageFilter, inView])

  const getUnifiedArticles = (): UnifiedArticle[] => {
    const allArticles: UnifiedArticle[] = []

    if (languageFilter === 'english' || languageFilter === 'both') {
      englishPosts.forEach(post => {
        allArticles.push({
          type: 'blog',
          title: post.frontmatter.title,
          date: post.frontmatter.date,
          excerpt: post.frontmatter.excerpt,
          readTime: post.frontmatter.readTime,
          tags: post.frontmatter.tags,
          slug: post.slug,
          language: 'english',
          url: `/blog/${post.slug}`,
          coverImage: post.frontmatter.coverImage
        })
      })
    }

    if (languageFilter === 'japanese' || languageFilter === 'both') {
      qiitaArticles.forEach((article: QiitaArticle) => {
        allArticles.push({
          type: 'qiita',
          title: article.title,
          date: article.created_at,
          excerpt: `${article.title.substring(0, 100)}...`,
          readTime: '5分',
          tags: article.tags.map((tag: QiitaTag) => tag.name),
          slug: article.id,
          language: 'japanese',
          url: article.url,
          likes: article.likes_count
        })
      })
    }

    return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    englishPosts.forEach(post => {
      post.frontmatter.tags.forEach(tag => tagSet.add(tag))
    })
    qiitaArticles.forEach((article: QiitaArticle) => {
      article.tags.forEach((articleTag: QiitaTag) => tagSet.add(articleTag.name))
    })
    return Array.from(tagSet).sort()
  }, [englishPosts, qiitaArticles])

  const filteredArticles = useMemo(() => {
    let articles = getUnifiedArticles()

    if (searchQuery) {
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedTags.length > 0) {
      articles = articles.filter(article =>
        selectedTags.some(selectedTag => article.tags.includes(selectedTag))
      )
    }

    return articles
  }, [englishPosts, qiitaArticles, searchQuery, selectedTags, languageFilter])

  const totalPages = Math.ceil(filteredArticles.length / postsPerPage)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={
        isHome
          ? "container mx-auto px-4 py-8"
          : "mx-auto max-w-screen-2xl px-2 md:px-4 py-8"
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isHome && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Blog & Articles</h2>
      )}

      {/* 言語フィルター */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2">
          <Button variant={languageFilter === 'japanese' ? 'default' : 'outline'} size="sm" onClick={() => { setLanguageFilter('japanese'); setCurrentPage(1) }}>
            日本語
          </Button>
          <Button variant={languageFilter === 'english' ? 'default' : 'outline'} size="sm" onClick={() => { setLanguageFilter('english'); setCurrentPage(1) }}>
            English
          </Button>
          <Button variant={languageFilter === 'both' ? 'default' : 'outline'} size="sm" onClick={() => { setLanguageFilter('both'); setCurrentPage(1) }}>
            All
          </Button>
        </div>
      </div>

      {/* 検索バー（一覧のみ） */}
      {!isHome && (
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* タグフィルター（一覧のみ） */}
      {!isHome && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 記事一覧 */}
      <div className="space-y-6 mb-8">
        {paginatedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">該当する記事が見つかりませんでした</p>
          </div>
        ) : (
          paginatedArticles.map((article, index) => (
            <div
              key={`${article.type}-${article.slug}`}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ArticleCard article={article} isHome={isHome} />
            </div>
          ))
        )}
      </div>

      {/* ホーム用: 全記事へのリンク */}
      {isHome && (
        <div className="flex justify-center mb-8">
          <Button asChild className="bg-black text-white hover:bg-white hover:text-black border border-black transition-colors">
            <a href="/blog" data-astro-prefetch>View all articles</a>
          </Button>
        </div>
      )}

      {/* ページネーション */}
      {!isHome && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
