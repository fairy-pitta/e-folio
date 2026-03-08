"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLinkIcon, Heart, Calendar, User } from "lucide-react"

export interface UnifiedArticle {
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

interface ArticleCardProps {
  article: UnifiedArticle
  isHome: boolean
}

function ArticleLink({ article, children, className }: { article: UnifiedArticle; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={article.url}
      target={article.type === 'qiita' ? '_blank' : '_self'}
      rel={article.type === 'qiita' ? 'noopener noreferrer' : undefined}
      className={className}
      {...(article.type === 'blog' ? { 'data-astro-prefetch': true } : {})}
    >
      {children}
    </a>
  )
}

function TypeBadge({ type }: { type: 'blog' | 'qiita' }) {
  return (
    <Badge variant="outline" className="text-xs px-2 py-0.5">
      {type === 'blog' ? 'Blog' : 'Qiita'}
    </Badge>
  )
}

function FormattedDate({ date }: { date: string }) {
  return (
    <span className="flex items-center gap-1 text-sm text-gray-500">
      <Calendar className="h-4 w-4" />
      {new Date(date).toLocaleDateString('ja-JP')}
    </span>
  )
}

export default function ArticleCard({ article, isHome }: ArticleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            {isHome ? (
              <h3 className="text-xl font-semibold mb-1 font-source-sans flex items-center justify-between">
                <ArticleLink article={article} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  {article.title}
                  <TypeBadge type={article.type} />
                  {article.type === 'qiita' && <ExternalLinkIcon className="h-4 w-4" />}
                </ArticleLink>
                <FormattedDate date={article.date} />
              </h3>
            ) : (
              <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors font-source-sans">
                <ArticleLink article={article} className="flex items-center gap-2">
                  {article.title}
                  <TypeBadge type={article.type} />
                  {article.type === 'qiita' && <ExternalLinkIcon className="h-4 w-4" />}
                </ArticleLink>
              </h3>
            )}

            {!isHome && (
              <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
            )}

            {!isHome && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                <div className="flex items-center gap-1 ml-auto">
                  <FormattedDate date={article.date} />
                </div>
              </div>
            )}

            {!isHome && (
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
