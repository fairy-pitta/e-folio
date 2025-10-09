// lib/resend.ts
import { Resend } from "resend"

// サーバー側でだけ実行されるコードにする！
const resendApiKey = process.env.RESEND_API

if (!resendApiKey) {
  throw new Error("RESEND_API key is missing. Please set it in your environment variables.")
}

export const resend = new Resend(resendApiKey)