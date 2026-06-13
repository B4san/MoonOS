import { describe, it, expect } from 'vitest'
import { computeScore, scoreToTier } from '@/core/hardware-detector'
import type { HardwareDetails } from '@/types'

describe('hardware-detector', () => {
  it('assigns quality tier for powerful hardware', () => {
    const details: HardwareDetails = { cpuCores: 16, ram: 16, gpu: true, battery: null, connection: { effectiveType: '4g', downlink: 10 } }
    const score = computeScore(details)
    expect(score).toBeGreaterThanOrEqual(70)
    expect(scoreToTier(score)).toBe('quality')
  })

  it('assigns balanced tier for mid-range hardware', () => {
    const details: HardwareDetails = { cpuCores: 4, ram: 4, gpu: true, battery: null, connection: { effectiveType: '3g', downlink: 1.5 } }
    const score = computeScore(details)
    expect(scoreToTier(score)).toBe('balanced')
  })

  it('assigns performance tier for weak hardware', () => {
    const details: HardwareDetails = { cpuCores: 2, ram: 2, gpu: false, battery: { charging: false, level: 0.1 }, connection: { effectiveType: '2g', downlink: 0.3 } }
    const score = computeScore(details)
    expect(score).toBeLessThan(40)
    expect(scoreToTier(score)).toBe('performance')
  })

  it('handles null RAM gracefully (defaults to 4GB)', () => {
    const details: HardwareDetails = { cpuCores: 4, ram: null, gpu: false, battery: null, connection: null }
    const score = computeScore(details)
    expect(score).toBeGreaterThan(0)
  })

  it('applies battery penalty when low and not charging', () => {
    const base: HardwareDetails = { cpuCores: 8, ram: 8, gpu: true, battery: null, connection: null }
    const withBattery: HardwareDetails = { ...base, battery: { charging: false, level: 0.1 } }
    expect(computeScore(base)).toBeGreaterThan(computeScore(withBattery))
  })

  it('score is always between 0 and 100', () => {
    const extreme: HardwareDetails = { cpuCores: 64, ram: 128, gpu: true, battery: { charging: true, level: 1 }, connection: { effectiveType: '4g', downlink: 100 } }
    expect(computeScore(extreme)).toBeLessThanOrEqual(100)
    const weak: HardwareDetails = { cpuCores: 1, ram: 1, gpu: false, battery: { charging: false, level: 0.05 }, connection: { effectiveType: 'slow-2g', downlink: 0.01 } }
    expect(computeScore(weak)).toBeGreaterThanOrEqual(0)
  })
})
