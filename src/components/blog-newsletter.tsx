"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailIcon, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export default function BlogNewsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    // 送信シミュレーション
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
      setEmail("")

      // 3秒後に成功メッセージをリセット
      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)
    }, 1000)
  }

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Subscribe to our newsletter to receive new articles and updates directly in your inbox.
          </p>

          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-gray-700 p-2 bg-gray-100 rounded-md"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Thanks for subscribing!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="email"
                    placeholder="Your email"
                    className="pl-9 bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white flex-shrink-0" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
