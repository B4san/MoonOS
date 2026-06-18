import { useRef } from 'react'
import { useBackgroundStore } from '@/stores/background-store'

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--moon-text-secondary)] w-24 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={e => onChange(+e.target.value)} className="flex-1 h-1 accent-[var(--moon-accent)]" />
      <span className="text-xs text-[var(--moon-text-muted)] w-8 text-right">{value}</span>
    </label>
  )
}

export function BackgroundCustomizerApp() {
  const store = useBackgroundStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      store.setImageUrl(url)
      store.setType('image')
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h3 className="text-sm font-medium text-[var(--moon-text-primary)]">Background Type</h3>
      <div className="flex gap-1">
        {(['solid', 'gradient', 'image'] as const).map(t => (
          <button key={t} onClick={() => store.setType(t)} className={`px-3 py-1 text-xs rounded-lg capitalize ${store.type === t ? 'bg-[var(--moon-accent)] text-white' : 'bg-[var(--moon-bg-elevated)] text-[var(--moon-text-muted)]'}`}>{t}</button>
        ))}
      </div>

      {store.type === 'solid' && (
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-xs text-[var(--moon-text-secondary)]">Color</span>
            <input type="color" value={store.solidColor} onChange={e => store.setSolidColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
          </label>
        </div>
      )}

      {store.type === 'gradient' && (
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-xs text-[var(--moon-text-secondary)]">From</span>
            <input type="color" value={store.gradientFrom} onChange={e => store.setGradientFrom(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-xs text-[var(--moon-text-secondary)]">To</span>
            <input type="color" value={store.gradientTo} onChange={e => store.setGradientTo(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
          </label>
          <Slider label="Angle" value={store.gradientAngle} min={0} max={360} onChange={store.setGradientAngle} />
        </div>
      )}

      {store.type === 'image' && (
        <div className="space-y-3">
          <button onClick={() => fileRef.current?.click()} className="w-full py-2 text-xs rounded-lg bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)] hover:bg-[var(--moon-accent-muted)] transition-colors">
            Choose Image
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          {store.imageUrl && <img src={store.imageUrl} className="w-full h-20 object-cover rounded-lg opacity-70" />}
          <Slider label="Blur" value={store.imageBlur} min={0} max={20} onChange={store.setImageBlur} />
          <Slider label="Brightness" value={store.imageBrightness} min={20} max={150} onChange={store.setImageBrightness} />
        </div>
      )}

      <h3 className="text-sm font-medium text-[var(--moon-text-primary)] pt-2">Effects</h3>
      <label className="flex items-center justify-between">
        <span className="text-xs text-[var(--moon-text-secondary)]">Particles</span>
        <button onClick={() => store.setParticles(!store.particles)} className={`w-8 h-4 rounded-full transition-colors ${store.particles ? 'bg-[var(--moon-accent)]' : 'bg-[var(--moon-bg-elevated)]'}`}>
          <div className={`w-3 h-3 rounded-full bg-white transition-transform mx-0.5 ${store.particles ? 'translate-x-4' : ''}`} />
        </button>
      </label>

      <button onClick={store.reset} className="w-full mt-4 py-1.5 text-xs rounded-lg bg-[var(--moon-danger)]/15 text-[var(--moon-danger)] hover:bg-[var(--moon-danger)]/25 transition-colors">
        Reset to Defaults
      </button>
    </div>
  )
}
