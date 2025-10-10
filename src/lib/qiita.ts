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

// キャッシュの有効期限（10分）
const CACHE_DURATION = 10 * 60 * 1000

// ローカルストレージからキャッシュを取得
const getCachedData = (): QiitaCacheData | null => {
  if (typeof window === 'undefined') return null
  
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
    localStorage.removeItem('qiita-cache')
    return null
  }
}

// ローカルストレージにキャッシュを保存
const setCachedData = (articles: QiitaArticle[], rateLimitReset?: number) => {
  if (typeof window === 'undefined') return
  
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

// Qiita記事を取得する関数
export async function fetchQiitaArticles(): Promise<{
  articles: QiitaArticle[]
  error: string | null
  isRateLimited: boolean
  rateLimitResetTime: Date | null
}> {
  try {
    // まずキャッシュをチェック
    const cachedData = getCachedData()
    if (cachedData) {
      let isRateLimited = false
      let rateLimitResetTime: Date | null = null
      
      // レート制限情報があれば設定
      if (cachedData.rateLimitReset) {
        const resetTime = new Date(cachedData.rateLimitReset * 1000)
        if (resetTime > new Date()) {
          isRateLimited = true
          rateLimitResetTime = resetTime
        }
      }
      
      return {
        articles: cachedData.articles,
        error: null,
        isRateLimited,
        rateLimitResetTime
      }
    }
    
    const response = await fetch('https://qiita.com/api/v2/users/Pitta/items?page=1&per_page=20')
    
    if (!response.ok) {
      if (response.status === 403) {
        const rateLimitReset = response.headers.get('rate-reset')
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null
        
        const resetTimeStr = resetTime ? resetTime.toLocaleString('ja-JP') : '不明'
        const errorMessage = `Qiita APIのレート制限に達しました。リセット時刻: ${resetTimeStr}`
        
        // レート制限情報をキャッシュに保存
        if (rateLimitReset) {
          setCachedData([], parseInt(rateLimitReset))
        }
        
        return {
          articles: [],
          error: errorMessage,
          isRateLimited: true,
          rateLimitResetTime: resetTime
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const fetchedArticles: QiitaArticle[] = await response.json()
    
    // 成功した場合はキャッシュに保存
    setCachedData(fetchedArticles)
    
    return {
      articles: fetchedArticles,
      error: null,
      isRateLimited: false,
      rateLimitResetTime: null
    }
    
  } catch (err) {
    console.error('Failed to fetch Qiita articles:', err)
    const errorMessage = err instanceof Error ? err.message : 'Qiita記事の読み込みに失敗しました'
    
    return {
      articles: [],
      error: errorMessage,
      isRateLimited: false,
      rateLimitResetTime: null
    }
  }
}