import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useClipboardStore } from '@/stores/clipboard-store'
import { SmartShelf } from '@/ui/SmartShelf'
import { ClipboardOverlay } from '@/ui/ClipboardOverlay'

// Mock dependencies
vi.mock('@/core/audio-engine', () => ({
  audioEngine: {
    playKeyboardClick: vi.fn(),
    playUIEvent: vi.fn(),
  },
}))

vi.mock('@/core/filesystem', () => ({
  filesystem: {
    getRecentFiles: vi.fn().mockResolvedValue([
      { path: '/home/documents/test.md', name: 'test.md', type: 'file', updatedAt: Date.now() }
    ]),
  },
}))

vi.mock('@/core/file-associations', () => ({
  getDefaultApp: vi.fn().mockReturnValue('text-editor'),
}))

vi.mock('@/stores/window-store', () => ({
  useWindowStore: () => ({
    openWindow: vi.fn(),
  }),
}))

vi.mock('@/stores/app-registry', () => ({
  useAppRegistry: () => ({
    getApp: vi.fn().mockReturnValue({ defaultSize: { width: 600, height: 400 } }),
  }),
}))

describe('Clipboard Store & SmartShelf Integration', () => {
  beforeEach(() => {
    act(() => {
      useClipboardStore.getState().clearHistory()
      useClipboardStore.setState({ recentCommands: [] })
    })
  })

  it('correctly classifies clipboard item types', () => {
    const store = useClipboardStore.getState()

    // 1. Color type
    act(() => {
      store.addItem('#ffffff')
    })
    expect(useClipboardStore.getState().items[0].type).toBe('color')

    // 2. Link type
    act(() => {
      store.addItem('https://google.com')
    })
    expect(useClipboardStore.getState().items[0].type).toBe('link')

    // 3. Code type
    act(() => {
      store.addItem('const x = 5;\nfunction test() { return x; }')
    })
    expect(useClipboardStore.getState().items[0].type).toBe('code')

    // 4. Plain Text type
    act(() => {
      store.addItem('Hello World')
    })
    expect(useClipboardStore.getState().items[0].type).toBe('text')
  })

  it('toggles the clipboard history visibility', () => {
    const store = useClipboardStore.getState()
    expect(store.isHistoryOpen).toBe(false)

    act(() => {
      store.setHistoryOpen(true)
    })
    expect(useClipboardStore.getState().isHistoryOpen).toBe(true)
  })

  it('renders SmartShelf and slides it open on trigger', async () => {
    render(<SmartShelf />)

    // Hidden initially (x: '100%')
    const trigger = document.querySelector('.bg-transparent')
    expect(trigger).toBeInTheDocument()

    // Hover over trigger area to simulate opening
    if (trigger) {
      await act(async () => {
        fireEvent.mouseEnter(trigger)
      })
    }

    // Shelf title should be displayed
    expect(screen.getByText(/smart shelf/i)).toBeInTheDocument()
  })

  it('renders ClipboardOverlay when history is open', () => {
    act(() => {
      useClipboardStore.setState({ isHistoryOpen: true })
      useClipboardStore.getState().addItem('Test copied item')
    })

    render(<ClipboardOverlay />)

    expect(screen.getByPlaceholderText(/search clipboard history/i)).toBeInTheDocument()
    expect(screen.getByText('Test copied item')).toBeInTheDocument()
  })
})
