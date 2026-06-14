import { create } from 'zustand'
import { persistence } from '@/core/persistence'

interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image'
  solidColor: string
  gradientFrom: string
  gradientTo: string
  gradientAngle: number
  imageUrl: string
  imageBlur: number
  imageBrightness: number
  particles: boolean
}

interface BackgroundStore extends BackgroundConfig {
  setType: (v: BackgroundConfig['type']) => void
  setSolidColor: (v: string) => void
  setGradientFrom: (v: string) => void
  setGradientTo: (v: string) => void
  setGradientAngle: (v: number) => void
  setImageUrl: (v: string) => void
  setImageBlur: (v: number) => void
  setImageBrightness: (v: number) => void
  setParticles: (v: boolean) => void
  reset: () => void
}

const defaults: BackgroundConfig = {
  type: 'gradient',
  solidColor: '#050814',
  gradientFrom: '#050814',
  gradientTo: '#1a1040',
  gradientAngle: 135,
  imageUrl: '',
  imageBlur: 0,
  imageBrightness: 100,
  particles: true,
}

const saved = persistence.get<BackgroundConfig>('background-config', defaults)

const save = (get: () => BackgroundStore) => {
  const { type, solidColor, gradientFrom, gradientTo, gradientAngle, imageUrl, imageBlur, imageBrightness, particles } = get()
  persistence.set('background-config', { type, solidColor, gradientFrom, gradientTo, gradientAngle, imageUrl, imageBlur, imageBrightness, particles })
}

export const useBackgroundStore = create<BackgroundStore>((set, get) => ({
  ...{ ...defaults, ...saved },
  setType: (v) => { set({ type: v }); save(get) },
  setSolidColor: (v) => { set({ solidColor: v }); save(get) },
  setGradientFrom: (v) => { set({ gradientFrom: v }); save(get) },
  setGradientTo: (v) => { set({ gradientTo: v }); save(get) },
  setGradientAngle: (v) => { set({ gradientAngle: v }); save(get) },
  setImageUrl: (v) => { set({ imageUrl: v }); save(get) },
  setImageBlur: (v) => { set({ imageBlur: v }); save(get) },
  setImageBrightness: (v) => { set({ imageBrightness: v }); save(get) },
  setParticles: (v) => { set({ particles: v }); save(get) },
  reset: () => { set(defaults); persistence.set('background-config', defaults) },
}))
