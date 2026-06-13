import { useRef, useEffect, useCallback } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'
import { getParticleCount } from '@/core/adaptive-renderer'
import { Window } from './Window'

interface Particle {
  x: number; y: number; size: number; speed: number; opacity: number
}

export function Desktop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)
  const windows = useWindowStore(s => s.windows)
  const activeWorkspaceId = useWindowStore(s => s.activeWorkspaceId)
  const activeTier = useSettingsStore(s => s.activeTier)
  const focusMode = useSettingsStore(s => s.focusMode)

  const visibleWindows = windows.filter(w => w.workspaceId === activeWorkspaceId && !w.isMinimized)

  const initParticles = useCallback((count: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const count = getParticleCount(activeTier)
    initParticles(count)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x / canvas.width - 0.5
      const my = mouseRef.current.y / canvas.height - 0.5

      for (const p of particlesRef.current) {
        p.y -= p.speed
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        const parallaxX = mx * p.size * 8
        const parallaxY = my * p.size * 8
        ctx.beginPath()
        ctx.arc(p.x + parallaxX, p.y + parallaxY, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 200, 255, ${p.opacity})`
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(animate)
    }
    if (count > 0) animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [activeTier, initParticles])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at top, #202840, #050814)' }}
          onMouseMove={handleMouseMove}
        >
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
          {visibleWindows.map(w => (
            <div key={w.id} style={{ opacity: focusMode && !w.isFocused ? 0.4 : 1, transition: 'opacity 0.3s' }}>
              <Window windowId={w.id} />
            </div>
          ))}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] rounded-lg p-1 text-sm" style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)' }}>
          <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)]">
            Change Wallpaper
          </ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)]">
            New Workspace
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px my-1 bg-[var(--moon-border)]" />
          <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)]">
            Display Settings
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
