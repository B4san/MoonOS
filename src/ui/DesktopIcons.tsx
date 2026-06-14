import { useState, useCallback, useRef } from 'react'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useDockStore } from '@/stores/dock-store'
import { DockIcons } from './DockIcons'
import { persistence } from '@/core/persistence'

interface IconPos { x: number; y: number }

export function DesktopIcons() {
  const apps = useAppRegistry(s => s.apps)
  const pinnedApps = useDockStore(s => s.pinnedApps)
  const pinApp = useDockStore(s => s.pinApp)
  const { openWindow, windows, focusWindow } = useWindowStore()
  const desktopApps = apps.filter(a => !pinnedApps.includes(a.id))

  const [positions, setPositions] = useState<Record<string, IconPos>>(() => {
    const saved = persistence.get<Record<string, IconPos>>('desktop-icon-positions', {})
    const initial: Record<string, IconPos> = { ...saved }
    return initial
  })

  const getDefaultPos = (index: number): IconPos => {
    const col = Math.floor(index / 6)
    const row = index % 6
    return { x: 20 + col * 100, y: 50 + row * 100 }
  }

  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent, appId: string, pos: IconPos) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { id: appId, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = dragRef.current
    const x = d.origX + (e.clientX - d.startX)
    const y = d.origY + (e.clientY - d.startY)
    setPositions(p => ({ ...p, [d.id]: { x, y } }))
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    setPositions(p => { persistence.set('desktop-icon-positions', p); return p })
  }, [])

  const handleDoubleClick = (appId: string, appName: string, size?: { width: number; height: number }) => {
    const existing = windows.find(w => w.appId === appId && !w.isMinimized)
    if (existing) focusWindow(existing.id)
    else openWindow(appId, appName, size)
  }

  if (desktopApps.length === 0) return null

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none">
      {desktopApps.map((app, i) => {
        const pos = positions[app.id] || getDefaultPos(i)
        return (
          <div
            key={app.id}
            className="absolute pointer-events-auto flex flex-col items-center gap-1 cursor-default select-none group"
            style={{ left: pos.x, top: pos.y, width: 76 }}
            onPointerDown={(e) => handlePointerDown(e, app.id, pos)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={() => handleDoubleClick(app.id, app.name, app.defaultSize)}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--moon-bg-surface)]/60 group-hover:bg-[var(--moon-bg-surface)]/90 backdrop-blur-sm border border-[var(--moon-border)]/50 group-hover:border-[var(--moon-accent)]/40 transition-all group-active:scale-90">
              {DockIcons[app.id] ? DockIcons[app.id]({ size: 28 }) : <span className="text-2xl">{app.icon}</span>}
            </div>
            <span className="text-[10px] text-[var(--moon-text-secondary)] text-center leading-tight max-w-full truncate px-1 group-hover:text-[var(--moon-text-primary)] transition-colors">
              {app.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
