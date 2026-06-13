import { create } from 'zustand'
import { produce } from 'immer'
import type { WindowState, Workspace } from '@/types'

interface WindowStore {
  windows: WindowState[]
  workspaces: Workspace[]
  activeWorkspaceId: string
  maxZIndex: number

  openWindow: (appId: string, title: string, size?: { width: number; height: number }) => string
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

  openWindow: (appId, title, size = { width: 600, height: 400 }) => {
    const id = `win-${++idCounter}-${Date.now()}`
    const { activeWorkspaceId, maxZIndex } = get()
    const offset = (get().windows.length % 8) * 30
    const newWindow: WindowState = {
      id,
      appId,
      title,
      position: { x: 100 + offset, y: 60 + offset },
      size,
      zIndex: maxZIndex + 1,
      isFocused: true,
      isMinimized: false,
      isMaximized: false,
      workspaceId: activeWorkspaceId,
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

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

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

  getWindowsByWorkspace: (wsId) => get().windows.filter(w => w.workspaceId === wsId),
}))
