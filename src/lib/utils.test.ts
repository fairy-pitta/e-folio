import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges_class_names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles_conditional_classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })

  it('resolves_tailwind_conflicts_with_last_win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles_empty_input', () => {
    expect(cn()).toBe('')
  })

  it('handles_undefined_and_null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b')
  })
})
