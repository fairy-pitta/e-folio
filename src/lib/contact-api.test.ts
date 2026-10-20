import { describe, it, expect, vi } from 'vitest'
import {
  CONTACT_FROM,
  CONTACT_TO,
  RESEND_ENDPOINT,
  FIELD_LIMITS,
  parseContact,
  buildResendBody,
  handleContactRequest,
} from './contact-api'

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there' }

function postRequest(body: unknown): Request {
  return new Request('https://fairy-pitta.net/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function okFetch() {
  return vi.fn(async () => new Response(JSON.stringify({ id: 'mail_1' }), { status: 200 }))
}

describe('parseContact', () => {
  it('test_parse_contact_with_valid_payload_returns_trimmed_fields', () => {
    expect(parseContact({ name: '  Ada  ', email: ' ada@example.com ', message: ' hi ' })).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'hi',
    })
  })

  it('test_parse_contact_with_blank_message_returns_null', () => {
    expect(parseContact({ ...valid, message: '   ' })).toBeNull()
  })

  it('test_parse_contact_with_invalid_email_returns_null', () => {
    expect(parseContact({ ...valid, email: 'not-an-email' })).toBeNull()
  })

  it('test_parse_contact_with_non_string_field_returns_null', () => {
    expect(parseContact({ ...valid, name: 42 })).toBeNull()
  })

  it('test_parse_contact_with_oversized_message_returns_null', () => {
    expect(parseContact({ ...valid, message: 'x'.repeat(FIELD_LIMITS.message + 1) })).toBeNull()
  })

  it('test_parse_contact_with_non_object_returns_null', () => {
    expect(parseContact(null)).toBeNull()
    expect(parseContact('Ada')).toBeNull()
  })
})

describe('buildResendBody', () => {
  it('test_build_resend_body_uses_verified_fairy_pitta_sender', () => {
    const body = buildResendBody(valid)
    expect(body.from).toBe('contact@fairy-pitta.net')
    expect(body.to).toBe('shunaruna@gmail.com')
    expect(body.reply_to).toBe('ada@example.com')
    expect(body.subject).toContain('Ada')
  })

  it('test_build_resend_body_with_html_in_message_returns_escaped_markup', () => {
    const body = buildResendBody({ ...valid, message: '<script>alert(1)</script>' })
    expect(body.html).not.toContain('<script>')
    expect(body.html).toContain('&lt;script&gt;')
  })

  it('test_build_resend_body_with_newlines_returns_line_breaks', () => {
    expect(buildResendBody({ ...valid, message: 'a\nb' }).html).toContain('a<br/>b')
  })
})

describe('handleContactRequest', () => {
  it('test_handle_contact_request_with_valid_payload_returns_success_true', async () => {
    const fetchImpl = okFetch()
    const response = await handleContactRequest(postRequest(valid), { RESEND_API_KEY: 'test-key' }, fetchImpl)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(RESEND_ENDPOINT)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key')
    const sent = JSON.parse(String(init.body))
    expect(sent.from).toBe(CONTACT_FROM)
    expect(sent.to).toBe(CONTACT_TO)
  })

  it('test_handle_contact_request_with_invalid_payload_returns_400_without_calling_resend', async () => {
    const fetchImpl = okFetch()
    const response = await handleContactRequest(postRequest({ name: '', email: 'x', message: '' }), { RESEND_API_KEY: 'test-key' }, fetchImpl)

    expect(response.status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('test_handle_contact_request_with_malformed_json_returns_400', async () => {
    const fetchImpl = okFetch()
    const response = await handleContactRequest(postRequest('{not json'), { RESEND_API_KEY: 'test-key' }, fetchImpl)

    expect(response.status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('test_handle_contact_request_without_api_key_returns_500', async () => {
    const fetchImpl = okFetch()
    const response = await handleContactRequest(postRequest(valid), {}, fetchImpl)

    expect(response.status).toBe(500)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('test_handle_contact_request_when_resend_rejects_returns_502', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"message":"domain not verified"}', { status: 403 }))
    const response = await handleContactRequest(postRequest(valid), { RESEND_API_KEY: 'test-key' }, fetchImpl)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({ success: false })
  })

  it('test_handle_contact_request_when_resend_unreachable_returns_502', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND')
    })
    const response = await handleContactRequest(postRequest(valid), { RESEND_API_KEY: 'test-key' }, fetchImpl)

    expect(response.status).toBe(502)
  })

  it('test_handle_contact_request_never_echoes_api_key_in_response', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 403 }))
    const response = await handleContactRequest(postRequest(valid), { RESEND_API_KEY: 'super-secret' }, fetchImpl)

    expect(await response.text()).not.toContain('super-secret')
  })
})
