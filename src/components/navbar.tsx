"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface NavLink {
  name: string
  href: string
  isSection: boolean
  sectionId: string
}

export default function Navbar() {
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pathname, setPathname] = useState("")
  const isHomePage = pathname === "/"

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  const navigateToSection = (sectionId: string) => {
    if (isHomePage) {
      if (sectionId === "about") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        const element = document.getElementById(sectionId)
        if (element) {
          const navbarHeight = 64
          const elementPosition = element.getBoundingClientRect().top + window.scrollY
          window.scrollTo({ top: elementPosition - navbarHeight, behavior: "smooth" })
        }
      }
    } else {
      if (sectionId === "about") {
        window.location.href = "/"
      } else {
        window.location.href = `/?section=${sectionId}#${sectionId}`
      }
    }
    setIsMenuOpen(false)
  }

  const navLinks: NavLink[] = [
    { name: "About", href: "#about", isSection: true, sectionId: "about" },
    { name: "Skills", href: "#skills", isSection: true, sectionId: "skills" },
    { name: "Projects", href: "/projects", isSection: false, sectionId: "" },
    { name: "Blog", href: "/blog", isSection: false, sectionId: "" },
    { name: "Contact", href: "#contact", isSection: true, sectionId: "contact" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 border-b transition-all duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2" data-astro-prefetch>
          <img
            src="/new-favicon.png"
            alt="Fairy Pitta"
            className="h-6 w-6 object-contain"
            width="24"
            height="24"
            loading="lazy"
            decoding="async"
          />
          <span className="font-caveat text-xl">Fairy Pitta</span>
        </a>

        {isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="h-8 w-8"
            >
              {isMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </Button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-background border-b p-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.isSection ? (
                      <button
                        onClick={() => navigateToSection(link.sectionId)}
                        className="w-full text-left px-3 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="block px-3 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        data-astro-prefetch
                      >
                        {link.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                (link.href === "/projects" && pathname.startsWith("/projects")) ||
                (link.href === "/blog" && pathname.startsWith("/blog"))

              if (link.isSection) {
                return (
                  <button
                    key={link.name}
                    onClick={() => navigateToSection(link.sectionId)}
                    className="text-xs font-mono tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase"
                  >
                    {link.name}
                  </button>
                )
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-mono tracking-wide uppercase transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-astro-prefetch
                >
                  {link.name}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
