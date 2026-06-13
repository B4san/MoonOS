import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useWindowStore } from '@/stores/window-store'
import { useHotkey } from '@/hooks/useHotkey'

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const { workspaces, activeWorkspaceId, setActiveWorkspace, windows } = useWindowStore()

  const toggle = useCallback(() => setOpen(o => !o), [])
  useHotkey('Tab', toggle, { ctrl: true })

  // Direct workspace switching with Ctrl+1-4
  useHotkey('1', () => workspaces[0] && setActiveWorkspace(workspaces[0].id), { ctrl: true })
  useHotkey('2', () => workspaces[1] && setActiveWorkspace(workspaces[1].id), { ctrl: true })
  useHotkey('3', () => workspaces[2] && setActiveWorkspace(workspaces[2].id), { ctrl: true })
  useHotkey('4', () => workspaces[3] && setActiveWorkspace(workspaces[3].id), { ctrl: true })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div className="grid grid-cols-2 gap-4 p-6" onClick={e => e.stopPropagation()}>
            {workspaces.map(ws => {
              const wsWindows = windows.filter(w => w.workspaceId === ws.id)
              const isActive = ws.id === activeWorkspaceId
              return (
                <motion.button
                  key={ws.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-56 h-36 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${isActive ? 'ring-2 ring-[var(--moon-accent)]' : ''}`}
                  style={{ background: 'var(--moon-bg-surface)', border: '1px solid var(--moon-border)' }}
                  onClick={() => { setActiveWorkspace(ws.id); setOpen(false) }}
                >
                  <span className="text-xs text-[var(--moon-text-secondary)]">{ws.name}</span>
                  <span className="text-xs text-[var(--moon-text-muted)]">{wsWindows.length} window{wsWindows.length !== 1 ? 's' : ''}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
