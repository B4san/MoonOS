import { useRef, useCallback, useState, useEffect, type PointerEvent as RPointerEvent } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'

type SnapZone = 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null

function getSnapZone(x: number, y: number): SnapZone {
  const { innerWidth: W, innerHeight: H } = window
  const EDGE = 8
  const atLeft = x <= EDGE
  const atRight = x >= W - EDGE
  const atTop = y <= EDGE
  const atBottom = y >= H - EDGE

  if (atTop && atLeft) return 'top-left'
  if (atTop && atRight) return 'top-right'
  if (atBottom && atLeft) return 'bottom-left'
  if (atBottom && atRight) return 'bottom-right'
  if (atLeft) return 'left'
  if (atRight) return 'right'
  if (atTop) return 'top'
  return null
}

function getSnapBounds(zone: SnapZone) {
  const W = window.innerWidth
  const H = window.innerHeight
  const TOP = 32
  const BOTTOM = 72
  const usableH = H - TOP - BOTTOM

  switch (zone) {
    case 'left': return { x: 0, y: TOP, width: W / 2, height: usableH }
    case 'right': return { x: W / 2, y: TOP, width: W / 2, height: usableH }
    case 'top': return { x: 0, y: TOP, width: W, height: usableH }
    case 'top-left': return { x: 0, y: TOP, width: W / 2, height: usableH / 2 }
    case 'top-right': return { x: W / 2, y: TOP, width: W / 2, height: usableH / 2 }
    case 'bottom-left': return { x: 0, y: TOP + usableH / 2, width: W / 2, height: usableH / 2 }
    case 'bottom-right': return { x: W / 2, y: TOP + usableH / 2, width: W / 2, height: usableH / 2 }
    default: return null
  }
}

