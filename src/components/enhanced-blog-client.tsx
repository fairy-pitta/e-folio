"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading articles...</p>
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
          : "max-w-3xl mx-auto py-8"
      }
    >
      {error && (
        <div className="border border-destructive/30 rounded-sm p-4 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isHome && (
        <div className="mb-8">
          <h2 className="text-2xl font-mono-heading mb-2">Blog & Articles</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
        </div>
      )}

      {/* Language filter */}
      <div className="flex gap-4 mb-8">
        {(['japanese', 'english', 'both'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => { setLanguageFilter(lang); setCurrentPage(1) }}
            className={`text-xs font-mono uppercase tracking-wider transition-colors ${
              languageFilter === lang
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang === 'japanese' ? '日本語' : lang === 'english' ? 'English' : 'All'}
            {languageFilter === lang && (
              <span className="block w-full h-px bg-foreground mt-1"></span>
            )}
          </button>
        ))}
      </div>

      {/* Search (index only) */}
      {!isHome && (
        <div className="max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 rounded-sm text-sm"
            />
          </div>
        </div>
      )}

      {/* Tag filter (index only) */}
      {!isHome && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs font-mono px-2 py-1 border rounded-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="divide-y divide-border mb-8">
        {paginatedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No articles found</p>
          </div>
        ) : (
          paginatedArticles.map((article, index) => (
            <div
              key={`${article.type}-${article.slug}`}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <ArticleCard article={article} isHome={isHome} />
            </div>
          ))
        )}
      </div>

      {/* Home: link to all articles */}
      {isHome && (
        <div className="pt-4 border-t">
          <a
            href="/blog"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
            data-astro-prefetch
          >
            All articles &rarr;
          </a>
        </div>
      )}

      {/* Pagination */}
      {!isHome && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          <div className="flex gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`text-xs font-mono w-7 h-7 transition-colors ${
                  currentPage === page
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
