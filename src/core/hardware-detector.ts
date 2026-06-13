import type { HardwareDetails, HardwareProfile, HardwareTier } from '@/types'

const CACHE_KEY = 'moonos-hw-profile'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

export function computeScore(details: HardwareDetails): number {
  let score = 0
  // CPU (0-30 points): 2 cores=5, 4=15, 8+=30
  score += Math.min(30, (details.cpuCores / 8) * 30)
  // RAM (0-30 points): 2GB=8, 4GB=15, 8GB+=30
  const ram = details.ram ?? 4
  score += Math.min(30, (ram / 8) * 30)
  // GPU (0-25 points)
  score += details.gpu ? 25 : 0
  // Battery penalty (-10 if low and not charging)
  if (details.battery && !details.battery.charging && details.battery.level < 0.2) {
    score -= 10
  }
  // Network bonus (0-15): 4g=15, 3g=8, 2g=3
  if (details.connection) {
    const netScores: Record<string, number> = { '4g': 15, '3g': 8, '2g': 3, 'slow-2g': 0 }
    score += netScores[details.connection.effectiveType] ?? 10
  } else {
    score += 10
  }
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function scoreToTier(score: number): HardwareTier {
  if (score >= 70) return 'quality'
  if (score >= 40) return 'balanced'
  return 'performance'
}

export async function detectHardware(): Promise<HardwareDetails> {
  const cpuCores = navigator.hardwareConcurrency ?? 4
  const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null

  let gpu = false
  try {
    if ('gpu' in navigator) {
      const adapter = await (navigator as unknown as { gpu: { requestAdapter(): Promise<unknown> } }).gpu.requestAdapter()
      gpu = !!adapter
    }
  } catch { /* not supported */ }

  let battery: HardwareDetails['battery'] = null
  try {
    if ('getBattery' in navigator) {
      const bm = await (navigator as unknown as { getBattery(): Promise<{ charging: boolean; level: number }> }).getBattery()
      battery = { charging: bm.charging, level: bm.level }
    }
  } catch { /* not supported */ }

  let connection: HardwareDetails['connection'] = null
  const conn = (navigator as unknown as { connection?: { effectiveType: string; downlink: number } }).connection
  if (conn) {
    connection = { effectiveType: conn.effectiveType, downlink: conn.downlink }
  }

  return { cpuCores, ram, gpu, battery, connection }
}

export async function getHardwareProfile(): Promise<HardwareProfile> {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    const profile: HardwareProfile = JSON.parse(cached)
    if (Date.now() - profile.timestamp < CACHE_TTL) return profile
  }
  const details = await detectHardware()
  const score = computeScore(details)
  const profile: HardwareProfile = { tier: scoreToTier(score), score, details, timestamp: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(profile))
  return profile
}
