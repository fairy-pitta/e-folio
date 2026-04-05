import { useEffect, useRef } from 'react'

interface ExperienceItem {
  period: string
  role: string
  company: string
  description: string
  tags: string[]
}

const experiences: ExperienceItem[] = [
  {
    period: '2024 — Present',
    role: 'Software Engineer',
    company: 'Freelance',
    description:
      'Building web applications, browser extensions, and open-source tools. Focus on bioacoustics research tooling and education technology.',
    tags: ['TypeScript', 'React', 'Python', 'Astro'],
  },
  // Add more entries as needed
]

export default function Experience() {
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
    <section id="experience" className="py-20" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="mb-12" data-animate>
          <h2 className="text-2xl font-mono-heading mb-2">Experience</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
        </div>

        <div className="divide-y divide-border">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 opacity-0"
              data-animate
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground pt-1">
                {exp.period}
              </div>
              <div>
                <h3 className="font-mono-heading text-base mb-1">
                  {exp.role}
                  <span className="text-muted-foreground font-normal">
                    {' '}— {exp.company}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
