import { scramble } from './scramble'

let observer: IntersectionObserver | undefined

// Fades `.reveal` blocks in as they scroll into view, and plays the text
// effect on any `[data-scramble]` inside them. Blocks are hidden only here, so
// without the script, or for readers who ask for less motion, all is shown.
export function setupMotion(): void {
  observer?.disconnect()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const reveals = document.querySelectorAll<HTMLElement>('.reveal')
  for (const el of reveals) el.classList.add('reveal-pending')
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.remove('reveal-pending')
        observer?.unobserve(el)
        for (const target of el.querySelectorAll<HTMLElement>('[data-scramble]')) scramble(target)
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  for (const el of reveals) observer.observe(el)
}
