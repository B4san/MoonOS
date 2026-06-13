import { useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'

export function Dock() {
  const apps = useAppRegistry(s => s.apps)
  const { windows, openWindow, focusWindow } = useWindowStore()
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
          const isOpen = windows.some(w => w.appId === app.id)
          const scale = getScale(i)
          return (
            <motion.button
              key={app.id}
              className="flex flex-col items-center relative"
              style={{ originY: 1 }}
              animate={{ scale }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => handleClick(app.id, app.name, app.defaultSize)}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-accent-muted)] transition-colors">
                {app.icon}
              </div>
              {isOpen && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--moon-accent)]" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
