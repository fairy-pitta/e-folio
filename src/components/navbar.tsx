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
    // クライアントサイドでpathnameを設定
    setPathname(window.location.pathname)
  }, [])

  // セクションへのナビゲーション処理
  const navigateToSection = (sectionId: string) => {
    if (isHomePage) {
      // ホームページにいる場合は、直接スクロール
      const element = document.getElementById(sectionId)
      if (element) {
        const navbarHeight = 80 // ナビバーの高さを適宜調整
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - navbarHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    } else {
      // 他のページにいる場合は、クエリパラメータ付きでホームページに移動
      // URLにハッシュも追加して、JavaScriptが無効な場合でも動作するようにする
      window.location.href = `/?section=${sectionId}#${sectionId}`
    }

    // モバイルメニューを閉じる
    setIsMenuOpen(false)
  }

  // ナビゲーションリンクの定義
  const navLinks: NavLink[] = [
    { name: "About", href: "#about", isSection: true, sectionId: "about" },
    { name: "Skills", href: "#skills", isSection: true, sectionId: "skills" },
    { name: "Projects", href: "/projects", isSection: false, sectionId: "" },
    { name: "Blog", href: "/blog", isSection: false, sectionId: "" },
    { name: "Contact", href: "#contact", isSection: true, sectionId: "contact" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
            <img
              src="/new-favicon_svg.svg"
              alt="SingBirds"
              className="h-8 w-8 object-contain mr-2"
              width="32"
              height="32"
              loading="lazy"
              decoding="async"
            />
            <span className="text-2xl font-normal gradient-text font-caveat">Fairy Pitta</span>
          </a>

        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900"
              >
                {isMenuOpen ? (
                  <XIcon
                    className={`h-5 w-5 text-gray-900`}
                  />
                ) : (
                  <MenuIcon
                    className={`h-5 w-5 text-gray-900`}
                  />
                )}
              </Button>
            </div>

            {isMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-md p-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.isSection ? (
                      <button
                        onClick={() => navigateToSection(link.sectionId)}
                        className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-semibold"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors block font-semibold"
                        onClick={() => setIsMenuOpen(false)}
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
              // 現在のページがリンク先と一致するかチェック
              const isActive =
                (link.href === "/projects" && pathname.startsWith("/projects")) ||
                (link.href === "/blog" && pathname.startsWith("/blog"))

              if (link.isSection) {
                return (
                  <button
                    key={link.name}
                    onClick={() => navigateToSection(link.sectionId)}
                    className={`text-sm font-medium transition-colors text-gray-900 hover:text-gray-700 font-semibold`}
                  >
                    {link.name}
                  </button>
                )
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-gray-900 font-semibold" : "text-gray-900 hover:text-gray-700 font-semibold"
                  }`}
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
