import { useSettingsStore } from '@/stores/settings-store'
import type { HardwareTier } from '@/types'

export function useAdaptiveValue<T>(values: Record<HardwareTier, T>): T {
  const tier = useSettingsStore(s => s.activeTier)
  return values[tier]
}
