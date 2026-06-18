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

interface BatteryManager {
  charging: boolean
  level: number
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

function useBatteryStatus() {
  const [battery, setBattery] = useState<{ charging: boolean; level: number } | null>(null)
  useEffect(() => {
    if (!('getBattery' in navigator)) return
    let active = true
    let bm: BatteryManager | null = null
    
    const update = () => {
      if (active && bm) {
        setBattery({ charging: bm.charging, level: bm.level })
      }
    }

    const nav = navigator as unknown as { getBattery?: () => Promise<BatteryManager> }
    nav.getBattery?.().then((b) => {
      if (!active) return
      bm = b
      update()
      bm.addEventListener('chargingchange', update)
      bm.addEventListener('levelchange', update)
    })

    return () => {
      active = false
      if (bm) {
        bm.removeEventListener('chargingchange', update)
        bm.removeEventListener('levelchange', update)
      }
    }
  }, [])
  return battery
}

function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return online
}

function BatteryMeter() {
  const battery = useBatteryStatus()
  if (!battery) return null
  const pct = Math.round(battery.level * 100)
  return (
    <div className="flex items-center gap-1.5" title={`Battery: ${pct}% ${battery.charging ? '(Charging)' : ''}`}>
      <span className="text-[10px] opacity-75">{pct}%</span>
      <div className="w-5.5 h-3 border border-[var(--moon-text-secondary)] rounded-sm p-0.5 flex items-center relative opacity-80">
        <div className="h-full bg-[var(--moon-text-secondary)] rounded-2xs" style={{ width: `${pct}%` }} />
        <div className="absolute right-[-2.5px] top-[3px] w-[2px] h-[4px] bg-[var(--moon-text-secondary)] rounded-r-2xs" />
        {battery.charging && (
          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-[var(--moon-text-primary)] font-black">⚡</span>
        )}
      </div>
    </div>
  )
}

