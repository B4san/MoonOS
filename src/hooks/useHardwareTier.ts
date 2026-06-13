import { useEffect, useState } from 'react'
import { getHardwareProfile } from '@/core/hardware-detector'
import { useSettingsStore } from '@/stores/settings-store'
import type { HardwareProfile, HardwareTier } from '@/types'

export function useHardwareTier() {
  const [profile, setProfile] = useState<HardwareProfile | null>(null)
  const { tierOverride, setActiveTier } = useSettingsStore()

  useEffect(() => {
    getHardwareProfile().then(p => {
      setProfile(p)
      const tier: HardwareTier = tierOverride === 'auto' ? p.tier : tierOverride
      setActiveTier(tier)
    })
  }, [tierOverride, setActiveTier])

  return profile
}
