import { create } from 'zustand'
import { persistence } from '@/core/persistence'

interface DockConfig {
  position: 'bottom' | 'top' | 'left' | 'right'
  size: number
  gap: number
  borderRadius: number
  blur: number
  opacity: number
  borderWidth: number
  borderColor: string
  bgColor: string
  glassmorphism: boolean
  shadow: boolean
  autoHide: boolean
  magnification: boolean
  pinnedApps: string[]
}

interface DockStore extends DockConfig {
  setPosition: (v: DockConfig['position']) => void
  setSize: (v: number) => void
  setGap: (v: number) => void
  setBorderRadius: (v: number) => void
  setBlur: (v: number) => void
  setOpacity: (v: number) => void
  setBorderWidth: (v: number) => void
  setBorderColor: (v: string) => void
  setBgColor: (v: string) => void
  setGlassmorphism: (v: boolean) => void
  setShadow: (v: boolean) => void
  setAutoHide: (v: boolean) => void
  setMagnification: (v: boolean) => void
  setPinnedApps: (v: string[]) => void
  pinApp: (id: string) => void
  unpinApp: (id: string) => void
  reset: () => void
}

const defaults: DockConfig = {
  position: 'bottom',
  size: 44,
  gap: 4,
  borderRadius: 16,
  blur: 20,
  opacity: 80,
  borderWidth: 1,
  borderColor: 'rgba(100, 140, 220, 0.15)',
  bgColor: 'rgba(20, 30, 60, 0.8)',
  glassmorphism: true,
  shadow: true,
  autoHide: false,
  magnification: true,
  pinnedApps: ['terminal', 'notes', 'files', 'tasks', 'settings', 'browser'],
}

const saved = persistence.get<DockConfig>('dock-config', defaults)

const save = (get: () => DockStore) => {
  const { position, size, gap, borderRadius, blur, opacity, borderWidth, borderColor, bgColor, glassmorphism, shadow, autoHide, magnification, pinnedApps } = get()
  persistence.set('dock-config', { position, size, gap, borderRadius, blur, opacity, borderWidth, borderColor, bgColor, glassmorphism, shadow, autoHide, magnification, pinnedApps })
}

export const useDockStore = create<DockStore>((set, get) => ({
  ...{ ...defaults, ...saved },
  setPosition: (v) => { set({ position: v }); save(get) },
  setSize: (v) => { set({ size: v }); save(get) },
  setGap: (v) => { set({ gap: v }); save(get) },
  setBorderRadius: (v) => { set({ borderRadius: v }); save(get) },
  setBlur: (v) => { set({ blur: v }); save(get) },
  setOpacity: (v) => { set({ opacity: v }); save(get) },
  setBorderWidth: (v) => { set({ borderWidth: v }); save(get) },
  setBorderColor: (v) => { set({ borderColor: v }); save(get) },
  setBgColor: (v) => { set({ bgColor: v }); save(get) },
  setGlassmorphism: (v) => { set({ glassmorphism: v }); save(get) },
  setShadow: (v) => { set({ shadow: v }); save(get) },
  setAutoHide: (v) => { set({ autoHide: v }); save(get) },
  setMagnification: (v) => { set({ magnification: v }); save(get) },
  setPinnedApps: (v) => { set({ pinnedApps: v }); save(get) },
  pinApp: (id) => { const apps = [...get().pinnedApps]; if (!apps.includes(id)) { apps.push(id); set({ pinnedApps: apps }); save(get) } },
  unpinApp: (id) => { set({ pinnedApps: get().pinnedApps.filter(a => a !== id) }); save(get) },
  reset: () => { set(defaults); persistence.set('dock-config', defaults) },
}))
