import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useWindowStore } from '@/stores/window-store'
import { persistence } from '@/core/persistence'
import type { AccentColor, HardwareTier, ThemeMode } from '@/types'

const sections = ['Appearance', 'Performance', 'Workspaces', 'Data'] as const
type Section = typeof sections[number]

const accents: { id: AccentColor; label: string; color: string }[] = [
  { id: 'moonlight', label: 'Moonlight', color: '#5b9cf6' },
  { id: 'nebula', label: 'Nebula', color: '#a855f7' },
  { id: 'aurora', label: 'Aurora', color: '#34d399' },
  { id: 'solar', label: 'Solar', color: '#fbbf24' },
]

export function SettingsApp({ windowId: _ }: { windowId: string }) {
  const [section, setSection] = useState<Section>('Appearance')
  const { theme, accent, activeTier, tierOverride, workspaceName, setTheme, setAccent, setTierOverride, setWorkspaceName } = useSettingsStore()
  const { workspaces, addWorkspace, removeWorkspace } = useWindowStore()

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-40 border-r border-[var(--moon-border)] p-2 space-y-1 shrink-0">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${section === s ? 'bg-[var(--moon-accent-muted)] text-[var(--moon-accent)]' : 'text-[var(--moon-text-secondary)] hover:bg-[var(--moon-bg-elevated)]'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto space-y-6">
        {section === 'Appearance' && (
          <>
            <SettingGroup title="Theme">
              <div className="flex gap-2">
                {(['dark', 'light', 'auto'] as ThemeMode[]).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-4 py-2 rounded-lg text-xs capitalize ${theme === t ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)] hover:bg-[var(--moon-bg-tertiary)]'}`}>{t}</button>
                ))}
              </div>
            </SettingGroup>
            <SettingGroup title="Accent Color">
              <div className="flex gap-3">
                {accents.map(a => (
                  <button key={a.id} onClick={() => setAccent(a.id)} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${accent === a.id ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} style={{ background: a.color }} title={a.label} />
                ))}
              </div>
            </SettingGroup>
            <SettingGroup title="Workspace Name">
              <input
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--moon-bg-elevated)] text-[var(--moon-text-primary)] text-xs outline-none border border-[var(--moon-border)] focus:border-[var(--moon-accent)] w-48"
              />
            </SettingGroup>
          </>
        )}

        {section === 'Performance' && (
          <>
            <SettingGroup title="Hardware Tier" description={`Current active: ${activeTier}`}>
              <div className="flex gap-2">
                {(['auto', 'quality', 'balanced', 'performance'] as (HardwareTier | 'auto')[]).map(t => (
                  <button key={t} onClick={() => setTierOverride(t)} className={`px-4 py-2 rounded-lg text-xs capitalize ${tierOverride === t ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)] hover:bg-[var(--moon-bg-tertiary)]'}`}>
                    {t === 'quality' && '🚀 '}{t === 'balanced' && '⚡ '}{t === 'performance' && '🔋 '}{t === 'auto' && '🔄 '}{t}
                  </button>
                ))}
              </div>
            </SettingGroup>
            <SettingGroup title="Tier Effects">
              <div className="text-xs text-[var(--moon-text-muted)] space-y-1">
                <p>🚀 Quality: Full blur, glassmorphism, 500 particles, rich shadows</p>
                <p>⚡ Balanced: Moderate blur, 200 particles, simple shadows</p>
                <p>🔋 Performance: No effects, minimal rendering, max battery life</p>
              </div>
            </SettingGroup>
          </>
        )}

        {section === 'Workspaces' && (
          <>
            <SettingGroup title="Virtual Workspaces">
              <div className="space-y-2">
                {workspaces.map(ws => (
                  <div key={ws.id} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--moon-text-primary)] flex-1">{ws.name}</span>
                    {workspaces.length > 1 && (
                      <button onClick={() => removeWorkspace(ws.id)} className="text-xs text-[var(--moon-text-muted)] hover:text-[var(--moon-danger)]">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={() => addWorkspace(`Desktop ${workspaces.length + 1}`)} className="text-xs text-[var(--moon-accent)] hover:underline">+ Add Workspace</button>
              </div>
            </SettingGroup>
          </>
        )}

        {section === 'Data' && (
          <>
            <SettingGroup title="Export Settings" description="Download all your preferences as JSON">
              <button
                onClick={() => {
                  const data = persistence.exportAll()
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'moonos-settings.json'; a.click()
                  URL.revokeObjectURL(url)
                }}
                className="px-4 py-2 rounded-lg text-xs bg-[var(--moon-accent)] text-white hover:opacity-90"
              >
                Export JSON
              </button>
            </SettingGroup>
            <SettingGroup title="Reset" description="Clear all data and start fresh">
              <button
                onClick={() => { localStorage.clear(); window.location.reload() }}
                className="px-4 py-2 rounded-lg text-xs bg-[var(--moon-danger)] text-white hover:opacity-90"
              >
                Reset Everything
              </button>
            </SettingGroup>
          </>
        )}
      </div>
    </div>
  )
}

function SettingGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">{title}</h3>
        {description && <p className="text-xs text-[var(--moon-text-muted)]">{description}</p>}
      </div>
      {children}
    </div>
  )
}
