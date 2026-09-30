export interface ContactMessage {
  name: string
  email: string
  message: string
}

export const CONTACT_ENDPOINT = "https://resend-worker.shuna120700.workers.dev/api/contact"

// Returns false instead of throwing so the form can always show a fallback.
export async function sendContact(message: ContactMessage, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
    return response.ok
  } catch {
    return false
  }
}
