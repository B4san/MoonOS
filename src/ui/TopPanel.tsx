import { useState, useEffect } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useNotifications } from '@/core/notifications'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 60_000); return () => clearInterval(id) }, [])
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
  const notifications = useNotifications(s => s.notifications)
  const clearAll = useNotifications(s => s.clearAll)
  const [showNotifs, setShowNotifs] = useState(false)

  const focusedWindow = windows.find(w => w.isFocused && w.workspaceId === activeWorkspaceId)
  const currentWs = workspaces.find(w => w.id === activeWorkspaceId)
  const unread = notifications.filter(n => !n.read).length

  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 z-50"
        style={{
          background: 'var(--moon-bg-surface)',
          backdropFilter: `blur(var(--moon-blur))`,
          borderBottom: '1px solid var(--moon-border)',
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm">🌙</span>
          <span className="text-xs font-medium text-[var(--moon-text-primary)]">
            {focusedWindow?.title ?? 'MoonOS'}
          </span>
        </div>
        <div className="text-xs text-[var(--moon-text-muted)]">{currentWs?.name}</div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-xs" title={`Tier: ${activeTier}`}>{tierIcons[activeTier]}</span>
          <button
            className="text-xs relative"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            🔔
            {unread > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--moon-danger)] rounded-full text-[8px] text-white flex items-center justify-center">{unread}</span>}
          </button>
          <button
            className="text-xs text-[var(--moon-text-secondary)] hover:text-[var(--moon-text-primary)] transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Clock />
        </div>
      </div>

      {/* Notification panel */}
      {showNotifs && (
        <div
          className="absolute top-9 right-4 w-72 max-h-80 z-[9996] rounded-xl overflow-hidden"
          style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--moon-border)]">
            <span className="text-xs font-medium text-[var(--moon-text-primary)]">Notifications</span>
            {notifications.length > 0 && <button onClick={clearAll} className="text-[10px] text-[var(--moon-text-muted)] hover:text-[var(--moon-accent)]">Clear all</button>}
          </div>
          <div className="overflow-y-auto max-h-64">
            {notifications.length === 0 && <p className="text-xs text-[var(--moon-text-muted)] text-center py-4">No notifications</p>}
            {notifications.slice(0, 20).map(n => (
              <div key={n.id} className="px-3 py-2 border-b border-[var(--moon-border)] last:border-0">
                <p className="text-xs text-[var(--moon-text-primary)]">{n.title}</p>
                <p className="text-[10px] text-[var(--moon-text-muted)]">{n.message}</p>
                <p className="text-[9px] text-[var(--moon-text-muted)] mt-0.5">{new Date(n.timestamp).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
