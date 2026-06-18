import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useClipboardStore, ClipboardItem } from '@/stores/clipboard-store'
import { audioEngine } from '@/core/audio-engine'

export function ClipboardOverlay() {
  const { items, isHistoryOpen, setHistoryOpen, addItem } = useClipboardStore()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter items based on search input
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const query = search.toLowerCase()
    return items.filter(item => 
      item.content.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  }, [items, search])

  const handleSelect = useCallback((item: ClipboardItem) => {
    audioEngine.playUIEvent('click')
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(item.content).then(() => {
        addItem(item.content)
      }).catch(err => {
        console.error('Failed to copy to clipboard', err)
      })
    } else {
      addItem(item.content)
    }
    setHistoryOpen(false)
  }, [addItem, setHistoryOpen])

  // Focus input on mount/open
  useEffect(() => {
    if (isHistoryOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
        setSearch('')
      }, 50)
    }
  }, [isHistoryOpen])

  // Handle keys for navigation and action
  useEffect(() => {
    if (!isHistoryOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        audioEngine.playKeyboardClick()
        setHistoryOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        audioEngine.playKeyboardClick()
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        audioEngine.playKeyboardClick()
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isHistoryOpen, filteredItems, selectedIndex, handleSelect, setHistoryOpen])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isHistoryOpen) return null

  return (
    <AnimatePresence>
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            setHistoryOpen(false)
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-[500px] max-h-[400px] flex flex-col rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden text-white"
        >
          {/* Header & Search Input */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/2">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search clipboard history..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-white/40"
            />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 px-2 py-0.5 rounded border border-white/10">
              Clipboard
            </span>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto py-2 max-h-[300px]">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs">
                No items in history
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-4 transition-colors ${
                      isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icon based on type */}
                      {item.type === 'color' && (
                        <div 
                          className="w-5 h-5 rounded-md border border-white/25 shadow-sm shrink-0" 
                          style={{ backgroundColor: item.content }}
                        />
                      )}
                      {item.type === 'code' && (
                        <svg className="w-4 h-4 text-[var(--moon-accent,cyan)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {item.type === 'link' && (
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                      {item.type === 'text' && (
                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        {item.type === 'code' ? (
                          <pre className="text-xs font-mono bg-black/30 px-2 py-1 rounded border border-white/5 overflow-x-hidden text-ellipsis whitespace-nowrap text-cyan-200">
                            {item.content}
                          </pre>
                        ) : (
                          <span className="text-xs truncate block font-sans">
                            {item.content}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-[10px] text-white/40 font-medium whitespace-nowrap shrink-0">
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-white/2 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 font-medium">
            <span>Use ↑↓ keys to navigate</span>
            <span>Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
