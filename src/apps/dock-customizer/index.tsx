import { useDockStore } from '@/stores/dock-store'

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--moon-text-secondary)] w-24 shrink-0">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} className="flex-1 h-1 accent-[var(--moon-accent)]" />
      <span className="text-xs text-[var(--moon-text-muted)] w-8 text-right">{value}</span>
    </label>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-xs text-[var(--moon-text-secondary)]">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-8 h-4 rounded-full transition-colors ${value ? 'bg-[var(--moon-accent)]' : 'bg-[var(--moon-bg-elevated)]'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform mx-0.5 ${value ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  )
}

export function DockCustomizerApp() {
  const store = useDockStore()

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">Dock Appearance</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--moon-text-secondary)]">Position</span>
          <div className="flex gap-1">
            {(['bottom', 'top', 'left', 'right'] as const).map(p => (
              <button key={p} onClick={() => store.setPosition(p)} className={`px-2 py-0.5 text-xs rounded ${store.position === p ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-muted)]'}`}>{p}</button>
            ))}
          </div>
        </div>

        <Slider label="Icon Size" value={store.size} min={28} max={64} onChange={store.setSize} />
        <Slider label="Gap" value={store.gap} min={0} max={12} onChange={store.setGap} />
        <Slider label="Border Radius" value={store.borderRadius} min={0} max={32} onChange={store.setBorderRadius} />
        <Slider label="Blur" value={store.blur} min={0} max={40} onChange={store.setBlur} />
        <Slider label="Opacity" value={store.opacity} min={0} max={100} onChange={store.setOpacity} />
        <Slider label="Border Width" value={store.borderWidth} min={0} max={4} onChange={store.setBorderWidth} />
      </div>

      <h3 className="text-sm font-medium text-[var(--moon-text-primary)] pt-2">Colors</h3>
      <div className="space-y-2">
        <label className="flex items-center justify-between">
          <span className="text-xs text-[var(--moon-text-secondary)]">Background</span>
          <input type="color" value={store.bgColor.startsWith('#') ? store.bgColor : '#141e3c'} onChange={e => store.setBgColor(e.target.value + 'cc')} className="w-6 h-6 rounded border-0 cursor-pointer" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-xs text-[var(--moon-text-secondary)]">Border</span>
          <input type="color" value={store.borderColor.startsWith('#') ? store.borderColor : '#648cdc'} onChange={e => store.setBorderColor(e.target.value + '26')} className="w-6 h-6 rounded border-0 cursor-pointer" />
        </label>
      </div>

      <h3 className="text-sm font-medium text-[var(--moon-text-primary)] pt-2">Effects</h3>
      <div className="space-y-3">
        <Toggle label="Glassmorphism" value={store.glassmorphism} onChange={store.setGlassmorphism} />
        <Toggle label="Shadow" value={store.shadow} onChange={store.setShadow} />
        <Toggle label="Auto Hide" value={store.autoHide} onChange={store.setAutoHide} />
        <Toggle label="Magnification" value={store.magnification} onChange={store.setMagnification} />
      </div>

      <button onClick={store.reset} className="w-full mt-4 py-1.5 text-xs rounded-lg bg-[var(--moon-danger)]/15 text-[var(--moon-danger)] hover:bg-[var(--moon-danger)]/25 transition-colors">
        Reset to Defaults
      </button>
    </div>
  )
}

