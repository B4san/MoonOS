import { useState, useCallback, useRef } from 'react'
import { useAppRegistry } from '@/stores/app-registry'
import { useWindowStore } from '@/stores/window-store'
import { useDockStore } from '@/stores/dock-store'
import { useSettingsStore } from '@/stores/settings-store'
import { DockIcons } from './DockIcons'
import { persistence } from '@/core/persistence'

interface IconPos { x: number; y: number }

const GRID_COLS = 12
const GRID_ROWS = 6
const CELL_W = 100
const CELL_H = 105
const OFFSET_X = 20
const OFFSET_Y = 50

function snapToGrid(x: number, y: number): IconPos {
  const col = Math.round((x - OFFSET_X) / CELL_W)
  const row = Math.round((y - OFFSET_Y) / CELL_H)
  return {
    x: OFFSET_X + Math.max(0, Math.min(col, GRID_COLS - 1)) * CELL_W,
    y: OFFSET_Y + Math.max(0, Math.min(row, GRID_ROWS - 1)) * CELL_H,
  }
}

export function DesktopIcons() {
  const apps = useAppRegistry(s => s.apps)
  const pinnedApps = useDockStore(s => s.pinnedApps)
  const desktopLayout = useSettingsStore(s => s.desktopLayout)
  const { openWindow, windows, focusWindow } = useWindowStore()
  const desktopApps = apps.filter(a => !pinnedApps.includes(a.id))

  const [positions, setPositions] = useState<Record<string, IconPos>>(() =>
    persistence.get<Record<string, IconPos>>('desktop-icon-positions', {})
  )

  const getDefaultPos = (index: number): IconPos => {
    const col = Math.floor(index / GRID_ROWS)
    const row = index % GRID_ROWS
    return { x: OFFSET_X + col * CELL_W, y: OFFSET_Y + row * CELL_H }
  }

  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent, appId: string, pos: IconPos) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { id: appId, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = dragRef.current
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
    const x = d.origX + dx
    const y = d.origY + dy
    setPositions(p => ({ ...p, [d.id]: { x, y } }))
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    const d = dragRef.current
    dragRef.current = null
    setPositions(p => {
      const pos = p[d.id]
      if (!pos) return p
      const final = desktopLayout === 'grid' ? snapToGrid(pos.x, pos.y) : pos
      const next = { ...p, [d.id]: final }
      persistence.set('desktop-icon-positions', next)
      return next
    })
  }, [desktopLayout])

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
            className="absolute pointer-events-auto flex flex-col items-center gap-1.5 cursor-default select-none group"
            style={{
              left: pos.x,
              top: pos.y,
              width: 88,
              transition: dragRef.current?.id === app.id ? 'none' : 'left 0.2s ease, top 0.2s ease',
            }}
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
