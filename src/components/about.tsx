import { useEffect, useRef } from 'react'

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = el.querySelectorAll('[data-animate]')
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-20" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="mb-12" data-animate>
          <h2 className="text-2xl font-mono-heading mb-2">About</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
          {/* Left: photo placeholder + quick facts */}
          <div className="opacity-0" data-animate style={{ animationDelay: '80ms' }}>
            <div className="aspect-square bg-muted rounded-sm mb-6 flex items-center justify-center overflow-hidden">
              <img
                src="/new-favicon.png"
                alt="Fairy Pitta"
                className="w-full h-full object-cover"
                width="400"
                height="400"
                loading="lazy"
                decoding="async"
              />
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Location
                </dt>
                <dd>Singapore</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Focus
                </dt>
                <dd>Bioacoustics / EdTech</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Languages
                </dt>
                <dd>JP / EN</dd>
              </div>
            </dl>
          </div>

          {/* Right: bio text */}
          <div className="opacity-0" data-animate style={{ animationDelay: '160ms' }}>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Software engineer based in Singapore, building tools at the intersection
              of technology, education, and nature. Particularly interested in
              bioacoustics — using code to analyze and classify bird vocalizations.
            </p>
            <p className="leading-relaxed text-muted-foreground mb-6">
              My work ranges from full-stack web applications and browser extensions
              to audio processing pipelines and open-source developer tools.
              I value clean architecture, purposeful design, and code that solves
              real problems.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              When not coding, I'm usually birding, reading field guides,
              or tinkering with spectrogram visualizations.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
