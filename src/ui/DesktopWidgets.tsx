import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useWindowStore } from '@/stores/window-store'
import { useDockStore } from '@/stores/dock-store'

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])
  return (
    <div className="text-center">
      <div className="text-3xl font-light text-[var(--moon-text-primary)] tabular-nums">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xs text-[var(--moon-text-secondary)] mt-1 truncate">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

function SystemWidget() {
  const tier = useSettingsStore(s => s.activeTier)
  const windows = useWindowStore(s => s.windows)
  return (
    <div className="space-y-2 overflow-hidden">
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--moon-text-muted)] truncate">Windows</span>
        <span className="text-[var(--moon-text-primary)] shrink-0 ml-2">{windows.length}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--moon-text-muted)] truncate">Tier</span>
        <span className="text-[var(--moon-accent)] capitalize shrink-0 ml-2">{tier}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--moon-text-muted)] truncate">CPU</span>
        <span className="text-[var(--moon-text-primary)] shrink-0 ml-2">{navigator.hardwareConcurrency} cores</span>
      </div>
    </div>
  )
}

export function DesktopWidgets() {
  const dockPosition = useDockStore(s => s.position)
  const posClass = dockPosition === 'right' ? 'top-12 left-4' : dockPosition === 'left' ? 'top-12 right-4' : 'top-12 right-4'
  return (
    <div className={`absolute z-10 flex flex-col gap-3 w-52 ${posClass}`}>
      <WidgetCard><ClockWidget /></WidgetCard>
      <WidgetCard title="System"><SystemWidget /></WidgetCard>
    </div>
  )
}

function WidgetCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 overflow-hidden" style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)' }}>
      {title && <div className="text-[10px] text-[var(--moon-text-muted)] uppercase tracking-wider mb-2">{title}</div>}
      {children}
    </div>
  )
}
