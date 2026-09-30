import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, 'site.css'), 'utf8')

function block(source: string, opener: RegExp): string {
  const match = opener.exec(source)
  if (!match) throw new Error(`block not found: ${opener}`)
  const start = match.index + match[0].length
  let depth = 1
  let i = start
  while (i < source.length && depth > 0) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') depth--
    i++
  }
  return source.slice(start, i - 1)
}

function variable(source: string, name: string): string {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`).exec(source)
  if (!m) throw new Error(`variable not found: ${name}`)
  return m[1]
}

function luminance(hex: string): number {
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('site.css', () => {
  it('hides_elements_with_the_hidden_attribute_despite_display_rules', () => {
    expect(css).toMatch(/\[hidden\]\s*\{[^}]*display:\s*none/)
  })

  const light = block(css, /^:root\s*\{/m)
  const dark = block(
    block(css, /@media \(prefers-color-scheme: dark\)\s*\{/),
    /:root:not\(\[data-theme="light"\]\)\s*\{/,
  )
  const chosenDark = block(css, /^:root\[data-theme="dark"\]\s*\{/m)

  it('lets_a_chosen_light_theme_override_a_dark_system_setting', () => {
    expect(block(css, /^:root\[data-theme="light"\]\s*\{/m)).toMatch(/color-scheme:\s*light/)
  })

  it('uses_the_same_colours_for_chosen_dark_and_system_dark', () => {
    for (const name of ['fg', 'muted', 'faint', 'line', 'bg', 'code-bg']) {
      expect(variable(chosenDark, name)).toBe(variable(dark, name))
    }
    expect(chosenDark).toMatch(/color-scheme:\s*dark/)
  })

  for (const [label, scope] of [['light', light], ['dark', dark]] as const) {
    for (const name of ['fg', 'muted', 'faint']) {
      it(`${label}_${name}_text_meets_wcag_aa_contrast_on_bg`, () => {
        expect(contrast(variable(scope, name), variable(scope, 'bg'))).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
