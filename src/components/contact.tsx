"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, CheckCircle, BellIcon } from "lucide-react"

interface ContactFormState {
  name: string
  email: string
  message: string
}

export default function Contact() {
  // コンタクトフォームの状態
  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  })
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [isContactSubmitted, setIsContactSubmitted] = useState(false)

  // ニュースレターフォームの状態
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // コンタクトフォームの入力ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  // コンタクトフォームの送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsContactSubmitting(true)
  
    try {
      const response = await fetch("https://resend-worker.shuna120700.workers.dev/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
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
      alert("Failed to send message. Please try again later.")
    } finally {
      setIsContactSubmitting(false)
    }
  }

  // ニュースレターフォームの送信ハンドラ
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
      alert("Failed to subscribe. Please try again later.")
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  return (
    <section id="contact" className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Connect With Me</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Have a question or want to stay updated? Reach out or subscribe to my newsletter.
            If you have any bird-related ideas and want to see it come true, feel free to contact me as well!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* コンタクトフォーム */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white/85 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">Get In Touch</h2>
                  <div className="w-12 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full mb-4"></div>
                  <p className="text-muted-foreground">
                    Have a question or want to collaborate? Send me a message and I'll get back to you soon.
                  </p>
                </div>

                {isContactSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
                  >
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Message Sent!</h3>
                    <p className="text-gray-700">
                      Thank you for reaching out. I'll get back to you as soon as possible.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="text-sm font-medium block mb-1.5 text-gray-70"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="border-gray-200 focus:border-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="text-sm font-medium block mb-1.5 text-gray-700"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="border-gray-200 focus:border-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="text-sm font-medium block mb-1.5 text-gray-700"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Your message..."
                        rows={4}
                        className="border-gray-200 focus:border-gray-400 resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black transition-all duration-300"
                      disabled={isContactSubmitting}
                    >
                      {isContactSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <SendIcon className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ニュースレターフォーム */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            id="newsletter"
          >
            <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white/85 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">Stay Updated</h2>
                  <div className="w-12 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full mb-4"></div>
                  <p className="text-muted-foreground">
                    Subscribe to receive new articles, project updates, and environmental tech insights.
                  </p>
                </div>

                {isSubscribed ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
                  >
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      Thanks for subscribing!
                    </h3>
                    <p className="text-gray-700">
                      You'll receive our next newsletter with the latest updates.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-5">
                    <div>
                      <label
                        htmlFor="newsletter-email"
                        className="text-sm font-medium block mb-1.5 text-gray-700"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Input
                          id="newsletter-email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10 border-gray-200 focus:border-gray-400 "
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                          disabled={isNewsletterSubmitting}
                        />
                        <BellIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black transition-all duration-300"
                      disabled={isNewsletterSubmitting}
                    >
                      {isNewsletterSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <BellIcon className="h-4 w-4 mr-2" />
                          Subscribe to Newsletter
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                      By subscribing, you agree to our{" "}
                      <a href="/privacy" className="underline hover:text-gray-700">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
