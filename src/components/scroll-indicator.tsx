"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ScrollIndicator() {
  const [activeSection, setActiveSection] = useState("about")
  const [showTooltip, setShowTooltip] = useState("")

  useEffect(() => {
    const sections = ["about", "skills", "projects", "blog", "contact"]

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3

      for (const section of sections) {
        const element = document.getElementById(section)
        if (!element) continue

        const offsetTop = element.offsetTop
        const offsetBottom = offsetTop + element.offsetHeight

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          setActiveSection(section)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      })
    }
  }

  const getSectionName = (section: string) => {
    switch (section) {
      case "about":
        return "About"
      case "skills":
        return "Skills"
      case "projects":
        return "Projects"
      case "blog":
        return "Blog"
      case "contact":
        return "Contact"
      default:
        return section.charAt(0).toUpperCase() + section.slice(1)
    }
  }

  return (
    <div className="scroll-indicator hidden lg:block">
      {["about", "skills", "projects", "blog", "contact"].map((section) => (
        <div key={section} className="relative">
          <div
            className={`scroll-indicator-dot ${activeSection === section ? "active" : ""}`}
            onClick={() => scrollToSection(section)}
            onMouseEnter={() => setShowTooltip(section)}
            onMouseLeave={() => setShowTooltip("")}
          />
          {showTooltip === section && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-0 right-full mr-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-medium shadow-sm whitespace-nowrap"
            >
              {getSectionName(section)}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}
