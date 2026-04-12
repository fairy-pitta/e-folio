import { useState } from "react"

interface UseFormSubmitOptions {
  url: string
  successDuration?: number
}

export function useFormSubmit<T>({ url, successDuration = 5000 }: UseFormSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: T) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        await response.text()
        throw new Error(`Request failed: ${response.status}`)
      }

      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), successDuration)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, isSubmitted, error, clearError: () => setError(null) }
}
