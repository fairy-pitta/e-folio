"use client"

import type React from "react"

import { useEffect, useState } from "react"

export default function ScrollToTop({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState("")

  useEffect(() => {
    // Set pathname on client side
    setPathname(window.location.pathname)
  }, [])

  useEffect(() => {
    // Scroll to top when the pathname changes
    window.scrollTo(0, 0)
  }, [pathname])

  return <>{children}</>
}
