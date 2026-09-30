import { describe, it, expect } from 'vitest'
import { readStoredTheme, storeTheme, resolveTheme, nextTheme, toggleView, THEME_STORAGE_KEY } from './theme'

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('readStoredTheme', () => {
  it('returns_a_stored_light_or_dark_value', () => {
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark')
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'light' }))).toBe('light')
  })

  it('ignores_missing_or_unknown_values', () => {
    expect(readStoredTheme(memoryStorage())).toBeNull()
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' }))).toBeNull()
  })

  it('returns_null_when_storage_is_unavailable', () => {
    expect(readStoredTheme(null)).toBeNull()
    expect(readStoredTheme(throwingStorage)).toBeNull()
  })
})

describe('storeTheme', () => {
  it('writes_the_theme_under_the_storage_key', () => {
    const storage = memoryStorage()
    storeTheme(storage, 'light')
    expect(storage.data[THEME_STORAGE_KEY]).toBe('light')
  })

  it('does_not_throw_when_storage_fails', () => {
    expect(() => storeTheme(throwingStorage, 'dark')).not.toThrow()
    expect(() => storeTheme(null, 'dark')).not.toThrow()
  })
})

describe('resolveTheme', () => {
  it('prefers_the_stored_choice_over_the_system_setting', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls_back_to_the_system_setting', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })
})

describe('nextTheme', () => {
  it('toggles_between_light_and_dark', () => {
    expect(nextTheme('light')).toBe('dark')
    expect(nextTheme('dark')).toBe('light')
  })
})

describe('toggleView', () => {
  it('test_build_view_in_dark_theme_returns_the_light_target', () => {
    expect(toggleView('dark')).toEqual({
      target: 'light',
      label: 'Light',
      ariaLabel: 'Switch to light mode',
    })
  })

  it('test_build_view_in_light_theme_returns_the_dark_target', () => {
    expect(toggleView('light')).toEqual({
      target: 'dark',
      label: 'Dark',
      ariaLabel: 'Switch to dark mode',
    })
  })

  it('test_build_view_never_labels_the_current_theme', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(toggleView(theme).target).not.toBe(theme)
    }
  })
})
