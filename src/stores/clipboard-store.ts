import { create } from 'zustand'
import localforage from 'localforage'

const clipboardDb = localforage.createInstance({
  name: 'moonos',
  storeName: 'clipboard',
})

export interface ClipboardItem {
  id: string
  content: string
  type: 'text' | 'color' | 'code' | 'link'
  timestamp: number
}

interface ClipboardState {
  items: ClipboardItem[]
  recentCommands: string[]
  isHistoryOpen: boolean
  addItem: (content: string) => void
  addCommand: (command: string) => void
  clearHistory: () => void
  setHistoryOpen: (open: boolean) => void
  loadPersisted: () => Promise<void>
}

function detectClipboardType(content: string): 'text' | 'color' | 'code' | 'link' {
  const trimmed = content.trim()

  // Hex color check
  if (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return 'color'
  }

  // Link check
  if (/^(https?:\/\/|www\.)[^\s$.?#].[^\s]*$/i.test(trimmed)) {
    return 'link'
  }

  // Code check
  const lines = trimmed.split('\n')
  const hasMultipleLines = lines.length > 1
  const codeKeywords = /\b(const|let|var|function|return|import|export|class|if|for|while|interface|type|async|await)\b/
  const codeSymbols = /[{}[\];=<>]/
  if (hasMultipleLines && (codeKeywords.test(trimmed) || codeSymbols.test(trimmed))) {
    return 'code'
  }

  return 'text'
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  items: [],
  recentCommands: [],
  isHistoryOpen: false,

  addItem: (content: string) => {
    if (!content || !content.trim()) return
    const trimmed = content.trim()

    const currentItems = get().items
    const existingIndex = currentItems.findIndex(i => i.content === trimmed)

    let updatedItems = [...currentItems]
    if (existingIndex !== -1) {
      updatedItems.splice(existingIndex, 1)
    }

    const newItem: ClipboardItem = {
      id: Math.random().toString(36).substring(2, 9),
      content: trimmed,
      type: detectClipboardType(trimmed),
      timestamp: Date.now()
    }

    updatedItems = [newItem, ...updatedItems].slice(0, 50)

    set({ items: updatedItems })
    clipboardDb.setItem('items', updatedItems)
  },

  addCommand: (command: string) => {
    if (!command || !command.trim()) return
    const trimmed = command.trim()

    const currentCmds = get().recentCommands
    const filtered = currentCmds.filter(c => c !== trimmed)
    const updatedCmds = [trimmed, ...filtered].slice(0, 10)

    set({ recentCommands: updatedCmds })
    clipboardDb.setItem('recentCommands', updatedCmds)
  },

  clearHistory: () => {
    set({ items: [] })
    clipboardDb.setItem('items', [])
  },

  setHistoryOpen: (open: boolean) => {
    set({ isHistoryOpen: open })
  },

  loadPersisted: async () => {
    try {
      const persistedItems = await clipboardDb.getItem<ClipboardItem[]>('items')
      const persistedCmds = await clipboardDb.getItem<string[]>('recentCommands')
      set({
        items: persistedItems || [],
        recentCommands: persistedCmds || []
      })
    } catch (e) {
      console.error('Failed to load clipboard persistence', e)
    }
  }
}))
