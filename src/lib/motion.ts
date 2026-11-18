let observer: IntersectionObserver | undefined

// Fades `.reveal` blocks in as they scroll into view. Blocks are hidden only
// here, so without the script, or for readers who ask for less motion, all is shown.
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
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  for (const el of reveals) observer.observe(el)
}

let coverVideosWatched = false

// Looping card covers stand still for readers who ask for less motion, and
// follow the setting if it changes while the page is open. Call it once: the
// router swaps pages without reloading, so it re-applies on every arrival.
export function watchCoverVideos(): void {
  if (coverVideosWatched) return
  coverVideosWatched = true
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const apply = () => {
    for (const video of document.querySelectorAll<HTMLVideoElement>('.specimen video')) {
      if (reduce.matches) video.pause()
      else void video.play().catch(() => {})
    }
  }
  document.addEventListener('astro:page-load', apply)
  reduce.addEventListener('change', apply)
}
