export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "theme"

type ReadableStorage = Pick<Storage, "getItem">
type WritableStorage = Pick<Storage, "setItem">

// Storage access can throw (private mode, blocked site data), so every call is guarded.
export function readStoredTheme(storage: ReadableStorage | null): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY)
    return value === "light" || value === "dark" ? value : null
  } catch {
    return null
  }
}

export function storeTheme(storage: WritableStorage | null, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The choice still applies to this page view.
  }
}

export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  return stored ?? (systemPrefersDark ? "dark" : "light")
}

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark"
}

export interface ToggleView {
  // What the button will switch to — labelling the current theme instead left
  // it ambiguous whether "Dark" meant the state or the action.
  target: Theme
  label: string
  ariaLabel: string
}

export function toggleView(current: Theme): ToggleView {
  const target = nextTheme(current)
  return {
    target,
    label: target === "dark" ? "Dark" : "Light",
    ariaLabel: `Switch to ${target} mode`,
  }
}
