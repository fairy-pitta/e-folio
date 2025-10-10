"use client"

import BlogWithLanguageToggle from "./blog-with-language-toggle"
import { useQiita } from "../contexts/QiitaContext"
import { useState, useEffect } from "react"

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

interface UnifiedBlogProps {
  englishPosts: BlogPost[]
}

export default function UnifiedBlog({ englishPosts = [] }: UnifiedBlogProps) {
  const [isClient, setIsClient] = useState(false)
  
  // クライアントサイドでのみQiitaコンテキストを使用
  useEffect(() => {
    setIsClient(true)
  }, [])

  // サーバーサイドレンダリング時は基本的なコンテンツを表示
  if (!isClient) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Blog & Articles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Loading articles...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <UnifiedBlogClient englishPosts={englishPosts} />
}

// クライアントサイドでのみ実行されるコンポーネント
function UnifiedBlogClient({ englishPosts }: UnifiedBlogProps) {
  const { articles: qiitaArticles, loading, error } = useQiita()

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Blog & Articles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Loading articles...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Blog & Articles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Technical insights and research findings in bioacoustics and software engineering
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-gray-500 text-sm mt-2">
                Showing English articles only
              </p>
            </div>
          </div>
          <div className="mt-8">
            <BlogWithLanguageToggle 
              englishPosts={englishPosts} 
              qiitaArticles={[]} 
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <BlogWithLanguageToggle 
      englishPosts={englishPosts} 
      qiitaArticles={qiitaArticles} 
    />
  )
}