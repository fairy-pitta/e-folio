import { describe, it, expect, vi } from 'vitest'
import { fetchQiitaItems, QIITA_ITEMS_URL } from './qiita'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('fetchQiitaItems', () => {
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
})
