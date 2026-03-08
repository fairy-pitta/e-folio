"use client"

import { ExternalLinkIcon, Heart, Clock } from "lucide-react"

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

export default function ArticleCard({ article, isHome }: ArticleCardProps) {
  return (
    <article className="py-5 group">
      <div className="flex items-baseline gap-3 mb-1.5">
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {new Date(article.date).toLocaleDateString('ja-JP')}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {article.type === 'blog' ? 'Blog' : 'Qiita'}
        </span>
      </div>

      <h3 className="text-base font-medium mb-1 font-source-sans">
        <ArticleLink
          article={article}
          className="group-hover:text-[hsl(var(--accent))] transition-colors inline-flex items-center gap-1.5"
        >
          {article.title}
          {article.type === 'qiita' && <ExternalLinkIcon className="h-3 w-3 shrink-0" />}
        </ArticleLink>
      </h3>

      {!isHome && (
        <>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2 max-w-2xl">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
            {article.likes !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {article.likes}
              </span>
            )}
            {article.tags.length > 0 && (
              <span className="flex items-center gap-1.5 font-mono">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            )}
          </div>
        </>
      )}
    </article>
  )
}
