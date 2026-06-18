import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useWindowStore } from '@/stores/window-store'
import { Window } from '@/ui/Window'

// Mock dependencies
vi.mock('@/core/audio-engine', () => ({
  audioEngine: {
    playUIEvent: vi.fn(),
  },
}))

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: () => ({
    activeTier: 'balanced',
    focusMode: false,
  }),
}))

vi.mock('@/stores/app-registry', () => {
  const storeInstance = {
    getApp: () => ({
      id: 'notes',
      name: 'Notes',
      defaultSize: { width: 600, height: 400 },
      component: () => <div data-testid="app-content">Notes App content</div>
    })
  }
  const mockHook = (selector: (s: typeof storeInstance) => unknown) => selector(storeInstance)
  return { useAppRegistry: mockHook }
})

describe('Window Stacks and Ghost Windows', () => {
  let store: ReturnType<typeof useWindowStore.getState>

  beforeEach(() => {
    store = useWindowStore.getState()
    act(() => {
      // Clear windows array
      useWindowStore.setState({ windows: [], maxZIndex: 1 })
    })
  })

  it('can toggle Ghost Mode on a window', () => {
    let winId = ''
    act(() => {
      winId = store.openWindow('notes', 'Test Window')
    })

    const win = useWindowStore.getState().windows.find(w => w.id === winId)
    expect(win?.meta?.ghost).toBeUndefined()

    // Toggle on
    act(() => {
      useWindowStore.getState().toggleGhostMode(winId)
    })
    const ghosted = useWindowStore.getState().windows.find(w => w.id === winId)
    expect(ghosted?.meta?.ghost).toBe(true)

    // Toggle off
    act(() => {
      useWindowStore.getState().toggleGhostMode(winId)
    })
    const unghosted = useWindowStore.getState().windows.find(w => w.id === winId)
    expect(unghosted?.meta?.ghost).toBe(false)
  })

  it('can compile two windows into a tabbed stack', () => {
    let winA = ''
    let winB = ''
    act(() => {
      winA = store.openWindow('notes', 'Window A')
      winB = store.openWindow('notes', 'Window B')
    })

    // Merge winA into winB (winB is target, winA is source)
    act(() => {
      useWindowStore.getState().stackWindows(winB, winA)
    })

    const targetStack = useWindowStore.getState().windows.find(w => w.id === winB)
    const sourceWindow = useWindowStore.getState().windows.find(w => w.id === winA)

    expect(targetStack?.meta?.isStack).toBe(true)
    expect(sourceWindow?.meta?.stackId).toBe(winB)
    expect(sourceWindow?.isMinimized).toBe(true) // Hidden from standalone view
    expect(targetStack?.meta?.stackedWindows).toHaveLength(2)
  })

  it('can switch active tabs and detach a window from a stack', () => {
    let winA = ''
    let winB = ''
    act(() => {
      winA = store.openWindow('notes', 'Window A')
      winB = store.openWindow('notes', 'Window B')
    })

    act(() => {
      useWindowStore.getState().stackWindows(winB, winA)
    })

    const stack = useWindowStore.getState().windows.find(w => w.id === winB)
    expect(stack?.meta?.activeWindowId).toBe(winA)

    // Switch tab back to winB
    act(() => {
      useWindowStore.getState().switchStackTab(winB, winB)
    })
    expect(useWindowStore.getState().windows.find(w => w.id === winB)?.meta?.activeWindowId).toBe(winB)

    // Detach winA
    act(() => {
      useWindowStore.getState().detachWindow(winB, winA)
    })

    const afterDetachStack = useWindowStore.getState().windows.find(w => w.id === winB)
    const afterDetachWinA = useWindowStore.getState().windows.find(w => w.id === winA)

    // Detached window should no longer have stackId
    expect(afterDetachWinA?.meta?.stackId).toBeUndefined()
    expect(afterDetachWinA?.isMinimized).toBe(false)

    // Stack of 2 dissolved back to standalone for remaining window B since only 1 is left
    expect(afterDetachStack?.meta?.isStack).toBeUndefined()
  })

  it('renders tabs in header when in stack mode', () => {
    let winA = ''
    let winB = ''
    act(() => {
      winA = store.openWindow('notes', 'Window A')
      winB = store.openWindow('notes', 'Window B')
    })

    act(() => {
      useWindowStore.getState().stackWindows(winB, winA)
    })

    render(<Window windowId={winB} />)

    // Check if the tabs exist in the header
    expect(screen.getByText('Window A')).toBeInTheDocument()
    expect(screen.getByText('Window B')).toBeInTheDocument()
  })
})
