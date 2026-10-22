// Server side of the contact form. Lives in src/ (not functions/) so that
// `astro check` type-checks it and vitest can exercise it without the
// Workers runtime; functions/api/contact.ts is only a thin adapter.

export interface ContactEnv {
  RESEND_API_KEY?: string
  // Where submissions are delivered. A Cloudflare Pages secret, so the
  // owner's personal address stays out of this public repository.
  CONTACT_TO?: string
}

export interface ParsedContact {
  name: string
  email: string
  message: string
}

// singbirds.net is not a verified Resend domain any more (and expires 2026-10-25).
export const CONTACT_FROM = "contact@fairy-pitta.net"
export const RESEND_ENDPOINT = "https://api.resend.com/emails"

export const FIELD_LIMITS = { name: 200, email: 320, message: 10000 } as const

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function parseContact(raw: unknown): ParsedContact | null {
  if (typeof raw !== "object" || raw === null) return null
  const { name, email, message } = raw as Record<string, unknown>
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") return null

  const parsed: ParsedContact = { name: name.trim(), email: email.trim(), message: message.trim() }
  if (!parsed.name || !parsed.message) return null
  if (!EMAIL_PATTERN.test(parsed.email)) return null
  if (parsed.name.length > FIELD_LIMITS.name) return null
  if (parsed.email.length > FIELD_LIMITS.email) return null
  if (parsed.message.length > FIELD_LIMITS.message) return null
  return parsed
}

// The visitor's text ends up inside an HTML mail body, so it has to be escaped.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildResendBody(contact: ParsedContact, to: string) {
  return {
    from: CONTACT_FROM,
    to,
    reply_to: contact.email,
    subject: `New contact form submission from ${contact.name}`,
    html: [
      `<p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>`,
      `<p><strong>Message:</strong><br/>${escapeHtml(contact.message).replace(/\n/g, "<br/>")}</p>`,
    ].join("\n"),
  }
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

// Same origin as the page, so no CORS headers are needed.
export async function handleContactRequest(
  request: Request,
  env: ContactEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return jsonResponse({ success: false, error: "invalid-json" }, 400)
  }

  const contact = parseContact(raw)
  if (!contact) return jsonResponse({ success: false, error: "invalid-payload" }, 400)

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return jsonResponse({ success: false, error: "not-configured" }, 500)

  let upstream: Response
  try {
    upstream = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildResendBody(contact, env.CONTACT_TO)),
    })
  } catch {
    return jsonResponse({ success: false, error: "upstream-unreachable" }, 502)
  }

  if (!upstream.ok) {
    return jsonResponse({ success: false, error: "upstream-rejected", status: upstream.status }, 502)
  }

  return jsonResponse({ success: true }, 200)
}
