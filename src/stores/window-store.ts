import { create } from 'zustand'
import { produce } from 'immer'
import type { WindowState, Workspace } from '@/types'
import { audioEngine } from '@/core/audio-engine'

interface WindowStore {
  windows: WindowState[]
  workspaces: Workspace[]
  activeWorkspaceId: string
  maxZIndex: number
  stackTargetWindowId: string | null

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

  // Innovations: Ghost Mode & Window Stacking
  toggleGhostMode: (id: string) => void
  stackWindows: (targetId: string, sourceId: string) => void
  detachWindow: (stackId: string, windowId: string) => void
  switchStackTab: (stackId: string, windowId: string) => void
  setStackTargetWindowId: (id: string | null) => void
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
  stackTargetWindowId: null,

  openWindow: (appId, title, size = { width: 600, height: 400 }, meta) => {
    const id = `win-${++idCounter}-${Date.now()}`
    const { activeWorkspaceId, maxZIndex } = get()
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
    // If closing a stack parent, also close all stacked child windows
    const win = s.windows.find(w => w.id === id)
    if (win?.meta?.isStack && win.meta.stackedWindows) {
      const childrenIds = (win.meta.stackedWindows as { id: string }[]).map(c => c.id)
      s.windows = s.windows.filter(w => w.id !== id && !childrenIds.includes(w.id))
    } else {
      s.windows = s.windows.filter(w => w.id !== id)
    }
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
    const visible = s.windows.filter(w => w.workspaceId === s.activeWorkspaceId && !w.isMinimized && !w.meta?.stackId)
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

  toggleGhostMode: (id) => set(produce((s: WindowStore) => {
    const w = s.windows.find(w => w.id === id)
    if (w) {
      w.meta = w.meta || {}
      w.meta.ghost = !w.meta.ghost
      if (w.meta.ghost) {
        s.maxZIndex += 1000
        w.zIndex = s.maxZIndex
      } else {
        s.maxZIndex += 1
        w.zIndex = s.maxZIndex
      }
    }
  })),

  setStackTargetWindowId: (id) => set({ stackTargetWindowId: id }),

  stackWindows: (targetId, sourceId) => set(produce((s: WindowStore) => {
    const target = s.windows.find(w => w.id === targetId)
    const source = s.windows.find(w => w.id === sourceId)
    if (!target || !source) return

    target.meta = target.meta || {}
    source.meta = source.meta || {}

    const targetItem = {
      id: target.id,
      title: target.title,
      appId: target.appId,
      size: { ...target.size }
    }

    const sourceItem = {
      id: source.id,
      title: source.title,
      appId: source.appId,
      size: { ...source.size }
    }

    if (!target.meta.isStack) {
      target.meta.isStack = true
      target.meta.stackedWindows = [targetItem, sourceItem]
      target.meta.activeWindowId = source.id
    } else {
      const exists = (target.meta.stackedWindows as { id: string }[]).some(w => w.id === source.id)
      if (!exists) {
        (target.meta.stackedWindows as unknown[] as { id: string; title: string; appId: string; size: { width: number; height: number } }[]).push(sourceItem)
      }
      target.meta.activeWindowId = source.id
    }

    source.meta.stackId = targetId
    source.isFocused = false
    source.isMinimized = true

    s.maxZIndex += 1
    target.zIndex = s.maxZIndex
    target.isFocused = true

    audioEngine.playUIEvent('snap')
  })),

  detachWindow: (stackId, windowId) => set(produce((s: WindowStore) => {
    const stack = s.windows.find(w => w.id === stackId)
    const detached = s.windows.find(w => w.id === windowId)
    if (!stack || !detached) return

    stack.meta = stack.meta || {}
    detached.meta = detached.meta || {}

    if (stack.meta.stackedWindows) {
      stack.meta.stackedWindows = (stack.meta.stackedWindows as { id: string }[]).filter(w => w.id !== windowId)
    }

    if (detached.meta) {
      delete detached.meta.stackId
    }
    detached.isMinimized = false
    detached.position = { x: stack.position.x + 35, y: stack.position.y + 35 }
    if (stack.size) {
      detached.size = { ...stack.size }
    }

    const remaining = stack.meta.stackedWindows as { id: string; title: string; appId: string; size: { width: number; height: number } }[]
    if (remaining && remaining.length <= 1) {
      const lastItem = remaining[0]
      const lastWin = s.windows.find(w => w.id === lastItem.id)

      if (stack.meta) {
        delete stack.meta.isStack
        delete stack.meta.stackedWindows
        delete stack.meta.activeWindowId
      }

      if (lastWin && lastWin.id !== stack.id) {
        if (lastWin.meta) {
          delete lastWin.meta.stackId
        }
        lastWin.isMinimized = false
        lastWin.position = { ...stack.position }
        lastWin.size = { ...stack.size }
        s.windows = s.windows.filter(w => w.id !== stack.id)
      }
    } else {
      if (stack.meta && stack.meta.activeWindowId === windowId && remaining && remaining.length > 0) {
        stack.meta.activeWindowId = remaining[0].id
        stack.title = remaining[0].title
        if (remaining[0].size) {
          stack.size = { ...remaining[0].size }
        }
      }
    }

    s.maxZIndex += 1
    detached.zIndex = s.maxZIndex
    s.windows.forEach(w => { w.isFocused = w.id === windowId })

    audioEngine.playUIEvent('open')
  })),

  switchStackTab: (stackId, windowId) => set(produce((s: WindowStore) => {
    const stack = s.windows.find(w => w.id === stackId)
    if (stack && stack.meta) {
      const currentActiveId = stack.meta.activeWindowId as string
      const currentItem = (stack.meta.stackedWindows as { id: string; size?: { width: number; height: number } }[]).find(w => w.id === currentActiveId)
      if (currentItem) {
        currentItem.size = { ...stack.size }
      }

      stack.meta.activeWindowId = windowId

      const child = (stack.meta.stackedWindows as { id: string; title: string; appId: string; size?: { width: number; height: number } }[]).find(w => w.id === windowId)
      if (child) {
        stack.title = child.title
        if (child.size) {
          stack.size = { ...child.size }
        }
      }
    }
  })),
}))
