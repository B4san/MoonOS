export type HardwareTier = 'quality' | 'balanced' | 'performance'

export type GpuTier = 'webgpu' | 'webgl2' | 'webgl1' | 'none'

export interface HardwareDetails {
  cpuCores: number
  ram: number | null
  gpuTier: GpuTier
  battery: { charging: boolean; level: number } | null
  connection: { effectiveType: string; downlink: number } | null
}

export interface HardwareProfile {
  tier: HardwareTier
  score: number
  details: HardwareDetails
  timestamp: number
}

export interface WindowState {
  id: string
  appId: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isFocused: boolean
  isMinimized: boolean
  isMaximized: boolean
  workspaceId: string
  prevBounds?: { x: number; y: number; width: number; height: number }
  meta?: Record<string, unknown>
}

export interface AppDefinition {
  id: string
  name: string
  icon: string
  keywords: string[]
  defaultSize: { width: number; height: number }
  component: React.ComponentType<{ windowId: string }>
}

export interface Workspace {
  id: string
  name: string
  order: number
}

export type ThemeMode = 'dark' | 'light' | 'auto'
export type AccentColor = 'moonlight' | 'nebula' | 'aurora' | 'solar'

export type DesktopLayout = 'free' | 'grid'

export interface UserSettings {
  theme: ThemeMode
  accent: AccentColor
  tierOverride: HardwareTier | 'auto'
  workspaceName: string
  initialized: boolean
  desktopLayout: DesktopLayout
  circadianEnabled?: boolean
  circadianOffset?: number
  audioVolume?: number
  soundscapesEnabled?: boolean
  soundscapeActive?: 'none' | 'deep-space' | 'rain-studio' | 'digital-garden' | 'white-noise' | 'lunar-tide'
  uiSoundsEnabled?: boolean
  terminalClicksEnabled?: boolean
}

export interface CommandAction {
  id: string
  label: string
  icon?: string
  category: 'apps' | 'system' | 'theme'
  keywords: string[]
  action: () => void
}
