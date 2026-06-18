import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useWindowStore } from '@/stores/window-store'
import { persistence } from '@/core/persistence'
import type { AccentColor, DesktopLayout, HardwareTier, ThemeMode } from '@/types'

const sections = ['Appearance', 'Desktop', 'Audio', 'Focus', 'Performance', 'Workspaces', 'Data'] as const
type Section = typeof sections[number]

const accents: { id: AccentColor; label: string; color: string }[] = [
  { id: 'moonlight', label: 'Moonlight', color: '#5b9cf6' },
  { id: 'nebula', label: 'Nebula', color: '#a855f7' },
  { id: 'aurora', label: 'Aurora', color: '#34d399' },
  { id: 'solar', label: 'Solar', color: '#fbbf24' },
]

export function SettingsApp() {
  const [section, setSection] = useState<Section>('Appearance')
  const {
    theme, accent, activeTier, tierOverride, workspaceName, desktopLayout,
    audioVolume, soundscapesEnabled, soundscapeActive, uiSoundsEnabled, terminalClicksEnabled,
    focusMode, focusDuration, focusBreakDuration, focusTimerActive,
    setTheme, setAccent, setTierOverride, setWorkspaceName, setDesktopLayout,
    setAudioVolume, setSoundscapesEnabled, setSoundscapeActive, setUiSoundsEnabled, setTerminalClicksEnabled,
    toggleFocusMode, setFocusDuration, setFocusBreakDuration
  } = useSettingsStore()
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

        {section === 'Desktop' && (
          <>
            <SettingGroup title="Icon Layout" description="How desktop icons are positioned">
              <div className="flex gap-3">
                {([
                  { id: 'free' as DesktopLayout, label: 'Free', desc: 'Move icons anywhere freely' },
                  { id: 'grid' as DesktopLayout, label: 'Grid Snap', desc: 'Icons snap to a grid like Windows' },
                ] ).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setDesktopLayout(opt.id)}
                    className={`flex-1 p-3 rounded-xl text-left border transition-all ${desktopLayout === opt.id ? 'border-[var(--moon-accent)] bg-[var(--moon-accent-muted)]' : 'border-[var(--moon-border)] bg-[var(--moon-bg-elevated)] hover:border-[var(--moon-text-muted)]'}`}
                  >
                    <div className="text-xs font-medium text-[var(--moon-text-primary)]">{opt.label}</div>
                    <div className="text-[10px] text-[var(--moon-text-muted)] mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </SettingGroup>
          </>
        )}

        {section === 'Audio' && (
          <>
            <SettingGroup title="Master Volume" description="Set the system audio output volume">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioVolume ?? 50}
                  onChange={e => setAudioVolume(Number(e.target.value))}
                  className="w-48 accent-[var(--moon-accent)]"
                />
                <span className="text-xs text-[var(--moon-text-primary)] w-8">{audioVolume ?? 50}%</span>
              </div>
            </SettingGroup>

            <SettingGroup title="Soundscapes" description="Continuous procedural ambient soundscapes for deep focus">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="soundscapesEnabled"
                    checked={soundscapesEnabled ?? true}
                    onChange={e => setSoundscapesEnabled(e.target.checked)}
                    className="accent-[var(--moon-accent)] cursor-pointer"
                  />
                  <label htmlFor="soundscapesEnabled" className="text-xs text-[var(--moon-text-primary)] cursor-pointer">Enable Ambient Soundscapes</label>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {[
                    { id: 'none', label: 'None (Silence)' },
                    { id: 'deep-space', label: '🪐 Deep Space' },
                    { id: 'rain-studio', label: '🌧️ Rain Studio' },
                    { id: 'digital-garden', label: '🌱 Digital Garden' },
                    { id: 'white-noise', label: '🌫️ White Noise' },
                    { id: 'lunar-tide', label: '🌊 Lunar Tide' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSoundscapeActive(s.id as 'none' | 'deep-space' | 'rain-studio' | 'digital-garden' | 'white-noise' | 'lunar-tide')}
                      disabled={!(soundscapesEnabled ?? true)}
                      className={`px-3 py-2 rounded-lg text-left text-xs transition-colors flex flex-col ${
                        soundscapeActive === s.id && (soundscapesEnabled ?? true)
                          ? 'bg-[var(--moon-accent-muted)] text-[var(--moon-accent)] border border-[var(--moon-accent)]'
                          : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)] border border-transparent hover:bg-[var(--moon-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </SettingGroup>

            <SettingGroup title="Tactile Sound Feedback" description="Low-latency sounds for window and workspace interactions">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uiSoundsEnabled"
                  checked={uiSoundsEnabled ?? true}
                  onChange={e => setUiSoundsEnabled(e.target.checked)}
                  className="accent-[var(--moon-accent)] cursor-pointer"
                />
                <label htmlFor="uiSoundsEnabled" className="text-xs text-[var(--moon-text-primary)] cursor-pointer">Enable UI Sound Effects</label>
              </div>
            </SettingGroup>

            <SettingGroup title="Terminal Keystroke Feedback" description="Procedural keyboard clicks when typing inside the terminal">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terminalClicksEnabled"
                  checked={terminalClicksEnabled ?? true}
                  onChange={e => setTerminalClicksEnabled(e.target.checked)}
                  className="accent-[var(--moon-accent)] cursor-pointer"
                />
                <label htmlFor="terminalClicksEnabled" className="text-xs text-[var(--moon-text-primary)] cursor-pointer">Enable Mechanical Typing Clicks</label>
              </div>
            </SettingGroup>
          </>
        )}

        {section === 'Focus' && (
          <>
            <SettingGroup title="Focus Mode" description="Deep focus session settings with auto-hidden bars and ambient shading">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFocusMode}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    focusMode ? 'bg-[var(--moon-danger)] text-white hover:opacity-90' : 'bg-[var(--moon-accent)] text-white hover:opacity-90'
                  }`}
                >
                  {focusMode ? 'Stop Focus Session' : 'Start Focus Session'}
                </button>
                {focusTimerActive && (
                  <span className="text-xs text-[var(--moon-text-secondary)] animate-pulse">
                    Timer is currently running
                  </span>
                )}
              </div>
            </SettingGroup>

            <SettingGroup title="Focus Duration" description="Length of focus intervals (minutes)">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={focusDuration ?? 25}
                  onChange={e => setFocusDuration(Number(e.target.value))}
                  disabled={focusMode}
                  className="w-48 accent-[var(--moon-accent)] disabled:opacity-50"
                />
                <span className="text-xs text-[var(--moon-text-primary)] w-8">{focusDuration ?? 25}m</span>
              </div>
            </SettingGroup>

            <SettingGroup title="Break Duration" description="Length of break intervals (minutes)">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={focusBreakDuration ?? 5}
                  onChange={e => setFocusBreakDuration(Number(e.target.value))}
                  disabled={focusMode}
                  className="w-48 accent-[var(--moon-accent)] disabled:opacity-50"
                />
                <span className="text-xs text-[var(--moon-text-primary)] w-8">{focusBreakDuration ?? 5}m</span>
              </div>
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
