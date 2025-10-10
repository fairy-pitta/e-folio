"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLinkIcon, Heart, Search, Calendar, User, ChevronLeft, ChevronRight, X, Tag } from "lucide-react"
import { fetchQiitaArticles, QiitaArticle } from "../lib/qiita"

interface BlogPost {
  slug: string
  frontmatter: {
    title: string
    date: string
    excerpt: string
    coverImage: string
    readTime: string
    tags: string[]
  }
}

interface UnifiedArticle {
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
  coverImage?: string
}

type LanguageFilter = 'japanese' | 'english' | 'both'

interface EnhancedBlogClientProps {
  englishPosts: BlogPost[]
  mode?: 'home' | 'index'
}

export default function EnhancedBlogClient({ englishPosts = [], mode = 'index' }: EnhancedBlogClientProps) {
  const [qiitaArticles, setQiitaArticles] = useState<QiitaArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('both')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const isHome = mode === 'home'
  const postsPerPage = 5
  const showPagination = !isHome
  const showImages = isHome

  // Qiita記事を取得
  useEffect(() => {
    const loadQiitaArticles = async () => {
      setLoading(true)
      const result = await fetchQiitaArticles()
      setQiitaArticles(result.articles)
      setError(result.error)
      setLoading(false)
    }
    
    loadQiitaArticles()
  }, [])

  // 統合記事リストを作成
  const getUnifiedArticles = (): UnifiedArticle[] => {
    const allArticles: UnifiedArticle[] = []

    // 英語記事を追加
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

    // Qiita記事（日本語）を追加
    if (languageFilter === 'japanese' || languageFilter === 'both') {
      qiitaArticles.forEach((article: QiitaArticle) => {
        allArticles.push({
          type: 'qiita',
          title: article.title,
          date: article.created_at,
          excerpt: `${article.title.substring(0, 100)}...`,
          readTime: '5分',
          tags: article.tags.map((tag: any) => tag.name),
          slug: article.id,
          language: 'japanese',
          url: article.url,
          likes: article.likes_count
        })
      })
    }

    // 日付順でソート（新しい順）
    return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // 全タグを取得
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    
    englishPosts.forEach(post => {
      post.frontmatter.tags.forEach(tag => tagSet.add(tag))
    })
    
    qiitaArticles.forEach((article: QiitaArticle) => {
      article.tags.forEach((articleTag: any) => tagSet.add(articleTag.name))
    })
    
    return Array.from(tagSet).sort()
  }, [englishPosts, qiitaArticles])

  // フィルタリングされた記事を取得
  const filteredArticles = useMemo(() => {
    let articles = getUnifiedArticles()

    // 検索クエリでフィルタリング
    if (searchQuery) {
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // タグでフィルタリング
    if (selectedTags.length > 0) {
      articles = articles.filter(article =>
        selectedTags.some(selectedTag => article.tags.includes(selectedTag))
      )
    }

    return articles
  }, [englishPosts, qiitaArticles, searchQuery, selectedTags, languageFilter])

  // ページネーション
  const totalPages = Math.ceil(filteredArticles.length / postsPerPage)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  // タグの選択/解除
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(1)
  }

  // 検索とフィルタのリセット
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">記事を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー削除（要望により非表示） */}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 言語フィルター */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['both', 'japanese', 'english'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setLanguageFilter(filter)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                languageFilter === filter
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter === 'both' ? '全て' : filter === 'japanese' ? '日本語' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* 検索バー */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="記事を検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* タグフィルター */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {allTags.slice(0, 20).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className="cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        {(searchQuery || selectedTags.length > 0) && (
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              フィルターをクリア
            </Button>
          </div>
        )}
      </div>

      {/* 記事一覧 */}
      <div className="space-y-6 mb-8">
        {paginatedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">該当する記事が見つかりませんでした</p>
          </div>
        ) : (
          paginatedArticles.map((article, index) => (
            <motion.div
              key={`${article.type}-${article.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {showImages && article.coverImage && (
                      <div className="md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={article.type === 'blog' ? 'default' : 'secondary'}>
                          {article.type === 'blog' ? 'Blog' : 'Qiita'}
                        </Badge>
                        <Badge variant="outline">
                          {article.language === 'english' ? 'EN' : 'JP'}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                        <a
                          href={article.url}
                          target={article.type === 'qiita' ? '_blank' : '_self'}
                          rel={article.type === 'qiita' ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2"
                        >
                          {article.title}
                          {article.type === 'qiita' && <ExternalLinkIcon className="h-4 w-4" />}
                        </a>
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.date).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.readTime}
                        </div>
                        {article.likes !== undefined && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {article.likes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* ホーム用: 全記事へのリンク */}
      {isHome && (
        <div className="text-center mb-8">
          <a href="/blog" className="text-blue-600 hover:underline">View all articles</a>
        </div>
      )}

      {/* ページネーション */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
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
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}