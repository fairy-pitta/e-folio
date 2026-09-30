// Qiita articles are fetched once at build time and listed next to our own posts.
export interface QiitaItem {
  title: string
  url: string
  createdAt: Date
}

export const QIITA_ITEMS_URL = "https://qiita.com/api/v2/users/Pitta/items?page=1&per_page=100"

function toQiitaItem(raw: unknown): QiitaItem | null {
  if (typeof raw !== "object" || raw === null) return null
  const { title, url, created_at } = raw as Record<string, unknown>
  if (typeof title !== "string" || typeof url !== "string" || typeof created_at !== "string") return null
  const createdAt = new Date(created_at)
  if (Number.isNaN(createdAt.getTime())) return null
  return { title, url, createdAt }
}

// Never throws: a Qiita outage or rate limit must not break the site build.
export async function fetchQiitaItems(fetchImpl: typeof fetch = fetch): Promise<QiitaItem[]> {
  try {
    const response = await fetchImpl(QIITA_ITEMS_URL)
    if (!response.ok) {
      console.warn(`[qiita] skipped: HTTP ${response.status}`)
      return []
    }
    const body: unknown = await response.json()
    if (!Array.isArray(body)) {
      console.warn("[qiita] skipped: unexpected response shape")
      return []
    }
    return body.map(toQiitaItem).filter((item): item is QiitaItem => item !== null)
  } catch (error) {
    console.warn("[qiita] skipped:", error)
    return []
  }
}
