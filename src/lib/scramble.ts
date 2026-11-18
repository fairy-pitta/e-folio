// Text that starts as noise and settles, left to right, into the real words.

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// One frame of the effect. `progress` runs from 0 to 1. Characters left of the
// front are final and the rest are noise, so the text keeps its full length and
// the paragraph never changes height. Whitespace is always kept, so lines wrap
// where they will end up.
export function scrambleFrame(text: string, progress: number, random: () => number = Math.random): string {
  const p = Math.min(Math.max(progress, 0), 1)
  if (p === 1) return text
  const front = Math.floor(p * text.length)
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    out += i < front || /\s/.test(ch) ? ch : GLYPHS[Math.floor(random() * GLYPHS.length)]
  }
  return out
}

// Plays the effect once on an element, then leaves its original text.
export function scramble(el: HTMLElement, duration = 1400): void {
  if (el.dataset.scrambled) return
  el.dataset.scrambled = 'true'
  const text = el.dataset.text ?? el.textContent ?? ''
  el.dataset.text = text
  const start = performance.now()
  const tick = (now: number) => {
    const progress = (now - start) / duration
    el.textContent = scrambleFrame(text, progress)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
