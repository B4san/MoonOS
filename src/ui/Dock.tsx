import { useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'
import { DockIcons } from './DockIcons'

export function Dock() {
  const apps = useAppRegistry(s => s.apps)
  const { windows, openWindow, focusWindow, closeWindow } = useWindowStore()
  const activeTier = useSettingsStore(s => s.activeTier)
  const dockRef = useRef<HTMLDivElement>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeTier === 'performance') return
    const rect = dockRef.current?.getBoundingClientRect()
    if (rect) setMouseX(e.clientX - rect.left)
  }, [activeTier])

  const handleMouseLeave = useCallback(() => setMouseX(null), [])

  const handleClick = (appId: string, appName: string, size?: { width: number; height: number }) => {
    const existing = windows.find(w => w.appId === appId && !w.isMinimized)
    if (existing) {
      focusWindow(existing.id)
    } else {
      openWindow(appId, appName, size)
    }
  }

  const getScale = (index: number) => {
    if (mouseX === null || activeTier === 'performance') return 1
    const iconCenter = index * 56 + 28
    const distance = Math.abs(mouseX - iconCenter)
    return Math.max(1, 1.4 - distance / 120)
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div
        ref={dockRef}
        className="flex items-end gap-1 px-3 py-2 rounded-2xl"
        style={{
          background: 'var(--moon-bg-surface)',
          backdropFilter: `blur(var(--moon-blur))`,
          border: '1px solid var(--moon-border)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {apps.map((app, i) => {
          const appWindows = windows.filter(w => w.appId === app.id)
          const isOpen = appWindows.length > 0
          const scale = getScale(i)
          return (
            <ContextMenu.Root key={app.id}>
              <ContextMenu.Trigger asChild>
                <motion.button
                  className="flex flex-col items-center relative"
                  style={{ originY: 1 }}
                  animate={{ scale }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => handleClick(app.id, app.name, app.defaultSize)}
                  aria-label={app.name}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-accent-muted)] transition-colors">
                    {DockIcons[app.id] ? DockIcons[app.id]({ size: 26 }) : <span className="text-2xl">{app.icon}</span>}
                  </div>
                  {isOpen && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--moon-accent)]" />
                  )}
                </motion.button>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-[140px] rounded-lg p-1 text-sm z-[9999]" style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)' }}>
                  <ContextMenu.Item
                    className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs"
                    onSelect={() => openWindow(app.id, app.name, app.defaultSize)}
                  >
                    New Window
                  </ContextMenu.Item>
                  {isOpen && (
                    <ContextMenu.Item
                      className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-danger)] text-xs"
                      onSelect={() => appWindows.forEach(w => closeWindow(w.id))}
                    >
                      Close All
                    </ContextMenu.Item>
                  )}
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          )
        })}
      </div>
    </div>
  )
}
