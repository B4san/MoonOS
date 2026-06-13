import { useState, useEffect } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-xs text-[var(--moon-text-secondary)]">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

const tierIcons: Record<string, string> = { quality: '🚀', balanced: '⚡', performance: '🔋' }

export function TopPanel() {
  const windows = useWindowStore(s => s.windows)
  const activeWorkspaceId = useWindowStore(s => s.activeWorkspaceId)
  const workspaces = useWindowStore(s => s.workspaces)
  const { activeTier, theme, setTheme } = useSettingsStore()

  const focusedWindow = windows.find(w => w.isFocused && w.workspaceId === activeWorkspaceId)
  const currentWs = workspaces.find(w => w.id === activeWorkspaceId)

  return (
    <div
      className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 z-50"
      style={{
        background: 'var(--moon-bg-surface)',
        backdropFilter: `blur(var(--moon-blur))`,
        borderBottom: '1px solid var(--moon-border)',
      }}
    >
      {/* Left: Logo + active app */}
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm">🌙</span>
        <span className="text-xs font-medium text-[var(--moon-text-primary)]">
          {focusedWindow?.title ?? 'MoonOS'}
        </span>
      </div>

      {/* Center: Workspace */}
      <div className="text-xs text-[var(--moon-text-muted)]">
        {currentWs?.name}
      </div>

      {/* Right: System tray */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <span className="text-xs" title={`Tier: ${activeTier}`}>{tierIcons[activeTier]}</span>
        <button
          className="text-xs text-[var(--moon-text-secondary)] hover:text-[var(--moon-text-primary)] transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <Clock />
      </div>
    </div>
  )
}
