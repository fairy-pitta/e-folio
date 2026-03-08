"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { MailIcon, CheckCircle } from "lucide-react"

export default function BlogNewsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
      setEmail("")

      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="border-t pt-8">
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Newsletter</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to receive new articles directly in your inbox.
      </p>

      {isSubscribed ? (
        <div className="flex items-center gap-2 text-sm animate-fade-in-up">
          <CheckCircle className="h-4 w-4 text-[hsl(var(--accent))]" />
          <span>Subscribed</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-sm">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              className="rounded-sm text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 font-mono text-xs px-4 py-2 bg-foreground text-background hover:bg-[hsl(var(--accent))] transition-colors shrink-0 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <MailIcon className="h-3 w-3" />
                  Subscribe
                </>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </form>
      )}
    </div>
  )
}
