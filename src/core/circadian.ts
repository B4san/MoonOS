import type { AccentColor, ThemeMode } from '@/types'

export interface CircadianPalette {
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgSurface: string
  bgElevated: string
  textPrimary: string
  textSecondary: string
  accent: string
  shadowX: number
  shadowY: number
  shadowBlur: number
  shadowColor: string
  blurAmount: string
  particleCount: number
}

export const circadianPhases = {
  dawn: { start: 5, end: 8 },
  morning: { start: 8, end: 12 },
  day: { start: 12, end: 17 },
  golden: { start: 17, end: 20 },
  dusk: { start: 20, end: 23 },
  night: { start: 23, end: 5 },
}

const darkPalettes: Record<string, CircadianPalette> = {
  dawn: {
    bgPrimary: '#0e0b1e',
    bgSecondary: '#161130',
    bgTertiary: '#221948',
    bgSurface: 'rgba(22, 17, 48, 0.75)',
    bgElevated: 'rgba(34, 25, 72, 0.6)',
    textPrimary: '#e5e1f0',
    textSecondary: '#a59ec0',
    accent: '#d97706', // soft orange
    shadowX: -6,
    shadowY: 6,
    shadowBlur: 24,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    blurAmount: '16px',
    particleCount: 15,
  },
  morning: {
    bgPrimary: '#070f22',
    bgSecondary: '#0f1c3a',
    bgTertiary: '#192b57',
    bgSurface: 'rgba(15, 28, 58, 0.8)',
    bgElevated: 'rgba(25, 43, 87, 0.65)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    accent: '#0284c7', // morning sky blue
    shadowX: -12,
    shadowY: 8,
    shadowBlur: 32,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    blurAmount: '20px',
    particleCount: 40,
  },
  day: {
    bgPrimary: '#030712',
    bgSecondary: '#0f172a',
    bgTertiary: '#1e293b',
    bgSurface: 'rgba(15, 23, 42, 0.85)',
    bgElevated: 'rgba(30, 41, 59, 0.7)',
    textPrimary: '#f8fafc',
    textSecondary: '#64748b',
    accent: '#3b82f6', // neutral blue
    shadowX: 0,
    shadowY: 10,
    shadowBlur: 32,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    blurAmount: '20px',
    particleCount: 50,
  },
  golden: {
    bgPrimary: '#1c0f16',
    bgSecondary: '#291720',
    bgTertiary: '#3b212e',
    bgSurface: 'rgba(41, 23, 32, 0.8)',
    bgElevated: 'rgba(59, 33, 46, 0.65)',
    textPrimary: '#fdf4ff',
    textSecondary: '#d946ef',
    accent: '#ea580c', // sunset orange
    shadowX: 12,
    shadowY: 8,
    shadowBlur: 32,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    blurAmount: '16px',
    particleCount: 30,
  },
  dusk: {
    bgPrimary: '#0c0721',
    bgSecondary: '#140c36',
    bgTertiary: '#211357',
    bgSurface: 'rgba(20, 12, 54, 0.75)',
    bgElevated: 'rgba(33, 19, 87, 0.6)',
    textPrimary: '#f3e8ff',
    textSecondary: '#c084fc',
    accent: '#7c3aed', // dusk violet
    shadowX: 6,
    shadowY: 6,
    shadowBlur: 28,
    shadowColor: 'rgba(0, 0, 0, 0.55)',
    blurAmount: '24px',
    particleCount: 20,
  },
  night: {
    bgPrimary: '#020208',
    bgSecondary: '#050514',
    bgTertiary: '#0d0d27',
    bgSurface: 'rgba(5, 5, 20, 0.8)',
    bgElevated: 'rgba(13, 13, 39, 0.55)',
    textPrimary: '#fef08a', // warm yellow/candlelight flux white
    textSecondary: '#ca8a04',
    accent: '#4f46e5', // indigo space
    shadowX: 0,
    shadowY: 6,
    shadowBlur: 20,
    shadowColor: 'rgba(0, 0, 0, 0.65)',
    blurAmount: '12px',
    particleCount: 10,
  },
}

function parseHour(offset: number): { currentHour: number; currentMinute: number } {
  const d = new Date()
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const adjusted = new Date(utc + 3600000 * offset)
  return {
    currentHour: adjusted.getHours(),
    currentMinute: adjusted.getMinutes(),
  }
}

