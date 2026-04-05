"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, CheckCircle, BellIcon } from "lucide-react"

interface ContactFormState {
  name: string
  email: string
  message: string
}

function InlineError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-sm text-sm animate-fade-in-up">
      <span className="text-destructive shrink-0">!</span>
      <span className="text-destructive/90 flex-1">{message}</span>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground text-xs shrink-0" aria-label="Dismiss">
        &times;
      </button>
    </div>
  )
}

export default function Contact() {
  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  })
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [isContactSubmitted, setIsContactSubmitted] = useState(false)

  const [contactError, setContactError] = useState<string | null>(null)

  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsContactSubmitting(true)

    setContactError(null)
    try {
      const response = await fetch("https://resend-worker.shuna120700.workers.dev/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setIsContactSubmitted(true)
      setFormState({ name: "", email: "", message: "" })

      setTimeout(() => {
        setIsContactSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error(error)
      setContactError("Failed to send message. Please try again later.")
    } finally {
      setIsContactSubmitting(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsNewsletterSubmitting(true)

    try {
      const response = await fetch("https://resend-worker.shuna120700.workers.dev/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const resultText = await response.text()

      if (!response.ok) {
        console.error("Failed response body:", resultText)
        throw new Error(`Failed to subscribe: ${response.status}`)
      }

      setIsSubscribed(true)
      setNewsletterEmail("")

      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)
    } catch (error) {
      console.error(error)
      setNewsletterError("Failed to subscribe. Please try again later.")
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-2xl font-mono-heading mb-2">Contact</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm">
            Have a question or want to stay updated? Reach out or subscribe to my newsletter.
            Bird-related project ideas are especially welcome.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl">
          {/* Contact Form */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-6">
              Send a message
            </h3>

            {isContactSubmitted ? (
              <div className="border rounded-sm p-6 text-center animate-fade-in-up">
                <CheckCircle className="h-8 w-8 mx-auto text-[hsl(var(--accent))] mb-3" />
                <p className="text-sm font-medium mb-1">Message sent</p>
                <p className="text-xs text-muted-foreground">
                  I'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {contactError && (
                  <InlineError message={contactError} onDismiss={() => setContactError(null)} />
                )}
                <div>
                  <label htmlFor="name" className="text-xs font-mono block mb-1.5 text-muted-foreground">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="rounded-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-xs font-mono block mb-1.5 text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="rounded-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-xs font-mono block mb-1.5 text-muted-foreground">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={4}
                    className="rounded-sm resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 font-mono text-sm px-5 py-2.5 bg-foreground text-background hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
                  disabled={isContactSubmitting}
                >
                  {isContactSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-3.5 w-3.5" />
                      Send
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-6">
              Newsletter
            </h3>

            {isSubscribed ? (
              <div className="border rounded-sm p-6 text-center animate-fade-in-up">
                <CheckCircle className="h-8 w-8 mx-auto text-[hsl(var(--accent))] mb-3" />
                <p className="text-sm font-medium mb-1">Subscribed</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive the next newsletter.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                {newsletterError && (
                  <InlineError message={newsletterError} onDismiss={() => setNewsletterError(null)} />
                )}
                <p className="text-sm text-muted-foreground">
                  New articles, project updates, and environmental tech insights.
                </p>

                <div>
                  <label htmlFor="newsletter-email" className="text-xs font-mono block mb-1.5 text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-sm"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={isNewsletterSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 font-mono text-sm px-5 py-2.5 bg-foreground text-background hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
                  disabled={isNewsletterSubmitting}
                >
                  {isNewsletterSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <BellIcon className="h-3.5 w-3.5" />
                      Subscribe
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground">
                  By subscribing, you agree to the{" "}
                  <a href="/privacy" className="underline hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
