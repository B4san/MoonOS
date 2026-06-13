import { useSettingsStore } from '@/stores/settings-store'
import type { AccentColor } from '@/types'

const accents: AccentColor[] = ['moonlight', 'nebula', 'aurora', 'solar']

export function SettingsApp({ windowId: _ }: { windowId: string }) {
  const { theme, accent, activeTier, tierOverride, setTheme, setAccent, setTierOverride } = useSettingsStore()
  return (
    <div className="h-full p-4 space-y-4 overflow-auto">
      <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">Theme</h3>
      <div className="flex gap-2">
        {(['dark', 'light'] as const).map(t => (
          <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1 rounded text-xs ${theme === t ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)]'}`}>{t}</button>
        ))}
      </div>
      <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">Accent</h3>
      <div className="flex gap-2">
        {accents.map(a => (
          <button key={a} onClick={() => setAccent(a)} className={`px-3 py-1 rounded text-xs ${accent === a ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)]'}`}>{a}</button>
        ))}
      </div>
      <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">Performance Tier</h3>
      <p className="text-xs text-[var(--moon-text-muted)]">Current: {activeTier}</p>
      <div className="flex gap-2">
        {(['auto', 'quality', 'balanced', 'performance'] as const).map(t => (
          <button key={t} onClick={() => setTierOverride(t)} className={`px-3 py-1 rounded text-xs ${tierOverride === t ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)]'}`}>{t}</button>
        ))}
      </div>
    </div>
  )
}
