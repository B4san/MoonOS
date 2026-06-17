import { useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDockStore } from '@/stores/dock-store'
import { DockIcons } from './DockIcons'

export function Dock() {
  const allApps = useAppRegistry(s => s.apps)
  const { windows, openWindow, focusWindow, closeWindow } = useWindowStore()
  const activeTier = useSettingsStore(s => s.activeTier)
  const dock = useDockStore()
  const dockRef = useRef<HTMLDivElement>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [bouncingApps, setBouncingApps] = useState<Record<string, boolean>>({})
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeTier === 'performance' || !dock.magnification) return
    const rect = dockRef.current?.getBoundingClientRect()
    if (rect) setMouseX(e.clientX - rect.left)
  }, [activeTier, dock.magnification])

  const handleMouseLeave = useCallback(() => {
    setMouseX(null)
    setHoveredAppId(null)
  }, [])

  const handleClick = (appId: string, appName: string, size?: { width: number; height: number }) => {
    const existing = windows.find(w => w.appId === appId && !w.isMinimized)
    if (existing) {
      focusWindow(existing.id)
    } else {
      setBouncingApps(prev => ({ ...prev, [appId]: true }))
      setTimeout(() => {
        setBouncingApps(prev => {
          const next = { ...prev }
          delete next[appId]
          return next
        })
      }, 1200)
      openWindow(appId, appName, size)
    }
  }

  const getScale = (index: number) => {
    if (mouseX === null || activeTier === 'performance' || !dock.magnification) return 1
    const padding = 12 // px-3
    const iconCenter = padding + index * (dock.size + dock.gap) + dock.size / 2
    const distance = Math.abs(mouseX - iconCenter)
    return Math.max(1, 1.4 - distance / 120)
  }

  const isVertical = dock.position === 'left' || dock.position === 'right'
  const positionClasses: Record<string, string> = {
    bottom: 'bottom-3 left-1/2 -translate-x-1/2',
    top: 'top-10 left-1/2 -translate-x-1/2',
    left: 'left-3 top-[calc(50%+16px)] -translate-y-1/2',
    right: 'right-3 top-[calc(50%+16px)] -translate-y-1/2',
  }

  return (
    <div className={`absolute z-50 ${positionClasses[dock.position]}`}>
      <div
        ref={dockRef}
        className={`flex ${isVertical ? 'flex-col' : ''} items-center px-3 py-2`}
        style={{
          gap: `${dock.gap}px`,
          borderRadius: `${dock.borderRadius}px`,
          background: dock.bgColor,
          backdropFilter: dock.glassmorphism ? `blur(${dock.blur}px)` : 'none',
          border: `${dock.borderWidth}px solid ${dock.borderColor}`,
          boxShadow: dock.shadow ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
          opacity: dock.opacity / 100,
          ...(isVertical ? { maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' } : {}),
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {allApps.filter(a => dock.pinnedApps.includes(a.id)).sort((a, b) => dock.pinnedApps.indexOf(a.id) - dock.pinnedApps.indexOf(b.id)).map((app, i) => {
          const appWindows = windows.filter(w => w.appId === app.id)
          const isOpen = appWindows.length > 0
          const scale = getScale(i)
          return (
            <ContextMenu.Root key={app.id}>
              <ContextMenu.Trigger asChild>
                <motion.button
                  className="flex flex-col items-center relative dock-item-glow"
                  style={{ originY: 1 }}
                  animate={{
                    scale,
                    y: bouncingApps[app.id] ? [-14, 0, -10, 0, -4, 0] : 0
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 400, damping: 25 },
                    y: bouncingApps[app.id] ? { duration: 1, ease: 'easeOut' } : undefined
                  }}
                  onClick={() => handleClick(app.id, app.name, app.defaultSize)}
                  onMouseEnter={() => setHoveredAppId(app.id)}
                  onMouseLeave={() => setHoveredAppId(null)}
                  aria-label={app.name}
                >
                  <div
                    className="rounded-xl flex items-center justify-center bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-accent-muted)] transition-colors"
                    style={{ width: `${dock.size}px`, height: `${dock.size}px` }}
                  >
                    {DockIcons[app.id] ? DockIcons[app.id]({ size: Math.round(dock.size * 0.6) }) : <span style={{ fontSize: `${dock.size * 0.5}px` }}>{app.icon}</span>}
                  </div>
                  {isOpen && (
                    <div className={`absolute ${isVertical ? '-right-1.5 top-1/2 -translate-y-1/2' : '-bottom-1'} w-1 h-1 rounded-full bg-[var(--moon-accent)]`} />
                  )}

                  {hoveredAppId === app.id && (
                    <div 
                      className={`absolute ${isVertical ? 'left-16 top-1/2 -translate-y-1/2' : 'bottom-16 left-1/2 -translate-x-1/2'} px-3 py-2 rounded-lg text-[10px] text-nowrap pointer-events-none select-none`}
                      style={{
                        background: 'var(--moon-bg-surface)',
                        backdropFilter: 'blur(var(--moon-blur))',
                        border: '1px solid var(--moon-border)',
                        boxShadow: 'var(--moon-shadow)',
                        zIndex: 9999
                      }}
                    >
                      <p className="font-semibold text-[var(--moon-text-primary)]">{app.name}</p>
                      {isOpen ? (
                        <p className="text-[var(--moon-text-secondary)] opacity-85 mt-0.5">Active: {appWindows[0].title}</p>
                      ) : (
                        <p className="text-[var(--moon-text-muted)] mt-0.5">Launch app</p>
                      )}
                    </div>
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
