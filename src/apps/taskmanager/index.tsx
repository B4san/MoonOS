import { useState, useEffect } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { useSettingsStore } from '@/stores/settings-store'

export function TaskManagerApp({ windowId: _self }: { windowId: string }) {
  const { windows, closeWindow, focusWindow } = useWindowStore()
  const activeTier = useSettingsStore(s => s.activeTier)
  const [memUsage, setMemUsage] = useState<number | null>(null)
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const interval = setInterval(() => {
      setUptime(Math.floor((performance.now() - start) / 1000))
      // Use performance.memory if available (Chrome only)
      const perf = performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
      if (perf.memory) {
        setMemUsage(Math.round(perf.memory.usedJSHeapSize / 1024 / 1024))
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-auto">
      {/* System Info */}
      <div className="grid grid-cols-3 gap-2">
        <InfoCard label="Windows" value={String(windows.length)} />
        <InfoCard label="Memory" value={memUsage ? `${memUsage}MB` : '—'} />
        <InfoCard label="Uptime" value={formatUptime(uptime)} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--moon-text-muted)]">Active Tier:</span>
        <span className="text-xs font-medium text-[var(--moon-accent)] capitalize">{activeTier}</span>
      </div>

      {/* Window list */}
      <div className="flex-1">
        <h3 className="text-xs font-medium text-[var(--moon-text-secondary)] mb-2">Running Windows</h3>
        <div className="space-y-1">
          {windows.length === 0 && <p className="text-xs text-[var(--moon-text-muted)]">No windows open</p>}
          {windows.map(w => (
            <div
              key={w.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--moon-bg-elevated)] group"
            >
              <span className={`w-2 h-2 rounded-full ${w.isMinimized ? 'bg-[var(--moon-warning)]' : w.isFocused ? 'bg-[var(--moon-success)]' : 'bg-[var(--moon-text-muted)]'}`} />
              <span className="flex-1 text-xs text-[var(--moon-text-primary)] truncate">{w.title}</span>
              <span className="text-[10px] text-[var(--moon-text-muted)]">{w.appId}</span>
              <button
                onClick={() => focusWindow(w.id)}
                className="text-[10px] text-[var(--moon-accent)] hover:underline opacity-0 group-hover:opacity-100"
              >
                Focus
              </button>
              <button
                onClick={() => closeWindow(w.id)}
                className="text-[10px] text-[var(--moon-danger)] hover:underline opacity-0 group-hover:opacity-100"
              >
                Kill
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-[var(--moon-bg-elevated)] text-center">
      <div className="text-sm font-semibold text-[var(--moon-text-primary)]">{value}</div>
      <div className="text-[10px] text-[var(--moon-text-muted)]">{label}</div>
    </div>
  )
}
