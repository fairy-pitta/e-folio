import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { lightTheme, variable } from '../styles/css-tokens'
import { OG_COLOURS } from './og-image'

const light = lightTheme(readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf8'))

describe('OG card', () => {
  for (const [name, value] of Object.entries(OG_COLOURS)) {
    it(`uses_the_light_theme_${name}_token`, () => {
      expect(value.toLowerCase()).toBe(variable(light, name).toLowerCase())
    })
  }

  it('reads_its_fonts_from_the_committed_files', () => {
    for (const file of ['Geist-Bold.ttf', 'GeistMono-Regular.ttf', 'OFL.txt']) {
      expect(() => readFileSync(resolve(__dirname, '../../assets/fonts', file))).not.toThrow()
    }
  })
})
