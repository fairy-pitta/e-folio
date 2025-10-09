"use client"

import Image from "next/image"

export default function ParallaxBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1]">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/sky.png"
          alt="Bird floating on water"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 backdrop-blur-[2px]"></div>
      </div>
      <div className="absolute inset-0 bg-pattern opacity-20"></div>
    </div>
  )
}
