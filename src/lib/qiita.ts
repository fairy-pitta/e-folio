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

// What a build got from Qiita. `ok` is false when the request failed, so the
// page can say so and the checks on the built site can tell an outage from a bug.
export interface QiitaFetch {
  items: QiitaItem[]
  ok: boolean
}

// The value of the writing list's data-qiita attribute when the fetch failed.
export const QIITA_UNAVAILABLE = "unavailable"

// Never throws: a Qiita outage or rate limit must not break the site build.
export async function fetchQiita(fetchImpl: typeof fetch = fetch): Promise<QiitaFetch> {
  try {
    const response = await fetchImpl(QIITA_ITEMS_URL)
    if (!response.ok) {
      console.warn(`[qiita] skipped: HTTP ${response.status}`)
      return { items: [], ok: false }
    }
    const body: unknown = await response.json()
    if (!Array.isArray(body)) {
      console.warn("[qiita] skipped: unexpected response shape")
      return { items: [], ok: false }
    }
    return { items: body.map(toQiitaItem).filter((item): item is QiitaItem => item !== null), ok: true }
  } catch (error) {
    console.warn("[qiita] skipped:", error)
    return { items: [], ok: false }
  }
}
