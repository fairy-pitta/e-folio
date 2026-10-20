import { handleContactRequest, type ContactEnv } from "../../src/lib/contact-api"

interface ContactContext {
  request: Request
  env: ContactEnv
}

// Pages answers 405 by itself for the methods we do not export.
export function onRequestPost(context: ContactContext): Promise<Response> {
  return handleContactRequest(context.request, context.env)
}
