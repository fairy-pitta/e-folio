import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { block, lightTheme, variable } from './css-tokens'

// Colours live in tokens.css; element defaults such as [hidden] in base.css.
const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')
const base = readFileSync(resolve(__dirname, 'base.css'), 'utf8')
const site = readFileSync(resolve(__dirname, 'site.css'), 'utf8')

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
  it('imports_every_part_and_each_part_exists', () => {
    const parts = [...site.matchAll(/@import "\.\/([^"]+)";/g)].map((m) => m[1])
    expect(parts[0]).toBe('tokens.css')
    expect(parts.at(-1)).toBe('motion.css')
    for (const part of parts) expect(existsSync(resolve(__dirname, part)), part).toBe(true)
  })

  it('hides_elements_with_the_hidden_attribute_despite_display_rules', () => {
    expect(base).toMatch(/\[hidden\]\s*\{[^}]*display:\s*none/)
  })

  const light = lightTheme(css)
  const dark = block(
    block(css, /@media \(prefers-color-scheme: dark\)\s*\{/),
    /:root:not\(\[data-theme="light"\]\)\s*\{/,
  )
  const chosenDark = block(css, /^:root\[data-theme="dark"\]\s*\{/m)

  it('lets_a_chosen_light_theme_override_a_dark_system_setting', () => {
    expect(block(css, /^:root\[data-theme="light"\]\s*\{/m)).toMatch(/color-scheme:\s*light/)
  })

  it('uses_the_same_colours_for_chosen_dark_and_system_dark', () => {
    for (const name of ['fg', 'muted', 'faint', 'fg-tertiary', 'line', 'bg', 'band-alt', 'card', 'tile-alt', 'code-bg', 'accent', 'button', 'button-fg']) {
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

    // Links and "Learn more" sit on both bands and on tiles of either colour.
    for (const surface of ['bg', 'band-alt', 'card', 'tile-alt']) {
      it(`${label}_accent_links_meet_wcag_aa_contrast_on_${surface}`, () => {
        expect(contrast(variable(scope, 'accent'), variable(scope, surface))).toBeGreaterThanOrEqual(4.5)
      })
    }

    it(`${label}_primary_button_text_meets_wcag_aa_contrast`, () => {
      expect(contrast(variable(scope, 'button-fg'), variable(scope, 'button'))).toBeGreaterThanOrEqual(4.5)
      expect(contrast(variable(scope, 'button-fg'), variable(scope, 'button-hover'))).toBeGreaterThanOrEqual(4.5)
    })

    // The grey half of a two-tone headline is for large type only: 3:1 is the
    // AA bar for text 24px and up, and it must still read on both bands.
    for (const surface of ['bg', 'band-alt']) {
      it(`${label}_tertiary_headline_grey_meets_large_text_contrast_on_${surface}`, () => {
        expect(contrast(variable(scope, 'fg-tertiary'), variable(scope, surface))).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
