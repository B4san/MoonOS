import { describe, it, expect } from 'vitest'
import { computeScore, scoreToTier } from '@/core/hardware-detector'
import type { HardwareDetails } from '@/types'

describe('hardware-detector', () => {
  it('assigns quality tier for powerful hardware', () => {
    const details: HardwareDetails = { cpuCores: 16, ram: 16, gpuTier: 'webgpu', battery: null, connection: { effectiveType: '4g', downlink: 10 } }
    const score = computeScore(details)
    expect(score).toBeGreaterThanOrEqual(70)
    expect(scoreToTier(score)).toBe('quality')
  })

  it('assigns balanced tier for mid-range hardware', () => {
    const details: HardwareDetails = { cpuCores: 4, ram: 4, gpuTier: 'webgl2', battery: null, connection: { effectiveType: '3g', downlink: 1.5 } }
    const score = computeScore(details)
    expect(scoreToTier(score)).toBe('balanced')
  })

  it('assigns performance tier for weak hardware', () => {
    const details: HardwareDetails = { cpuCores: 2, ram: 2, gpuTier: 'none', battery: { charging: false, level: 0.1 }, connection: { effectiveType: '2g', downlink: 0.3 } }
    const score = computeScore(details)
    expect(score).toBeLessThan(40)
    expect(scoreToTier(score)).toBe('performance')
  })

  it('handles null RAM gracefully (defaults to 4GB)', () => {
    const details: HardwareDetails = { cpuCores: 4, ram: null, gpuTier: 'webgl1', battery: null, connection: null }
    const score = computeScore(details)
    expect(score).toBeGreaterThan(0)
  })

  it('applies battery penalty when low and not charging', () => {
    const base: HardwareDetails = { cpuCores: 8, ram: 8, gpuTier: 'webgl2', battery: null, connection: null }
    const withLowBattery: HardwareDetails = { ...base, battery: { charging: false, level: 0.1 } }
    const withMidBattery: HardwareDetails = { ...base, battery: { charging: false, level: 0.4 } }
    expect(computeScore(base)).toBeGreaterThan(computeScore(withLowBattery))
    expect(computeScore(base)).toBeGreaterThan(computeScore(withMidBattery))
    expect(computeScore(withMidBattery)).toBeGreaterThan(computeScore(withLowBattery))
  })

  it('no battery penalty when charging', () => {
    const base: HardwareDetails = { cpuCores: 8, ram: 8, gpuTier: 'webgl2', battery: null, connection: null }
    const charging: HardwareDetails = { ...base, battery: { charging: true, level: 0.1 } }
    expect(computeScore(base)).toBe(computeScore(charging))
  })

  it('WebGPU scores higher than WebGL2 which scores higher than WebGL1', () => {
    const base = { cpuCores: 8, ram: 8, battery: null, connection: null }
    const webgpu = computeScore({ ...base, gpuTier: 'webgpu' })
    const webgl2 = computeScore({ ...base, gpuTier: 'webgl2' })
    const webgl1 = computeScore({ ...base, gpuTier: 'webgl1' })
    const none = computeScore({ ...base, gpuTier: 'none' })
    expect(webgpu).toBeGreaterThan(webgl2)
    expect(webgl2).toBeGreaterThan(webgl1)
    expect(webgl1).toBeGreaterThan(none)
  })

  it('score is always between 0 and 100', () => {
    const extreme: HardwareDetails = { cpuCores: 64, ram: 128, gpuTier: 'webgpu', battery: { charging: true, level: 1 }, connection: { effectiveType: '4g', downlink: 100 } }
    expect(computeScore(extreme)).toBeLessThanOrEqual(100)
    const weak: HardwareDetails = { cpuCores: 1, ram: 1, gpuTier: 'none', battery: { charging: false, level: 0.05 }, connection: { effectiveType: 'slow-2g', downlink: 0.01 } }
    expect(computeScore(weak)).toBeGreaterThanOrEqual(0)
  })
})
