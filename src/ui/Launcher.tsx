import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useHotkey } from '@/hooks/useHotkey'

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let qi = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++
  }
  return qi === q.length
}

export function Launcher() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const apps = useAppRegistry(s => s.apps)
  const openWindow = useWindowStore(s => s.openWindow)

  const toggle = useCallback(() => {
    setOpen(o => !o)
    setQuery('')
    setSelected(0)
  }, [])

  useHotkey(' ', toggle, { ctrl: true })

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const filtered = apps.filter(a =>
    fuzzyMatch(a.name, query) || a.keywords.some(k => fuzzyMatch(k, query))
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) {
      openWindow(filtered[selected].id, filtered[selected].name, filtered[selected].defaultSize)
      setOpen(false)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[520px] max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden"
            style={{ background: 'var(--moon-bg-surface)', backdropFilter: `blur(var(--moon-blur))`, border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
            onClick={e => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Search apps..."
              className="w-full px-5 py-3.5 bg-transparent text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-secondary)] outline-none text-sm"
            />
            {filtered.length > 0 && (
              <div className="border-t border-[var(--moon-border)] max-h-[300px] overflow-y-auto">
                {filtered.map((app, i) => (
                  <button
                    key={app.id}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors ${i === selected ? 'bg-[var(--moon-accent-muted)]' : 'hover:bg-[var(--moon-bg-elevated)]'}`}
                    onClick={() => { openWindow(app.id, app.name, app.defaultSize); setOpen(false) }}
                  >
                    <span className="text-lg">{app.icon}</span>
                    <span className="text-[var(--moon-text-primary)] truncate">{app.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
