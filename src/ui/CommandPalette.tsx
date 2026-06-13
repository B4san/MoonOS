import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useHotkey } from '@/hooks/useHotkey'
import { useSettingsStore } from '@/stores/settings-store'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'
import type { CommandAction } from '@/types'

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let qi = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setTheme, theme, setTierOverride } = useSettingsStore()
  const { setActiveWorkspace, workspaces, openWindow } = useWindowStore()
  const apps = useAppRegistry(s => s.apps)

  const toggle = useCallback(() => { setOpen(o => !o); setQuery(''); setSelected(0) }, [])
  useHotkey('k', toggle, { ctrl: true })

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  const actions: CommandAction[] = useMemo(() => [
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, icon: theme === 'dark' ? '☀️' : '🌙', category: 'theme', keywords: ['theme', 'dark', 'light', 'toggle'], action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { id: 'tier-quality', label: 'Set Quality Tier', icon: '🚀', category: 'system', keywords: ['tier', 'quality', 'high'], action: () => setTierOverride('quality') },
    { id: 'tier-balanced', label: 'Set Balanced Tier', icon: '⚡', category: 'system', keywords: ['tier', 'balanced', 'medium'], action: () => setTierOverride('balanced') },
    { id: 'tier-performance', label: 'Set Performance Tier', icon: '🔋', category: 'system', keywords: ['tier', 'performance', 'low'], action: () => setTierOverride('performance') },
    { id: 'tier-auto', label: 'Set Auto Tier', icon: '🔄', category: 'system', keywords: ['tier', 'auto', 'detect'], action: () => setTierOverride('auto') },
    ...workspaces.map(ws => ({
      id: `ws-${ws.id}`, label: `Switch to ${ws.name}`, icon: '🖥️', category: 'system' as const, keywords: ['workspace', ws.name], action: () => setActiveWorkspace(ws.id),
    })),
    ...apps.map(app => ({
      id: `open-${app.id}`, label: `Open ${app.name}`, icon: app.icon, category: 'apps' as const, keywords: ['open', app.name, ...app.keywords], action: () => openWindow(app.id, app.name, app.defaultSize),
    })),
  ], [theme, setTheme, setTierOverride, workspaces, setActiveWorkspace, apps, openWindow])

  const filtered = actions.filter(a =>
    fuzzyMatch(a.label, query) || a.keywords.some(k => fuzzyMatch(k, query))
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); setOpen(false) }
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
            className="w-[520px] rounded-xl overflow-hidden"
            style={{ background: 'var(--moon-bg-surface)', backdropFilter: `blur(var(--moon-blur))`, border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
            onClick={e => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="w-full px-4 py-3 bg-transparent text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-muted)] outline-none text-sm"
            />
            {filtered.length > 0 && (
              <div className="border-t border-[var(--moon-border)] max-h-[300px] overflow-y-auto">
                {filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${i === selected ? 'bg-[var(--moon-accent-muted)]' : 'hover:bg-[var(--moon-bg-elevated)]'}`}
                    onClick={() => { cmd.action(); setOpen(false) }}
                  >
                    <span className="text-lg">{cmd.icon}</span>
                    <span className="text-[var(--moon-text-primary)]">{cmd.label}</span>
                    <span className="ml-auto text-xs text-[var(--moon-text-muted)]">{cmd.category}</span>
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
