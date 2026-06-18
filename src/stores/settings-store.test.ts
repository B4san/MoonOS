import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettingsStore } from '@/stores/settings-store'

// Mock dependencies
vi.mock('@/core/persistence', () => ({
  persistence: {
    get: vi.fn((_, defaults) => defaults),
    set: vi.fn(),
  }
}))

vi.mock('@/core/theme-engine', () => ({
  applyTheme: vi.fn(),
  applyAccent: vi.fn(),
}))

vi.mock('@/core/adaptive-renderer', () => ({
  applyTierToDOM: vi.fn(),
}))

vi.mock('@/core/circadian', () => ({
  applyCircadianTheme: vi.fn(),
}))

vi.mock('@/core/audio-engine', () => ({
  audioEngine: {
    setVolume: vi.fn(),
    setSoundscapesEnabled: vi.fn(),
    setSoundscape: vi.fn(),
    setUiSoundsEnabled: vi.fn(),
    playUIEvent: vi.fn(),
  }
}))

vi.mock('@/core/notifications', () => ({
  useNotifications: {
    getState: () => ({
      push: vi.fn()
    })
  }
}))

describe('settings-store focus mode', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSettingsStore.setState({
      focusMode: false,
      focusDuration: 25,
      focusTimeRemaining: 1500,
      focusTimerActive: false,
      focusBreakActive: false,
      focusBreakDuration: 5,
    })
  })

  it('has correct focus defaults', () => {
    const state = useSettingsStore.getState()
    expect(state.focusDuration).toBe(25)
    expect(state.focusTimeRemaining).toBe(1500)
    expect(state.focusTimerActive).toBe(false)
    expect(state.focusBreakActive).toBe(false)
    expect(state.focusBreakDuration).toBe(5)
  })

  it('can start a focus session', () => {
    const store = useSettingsStore.getState()
    store.startFocusSession(20)

    const state = useSettingsStore.getState()
    expect(state.focusMode).toBe(true)
    expect(state.focusDuration).toBe(20)
    expect(state.focusTimeRemaining).toBe(1200)
    expect(state.focusTimerActive).toBe(true)
    expect(state.focusBreakActive).toBe(false)
  })

  it('can stop a focus session', () => {
    const store = useSettingsStore.getState()
    store.startFocusSession(25)
    store.stopFocusSession()

    const state = useSettingsStore.getState()
    expect(state.focusMode).toBe(false)
    expect(state.focusTimerActive).toBe(false)
    expect(state.focusBreakActive).toBe(false)
  })

  it('ticks the focus timer down', () => {
    const store = useSettingsStore.getState()
    store.startFocusSession(25)
    store.tickFocusTimer()

    const state = useSettingsStore.getState()
    expect(state.focusTimeRemaining).toBe(1499)
  })

  it('transitions to break when focus timer completes', () => {
    // Set remaining time to 1 second
    useSettingsStore.setState({
      focusTimeRemaining: 1,
      focusBreakActive: false,
      focusBreakDuration: 5,
    })

    const store = useSettingsStore.getState()
    store.tickFocusTimer()

    const state = useSettingsStore.getState()
    expect(state.focusBreakActive).toBe(true)
    expect(state.focusTimeRemaining).toBe(300) // 5 minutes break
  })

  it('deactivates focus session when break timer completes', () => {
    // Set remaining time to 1 second on break
    useSettingsStore.setState({
      focusMode: true,
      focusTimeRemaining: 1,
      focusBreakActive: true,
      focusDuration: 25,
    })

    const store = useSettingsStore.getState()
    store.tickFocusTimer()

    const state = useSettingsStore.getState()
    expect(state.focusMode).toBe(false)
    expect(state.focusBreakActive).toBe(false)
    expect(state.focusTimerActive).toBe(false)
  })
})