export function getCircadianPhase(offset = 0): { phase: keyof typeof circadianPhases; progress: number } {
  const { currentHour, currentMinute } = parseHour(offset)
  const timeVal = currentHour + currentMinute / 60

  if (timeVal >= 5 && timeVal < 8) return { phase: 'dawn', progress: (timeVal - 5) / 3 }
  if (timeVal >= 8 && timeVal < 12) return { phase: 'morning', progress: (timeVal - 8) / 4 }
  if (timeVal >= 12 && timeVal < 17) return { phase: 'day', progress: (timeVal - 12) / 5 }
  if (timeVal >= 17 && timeVal < 20) return { phase: 'golden', progress: (timeVal - 17) / 3 }
  if (timeVal >= 20 && timeVal < 23) return { phase: 'dusk', progress: (timeVal - 20) / 3 }
  
  // Night overlaps midnight
  let progress = 0
  if (timeVal >= 23) progress = (timeVal - 23) / 6
  else progress = (timeVal + 1) / 6
  return { phase: 'night', progress }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Lerp between colors
function interpolateColor(colorA: string, colorB: string, progress: number): string {
  if (colorA.startsWith('rgba') || colorB.startsWith('rgba')) {
    // Basic parser for rgba
    const parseRgba = (c: string) => {
      const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]), a: match[4] ? parseFloat(match[4]) : 1 }
      return { r: 0, g: 0, b: 0, a: 1 }
    }
    const a = parseRgba(colorA)
    const b = parseRgba(colorB)
    const r = a.r + (b.r - a.r) * progress
    const g = a.g + (b.g - a.g) * progress
    const b_val = a.b + (b.b - a.b) * progress
    const alpha = a.a + (b.a - a.a) * progress
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b_val)}, ${alpha})`
  }
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)
  const r = rgbA.r + (rgbB.r - rgbA.r) * progress
  const g = rgbA.g + (rgbB.g - rgbA.g) * progress
  const b = rgbA.b + (rgbB.b - rgbA.b) * progress
  return rgbToHex(r, g, b)
}

export function applyCircadianTheme(theme: ThemeMode, accent: AccentColor, enabled: boolean, offset = 0) {
  const root = document.documentElement
  if (!enabled || theme === 'light') {
    // If disabled or light mode, clear overrides and rely on basic CSS variables
    root.style.removeProperty('--moon-bg-primary')
    root.style.removeProperty('--moon-bg-secondary')
    root.style.removeProperty('--moon-bg-tertiary')
    root.style.removeProperty('--moon-bg-surface')
    root.style.removeProperty('--moon-bg-elevated')
    root.style.removeProperty('--moon-text-primary')
    root.style.removeProperty('--moon-text-secondary')
    root.style.removeProperty('--moon-accent')
    root.style.removeProperty('--moon-shadow')
    root.style.removeProperty('--moon-blur')
    return
  }

  const { phase, progress } = getCircadianPhase(offset)
  const keys = Object.keys(circadianPhases)
  const currentIndex = keys.indexOf(phase)
  const nextIndex = (currentIndex + 1) % keys.length
  const nextPhase = keys[nextIndex]

  const currentPal = darkPalettes[phase]
  const nextPal = darkPalettes[nextPhase]

  // Interpolate properties
  const bgPrimary = interpolateColor(currentPal.bgPrimary, nextPal.bgPrimary, progress)
  const bgSecondary = interpolateColor(currentPal.bgSecondary, nextPal.bgSecondary, progress)
  const bgTertiary = interpolateColor(currentPal.bgTertiary, nextPal.bgTertiary, progress)
  const bgSurface = interpolateColor(currentPal.bgSurface, nextPal.bgSurface, progress)
  const bgElevated = interpolateColor(currentPal.bgElevated, nextPal.bgElevated, progress)
  const textPrimary = interpolateColor(currentPal.textPrimary, nextPal.textPrimary, progress)
  const textSecondary = interpolateColor(currentPal.textSecondary, nextPal.textSecondary, progress)
  
  // Accent override handles theme editor choice vs circadian colors
  const activeAccent = accent === 'moonlight' ? currentPal.accent : root.style.getPropertyValue('--moon-accent') || currentPal.accent
  const nextAccent = accent === 'moonlight' ? nextPal.accent : activeAccent
  const accentColor = interpolateColor(activeAccent, nextAccent, progress)

  // Interpolate shadow directions
  const shadowX = currentPal.shadowX + (nextPal.shadowX - currentPal.shadowX) * progress
  const shadowY = currentPal.shadowY + (nextPal.shadowY - currentPal.shadowY) * progress
  const shadowBlur = currentPal.shadowBlur + (nextPal.shadowBlur - currentPal.shadowBlur) * progress
  const shadowColor = interpolateColor(currentPal.shadowColor, nextPal.shadowColor, progress)
  
  // Set custom properties
  root.style.setProperty('--moon-bg-primary', bgPrimary)
  root.style.setProperty('--moon-bg-secondary', bgSecondary)
  root.style.setProperty('--moon-bg-tertiary', bgTertiary)
  root.style.setProperty('--moon-bg-surface', bgSurface)
  root.style.setProperty('--moon-bg-elevated', bgElevated)
  root.style.setProperty('--moon-text-primary', textPrimary)
  root.style.setProperty('--moon-text-secondary', textSecondary)
  root.style.setProperty('--moon-accent', accentColor)
  
  root.style.setProperty(
    '--moon-shadow',
    `${Math.round(shadowX)}px ${Math.round(shadowY)}px ${Math.round(shadowBlur)}px ${shadowColor}`
  )

  const currentBlur = parseInt(currentPal.blurAmount)
  const nextBlur = parseInt(nextPal.blurAmount)
  const blurVal = currentBlur + (nextBlur - currentBlur) * progress
  root.style.setProperty('--moon-blur', `${Math.round(blurVal)}px`)
}
