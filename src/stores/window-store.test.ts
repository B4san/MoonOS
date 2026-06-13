import { describe, it, expect, beforeEach } from 'vitest'
import { useWindowStore } from '@/stores/window-store'

describe('window-store', () => {
  beforeEach(() => {
    useWindowStore.setState({ windows: [], maxZIndex: 1 })
  })

  it('opens a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    const win = useWindowStore.getState().windows.find(w => w.id === id)
    expect(win).toBeDefined()
    expect(win!.appId).toBe('notes')
    expect(win!.isFocused).toBe(true)
  })

  it('closes a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.getState().closeWindow(id)
    expect(useWindowStore.getState().windows).toHaveLength(0)
  })

  it('focuses a window and updates z-index', () => {
    const id1 = useWindowStore.getState().openWindow('notes', 'Notes 1')
    const id2 = useWindowStore.getState().openWindow('terminal', 'Terminal')
    useWindowStore.getState().focusWindow(id1)
    const w1 = useWindowStore.getState().windows.find(w => w.id === id1)!
    const w2 = useWindowStore.getState().windows.find(w => w.id === id2)!
    expect(w1.isFocused).toBe(true)
    expect(w2.isFocused).toBe(false)
    expect(w1.zIndex).toBeGreaterThan(w2.zIndex)
  })

  it('moves a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.getState().moveWindow(id, 200, 300)
    const win = useWindowStore.getState().windows.find(w => w.id === id)!
    expect(win.position).toEqual({ x: 200, y: 300 })
  })

  it('resizes a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.getState().resizeWindow(id, 800, 600)
    const win = useWindowStore.getState().windows.find(w => w.id === id)!
    expect(win.size).toEqual({ width: 800, height: 600 })
  })

  it('minimizes and restores a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.getState().minimizeWindow(id)
    expect(useWindowStore.getState().windows.find(w => w.id === id)!.isMinimized).toBe(true)
    useWindowStore.getState().restoreWindow(id)
    expect(useWindowStore.getState().windows.find(w => w.id === id)!.isMinimized).toBe(false)
  })

  it('maximizes and restores a window', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes', { width: 500, height: 400 })
    useWindowStore.getState().maximizeWindow(id)
    const win = useWindowStore.getState().windows.find(w => w.id === id)!
    expect(win.isMaximized).toBe(true)
    expect(win.prevBounds).toBeDefined()
    useWindowStore.getState().restoreWindow(id)
    const restored = useWindowStore.getState().windows.find(w => w.id === id)!
    expect(restored.isMaximized).toBe(false)
  })

  it('filters windows by workspace', () => {
    useWindowStore.setState({ activeWorkspaceId: 'ws-1' })
    useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.setState({ activeWorkspaceId: 'ws-2' })
    useWindowStore.getState().openWindow('terminal', 'Terminal')
    const ws1Windows = useWindowStore.getState().getWindowsByWorkspace('ws-1')
    const ws2Windows = useWindowStore.getState().getWindowsByWorkspace('ws-2')
    expect(ws1Windows).toHaveLength(1)
    expect(ws2Windows).toHaveLength(1)
    expect(ws1Windows[0].appId).toBe('notes')
  })

  it('changes workspace', () => {
    useWindowStore.getState().setActiveWorkspace('ws-3')
    expect(useWindowStore.getState().activeWorkspaceId).toBe('ws-3')
  })

  it('adds and removes workspaces', () => {
    const initial = useWindowStore.getState().workspaces.length
    useWindowStore.getState().addWorkspace('Test')
    expect(useWindowStore.getState().workspaces.length).toBe(initial + 1)
    const newWs = useWindowStore.getState().workspaces[initial]
    useWindowStore.getState().removeWorkspace(newWs.id)
    expect(useWindowStore.getState().workspaces.length).toBe(initial)
  })
})
