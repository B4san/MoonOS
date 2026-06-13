import { useRef, useCallback, type PointerEvent as RPointerEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'

export function Window({ windowId }: { windowId: string }) {
  const win = useWindowStore(s => s.windows.find(w => w.id === windowId))
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow } = useWindowStore()
  const getApp = useAppRegistry(s => s.getApp)
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; dir: string } | null>(null)

  const handleTitlePointerDown = useCallback((e: RPointerEvent) => {
    if (win?.isMaximized) return
    e.preventDefault()
    focusWindow(windowId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win!.position.x, origY: win!.position.y }
    const el = ref.current!

    const onMove = (ev: globalThis.PointerEvent) => {
      const d = dragRef.current!
      const x = d.origX + (ev.clientX - d.startX)
      const y = Math.max(32, d.origY + (ev.clientY - d.startY))
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    const onUp = (ev: globalThis.PointerEvent) => {
      const d = dragRef.current!
      const x = d.origX + (ev.clientX - d.startX)
      const y = Math.max(32, d.origY + (ev.clientY - d.startY))
      moveWindow(windowId, x, y)
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [win, windowId, focusWindow, moveWindow])

  const handleResizePointerDown = useCallback((dir: string) => (e: RPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(windowId)
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: win!.size.width, origH: win!.size.height, origX: win!.position.x, origY: win!.position.y, dir }

    const onMove = (ev: globalThis.PointerEvent) => {
      const r = resizeRef.current!
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY
      let w = r.origW, h = r.origH, x = r.origX, y = r.origY
      if (r.dir.includes('e')) w = Math.max(300, r.origW + dx)
      if (r.dir.includes('w')) { w = Math.max(300, r.origW - dx); x = r.origX + dx }
      if (r.dir.includes('s')) h = Math.max(200, r.origH + dy)
      if (r.dir.includes('n')) { h = Math.max(200, r.origH - dy); y = r.origY + dy }
      const el = ref.current!
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    const onUp = (ev: globalThis.PointerEvent) => {
      const r = resizeRef.current!
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY
      let w = r.origW, h = r.origH, x = r.origX, y = r.origY
      if (r.dir.includes('e')) w = Math.max(300, r.origW + dx)
      if (r.dir.includes('w')) { w = Math.max(300, r.origW - dx); x = r.origX + dx }
      if (r.dir.includes('s')) h = Math.max(200, r.origH + dy)
      if (r.dir.includes('n')) { h = Math.max(200, r.origH - dy); y = r.origY + dy }
      moveWindow(windowId, x, y)
      resizeWindow(windowId, w, h)
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
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute rounded-xl overflow-hidden"
        style={{
          transform: `translate(${win.position.x}px, ${win.position.y}px)`,
          width: win.size.width,
          height: win.size.height,
          zIndex: win.zIndex,
          backdropFilter: `blur(var(--moon-blur))`,
          background: 'var(--moon-bg-surface)',
          border: '1px solid var(--moon-border)',
          boxShadow: 'var(--moon-shadow)',
        }}
        onPointerDown={() => focusWindow(windowId)}
      >
        {/* Titlebar */}
        <div
          className="flex items-center h-9 px-3 gap-2 cursor-default select-none"
          style={{ background: 'var(--moon-bg-elevated)' }}
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={() => win.isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)}
        >
          {/* macOS controls */}
          <div className="flex gap-1.5 items-center group" onPointerDown={e => e.stopPropagation()}>
            <button onClick={() => closeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-close)] hover:brightness-110 transition-all" />
            <button onClick={() => minimizeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-minimize)] hover:brightness-110 transition-all" />
            <button onClick={() => win.isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)} className="w-3 h-3 rounded-full bg-[var(--moon-control-maximize)] hover:brightness-110 transition-all" />
          </div>
          <span className="flex-1 text-center text-xs text-[var(--moon-text-secondary)] truncate">{win.title}</span>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto" style={{ height: 'calc(100% - 36px)' }}>
          {AppComponent && <AppComponent windowId={windowId} />}
        </div>
        {/* Resize handles */}
        {!win.isMaximized && <>
          <div className="absolute top-0 left-0 right-0 h-1 cursor-n-resize" onPointerDown={handleResizePointerDown('n')} />
          <div className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize" onPointerDown={handleResizePointerDown('s')} />
          <div className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize" onPointerDown={handleResizePointerDown('w')} />
          <div className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize" onPointerDown={handleResizePointerDown('e')} />
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onPointerDown={handleResizePointerDown('nw')} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onPointerDown={handleResizePointerDown('ne')} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onPointerDown={handleResizePointerDown('sw')} />
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onPointerDown={handleResizePointerDown('se')} />
        </>}
      </motion.div>
    </AnimatePresence>
  )
}
