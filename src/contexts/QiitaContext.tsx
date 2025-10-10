"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Qiita記事の型定義
export interface QiitaTag {
  name: string
  versions: string[]
}

export interface QiitaArticle {
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

// キャッシュデータの型定義
interface QiitaCacheData {
  articles: QiitaArticle[]
  timestamp: number
  rateLimitReset?: number
}

// Context の型定義
interface QiitaContextType {
  articles: QiitaArticle[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isRateLimited: boolean
  rateLimitResetTime: Date | null
}

// Context の作成
const QiitaContext = createContext<QiitaContextType | undefined>(undefined)

// キャッシュの有効期限（10分）
const CACHE_DURATION = 10 * 60 * 1000

// Provider コンポーネント
interface QiitaProviderProps {
  children: ReactNode
}

export function QiitaProvider({ children }: QiitaProviderProps) {
  const [articles, setArticles] = useState<QiitaArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitResetTime, setRateLimitResetTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドかどうかを判定
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ローカルストレージからキャッシュを取得（クライアントサイドのみ）
  const getCachedData = (): QiitaCacheData | null => {
    if (!isClient) return null
    
    try {
      const cached = localStorage.getItem('qiita-cache')
      if (!cached) return null
      
      const data: QiitaCacheData = JSON.parse(cached)
      const now = Date.now()
      
      // キャッシュが有効期限内かチェック
      if (now - data.timestamp < CACHE_DURATION) {
        return data
      }
      
      // 期限切れの場合は削除
      localStorage.removeItem('qiita-cache')
      return null
    } catch (error) {
      console.error('Failed to parse cached data:', error)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('qiita-cache')
      }
      return null
    }
  }

  // ローカルストレージにキャッシュを保存（クライアントサイドのみ）
  const setCachedData = (articles: QiitaArticle[], rateLimitReset?: number) => {
    if (!isClient) return
    
    try {
      const cacheData: QiitaCacheData = {
        articles,
        timestamp: Date.now(),
        rateLimitReset
      }
      localStorage.setItem('qiita-cache', JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  // Qiita記事を取得
  const fetchQiitaArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // まずキャッシュをチェック
      const cachedData = getCachedData()
      if (cachedData) {
        setArticles(cachedData.articles)
        setLoading(false)
        
        // レート制限情報があれば設定
        if (cachedData.rateLimitReset) {
          const resetTime = new Date(cachedData.rateLimitReset * 1000)
          if (resetTime > new Date()) {
            setIsRateLimited(true)
            setRateLimitResetTime(resetTime)
          }
        }
        return
      }
      
      // レート制限中の場合はAPIを呼ばない
      if (isRateLimited && rateLimitResetTime && rateLimitResetTime > new Date()) {
        setError(`Qiita APIのレート制限中です。リセット時刻: ${rateLimitResetTime.toLocaleString('ja-JP')}`)
        setLoading(false)
        return
      }
      
      const response = await fetch('https://qiita.com/api/v2/users/Pitta/items?page=1&per_page=20')
      
      if (!response.ok) {
        if (response.status === 403) {
          const rateLimitReset = response.headers.get('rate-reset')
          const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null
          
          setIsRateLimited(true)
          setRateLimitResetTime(resetTime)
          
          const resetTimeStr = resetTime ? resetTime.toLocaleString('ja-JP') : '不明'
          const errorMessage = `Qiita APIのレート制限に達しました。リセット時刻: ${resetTimeStr}`
          
          setError(errorMessage)
          
          // レート制限情報をキャッシュに保存
          if (rateLimitReset) {
            setCachedData([], parseInt(rateLimitReset))
          }
          
          throw new Error(errorMessage)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const fetchedArticles: QiitaArticle[] = await response.json()
      setArticles(fetchedArticles)
      setIsRateLimited(false)
      setRateLimitResetTime(null)
      
      // 成功した場合はキャッシュに保存
      setCachedData(fetchedArticles)
      
    } catch (err) {
      console.error('Failed to fetch Qiita articles:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Qiita記事の読み込みに失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  // 初回読み込み（クライアントサイドのみ）
  useEffect(() => {
    if (isClient) {
      fetchQiitaArticles()
    }
  }, [isClient])

  // レート制限のリセット時刻をチェック
  useEffect(() => {
    if (isRateLimited && rateLimitResetTime) {
      const checkRateLimit = () => {
        if (new Date() > rateLimitResetTime) {
          setIsRateLimited(false)
          setRateLimitResetTime(null)
          setError(null)
        }
      }
      
      const interval = setInterval(checkRateLimit, 60000) // 1分ごとにチェック
      return () => clearInterval(interval)
    }
  }, [isRateLimited, rateLimitResetTime])

  const value: QiitaContextType = {
    articles,
    loading,
    error,
    refetch: fetchQiitaArticles,
    isRateLimited,
    rateLimitResetTime
  }

  return (
    <QiitaContext.Provider value={value}>
      {children}
    </QiitaContext.Provider>
  )
}

// Context を使用するためのカスタムフック
export function useQiita() {
  const context = useContext(QiitaContext)
  if (context === undefined) {
    throw new Error('useQiita must be used within a QiitaProvider')
  }
  return context
}