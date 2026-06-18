/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { audioEngine } from '@/core/audio-engine'

// Mock useSettingsStore
vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: {
    getState: () => ({
      audioVolume: 50,
      uiSoundsEnabled: true,
      soundscapesEnabled: true,
      soundscapeActive: 'none',
      terminalClicksEnabled: true,
    })
  }
}))

describe('AudioEngine', () => {
  let mockAudioContext: any

  beforeEach(() => {
    audioEngine.resetForTest()
    mockAudioContext = {
      currentTime: 0,
      state: 'suspended',
      sampleRate: 44100,
      destination: {},
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(44100 * 2)),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        loop: false,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'lowpass',
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          connect: vi.fn(),
        },
        Q: {
          setValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createDelay: vi.fn(() => ({
        delayTime: {
          setValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      resume: vi.fn().mockImplementation(() => {
        mockAudioContext.state = 'running'
        return Promise.resolve()
      }),
    }

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
  })

  it('can initialize', () => {
    audioEngine.init()
    expect(window.AudioContext).toHaveBeenCalled()
  })

  it('triggers UI sound events', () => {
    audioEngine.init()
    audioEngine.playUIEvent('open')
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
  })

  it('can trigger keypress sound', () => {
    audioEngine.init()
    audioEngine.playKeyboardClick()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
  })

  it('can set volume', () => {
    audioEngine.init()
    audioEngine.setVolume(80)
    expect(mockAudioContext.createGain).toHaveBeenCalled()
  })
})
