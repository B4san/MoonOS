import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import type { AccentColor } from '@/types'

const presets = [
  { name: 'Moonlight', accent: 'moonlight' as AccentColor, bg: '#050814', surface: 'rgba(20,30,60,0.8)' },
  { name: 'Nebula', accent: 'nebula' as AccentColor, bg: '#0f0520', surface: 'rgba(30,15,50,0.8)' },
  { name: 'Aurora', accent: 'aurora' as AccentColor, bg: '#051410', surface: 'rgba(15,40,30,0.8)' },
  { name: 'Solar', accent: 'solar' as AccentColor, bg: '#141005', surface: 'rgba(40,30,10,0.8)' },
  { name: 'Nordic', accent: 'moonlight' as AccentColor, bg: '#0d1117', surface: 'rgba(22,27,34,0.85)' },
]

export function ThemeEditorApp({ windowId: _ }: { windowId: string }) {
  const { accent, setAccent, activeTier, setTierOverride } = useSettingsStore()
  const [blur, setBlur] = useState(activeTier === 'quality' ? 20 : activeTier === 'balanced' ? 10 : 0)
  const [borderOpacity, setBorderOpacity] = useState(15)
  const [shadowIntensity, setShadowIntensity] = useState(40)

  const applyCustom = () => {
    const root = document.documentElement
    root.style.setProperty('--moon-blur', `${blur}px`)
    root.style.setProperty('--moon-border-opacity', String(borderOpacity / 100))
    root.style.setProperty('--moon-shadow', `0 8px 32px rgba(0,0,0,${shadowIntensity / 100}), 0 2px 8px rgba(0,0,0,${shadowIntensity / 200})`)
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setAccent(preset.accent)
    document.documentElement.style.setProperty('--moon-bg-primary', preset.bg)
    document.documentElement.style.setProperty('--moon-bg-surface', preset.surface)
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-auto">
      <h3 className="text-sm font-semibold text-[var(--moon-text-primary)]">Theme Editor</h3>

      {/* Presets */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] block mb-2">Presets</label>
        <div className="flex gap-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--moon-border)] hover:border-[var(--moon-accent)] text-[var(--moon-text-secondary)] transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] block mb-2">Accent Color</label>
        <div className="flex gap-3">
          {(['moonlight', 'nebula', 'aurora', 'solar'] as AccentColor[]).map(a => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${accent === a ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ background: a === 'moonlight' ? '#5b9cf6' : a === 'nebula' ? '#a855f7' : a === 'aurora' ? '#34d399' : '#fbbf24' }}
            />
          ))}
        </div>
      </div>

      {/* Blur */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] flex justify-between mb-1">
          <span>Blur</span><span>{blur}px</span>
        </label>
        <input type="range" min="0" max="30" value={blur} onChange={e => setBlur(+e.target.value)} className="w-full accent-[var(--moon-accent)]" />
      </div>

      {/* Border Opacity */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] flex justify-between mb-1">
          <span>Border Opacity</span><span>{borderOpacity}%</span>
        </label>
        <input type="range" min="0" max="50" value={borderOpacity} onChange={e => setBorderOpacity(+e.target.value)} className="w-full accent-[var(--moon-accent)]" />
      </div>

      {/* Shadow */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] flex justify-between mb-1">
          <span>Shadow Intensity</span><span>{shadowIntensity}%</span>
        </label>
        <input type="range" min="0" max="80" value={shadowIntensity} onChange={e => setShadowIntensity(+e.target.value)} className="w-full accent-[var(--moon-accent)]" />
      </div>

      <button onClick={applyCustom} className="px-4 py-2 text-xs rounded-lg bg-[var(--moon-accent)] text-white hover:opacity-90 self-start">Apply Changes</button>

      {/* Performance tier quick switch */}
      <div>
        <label className="text-xs text-[var(--moon-text-muted)] block mb-2">Quick Tier</label>
        <div className="flex gap-2">
          {(['quality', 'balanced', 'performance'] as const).map(t => (
            <button key={t} onClick={() => { setTierOverride(t); setBlur(t === 'quality' ? 20 : t === 'balanced' ? 10 : 0) }} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-secondary)] capitalize">{t}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