function NetworkMeter() {
  const online = useNetworkStatus()
  return (
    <span title={online ? 'Online' : 'Offline'} className="flex items-center opacity-85">
      {online ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--moon-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l5 5L20 6" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--moon-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </span>
  )
}

export function TopPanel() {
  const windows = useWindowStore(s => s.windows)
  const activeWorkspaceId = useWindowStore(s => s.activeWorkspaceId)
  const workspaces = useWindowStore(s => s.workspaces)
  const { activeTier, theme, setTheme, focusMode } = useSettingsStore()
  const { openWindow } = useWindowStore()
  const notifications = useNotifications(s => s.notifications)
  const { clearAll, dismiss, markRead } = useNotifications.getState()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showLogoMenu, setShowLogoMenu] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'all' | 'info' | 'success' | 'alert'>('all')

  const focusedWindow = windows.find(w => w.isFocused && w.workspaceId === activeWorkspaceId)
  const currentWs = workspaces.find(w => w.id === activeWorkspaceId)
  const unread = notifications.filter(n => !n.read).length

  const handleLogoOption = (opt: string) => {
    setShowLogoMenu(false)
    if (opt === 'about') {
      openWindow('settings', 'About MoonOS')
    } else if (opt === 'settings') {
      openWindow('settings', 'Settings')
    } else if (opt === 'lock') {
      localStorage.setItem('moonos-locked', 'true')
      window.dispatchEvent(new Event('moonos-lock-event'))
    } else if (opt === 'restart') {
      window.location.reload()
    }
  }

  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'all') return true
    if (notifFilter === 'info') return n.type === 'info'
    if (notifFilter === 'success') return n.type === 'success'
    return n.type === 'warning' || n.type === 'error'
  })

  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 z-50 select-none"
        style={{
          background: 'var(--moon-bg-surface)',
          backdropFilter: `blur(var(--moon-blur))`,
          borderBottom: '1px solid var(--moon-border)',
          transform: focusMode ? 'translateY(-100%)' : 'translateY(0)',
          transition: focusMode
            ? 'transform 1s cubic-bezier(0.25, 0.8, 0.25, 1)'
            : 'transform 5s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <button 
            className="flex items-center gap-1.5 p-1 rounded hover:bg-[var(--moon-bg-elevated)] transition-colors active:scale-95 cursor-pointer"
            onClick={() => { setShowLogoMenu(!showLogoMenu); setShowNotifs(false) }}
          >
            <MoonLogo />
          </button>
          <span className="text-xs font-semibold text-[var(--moon-text-primary)] truncate min-w-0">
            {focusedWindow?.title ?? 'MoonOS'}
          </span>
        </div>
        <div className="text-xs text-[var(--moon-text-secondary)] shrink-0 font-medium">{currentWs?.name}</div>
        <div className="flex items-center gap-3.5 flex-1 justify-end">
          <NetworkMeter />
          <BatteryMeter />
          <span className="w-px h-3 bg-[var(--moon-border)]" />
          <span title={`Tier: ${activeTier}`} className="cursor-default"><TierIcon tier={activeTier} /></span>
          <button
            className="relative flex items-center p-1 hover:bg-[var(--moon-bg-elevated)] rounded-md transition-colors cursor-pointer"
            onClick={() => { setShowNotifs(!showNotifs); setShowLogoMenu(false) }}
            aria-label="Notifications"
          >
            <BellIcon />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--moon-danger)] rounded-full text-[9px] text-white flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
          </button>
          <button
            className="flex items-center p-1 text-[var(--moon-text-secondary)] hover:text-[var(--moon-text-primary)] hover:bg-[var(--moon-bg-elevated)] rounded-md transition-colors cursor-pointer"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <ThemeIcon isDark={theme === 'dark'} />
          </button>
          <Clock />
        </div>
      </div>

      {/* Logo options menu */}
      {showLogoMenu && (
        <div
          className="absolute top-9 left-4 w-44 z-[9996] rounded-xl overflow-hidden p-1 flex flex-col gap-0.5"
          style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
        >
          <button onClick={() => handleLogoOption('about')} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[var(--moon-text-primary)] hover:bg-[var(--moon-accent-muted)] transition-colors">
             About MoonOS
          </button>
          <button onClick={() => handleLogoOption('settings')} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[var(--moon-text-primary)] hover:bg-[var(--moon-accent-muted)] transition-colors">
            ⚙️ System Settings...
          </button>
          <span className="h-px bg-[var(--moon-border)] my-0.5" />
          <button onClick={() => handleLogoOption('lock')} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[var(--moon-text-primary)] hover:bg-[var(--moon-accent-muted)] transition-colors">
            🔒 Lock Screen
          </button>
          <button onClick={() => handleLogoOption('restart')} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[var(--moon-danger)] hover:bg-[var(--moon-danger)]/15 transition-colors">
            🔄 Restart system
          </button>
        </div>
      )}

      {/* Notification panel */}
      {showNotifs && (
        <div
          className="absolute top-9 right-4 w-80 max-h-[400px] z-[9996] rounded-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--moon-border)] shrink-0">
            <span className="text-xs font-semibold text-[var(--moon-text-primary)]">Notifications</span>
            {notifications.length > 0 && <button onClick={clearAll} className="text-[10px] text-[var(--moon-text-muted)] hover:text-[var(--moon-accent)] font-medium">Clear all</button>}
          </div>

          {/* Grouping Filters */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--moon-border)] bg-[var(--moon-bg-elevated)]/30 shrink-0">
            {(['all', 'info', 'success', 'alert'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setNotifFilter(f)}
                className={`px-2 py-0.5 rounded text-[9px] capitalize transition-colors ${notifFilter === f ? 'bg-[var(--moon-accent)] text-white font-medium' : 'text-[var(--moon-text-secondary)] hover:bg-[var(--moon-bg-elevated)]'}`}
              >
                {f === 'alert' ? 'alerts' : f}
              </button>
            ))}
          </div>

          {/* List content */}
          <div className="overflow-y-auto max-h-72 flex-1">
            {filteredNotifs.length === 0 && <p className="text-xs text-[var(--moon-text-muted)] text-center py-6">No notifications</p>}
            {filteredNotifs.map(n => (
              <div key={n.id} className={`group flex items-start gap-2.5 px-3 py-2 border-b border-[var(--moon-border)] last:border-0 hover:bg-[var(--moon-bg-elevated)]/25 transition-colors ${!n.read ? 'border-l-2 border-l-[var(--moon-accent)]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-xs font-medium text-[var(--moon-text-primary)] truncate">{n.title}</p>
                    <span className="text-[8px] text-[var(--moon-text-muted)] shrink-0">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-[var(--moon-text-secondary)] opacity-85 leading-normal mt-0.5">{n.message}</p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.read && (
                    <button 
                      onClick={() => markRead(n.id)} 
                      className="p-1 rounded hover:bg-[var(--moon-success)]/20 text-[var(--moon-success)] cursor-pointer font-bold text-xs"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    onClick={() => dismiss(n.id)} 
                    className="p-1 rounded hover:bg-[var(--moon-danger)]/20 text-[var(--moon-danger)] cursor-pointer font-bold text-xs"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
