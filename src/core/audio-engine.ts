import { useSettingsStore } from '@/stores/settings-store'

export type SoundscapeType = 'none' | 'deep-space' | 'rain-studio' | 'digital-garden' | 'white-noise' | 'lunar-tide'

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private ambientGain: GainNode | null = null

  // Ambient states
  private activeSoundscape: SoundscapeType = 'none'
  private ambientSourceNodes: AudioNode[] = []
  private chimeTimer: ReturnType<typeof setTimeout> | null = null
  private thunderTimer: ReturnType<typeof setTimeout> | null = null
  private waveInterval: ReturnType<typeof setInterval> | null = null

  // Audio Buffers
  private pinkNoiseBuffer: AudioBuffer | null = null
  private whiteNoiseBuffer: AudioBuffer | null = null

  constructor() {
    // Lazy initialize on first click or interaction to respect autoplay policies
    if (typeof window !== 'undefined') {
      const initOnInteraction = () => {
        this.init()
        window.removeEventListener('click', initOnInteraction)
        window.removeEventListener('keydown', initOnInteraction)
      }
      window.addEventListener('click', initOnInteraction)
      window.addEventListener('keydown', initOnInteraction)
    }
  }

  public init() {
    if (this.ctx) return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    try {
      this.ctx = new AudioContextClass()
      this.masterGain = this.ctx.createGain()
      this.sfxGain = this.ctx.createGain()
      this.ambientGain = this.ctx.createGain()

      // Connect gains
      this.masterGain.connect(this.ctx.destination)
      this.sfxGain.connect(this.masterGain)
      this.ambientGain.connect(this.masterGain)

      // Initial settings
      const settings = useSettingsStore.getState()
      const volume = settings.audioVolume !== undefined ? settings.audioVolume : 50
      this.masterGain.gain.setValueAtTime(volume / 100, this.ctx.currentTime)
      this.sfxGain.gain.setValueAtTime(settings.uiSoundsEnabled !== false ? 1.0 : 0.0, this.ctx.currentTime)
      this.ambientGain.gain.setValueAtTime(settings.soundscapesEnabled !== false ? 0.3 : 0.0, this.ctx.currentTime)

      // Create noise buffers
      this.createNoiseBuffers()

      // Start current soundscape if enabled
      if (settings.soundscapesEnabled && settings.soundscapeActive && settings.soundscapeActive !== 'none') {
        this.setSoundscape(settings.soundscapeActive as SoundscapeType)
      }
    } catch (e) {
      console.warn('Failed to initialize AudioContext:', e)
    }
  }

  public resetForTest() {
    this.ctx = null
    this.masterGain = null
    this.sfxGain = null
    this.ambientGain = null
    this.stopSoundscapes()
  }

  private resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  private createNoiseBuffers() {
    if (!this.ctx) return

    const sampleRate = this.ctx.sampleRate
    const bufferSize = sampleRate * 2 // 2 seconds

    // White Noise
    this.whiteNoiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate)
    const whiteData = this.whiteNoiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1
    }

    // Pink Noise (Paul Kellet's refined method)
    this.pinkNoiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate)
    const pinkData = this.pinkNoiseBuffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      pinkData[i] *= 0.11 // estimate to rescue headroom
      b6 = white * 0.115926
    }
  }

  public setVolume(volume: number) {
    this.resumeContext()
    this.init()
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.05)
    }
  }

  public setUiSoundsEnabled(enabled: boolean) {
    this.resumeContext()
    this.init()
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(enabled ? 1.0 : 0.0, this.ctx.currentTime, 0.05)
    }
  }

  public setSoundscapesEnabled(enabled: boolean) {
    this.resumeContext()
    this.init()
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(enabled ? 0.3 : 0.0, this.ctx.currentTime, 0.05)
    }
    const settings = useSettingsStore.getState()
    if (enabled && settings.soundscapeActive && settings.soundscapeActive !== 'none') {
      this.setSoundscape(settings.soundscapeActive as SoundscapeType)
    } else if (!enabled) {
      this.stopSoundscapes()
    }
  }

  public setSoundscape(type: SoundscapeType) {
    this.resumeContext()
    this.init()
    if (!this.ctx || !this.ambientGain) return

    // Stop existing loops
    this.stopSoundscapes()
    this.activeSoundscape = type

    if (type === 'none') return

    // Verify system settings show soundscapes are enabled
    const settings = useSettingsStore.getState()
    if (settings.soundscapesEnabled === false) return

    switch (type) {
      case 'deep-space':
        this.playDeepSpace()
        break
      case 'rain-studio':
        this.playRainStudio()
        break
      case 'digital-garden':
        this.playDigitalGarden()
        break
      case 'white-noise':
        this.playWhiteNoise()
        break
      case 'lunar-tide':
        this.playLunarTide()
        break
    }
  }

  private stopSoundscapes() {
    this.ambientSourceNodes.forEach(node => {
      try {
        (node as unknown as { stop?: () => void }).stop?.()
        node.disconnect()
      } catch {
        // Safe check
      }
    })
    this.ambientSourceNodes = []

    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer)
      this.chimeTimer = null
    }
    if (this.thunderTimer) {
      clearTimeout(this.thunderTimer)
      this.thunderTimer = null
    }
    if (this.waveInterval) {
      clearInterval(this.waveInterval)
      this.waveInterval = null
    }
  }

  // SOUND EFFECT PLAYERS
  public playUIEvent(type: 'open' | 'close' | 'snap' | 'workspace' | 'error') {
    this.resumeContext()
    this.init()
    if (!this.ctx || !this.sfxGain) return

    const settings = useSettingsStore.getState()
    if (settings.uiSoundsEnabled === false) return

    const now = this.ctx.currentTime

    switch (type) {
      case 'open': {
        const osc = this.ctx.createOscillator()
        const gainNode = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.08)

        gainNode.gain.setValueAtTime(0.001, now)
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

        osc.connect(gainNode)
        gainNode.connect(this.sfxGain)

        osc.start(now)
        osc.stop(now + 0.08)
        break
      }
      case 'close': {
        const osc = this.ctx.createOscillator()
        const gainNode = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(580, now)
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08)

        gainNode.gain.setValueAtTime(0.001, now)
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

        osc.connect(gainNode)
        gainNode.connect(this.sfxGain)

        osc.start(now)
        osc.stop(now + 0.08)
        break
      }
      case 'snap': {
        const osc = this.ctx.createOscillator()
        const gainNode = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(1200, now)
        osc.frequency.setValueAtTime(1500, now + 0.005)

        gainNode.gain.setValueAtTime(0.001, now)
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.002)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

        osc.connect(gainNode)
        gainNode.connect(this.sfxGain)

        osc.start(now)
        osc.stop(now + 0.035)
        break
      }
      case 'workspace': {
        if (!this.pinkNoiseBuffer) return
        const source = this.ctx.createBufferSource()
        const filter = this.ctx.createBiquadFilter()
        const gainNode = this.ctx.createGain()

        source.buffer = this.pinkNoiseBuffer
        source.loop = false

        filter.type = 'bandpass'
        filter.Q.setValueAtTime(2.0, now)
        filter.frequency.setValueAtTime(250, now)
        filter.frequency.exponentialRampToValueAtTime(1000, now + 0.12)
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.25)

        gainNode.gain.setValueAtTime(0.001, now)
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

        source.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(this.sfxGain)

        source.start(now)
        source.stop(now + 0.25)
        break
      }
      case 'error': {
        const osc = this.ctx.createOscillator()
        const gainNode = this.ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(110, now)
        osc.frequency.linearRampToValueAtTime(90, now + 0.09)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(220, now)

        gainNode.gain.setValueAtTime(0.001, now)
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

        osc.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(this.sfxGain)

        osc.start(now)
        osc.stop(now + 0.1)
        break
      }
    }
  }

  public playKeyboardClick() {
    this.resumeContext()
    this.init()
    if (!this.ctx || !this.sfxGain) return

    const settings = useSettingsStore.getState()
    if (settings.terminalClicksEnabled === false) return

    const now = this.ctx.currentTime

    // Key Actuation Click
    if (this.whiteNoiseBuffer) {
      const clickSource = this.ctx.createBufferSource()
      const clickFilter = this.ctx.createBiquadFilter()
      const clickGain = this.ctx.createGain()

      clickSource.buffer = this.whiteNoiseBuffer
      clickSource.loop = false

      clickFilter.type = 'bandpass'
      clickFilter.frequency.setValueAtTime(3200, now)
      clickFilter.Q.setValueAtTime(8, now)

      // Random tiny variation in gain and timing to sound realistic
      const vol = 0.04 + Math.random() * 0.03
      const duration = 0.005 + Math.random() * 0.004

      clickGain.gain.setValueAtTime(0.001, now)
      clickGain.gain.linearRampToValueAtTime(vol, now + 0.001)
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      clickSource.connect(clickFilter)
      clickFilter.connect(clickGain)
      clickGain.connect(this.sfxGain)

      clickSource.start(now)
      clickSource.stop(now + duration + 0.01)
    }

    // Key Bottoming Thump
    const thumpOsc = this.ctx.createOscillator()
    const thumpGain = this.ctx.createGain()

    thumpOsc.type = 'sine'
    thumpOsc.frequency.setValueAtTime(140 + Math.random() * 20, now)

    const thumpVol = 0.12 + Math.random() * 0.06
    const thumpDuration = 0.015 + Math.random() * 0.01

    thumpGain.gain.setValueAtTime(0.001, now)
    thumpGain.gain.linearRampToValueAtTime(thumpVol, now + 0.002)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + thumpDuration)

    thumpOsc.connect(thumpGain)
    thumpGain.connect(this.sfxGain)

    thumpOsc.start(now)
    thumpOsc.stop(now + thumpDuration + 0.01)
  }

  // ATMOSPHERE PROCEDURAL METHODS
  private playDeepSpace() {
    if (!this.ctx || !this.ambientGain) return

    const now = this.ctx.currentTime

    // Create 3 detuned oscillators for space drone
    const freqs = [55, 82.5, 110]
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientGain) return
      const osc = this.ctx.createOscillator()
      const gainNode = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq + (idx * 0.1), now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(140, now)
      filter.Q.setValueAtTime(1.5, now)

      // Slow LFO to modulate filter frequency
      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = 0.04 + (idx * 0.01) // slow pulse
      lfoGain.gain.value = 40 // sweep range 100Hz to 180Hz

      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      gainNode.gain.setValueAtTime(0.12 / freqs.length, now)

      osc.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.ambientGain)

      osc.start(now)
      lfo.start(now)

      this.ambientSourceNodes.push(osc)
      this.ambientSourceNodes.push(lfo)
    })
  }

  private playRainStudio() {
    if (!this.ctx || !this.ambientGain || !this.pinkNoiseBuffer) return

    const now = this.ctx.currentTime

    // Constant Rain noise
    const rainSource = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const gainNode = this.ctx.createGain()

    rainSource.buffer = this.pinkNoiseBuffer
    rainSource.loop = true

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.Q.setValueAtTime(0.8, now)

    // Wind modulation
    const windLFO = this.ctx.createOscillator()
    const windGain = this.ctx.createGain()
    windLFO.type = 'sine'
    windLFO.frequency.setValueAtTime(0.08, now)
    windGain.gain.setValueAtTime(300, now)

    windLFO.connect(windGain)
    windGain.connect(filter.frequency)

    gainNode.gain.setValueAtTime(0.24, now)

    rainSource.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.ambientGain)

    rainSource.start(now)
    windLFO.start(now)

    this.ambientSourceNodes.push(rainSource)
    this.ambientSourceNodes.push(windLFO)

    // Procedural Distant Thunder
    const triggerThunder = () => {
      if (!this.ctx || !this.ambientGain || !this.pinkNoiseBuffer || this.activeSoundscape !== 'rain-studio') return

      const tNow = this.ctx.currentTime
      const thunderSource = this.ctx.createBufferSource()
      const tFilter = this.ctx.createBiquadFilter()
      const tGain = this.ctx.createGain()

      thunderSource.buffer = this.pinkNoiseBuffer
      thunderSource.loop = true

      tFilter.type = 'lowpass'
      tFilter.frequency.setValueAtTime(65, tNow)

      // Thunder envelope: rises quickly, drops slowly
      tGain.gain.setValueAtTime(0.001, tNow)
      tGain.gain.linearRampToValueAtTime(0.65, tNow + 1.2) // long rumble build
      tGain.gain.exponentialRampToValueAtTime(0.001, tNow + 6.0)

      thunderSource.connect(tFilter)
      tFilter.connect(tGain)
      tGain.connect(this.ambientGain)

      thunderSource.start(tNow)
      thunderSource.stop(tNow + 6.1)

      // Queue next thunder
      const nextTime = 20000 + Math.random() * 45000
      this.thunderTimer = setTimeout(triggerThunder, nextTime)
    }

    // Queue first thunder in 15 seconds
    this.thunderTimer = setTimeout(triggerThunder, 15000)
  }

  private playDigitalGarden() {
    if (!this.ctx || !this.ambientGain) return

    // Play soft backdrop drone
    const osc = this.ctx.createOscillator()
    const droneGain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(146.83, this.ctx.currentTime) // D3
    droneGain.gain.setValueAtTime(0.02, this.ctx.currentTime)
    osc.connect(droneGain)
    droneGain.connect(this.ambientGain)
    osc.start(this.ctx.currentTime)
    this.ambientSourceNodes.push(osc)

    const chimeFrequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50] // C5, D5, E5, G5, A5, C6 (Pentatonic Scale)

    const triggerChime = () => {
      if (!this.ctx || !this.ambientGain || this.activeSoundscape !== 'digital-garden') return

      const now = this.ctx.currentTime
      const freq = chimeFrequencies[Math.floor(Math.random() * chimeFrequencies.length)]

      const tone = this.ctx.createOscillator()
      const gainNode = this.ctx.createGain()
      const delay = this.ctx.createDelay()
      const delayGain = this.ctx.createGain()

      tone.type = 'sine'
      tone.frequency.setValueAtTime(freq, now)

      // Sharp strike envelope
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5)

      // Chime Echo/Delay
      delay.delayTime.setValueAtTime(0.4, now)
      delayGain.gain.setValueAtTime(0.35, now)

      tone.connect(gainNode)
      gainNode.connect(this.ambientGain)

      // Delay path
      gainNode.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(this.ambientGain)

      tone.start(now)
      tone.stop(now + 2.6)

      // Queue next chime between 4 to 12 seconds
      const nextTime = 4000 + Math.random() * 8000
      this.chimeTimer = setTimeout(triggerChime, nextTime)
    }

    triggerChime()
  }

  private playWhiteNoise() {
    if (!this.ctx || !this.ambientGain || !this.pinkNoiseBuffer) return
    const now = this.ctx.currentTime
    const source = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const gainNode = this.ctx.createGain()

    source.buffer = this.pinkNoiseBuffer
    source.loop = true

    // Lowpass filter to make pink noise even warmer and softer
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, now)

    gainNode.gain.setValueAtTime(0.18, now)

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.ambientGain)

    source.start(now)
    this.ambientSourceNodes.push(source)
  }

  private playLunarTide() {
    if (!this.ctx || !this.ambientGain || !this.pinkNoiseBuffer) return

    const now = this.ctx.currentTime
    const source = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const gainNode = this.ctx.createGain()

    source.buffer = this.pinkNoiseBuffer
    source.loop = true

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(280, now)

    gainNode.gain.setValueAtTime(0.01, now)

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.ambientGain)

    source.start(now)
    this.ambientSourceNodes.push(source)

    // Wave swell interval (10 second wave cycle: 5s swell, 5s ebb)
    let time = 0
    this.waveInterval = setInterval(() => {
      if (!this.ctx || !gainNode) return
      const tNow = this.ctx.currentTime
      time += 0.1
      // Sine wave modulation between 0.01 and 0.22
      const targetGain = 0.01 + (Math.sin(time * (2 * Math.PI / 10)) + 1) * 0.5 * 0.21
      gainNode.gain.setTargetAtTime(targetGain, tNow, 0.1)
    }, 100)
  }
}

export const audioEngine = new AudioEngine()
