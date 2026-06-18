import { create } from 'zustand'
import type { AccentColor, DesktopLayout, HardwareTier, ThemeMode, UserSettings } from '@/types'
import { persistence } from '@/core/persistence'
import { applyTheme, applyAccent } from '@/core/theme-engine'
import { applyTierToDOM } from '@/core/adaptive-renderer'
import { applyCircadianTheme } from '@/core/circadian'
import { audioEngine } from '@/core/audio-engine'

interface SettingsStore extends UserSettings {
  activeTier: HardwareTier
  focusMode: boolean
  setTheme: (theme: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setTierOverride: (tier: HardwareTier | 'auto') => void
  setActiveTier: (tier: HardwareTier) => void
  setWorkspaceName: (name: string) => void
  setDesktopLayout: (layout: DesktopLayout) => void
  setCircadianEnabled: (v: boolean) => void
  setCircadianOffset: (v: number) => void
  setAudioVolume: (v: number) => void
  setSoundscapesEnabled: (v: boolean) => void
  setSoundscapeActive: (v: 'none' | 'deep-space' | 'rain-studio' | 'digital-garden' | 'white-noise' | 'lunar-tide') => void
  setUiSoundsEnabled: (v: boolean) => void
  setTerminalClicksEnabled: (v: boolean) => void
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
  circadianEnabled: true,
  circadianOffset: 0,
  audioVolume: 50,
  soundscapesEnabled: true,
  soundscapeActive: 'none',
  uiSoundsEnabled: true,
  terminalClicksEnabled: true,
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
    applyCircadianTheme(theme, get().accent, get().circadianEnabled ?? true, get().circadianOffset ?? 0)
  },
  setAccent: (accent) => {
    applyAccent(accent)
    set({ accent })
    get().save()
    applyCircadianTheme(get().theme, accent, get().circadianEnabled ?? true, get().circadianOffset ?? 0)
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
  setCircadianEnabled: (circadianEnabled) => {
    set({ circadianEnabled })
    get().save()
    applyCircadianTheme(get().theme, get().accent, circadianEnabled, get().circadianOffset ?? 0)
  },
  setCircadianOffset: (circadianOffset) => {
    set({ circadianOffset })
    get().save()
    applyCircadianTheme(get().theme, get().accent, get().circadianEnabled ?? true, circadianOffset)
  },
  setAudioVolume: (audioVolume) => {
    set({ audioVolume })
    get().save()
    audioEngine.setVolume(audioVolume)
  },
  setSoundscapesEnabled: (soundscapesEnabled) => {
    set({ soundscapesEnabled })
    get().save()
    audioEngine.setSoundscapesEnabled(soundscapesEnabled)
  },
  setSoundscapeActive: (soundscapeActive) => {
    set({ soundscapeActive })
    get().save()
    audioEngine.setSoundscape(soundscapeActive)
  },
  setUiSoundsEnabled: (uiSoundsEnabled) => {
    set({ uiSoundsEnabled })
    get().save()
    audioEngine.setUiSoundsEnabled(uiSoundsEnabled)
  },
  setTerminalClicksEnabled: (terminalClicksEnabled) => {
    set({ terminalClicksEnabled })
    get().save()
  },
  toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
  markInitialized: () => {
    set({ initialized: true })
    get().save()
  },
  save: () => {
    const {
      theme, accent, tierOverride, workspaceName, initialized, desktopLayout,
      circadianEnabled, circadianOffset, audioVolume, soundscapesEnabled,
      soundscapeActive, uiSoundsEnabled, terminalClicksEnabled
    } = get()
    persistence.set('settings', {
      theme, accent, tierOverride, workspaceName, initialized, desktopLayout,
      circadianEnabled, circadianOffset, audioVolume, soundscapesEnabled,
      soundscapeActive, uiSoundsEnabled, terminalClicksEnabled
    })
  },
}))
