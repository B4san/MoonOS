import { useRef, useCallback, useState, useEffect, type PointerEvent as RPointerEvent } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'
import { useSettingsStore } from '@/stores/settings-store'
import { audioEngine } from '@/core/audio-engine'

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
  const { 
    focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow, snapWindow,
    toggleGhostMode, stackWindows, detachWindow, switchStackTab, setStackTargetWindowId, stackTargetWindowId
  } = useWindowStore()
  
  const getApp = useAppRegistry(s => s.getApp)
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; dir: string } | null>(null)
  const [snapPreview, setSnapPreview] = useState<SnapZone>(null)
  const [mounted, setMounted] = useState(false)
  const { activeTier, focusMode } = useSettingsStore()

  // Play open/close sound effects
  useEffect(() => {
    audioEngine.playUIEvent('open')
    return () => {
      audioEngine.playUIEvent('close')
    }
  }, [])

  // Mount/Genie Restore Animation
  useEffect(() => {
    const el = ref.current
    if (!el || !win || activeTier === 'performance') {
      setMounted(true)
      return
    }

    const dockX = window.innerWidth / 2
    const dockY = window.innerHeight
    const winX = win.position.x + win.size.width / 2
    const winY = win.position.y + win.size.height / 2
    const dx = dockX - winX
    const dy = dockY - winY

    el.style.transition = 'none'
    el.style.transformOrigin = 'center bottom'
    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.05, 0.2)`
    el.style.opacity = '0'

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!el) return
        el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.4s'
        el.style.transform = 'translate(0, 0) scale(1)'
        el.style.opacity = '1'
        setMounted(true)
      }, 30)
    })

    const tid = setTimeout(() => {
      if (el) {
        el.style.transition = ''
        el.style.transform = ''
        el.style.opacity = ''
      }
    }, 450)
    return () => clearTimeout(tid)
  }, [activeTier, win])

  // Ghost Mode keyboard listener (Ctrl+Shift+G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        if (win?.isFocused) {
          e.preventDefault()
          toggleGhostMode(windowId)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [win?.isFocused, windowId, toggleGhostMode])

  const handleMinimize = useCallback(() => {
    if (!win) return
    const el = ref.current
    if (!el) return

    const dockX = window.innerWidth / 2
    const dockY = window.innerHeight
    const winX = win.position.x + win.size.width / 2
    const winY = win.position.y + win.size.height / 2
    const dx = dockX - winX
    const dy = dockY - winY

    el.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.35s'
    el.style.transformOrigin = 'center bottom'
    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.05, 0.2)`
    el.style.opacity = '0'

    setTimeout(() => {
      minimizeWindow(windowId)
      if (el) {
        el.style.transform = ''
        el.style.opacity = ''
        el.style.transition = ''
      }
    }, 350)
  }, [win, windowId, minimizeWindow])

  const handleTitlePointerDown = useCallback((e: RPointerEvent) => {
    if (!win) return
    let lastX = e.clientX
    let lastY = e.clientY
    let lastTime = performance.now()
    let velX = 0
    let velY = 0

    if (win.isMaximized) {
      restoreWindow(windowId)
      const restored = useWindowStore.getState().windows.find(w => w.id === windowId)
      if (!restored) return
      const newX = e.clientX - restored.size.width / 2
      const newY = e.clientY - 18
      moveWindow(windowId, newX, newY)
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: newX, origY: newY }
    } else {
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.position.x, origY: win.position.y }
    }

    e.preventDefault()
    focusWindow(windowId)
    const el = ref.current!
    el.style.transition = 'none'

    const onMove = (ev: globalThis.PointerEvent) => {
      if (!dragRef.current) return
      const d = dragRef.current
      let x = d.origX + (ev.clientX - d.startX)
      let y = Math.max(0, d.origY + (ev.clientY - d.startY))

      // Magnetic Snapping check
      let isMagnetic = false
      const tolerance = 20
      const otherWins = useWindowStore.getState().windows.filter(
        w => w.workspaceId === win.workspaceId && w.id !== windowId && !w.isMinimized && !w.isMaximized && !w.meta?.stackId
      )

      for (const o of otherWins) {
        if (Math.abs(x - (o.position.x + o.size.width)) < tolerance) {
          x = o.position.x + o.size.width
          isMagnetic = true
        } else if (Math.abs((x + win.size.width) - o.position.x) < tolerance) {
          x = o.position.x - win.size.width
          isMagnetic = true
        } else if (Math.abs(x - o.position.x) < tolerance) {
          x = o.position.x
          isMagnetic = true
        } else if (Math.abs((x + win.size.width) - (o.position.x + o.size.width)) < tolerance) {
          x = o.position.x + o.size.width - win.size.width
          isMagnetic = true
        }

        if (Math.abs(y - (o.position.y + o.size.height)) < tolerance) {
          y = o.position.y + o.size.height
          isMagnetic = true
        } else if (Math.abs((y + win.size.height) - o.position.y) < tolerance) {
          y = o.position.y - win.size.height
          isMagnetic = true
        } else if (Math.abs(y - o.position.y) < tolerance) {
          y = o.position.y
          isMagnetic = true
        } else if (Math.abs((y + win.size.height) - (o.position.y + o.size.height)) < tolerance) {
          y = o.position.y + o.size.height - win.size.height
          isMagnetic = true
        }
      }

      el.style.left = `${x}px`
      el.style.top = `${y}px`

      if (isMagnetic) {
        el.style.boxShadow = '0 0 0 2px var(--moon-accent), var(--moon-shadow)'
      } else {
        el.style.boxShadow = ''
      }

      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) {
        velX = (ev.clientX - lastX) / dt
        velY = (ev.clientY - lastY) / dt
      }
      lastX = ev.clientX
      lastY = ev.clientY
      lastTime = now

      // Check if dragging over another window to highlight merge target
      const target = useWindowStore.getState().windows.find(
        w => w.workspaceId === win.workspaceId &&
             w.id !== windowId &&
             !w.isMinimized &&
             !w.meta?.stackId &&
             ev.clientX >= w.position.x &&
             ev.clientX <= w.position.x + w.size.width &&
             ev.clientY >= w.position.y &&
             ev.clientY <= w.position.y + w.size.height
      )
      setStackTargetWindowId(target ? target.id : null)

      setSnapPreview(getSnapZone(ev.clientX, ev.clientY))
    }

    const onUp = (ev: globalThis.PointerEvent) => {
      if (!dragRef.current) return
      const d = dragRef.current
      let currentX = d.origX + (ev.clientX - d.startX)
      let currentY = Math.max(0, d.origY + (ev.clientY - d.startY))

      // Final magnetic snapping check
      const tolerance = 20
      const otherWins = useWindowStore.getState().windows.filter(
        w => w.workspaceId === win.workspaceId && w.id !== windowId && !w.isMinimized && !w.isMaximized && !w.meta?.stackId
      )

      for (const o of otherWins) {
        if (Math.abs(currentX - (o.position.x + o.size.width)) < tolerance) {
          currentX = o.position.x + o.size.width
        } else if (Math.abs((currentX + win.size.width) - o.position.x) < tolerance) {
          currentX = o.position.x - win.size.width
        } else if (Math.abs(currentX - o.position.x) < tolerance) {
          currentX = o.position.x
        } else if (Math.abs((currentX + win.size.width) - (o.position.x + o.size.width)) < tolerance) {
          currentX = o.position.x + o.size.width - win.size.width
        }

        if (Math.abs(currentY - (o.position.y + o.size.height)) < tolerance) {
          currentY = o.position.y + o.size.height
        } else if (Math.abs((currentY + win.size.height) - o.position.y) < tolerance) {
          currentY = o.position.y - win.size.height
        } else if (Math.abs(currentY - o.position.y) < tolerance) {
          currentY = o.position.y
        } else if (Math.abs((currentY + win.size.height) - (o.position.y + o.size.height)) < tolerance) {
          currentY = o.position.y + o.size.height - win.size.height
        }
      }

      el.style.boxShadow = ''

      // If we are dropping over a valid stack target
      const targetId = useWindowStore.getState().stackTargetWindowId
      if (targetId) {
        stackWindows(targetId, windowId)
        setStackTargetWindowId(null)
        setSnapPreview(null)
        dragRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        return
      }

      const zone = getSnapZone(ev.clientX, ev.clientY)
      if (zone) {
        const bounds = getSnapBounds(zone)!
        snapWindow(windowId, bounds)
        audioEngine.playUIEvent('snap')
        el.style.transition = ''
        setSnapPreview(null)
        dragRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        return
      }

      const speed = Math.sqrt(velX * velX + velY * velY)
      if (speed > 0.15 && activeTier !== 'performance') {
        let vx = velX * 16
        let vy = velY * 16
        const friction = 0.95
        const bounceCoeff = -0.4
        const width = win.size.width
        const height = win.size.height

        const step = () => {
          vx *= friction
          vy *= friction
          currentX += vx
          currentY += vy

          const W = window.innerWidth
          const H = window.innerHeight
          const TOP = 32
          const BOTTOM = 72

          let bounced = false
          if (currentX < 0) {
            currentX = 0
            vx *= bounceCoeff
            bounced = true
          } else if (currentX + width > W) {
            currentX = W - width
            vx *= bounceCoeff
            bounced = true
          }

          if (currentY < TOP) {
            currentY = TOP
            vy *= bounceCoeff
            bounced = true
          } else if (currentY + height > H - BOTTOM) {
            currentY = H - BOTTOM - height
            vy *= bounceCoeff
            bounced = true
          }

          el.style.left = `${Math.round(currentX)}px`
          el.style.top = `${Math.round(currentY)}px`

          if (bounced) {
            el.style.transform = 'scale(1.012)'
            setTimeout(() => { el.style.transform = '' }, 80)
          }

          if (Math.sqrt(vx * vx + vy * vy) > 0.5) {
            requestAnimationFrame(step)
          } else {
            moveWindow(windowId, Math.round(currentX), Math.round(currentY))
            el.style.transition = ''
          }
        }
        requestAnimationFrame(step)
      } else {
        moveWindow(windowId, currentX, currentY)
        el.style.transition = ''
      }

      setSnapPreview(null)
      setStackTargetWindowId(null)
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [win, windowId, focusWindow, moveWindow, restoreWindow, snapWindow, activeTier, stackWindows, setStackTargetWindowId])

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

  // If stack parent, render the active child window's application component
  let app = getApp(win.appId)
  let activeChildWin = null

  if (win.meta?.isStack) {
    const activeId = win.meta.activeWindowId as string
    activeChildWin = useWindowStore.getState().windows.find(w => w.id === activeId)
    if (activeChildWin) {
      app = getApp(activeChildWin.appId)
    }
  }

  const AppComponent = app?.component
  const isTargetHighlight = stackTargetWindowId === windowId

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
        className={`absolute rounded-xl overflow-hidden flex flex-col window-container-transition ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${win.meta?.attention && !win.isFocused ? 'window-attention' : ''}`}
        style={{
          left: win.position.x,
          top: win.position.y,
          width: win.size.width,
          height: win.size.height,
          zIndex: win.zIndex,
          opacity: win.meta?.ghost ? 0.4 : (dimmed ? 0.4 : undefined),
          filter: dimmed ? 'saturate(0.15)' : undefined,
          backdropFilter: `blur(var(--moon-blur))`,
          background: 'var(--moon-bg-surface)',
          border: isTargetHighlight
            ? '2px dashed var(--moon-accent, cyan)'
            : ((win.meta?.attention && !win.isFocused) ? undefined : `1px solid ${win.isFocused ? 'var(--moon-border-active)' : 'var(--moon-border)'}`),
          boxShadow: isTargetHighlight
            ? '0 0 20px var(--moon-accent, rgba(0, 255, 255, 0.45))'
            : ((win.meta?.attention && !win.isFocused) ? undefined : (win.isFocused ? 'var(--moon-shadow)' : '0 2px 12px rgba(0,0,0,0.15)')),
          pointerEvents: win.meta?.ghost ? 'none' : 'auto',
          transition: `left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2),
                       top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2),
                       width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2),
                       height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2),
                       transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2),
                       opacity ${focusMode ? '1s' : '0.4s'} ease,
                       filter ${focusMode ? '1s' : '0.4s'} ease`,
        }}
        onPointerDown={() => focusWindow(windowId)}
      >
        {/* Titlebar */}
        <div
          className="flex items-center h-9 px-3 gap-2 cursor-default select-none shrink-0"
          style={{ 
            background: 'var(--moon-bg-elevated)', 
            borderBottom: '1px solid var(--moon-border)',
            pointerEvents: 'auto' // Titlebar remains interactive for ghost windows
          }}
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={() => {
            if (win.meta?.ghost) {
              toggleGhostMode(windowId)
            } else {
              if (win.isMaximized) {
                restoreWindow(windowId)
              } else {
                maximizeWindow(windowId)
              }
            }
          }}
        >
          {/* Controls Area */}
          <div className="flex gap-2 items-center ml-1" onPointerDown={e => e.stopPropagation()}>
            <button onClick={() => closeWindow(windowId)} className="group w-4 h-4 rounded-md bg-[var(--moon-control-close)]/15 hover:bg-[var(--moon-control-close)] flex items-center justify-center transition-all duration-150" aria-label="Close">
              <svg className="w-2 h-2 text-[var(--moon-control-close)] group-hover:text-white transition-colors" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/></svg>
            </button>
            <button onClick={handleMinimize} className="group w-4 h-4 rounded-md bg-[var(--moon-control-minimize)]/15 hover:bg-[var(--moon-control-minimize)] flex items-center justify-center transition-all duration-150" aria-label="Minimize">
              <svg className="w-2 h-2 text-[var(--moon-control-minimize)] group-hover:text-white transition-colors" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 4h5"/></svg>
            </button>
            <button onClick={() => win.isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)} className="group w-4 h-4 rounded-md bg-[var(--moon-control-maximize)]/15 hover:bg-[var(--moon-control-maximize)] flex items-center justify-center transition-all duration-150" aria-label="Maximize">
              {win.isMaximized
                ? <svg className="w-2.5 h-2.5 text-[var(--moon-control-maximize)] group-hover:text-white transition-colors" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="5" height="5" rx="1"/><path d="M4 3V2a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H7"/></svg>
                : <svg className="w-2 h-2 text-[var(--moon-control-maximize)] group-hover:text-white transition-colors" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1"/></svg>
              }
            </button>
            {/* Ghost Mode Toggle */}
            <button 
              onClick={() => toggleGhostMode(windowId)} 
              className={`group w-4 h-4 rounded-md flex items-center justify-center transition-all duration-150 ${win.meta?.ghost ? 'bg-[var(--moon-accent)] text-white' : 'bg-white/10 hover:bg-white/20'}`}
              title="Toggle Ghost Mode (Ctrl+Shift+G)"
            >
              <span className="text-[10px] scale-90">👻</span>
            </button>
          </div>

          {/* Title or Tabs Area */}
          {win.meta?.isStack ? (
            <div className="flex-1 flex gap-1.5 overflow-x-auto h-full items-end justify-center px-4" onPointerDown={e => e.stopPropagation()}>
              {(win.meta.stackedWindows as { id: string; title: string; appId: string }[]).map(child => {
                const isActive = win.meta?.activeWindowId === child.id
                return (
                  <div
                    key={child.id}
                    onClick={() => switchStackTab(windowId, child.id)}
                    className={`h-[28px] px-3.5 py-1 rounded-t-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all duration-150 border-t border-x cursor-pointer max-w-[120px] truncate group ${
                      isActive 
                        ? 'bg-[var(--moon-bg-surface)] border-white/10 text-white shadow-sm' 
                        : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <span>{child.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        detachWindow(windowId, child.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity shrink-0 leading-none pb-0.5"
                      title="Detach window"
                    >
                      ◳
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <span className="flex-1 text-center text-xs font-medium text-[var(--moon-text-primary)] opacity-80 truncate">
              {win.title}
            </span>
          )}

          <div className="w-[72px]" />
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-hidden ${win.meta?.ghost ? 'pointer-events-none' : ''}`}>
          {AppComponent && (
            <AppComponent 
              windowId={win.meta?.isStack && activeChildWin ? activeChildWin.id : windowId} 
            />
          )}
        </div>

        {/* Resize handles */}
        {!win.isMaximized && (
          <div style={{ pointerEvents: win.meta?.ghost ? 'none' : 'auto' }}>
            <div className="absolute top-0 left-3 right-3 h-2 cursor-n-resize" onPointerDown={handleResizePointerDown('n')} />
            <div className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize" onPointerDown={handleResizePointerDown('s')} />
            <div className="absolute top-3 bottom-3 left-0 w-2 cursor-w-resize" onPointerDown={handleResizePointerDown('w')} />
            <div className="absolute top-3 bottom-3 right-0 w-2 cursor-e-resize" onPointerDown={handleResizePointerDown('e')} />
            <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize" onPointerDown={handleResizePointerDown('nw')} />
            <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onPointerDown={handleResizePointerDown('ne')} />
            <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onPointerDown={handleResizePointerDown('sw')} />
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onPointerDown={handleResizePointerDown('se')} />
          </div>
        )}
      </div>
    </>
  )
}
