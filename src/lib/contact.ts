export interface ContactMessage {
  name: string
  email: string
  message: string
}

// Served by functions/api/contact.ts on the same origin, so no CORS and no workers.dev.
export const CONTACT_ENDPOINT = "/api/contact"

export const CONTACT_TIMEOUT_MS = 15000

// Returns false instead of throwing so the form can always show a fallback.
export async function sendContact(message: ContactMessage, fetchImpl: typeof fetch = fetch, timeoutMs = CONTACT_TIMEOUT_MS): Promise<boolean> {
  try {
    const response = await fetchImpl(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(timeoutMs),
    })
    return response.ok
  } catch {
    return false
  }
}
