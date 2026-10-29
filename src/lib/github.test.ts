import { describe, it, expect, vi } from 'vitest'
import { fetchStars, projectStars, repoFromUrl, starsLabel } from './github'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('repoFromUrl', () => {
  it.each([
    ['https://github.com/fairy-pitta/portree', 'fairy-pitta/portree'],
    ['https://github.com/fairy-pitta/printable_spectrogram/', 'fairy-pitta/printable_spectrogram'],
    ['https://github.com/fairy-pitta/Game-Of-Life.git', 'fairy-pitta/Game-Of-Life'],
  ])('test_parse_%s_returns_owner_and_repo', (url, expected) => {
    expect(repoFromUrl(url)).toBe(expected)
  })

  it.each([undefined, '', 'https://gitlab.com/a/b', 'https://github.com/only-owner'])(
    'test_parse_non_repo_url_%s_returns_null',
    (url) => {
      expect(repoFromUrl(url)).toBeNull()
    },
  )
})

describe('fetchStars', () => {
  it('test_fetch_repo_returns_stargazer_count_and_sends_token', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ stargazers_count: 67 })) as unknown as typeof fetch
    expect(await fetchStars('fairy-pitta/cc-account-switcher', fetchImpl, 'secret')).toBe(67)
    expect(fetchImpl).toHaveBeenCalledWith('https://api.github.com/repos/fairy-pitta/cc-account-switcher', {
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer secret' },
    })
  })

  it('test_fetch_repo_on_rate_limit_returns_null', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => jsonResponse({ message: 'rate limited' }, 403)) as unknown as typeof fetch
    expect(await fetchStars('a/b', fetchImpl, undefined)).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('test_fetch_repo_on_network_error_returns_null', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => {
      throw new TypeError('fetch failed')
    }) as unknown as typeof fetch
    expect(await fetchStars('a/b', fetchImpl, undefined)).toBeNull()
    warn.mockRestore()
  })

  it('test_fetch_repo_with_unexpected_body_returns_null', async () => {
    const fetchImpl = (async () => jsonResponse({ name: 'b' })) as unknown as typeof fetch
    expect(await fetchStars('a/b', fetchImpl, undefined)).toBeNull()
  })
})

describe('starsLabel', () => {
  it('test_label_count_at_threshold_returns_text', () => {
    expect(starsLabel(10)).toBe('10 on GitHub')
  })

  it.each([null, 0, 9])('test_label_count_%s_below_threshold_returns_null', (stars) => {
    expect(starsLabel(stars)).toBeNull()
  })
})

describe('projectStars', () => {
  it.each([[undefined], ['https://gitlab.com/x/y']])('test_read_stars_without_github_repo_%s_returns_null', async (url) => {
    expect(await projectStars(url)).toBeNull()
  })
})
