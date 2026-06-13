import { describe, it, expect, beforeEach } from 'vitest'
import { applyTierToDOM, getParticleCount } from '@/core/adaptive-renderer'

describe('adaptive-renderer', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-tier')
  })

  it('applies quality tier CSS variables', () => {
    applyTierToDOM('quality')
    const style = document.documentElement.style
    expect(style.getPropertyValue('--moon-blur')).toBe('20px')
    expect(style.getPropertyValue('--moon-particle-count')).toBe('500')
    expect(document.documentElement.getAttribute('data-tier')).toBe('quality')
  })

  it('applies performance tier with no blur', () => {
    applyTierToDOM('performance')
    expect(document.documentElement.style.getPropertyValue('--moon-blur')).toBe('0px')
    expect(document.documentElement.style.getPropertyValue('--moon-particle-count')).toBe('0')
  })

  it('getParticleCount returns correct values', () => {
    expect(getParticleCount('quality')).toBe(500)
    expect(getParticleCount('balanced')).toBe(200)
    expect(getParticleCount('performance')).toBe(0)
  })
})
