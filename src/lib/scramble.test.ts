import { describe, it, expect } from 'vitest'
import { scrambleFrame } from './scramble'

const text = 'I studied ecology at Yale-NUS, and hence my projects involve birds.'

describe('scrambleFrame', () => {
  it('starts_as_noise_of_the_same_length', () => {
    const frame = scrambleFrame(text, 0, () => 0)
    expect(frame).toHaveLength(text.length)
    expect(frame.replace(/[ A]/g, '')).toBe('')
  })

  it('shows_the_real_text_at_the_end', () => {
    expect(scrambleFrame(text, 1)).toBe(text)
    expect(scrambleFrame(text, 1.5)).toBe(text)
  })

  it('settles_from_the_left_and_keeps_spaces_in_place', () => {
    const frame = scrambleFrame(text, 0.6, () => 0)
    const settled = frame.slice(0, 10)
    expect(text.startsWith(settled)).toBe(true)
    for (let i = 0; i < frame.length; i++) {
      if (text[i] === ' ') expect(frame[i]).toBe(' ')
    }
    expect(frame).toHaveLength(text.length)
    expect(frame).not.toBe(text)
  })
})
