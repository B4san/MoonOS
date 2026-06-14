import { create } from 'zustand'
import type { AccentColor, DesktopLayout, HardwareTier, ThemeMode, UserSettings } from '@/types'
import { persistence } from '@/core/persistence'
import { applyTheme, applyAccent } from '@/core/theme-engine'
import { applyTierToDOM } from '@/core/adaptive-renderer'

interface SettingsStore extends UserSettings {
  activeTier: HardwareTier
  focusMode: boolean
  setTheme: (theme: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setTierOverride: (tier: HardwareTier | 'auto') => void
  setActiveTier: (tier: HardwareTier) => void
  setWorkspaceName: (name: string) => void
  setDesktopLayout: (layout: DesktopLayout) => void
  toggleFocusMode: () => void
  markInitialized: () => void
  save: () => void
}

const defaults: UserSettings = {
  theme: 'dark',
  accent: 'moonlight',
  tierOverride: 'auto',
  workspaceName: 'My Workspace',
  initialized: false,
  desktopLayout: 'grid',
}

const saved = persistence.get<UserSettings>('settings', defaults)

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...{ ...defaults, ...saved },
  activeTier: 'balanced',
  focusMode: false,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
    get().save()
  },
  setAccent: (accent) => {
    applyAccent(accent)
    set({ accent })
    get().save()
  },
  setTierOverride: (tierOverride) => {
    set({ tierOverride })
    if (tierOverride !== 'auto') {
      applyTierToDOM(tierOverride)
      set({ activeTier: tierOverride })
    }
    get().save()
  },
  setActiveTier: (tier) => {
    applyTierToDOM(tier)
    set({ activeTier: tier })
  },
  setWorkspaceName: (workspaceName) => {
    set({ workspaceName })
    get().save()
  },
  setDesktopLayout: (desktopLayout) => {
    set({ desktopLayout })
    get().save()
  },
  toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
  markInitialized: () => {
    set({ initialized: true })
    get().save()
  },
  save: () => {
    const { theme, accent, tierOverride, workspaceName, initialized, desktopLayout } = get()
    persistence.set('settings', { theme, accent, tierOverride, workspaceName, initialized, desktopLayout })
  },
}))
