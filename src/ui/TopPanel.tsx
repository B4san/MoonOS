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

function MoonLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="url(#moon-logo-g)" />
      <defs>
        <linearGradient id="moon-logo-g" x1="8" y1="3" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function TierIcon({ tier }: { tier: string }) {
  if (tier === 'quality') return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8L8 14l-6-4.8h7.6z" fill="url(#tier-q-g)" />
      <defs><linearGradient id="tier-q-g" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" /></linearGradient></defs>
    </svg>
  )
  if (tier === 'balanced') return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#tier-b-g)" />
      <defs><linearGradient id="tier-b-g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa" /><stop offset="1" stopColor="#3b82f6" /></linearGradient></defs>
    </svg>
  )
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="12" height="18" rx="3" stroke="url(#tier-p-g)" strokeWidth="2" fill="none" />
      <rect x="8" y="12" width="8" height="8" rx="1" fill="url(#tier-p-g)" />
      <defs><linearGradient id="tier-p-g" x1="6" y1="4" x2="18" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#4ade80" /><stop offset="1" stopColor="#22c55e" /></linearGradient></defs>
    </svg>
  )
}

function BellIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" fill="url(#bell-g)" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="var(--moon-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="bell-g" x1="3" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ThemeIcon({ isDark, size = 14 }: { isDark: boolean; size?: number }) {
  if (isDark) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="url(#sun-g)" />
      <g stroke="url(#sun-g)" strokeWidth="2" strokeLinecap="round">
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </g>
      <defs><linearGradient id="sun-g" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="url(#moon-g)" />
      <defs><linearGradient id="moon-g" x1="8" y1="3" x2="21" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa" /><stop offset="1" stopColor="#6366f1" /></linearGradient></defs>
    </svg>
  )
}

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
          <MoonLogo />
          <span className="text-xs font-medium text-[var(--moon-text-primary)]">
            {focusedWindow?.title ?? 'MoonOS'}
          </span>
        </div>
        <div className="text-xs text-[var(--moon-text-muted)]">{currentWs?.name}</div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span title={`Tier: ${activeTier}`}><TierIcon tier={activeTier} /></span>
          <button
            className="relative flex items-center"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            <BellIcon />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--moon-danger)] rounded-full text-[8px] text-white flex items-center justify-center">{unread}</span>}
          </button>
          <button
            className="flex items-center text-[var(--moon-text-secondary)] hover:text-[var(--moon-text-primary)] transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <ThemeIcon isDark={theme === 'dark'} />
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