export function Window({ windowId, dimmed }: { windowId: string; dimmed?: boolean }) {
  const win = useWindowStore(s => s.windows.find(w => w.id === windowId))
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow, snapWindow } = useWindowStore()
  const getApp = useAppRegistry(s => s.getApp)
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; dir: string } | null>(null)
  const [snapPreview, setSnapPreview] = useState<SnapZone>(null)
  const [mounted, setMounted] = useState(false)

  // Mount animation
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const handleTitlePointerDown = useCallback((e: RPointerEvent) => {
    if (win?.isMaximized) {
      restoreWindow(windowId)
      const restored = useWindowStore.getState().windows.find(w => w.id === windowId)
      if (!restored) return
      const newX = e.clientX - restored.size.width / 2
      const newY = e.clientY - 18
      moveWindow(windowId, newX, newY)
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: newX, origY: newY }
    } else {
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win!.position.x, origY: win!.position.y }
    }

    e.preventDefault()
    focusWindow(windowId)
    const el = ref.current!
    el.style.transition = 'none'

    const onMove = (ev: globalThis.PointerEvent) => {
      const d = dragRef.current!
      const x = d.origX + (ev.clientX - d.startX)
      const y = Math.max(0, d.origY + (ev.clientY - d.startY))
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      setSnapPreview(getSnapZone(ev.clientX, ev.clientY))
    }

    const onUp = (ev: globalThis.PointerEvent) => {
      const d = dragRef.current!
      const x = d.origX + (ev.clientX - d.startX)
      const y = Math.max(0, d.origY + (ev.clientY - d.startY))

      const zone = getSnapZone(ev.clientX, ev.clientY)
      if (zone) {
        const bounds = getSnapBounds(zone)!
        snapWindow(windowId, bounds)
      } else {
        moveWindow(windowId, x, y)
      }

      el.style.transition = ''
      setSnapPreview(null)
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [win, windowId, focusWindow, moveWindow, restoreWindow, snapWindow])

  const handleResizePointerDown = useCallback((dir: string) => (e: RPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(windowId)
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: win!.size.width, origH: win!.size.height, origX: win!.position.x, origY: win!.position.y, dir }
    const el = ref.current!
    el.style.transition = 'none'

    const onMove = (ev: globalThis.PointerEvent) => {
      const r = resizeRef.current!
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY
      let w = r.origW, h = r.origH, x = r.origX, y = r.origY
      if (r.dir.includes('e')) w = Math.max(280, r.origW + dx)
      if (r.dir.includes('w')) { w = Math.max(280, r.origW - dx); x = r.origX + (r.origW - w) }
      if (r.dir.includes('s')) h = Math.max(180, r.origH + dy)
      if (r.dir.includes('n')) { h = Math.max(180, r.origH - dy); y = r.origY + (r.origH - h) }
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    }

    const onUp = (ev: globalThis.PointerEvent) => {
      const r = resizeRef.current!
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY
      let w = r.origW, h = r.origH, x = r.origX, y = r.origY
      if (r.dir.includes('e')) w = Math.max(280, r.origW + dx)
      if (r.dir.includes('w')) { w = Math.max(280, r.origW - dx); x = r.origX + (r.origW - w) }
      if (r.dir.includes('s')) h = Math.max(180, r.origH + dy)
      if (r.dir.includes('n')) { h = Math.max(180, r.origH - dy); y = r.origY + (r.origH - h) }
      moveWindow(windowId, x, y)
      resizeWindow(windowId, w, h)
      el.style.transition = ''
      resizeRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [win, windowId, focusWindow, moveWindow, resizeWindow])

  if (!win || win.isMinimized) return null

  const app = getApp(win.appId)
  const AppComponent = app?.component

  return (
    <>
      {/* Snap preview */}
      {snapPreview && (() => {
        const bounds = getSnapBounds(snapPreview)
        if (!bounds) return null
        return (
          <div
            className="absolute rounded-xl pointer-events-none z-[9990] transition-all duration-150"
            style={{ left: bounds.x + 4, top: bounds.y + 4, width: bounds.width - 8, height: bounds.height - 8, background: 'var(--moon-accent-muted)', border: '2px solid var(--moon-accent)' }}
          />
        )
      })()}

      <div
        ref={ref}
        className={`absolute rounded-xl overflow-hidden flex flex-col transition-[transform,opacity] ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{
          left: win.position.x,
          top: win.position.y,
          width: win.size.width,
          height: win.size.height,
          zIndex: win.zIndex,
          opacity: dimmed ? 0.4 : undefined,
          backdropFilter: `blur(var(--moon-blur))`,
          background: 'var(--moon-bg-surface)',
          border: `1px solid ${win.isFocused ? 'var(--moon-border-active)' : 'var(--moon-border)'}`,
          boxShadow: win.isFocused ? 'var(--moon-shadow)' : '0 2px 12px rgba(0,0,0,0.15)',
          transitionDuration: '0.18s',
        }}
        onPointerDown={() => focusWindow(windowId)}
      >
        {/* Titlebar */}
        <div
          className="flex items-center h-9 px-3 gap-2 cursor-default select-none shrink-0"
          style={{ background: 'var(--moon-bg-elevated)', borderBottom: '1px solid var(--moon-border)' }}
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={() => win.isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)}
        >
          <div className="flex gap-1.5 items-center" onPointerDown={e => e.stopPropagation()}>
            <button onClick={() => closeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-close)] hover:brightness-125 active:brightness-90 transition-all" aria-label="Close" />
            <button onClick={() => minimizeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-minimize)] hover:brightness-125 active:brightness-90 transition-all" aria-label="Minimize" />
            <button onClick={() => win.isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-maximize)] hover:brightness-125 active:brightness-90 transition-all" aria-label="Maximize" />
          </div>
          <span className="flex-1 text-center text-xs font-medium text-[var(--moon-text-secondary)] truncate">{win.title}</span>
          <div className="w-[52px]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {AppComponent && <AppComponent windowId={windowId} />}
        </div>

        {/* Resize handles */}
        {!win.isMaximized && <>
          <div className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize" onPointerDown={handleResizePointerDown('n')} />
          <div className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize" onPointerDown={handleResizePointerDown('s')} />
          <div className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize" onPointerDown={handleResizePointerDown('w')} />
          <div className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize" onPointerDown={handleResizePointerDown('e')} />
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize" onPointerDown={handleResizePointerDown('nw')} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onPointerDown={handleResizePointerDown('ne')} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onPointerDown={handleResizePointerDown('sw')} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onPointerDown={handleResizePointerDown('se')} />
        </>}
      </div>
    </>
  )
}
