import type { AccentColor, ThemeMode } from '@/types'

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', 'light')
    }
  } else if (mode === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    root.removeAttribute('data-theme')
  }
}

export function applyAccent(accent: AccentColor) {
  const root = document.documentElement
  if (accent === 'moonlight') {
    root.removeAttribute('data-accent')
  } else {
    root.setAttribute('data-accent', accent)
  }
}
