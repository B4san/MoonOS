import type { AccentColor, ThemeMode } from '@/types'

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', mode === 'light' ? 'light' : '')
    if (mode === 'dark') root.removeAttribute('data-theme')
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
