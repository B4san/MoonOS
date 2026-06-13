import { useEffect, useState } from 'react'
import { getHardwareProfile, watchBattery } from '@/core/hardware-detector'
import { useSettingsStore } from '@/stores/settings-store'
import type { HardwareProfile, HardwareTier } from '@/types'

export function useHardwareTier() {
  const [profile, setProfile] = useState<HardwareProfile | null>(null)
  const tierOverride = useSettingsStore(s => s.tierOverride)
  const setActiveTier = useSettingsStore(s => s.setActiveTier)

  useEffect(() => {
    let unwatch: (() => void) | null = null

    const init = async () => {
      const p = await getHardwareProfile()
      setProfile(p)
      const tier: HardwareTier = tierOverride === 'auto' ? p.tier : tierOverride
      setActiveTier(tier)

      // Watch battery for real-time tier updates
      unwatch = await watchBattery((updated) => {
        setProfile(updated)
        if (tierOverride === 'auto') setActiveTier(updated.tier)
      })
    }

    init()
    return () => { unwatch?.() }
  }, [tierOverride, setActiveTier])

  return profile
}
