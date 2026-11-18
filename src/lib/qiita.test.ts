import { describe, it, expect, vi } from 'vitest'
import { fetchQiita, QIITA_ITEMS_URL } from './qiita'

const fetchQiitaItems = async (fetchImpl: typeof fetch) => (await fetchQiita(fetchImpl)).items

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('fetchQiita', () => {
  it('maps_valid_items_and_drops_malformed_ones', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        { title: 'A', url: 'https://qiita.com/Pitta/items/a', created_at: '2025-03-01T10:00:00+09:00' },
        { title: 'missing url', created_at: '2025-03-01T10:00:00+09:00' },
        { title: 'bad date', url: 'https://qiita.com/x', created_at: 'nope' },
      ]),
    ) as unknown as typeof fetch

    const items = await fetchQiitaItems(fetchImpl)

    expect(fetchImpl).toHaveBeenCalledWith(QIITA_ITEMS_URL)
    expect(items).toEqual([
      { title: 'A', url: 'https://qiita.com/Pitta/items/a', createdAt: new Date('2025-03-01T10:00:00+09:00') },
    ])
  })

  it('returns_empty_on_rate_limit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => jsonResponse({ message: 'Rate limit exceeded' }, 403)) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('returns_empty_on_network_error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => { throw new TypeError('fetch failed') }) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    warn.mockRestore()
  })

  it('returns_empty_when_body_is_not_an_array', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => jsonResponse({ items: [] })) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    warn.mockRestore()
  })

  it('reports_ok_only_when_the_fetch_succeeded', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const good = (async () => jsonResponse([])) as unknown as typeof fetch
    const limited = (async () => jsonResponse({ message: 'Rate limit exceeded' }, 403)) as unknown as typeof fetch
    const down = (async () => { throw new TypeError('fetch failed') }) as unknown as typeof fetch
    expect(await fetchQiita(good)).toEqual({ items: [], ok: true })
    expect(await fetchQiita(limited)).toEqual({ items: [], ok: false })
    expect(await fetchQiita(down)).toEqual({ items: [], ok: false })
    warn.mockRestore()
  })
})
