"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { CalendarIcon, ClockIcon, TagIcon, SearchIcon, HeartIcon, ExternalLinkIcon } from 'lucide-react'


// 型定義
interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  coverImage?: string
  readTime: string
  tags: string[]
}

interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
}

interface QiitaTag {
  name: string
  versions: string[]
}

interface QiitaArticle {
  id: string
  title: string
  url: string
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  tags: QiitaTag[]
  user: {
    id: string
    name: string
    profile_image_url: string
  }
}

interface BlogPageWithLanguageToggleProps {
  initialPosts: BlogPost[]
  initialTags: string[]
}

type LanguageFilter = 'japanese' | 'english' | 'both'

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
  coverImage?: string
}

export default function BlogPageWithLanguageToggle({ 
  initialPosts = [], 
  initialTags = [] 
}: BlogPageWithLanguageToggleProps) {
  const [qiitaArticles, setQiitaArticles] = useState<QiitaArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('both')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 12

  // Qiita記事を取得
  useEffect(() => {
    const fetchQiitaArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('https://qiita.com/api/v2/users/Pitta/items?page=1&per_page=20')
        
        if (!response.ok) {
          if (response.status === 403) {
            const rateLimitReset = response.headers.get('rate-reset')
            const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString('ja-JP') : '不明'
            throw new Error(`Qiita APIのレート制限に達しました。リセット時刻: ${resetTime}`)
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const articles: QiitaArticle[] = await response.json()
        setQiitaArticles(articles)
      } catch (err) {
        console.error('Failed to fetch Qiita articles:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Qiita記事の読み込みに失敗しました')
        }
        setQiitaArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchQiitaArticles()
  }, [])

  // 言語フィルターに基づいて記事をフィルタリング
  const getFilteredArticles = (): FilteredArticle[] => {
    const allArticles: FilteredArticle[] = []

    // 英語記事を追加
    if (languageFilter === 'english' || languageFilter === 'both') {
      initialPosts.forEach(post => {
        allArticles.push({
          type: 'blog' as const,
          title: post.frontmatter.title,
          date: post.frontmatter.date,
          excerpt: post.frontmatter.excerpt,
          readTime: post.frontmatter.readTime,
          tags: post.frontmatter.tags,
          slug: post.slug,
          language: 'english' as const,
          url: `/blog/${post.slug}`,
          coverImage: post.frontmatter.coverImage
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

  // 検索とタグフィルターを適用
  const filteredArticles = getFilteredArticles().filter(article => {
    const matchesSearch = searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => article.tags.some(articleTag => 
        articleTag.toLowerCase() === tag.toLowerCase()
      ))

    return matchesSearch && matchesTags
  })

  // ページネーション
  const indexOfLastArticle = currentPage * articlesPerPage
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle)
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)

  // 全てのタグを取得（英語記事とQiita記事の両方から）
  const getAllTags = () => {
    const tagSet = new Set<string>()
    
    // 英語記事のタグ
    initialTags.forEach(tag => tagSet.add(tag))
    
    // Qiita記事のタグ
    qiitaArticles.forEach(article => {
      article.tags.forEach(tag => tagSet.add(tag.name))
    })
    
    return Array.from(tagSet).sort()
  }

  const allTags = getAllTags()

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearchQuery('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Blog & Articles
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Loading articles...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Blog & Articles
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore my thoughts on technology, research, and development
              </p>
            </div>

            {/* 言語切り替えボタン */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={languageFilter === 'japanese' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLanguageFilter('japanese')
                    setCurrentPage(1)
                  }}
                  className={languageFilter === 'japanese' ? 'bg-sky-500 hover:bg-sky-600' : ''}
                >
                  日本語
                </Button>
                <Button
                  variant={languageFilter === 'english' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLanguageFilter('english')
                    setCurrentPage(1)
                  }}
                  className={languageFilter === 'english' ? 'bg-sky-500 hover:bg-sky-600' : ''}
                >
                  English
                </Button>
                <Button
                  variant={languageFilter === 'both' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLanguageFilter('both')
                    setCurrentPage(1)
                  }}
                  className={languageFilter === 'both' ? 'bg-sky-500 hover:bg-sky-600' : ''}
                >
                  Both
                </Button>
              </div>
            </div>

            {/* 検索とフィルター */}
            <div className="mb-8 space-y-4">
              {/* 検索バー */}
              <div className="relative max-w-md mx-auto">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

              {/* タグフィルター */}
              <div className="flex flex-wrap justify-center gap-2">
                {allTags.slice(0, 10).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag) 
                        ? "bg-sky-500 hover:bg-sky-600" 
                        : "hover:bg-sky-50"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {(selectedTags.length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sky-500 hover:text-sky-600"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="text-center mb-8">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* 記事一覧 */}
            {currentArticles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {currentArticles.map((article, index) => (
                  <motion.div
                    key={`${article.type}-${article.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      {article.coverImage && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {article.language === 'japanese' ? '日本語' : 'English'}
                          </Badge>
                          {article.type === 'qiita' && (
                            <div className="flex items-center text-sm text-gray-500">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              {article.likes}
                            </div>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2 text-lg">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {article.date}
                          {article.readTime && (
                            <>
                              <span className="mx-2">•</span>
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {article.readTime}
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {article.type === 'qiita' ? (
                          <Button variant="ghost" className="p-0 h-auto text-sky-500 hover:text-sky-600" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              Read on Qiita
                              <ExternalLinkIcon className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" className="p-0 h-auto text-sky-500 hover:text-sky-600" asChild>
                            <a href={article.url}>
                              Read more
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-sky-500 hover:bg-sky-600" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}