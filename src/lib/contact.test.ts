import { describe, it, expect, vi } from 'vitest'
import { CONTACT_ENDPOINT, sendContact } from './contact'

const message = { name: 'Ada', email: 'ada@example.com', message: 'Hello there' }

describe('CONTACT_ENDPOINT', () => {
  it('test_read_contact_endpoint_returns_same_origin_relative_path', () => {
    expect(CONTACT_ENDPOINT).toBe('/api/contact')
    expect(CONTACT_ENDPOINT.startsWith('http')).toBe(false)
  })
})

describe('sendContact', () => {
  it('test_send_contact_with_valid_payload_returns_true', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }))

    await expect(sendContact(message, fetchImpl as unknown as typeof fetch)).resolves.toBe(true)

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(message)
  })

  it('test_send_contact_when_endpoint_returns_500_returns_false', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"success":false}', { status: 500 }))

    await expect(sendContact(message, fetchImpl as unknown as typeof fetch)).resolves.toBe(false)
  })

  it('test_send_contact_when_fetch_throws_returns_false', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('Could not resolve host')
    })

    await expect(sendContact(message, fetchImpl as unknown as typeof fetch)).resolves.toBe(false)
  })

  it('test_send_contact_when_request_times_out_returns_false', async () => {
    const fetchImpl = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('TimeoutError')))
        }),
    )

    await expect(sendContact(message, fetchImpl as unknown as typeof fetch, 10)).resolves.toBe(false)
  })
})
