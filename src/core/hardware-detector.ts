import type { HardwareDetails, HardwareProfile, HardwareTier } from '@/types'

const CACHE_KEY = 'moonos-hw-profile'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

export function computeScore(details: HardwareDetails): number {
  let score = 0

  // CPU (0-30): exponential scale, 4 cores=15, 8=25, 12+=30
  const cpuNorm = Math.min(1, details.cpuCores / 12)
  score += Math.round(cpuNorm * 30)

  // RAM (0-30): 4GB=15, 8GB=25, 16+=30
  const ram = details.ram ?? 4
  const ramNorm = Math.min(1, ram / 16)
  score += Math.round(ramNorm * 30)

  // GPU (0-25): WebGPU=25, WebGL2=20, WebGL1=12, none=0
  if (details.gpuTier === 'webgpu') score += 25
  else if (details.gpuTier === 'webgl2') score += 20
  else if (details.gpuTier === 'webgl1') score += 12
  // else 0

  // Battery penalty: -15 if <20% and not charging, -5 if <50% and not charging
  if (details.battery && !details.battery.charging) {
    if (details.battery.level < 0.2) score -= 15
    else if (details.battery.level < 0.5) score -= 5
  }

  // Network bonus (0-15)
  if (details.connection) {
    const netScores: Record<string, number> = { '4g': 15, '3g': 8, '2g': 3, 'slow-2g': 0 }
    score += netScores[details.connection.effectiveType] ?? 10
  } else {
    score += 10 // assume decent connection if API not available
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function scoreToTier(score: number): HardwareTier {
  if (score >= 70) return 'quality'
  if (score >= 40) return 'balanced'
  return 'performance'
}

/** Detect GPU capability via WebGPU → WebGL2 → WebGL1 fallback chain */
function detectGPU(): HardwareDetails['gpuTier'] {
  // Try WebGPU first (synchronous check for existence)
  if ('gpu' in navigator) return 'webgpu'

  // Try WebGL2
  try {
    const canvas = document.createElement('canvas')
    const gl2 = canvas.getContext('webgl2')
    if (gl2) {
      const dbg = gl2.getExtension('WEBGL_debug_renderer_info')
      if (dbg) {
        const renderer = gl2.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        // Store GPU name for display
        if (renderer) (window as unknown as Record<string, string>).__moonGpuRenderer = renderer
      }
      return 'webgl2'
    }
  } catch { /* fallthrough */ }

  // Try WebGL1
  try {
    const canvas = document.createElement('canvas')
    if (canvas.getContext('webgl')) return 'webgl1'
  } catch { /* fallthrough */ }

  return 'none'
}

export async function detectHardware(): Promise<HardwareDetails> {
  const cpuCores = navigator.hardwareConcurrency ?? 4

  // RAM: deviceMemory API (Chrome only, returns nearest power of 2)
  const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null

  // GPU detection with fallback chain
  const gpuTier = detectGPU()

  // Battery
  let battery: HardwareDetails['battery'] = null
  try {
    if ('getBattery' in navigator) {
      const bm = await (navigator as unknown as { getBattery(): Promise<BatteryManager> }).getBattery()
      battery = { charging: bm.charging, level: bm.level }
    }
  } catch { /* not supported in Firefox/Safari */ }

  // Network
  let connection: HardwareDetails['connection'] = null
  const conn = (navigator as unknown as { connection?: NetworkInformation }).connection
  if (conn) {
    connection = { effectiveType: conn.effectiveType ?? '4g', downlink: conn.downlink ?? 10 }
  }

  return { cpuCores, ram, gpuTier, battery, connection }
}

export async function getHardwareProfile(forceRefresh = false): Promise<HardwareProfile> {
  if (!forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const profile: HardwareProfile = JSON.parse(cached)
        if (Date.now() - profile.timestamp < CACHE_TTL) return profile
      } catch { /* corrupted cache, re-detect */ }
    }
  }

  const details = await detectHardware()
  const score = computeScore(details)
  const profile: HardwareProfile = { tier: scoreToTier(score), score, details, timestamp: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(profile))
  return profile
}

/** Subscribe to battery changes and call back with updated profile */
export async function watchBattery(onUpdate: (profile: HardwareProfile) => void): Promise<() => void> {
  try {
    if (!('getBattery' in navigator)) return () => {}
    const bm = await (navigator as unknown as { getBattery(): Promise<BatteryManager> }).getBattery()

    const update = async () => {
      const profile = await getHardwareProfile(true)
      onUpdate(profile)
    }

    bm.addEventListener('chargingchange', update)
    bm.addEventListener('levelchange', update)

    return () => {
      bm.removeEventListener('chargingchange', update)
      bm.removeEventListener('levelchange', update)
    }
  } catch {
    return () => {}
  }
}

// Type helpers for browser APIs not in TS lib
interface BatteryManager extends EventTarget {
  charging: boolean
  level: number
}

interface NetworkInformation {
  effectiveType?: string
  downlink?: number
}
