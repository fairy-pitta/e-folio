import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const notoSans = Noto_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SingBirds | Environmental Tech Developer",
  description: "Portfolio of SingBirds - Environmental Technologist and Developer",
  applicationName: "SingBirds",
  authors: [{ name: "SingBirds" }],
  icons: {
    icon: "/fairy-pitta.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={notoSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}