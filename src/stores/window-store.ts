import { create } from 'zustand'
import { produce } from 'immer'
import type { WindowState, Workspace } from '@/types'
import { audioEngine } from '@/core/audio-engine'

interface WindowStore {
  windows: WindowState[]
  workspaces: Workspace[]
  activeWorkspaceId: string
  maxZIndex: number

  openWindow: (appId: string, title: string, size?: { width: number; height: number }, meta?: Record<string, unknown>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  setActiveWorkspace: (id: string) => void
  addWorkspace: (name: string) => void
  removeWorkspace: (id: string) => void
  snapWindow: (id: string, bounds: { x: number; y: number; width: number; height: number }) => void
  tileWindows: () => void
  getWindowsByWorkspace: (wsId: string) => WindowState[]
}

const defaultWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Desktop 1', order: 0 },
  { id: 'ws-2', name: 'Desktop 2', order: 1 },
  { id: 'ws-3', name: 'Desktop 3', order: 2 },
  { id: 'ws-4', name: 'Desktop 4', order: 3 },
]

let idCounter = 0

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  workspaces: defaultWorkspaces,
  activeWorkspaceId: 'ws-1',
  maxZIndex: 1,

  openWindow: (appId, title, size = { width: 600, height: 400 }, meta) => {
    const id = `win-${++idCounter}-${Date.now()}`
    const { activeWorkspaceId, maxZIndex } = get()
    // Center window on screen with slight offset for stacking
    const offset = (get().windows.length % 6) * 25
    const x = Math.round((window.innerWidth - size.width) / 2) + offset
    const y = Math.round((window.innerHeight - size.height) / 2) + offset
    const newWindow: WindowState = {
      id,
      appId,
      title,
      position: { x, y },
      size,
      zIndex: maxZIndex + 1,
      isFocused: true,
      isMinimized: false,
      isMaximized: false,
      workspaceId: activeWorkspaceId,
      meta,
    }
    set(produce((s: WindowStore) => {
      s.windows.forEach(w => { w.isFocused = false })
      s.windows.push(newWindow)
      s.maxZIndex += 1
    }))
    return id
  },

  closeWindow: (id) => set(produce((s: WindowStore) => {
    s.windows = s.windows.filter(w => w.id !== id)
  })),

  focusWindow: (id) => set(produce((s: WindowStore) => {
    s.maxZIndex += 1
    s.windows.forEach(w => {
      w.isFocused = w.id === id
      if (w.id === id) w.zIndex = s.maxZIndex
    })
  })),

  moveWindow: (id, x, y) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) w.position = { x, y }
  })),

  resizeWindow: (id, width, height) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) w.size = { width, height }
  })),

  minimizeWindow: (id) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) { w.isMinimized = true; w.isFocused = false }
  })),

  maximizeWindow: (id) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w && !w.isMaximized) {
      w.prevBounds = { ...w.position, ...w.size }
      w.isMaximized = true
      w.position = { x: 0, y: 32 }
      w.size = { width: window.innerWidth, height: window.innerHeight - 32 - 72 }
    }
  })),

  restoreWindow: (id) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) {
      if (w.isMaximized && w.prevBounds) {
        w.position = { x: w.prevBounds.x, y: w.prevBounds.y }
        w.size = { width: w.prevBounds.width, height: w.prevBounds.height }
        w.isMaximized = false
      }
      if (w.isMinimized) w.isMinimized = false
    }
  })),

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id })
    audioEngine.playUIEvent('workspace')
  },

  addWorkspace: (name) => set(produce((s: WindowStore) => {
    const order = s.workspaces.length
    s.workspaces.push({ id: `ws-${Date.now()}`, name, order })
  })),

  removeWorkspace: (id) => set(produce((s: WindowStore) => {
    if (s.workspaces.length <= 1) return
    s.workspaces = s.workspaces.filter(w => w.id !== id)
    s.windows = s.windows.filter(w => w.workspaceId !== id)
    if (s.activeWorkspaceId === id) s.activeWorkspaceId = s.workspaces[0].id
  })),

  snapWindow: (id, bounds) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) {
      w.prevBounds = { x: w.position.x, y: w.position.y, width: w.size.width, height: w.size.height }
      w.position = { x: bounds.x, y: bounds.y }
      w.size = { width: bounds.width, height: bounds.height }
      w.isMaximized = false
    }
  })),

  tileWindows: () => set(produce((s: WindowStore) => {
    const visible = s.windows.filter(w => w.workspaceId === s.activeWorkspaceId && !w.isMinimized)
    if (visible.length === 0) return
    const TOP = 32, BOTTOM = 72
    const W = window.innerWidth
    const H = window.innerHeight - TOP - BOTTOM
    const cols = Math.ceil(Math.sqrt(visible.length))
    const rows = Math.ceil(visible.length / cols)
    const cellW = Math.floor(W / cols)
    const cellH = Math.floor(H / rows)
    visible.forEach((win, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      win.position = { x: col * cellW, y: TOP + row * cellH }
      win.size = { width: cellW, height: cellH }
      win.isMaximized = false
    })
  })),

  getWindowsByWorkspace: (wsId) => get().windows.filter(w => w.workspaceId === wsId),
}))
