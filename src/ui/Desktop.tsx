import { useRef, useEffect, useCallback } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useBackgroundStore } from '@/stores/background-store'
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
  const bg = useBackgroundStore()

  const visibleWindows = windows.filter(w => w.workspaceId === activeWorkspaceId && !w.isMinimized && !w.meta?.stackId)

  const bgStyle = (): string => {
    if (bg.type === 'solid') return bg.solidColor
    if (bg.type === 'gradient') return `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`
    return '#050814'
  }

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
    const count = bg.particles ? getParticleCount(activeTier) : 0
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
  }, [activeTier, bg.particles, initParticles])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="absolute inset-0"
          style={{ background: bgStyle() }}
          onMouseMove={handleMouseMove}
        >
          {bg.type === 'image' && bg.imageUrl && (
            <img src={bg.imageUrl} className="absolute inset-0 w-full h-full object-cover" style={{ filter: `blur(${bg.imageBlur}px) brightness(${bg.imageBrightness}%)` }} />
          )}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity ease-in-out"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.75)',
              opacity: focusMode ? 1 : 0,
              transitionDuration: focusMode ? '1s' : '5s',
              zIndex: 999,
            }}
          />
          {visibleWindows.map(w => (
            <Window key={w.id} windowId={w.id} dimmed={focusMode && !w.isFocused} />
          ))}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] rounded-lg p-1 text-sm" style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)' }}>
          <ContextMenu.Item
            className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs"
            onSelect={() => useWindowStore.getState().tileWindows()}
          >
            Tile All Windows
          </ContextMenu.Item>
          <ContextMenu.Item
            className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs"
            onSelect={() => useSettingsStore.getState().toggleFocusMode()}
          >
            Toggle Focus Mode
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px my-1 bg-[var(--moon-border)]" />
          <ContextMenu.Item
            className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs"
            onSelect={() => useSettingsStore.getState().setTheme(useSettingsStore.getState().theme === 'dark' ? 'light' : 'dark')}
          >
            Toggle Theme
          </ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs">
            Display Settings
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
