"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowDownIcon, BellIcon } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  // Function to scroll to the next section
  const scrollToNextSection = () => {
    const skillsSection = document.getElementById("skills")
    if (skillsSection) {
      window.scrollTo({
        top: skillsSection.offsetTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
      <picture>
        <source
          srcSet="/hero_mobile.webp"
          type="image/webp"
          media="(max-width: 500px)"
        />
        <source
          srcSet="/hero_desktop.webp"
          type="image/webp"
          media="(min-width: 769px)"
        />
        <Image
          priority
          src="/hero_desktop.webp" // fallback
          alt="mangrove blue flycatcher"
          fill
          className="object-cover object-right"
          sizes="100vw"
          quality={90}
        />
      </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
      </div>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                I
              </span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 via-green-500 to-teal-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                Code
              </span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                Birds
              </span>
            </h1>
            <h2 className="text-2xl md:text-2xl italic font-semibold text-sky-700">Environmental Tech Developer</h2>
          </div>

          <p className="text-lg font-medium text-sky-800 max-w-xl leading-relaxed">
            Birdsong, sightings, and behavior—mapped, analyzed, and reimagined through digital tools.
            Rooted in avian ethology and based in Singapore, this work bridges ecological insight with interactive design.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-sky-500 hover:bg-sky-600">
              <a href="#projects">View My Work</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-sky-300 text-sky-500 hover:text-sky-600 hover:border-sky-400 bg-white/20 backdrop-blur-sm"
            >
              <a href="#contact">Get In Touch</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-blue-300 text-blue-500 hover:text-blue-600 hover:border-blue-400 bg-white/20 backdrop-blur-sm"
            >
              <a href="#contact">
                <BellIcon className="h-4 w-4 mr-2" />
                Subscribe
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-square max-w-md mx-auto hidden lg:block"
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-[280px] h-auto relative mb-6 floating">
                <Image
                  src="/tech-bird-illustration.png"
                  alt="Digital Bird Illustration"
                  width={280}
                  height={200}
                  className="object-contain"
                />
              </div>
              <p className="text-sky-800/80 text-center text-sm italic font-medium">
                "Harmonizing the natural world with digital innovation"
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToNextSection}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full w-12 h-12"
        >
          <ArrowDownIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
