import { describe, it, expect, vi } from 'vitest'
import { sendContact, CONTACT_ENDPOINT } from './contact'

const message = { name: 'Ada', email: 'ada@example.com', message: 'Hello' }

describe('sendContact', () => {
  it('posts_json_to_the_worker_and_returns_true_on_success', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 })) as unknown as typeof fetch

    expect(await sendContact(message, fetchImpl)).toBe(true)
    expect(fetchImpl).toHaveBeenCalledWith(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  })

  it('returns_false_on_server_error', async () => {
    const fetchImpl = (async () => new Response('fail', { status: 500 })) as unknown as typeof fetch
    expect(await sendContact(message, fetchImpl)).toBe(false)
  })

  it('returns_false_on_network_error', async () => {
    const fetchImpl = (async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    expect(await sendContact(message, fetchImpl)).toBe(false)
  })
})
