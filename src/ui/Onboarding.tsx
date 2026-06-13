import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSettingsStore } from '@/stores/settings-store'
import { detectHardware, computeScore, scoreToTier } from '@/core/hardware-detector'
import type { AccentColor, HardwareDetails, HardwareTier } from '@/types'

const accents: { id: AccentColor; label: string; color: string }[] = [
  { id: 'moonlight', label: 'Moonlight', color: '#5b9cf6' },
  { id: 'nebula', label: 'Nebula', color: '#a855f7' },
  { id: 'aurora', label: 'Aurora', color: '#34d399' },
  { id: 'solar', label: 'Solar', color: '#fbbf24' },
]

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [hwDetails, setHwDetails] = useState<HardwareDetails | null>(null)
  const [tier, setTier] = useState<HardwareTier>('balanced')
  const { setWorkspaceName, setTheme, setAccent, setActiveTier, markInitialized, accent, theme } = useSettingsStore()

  useEffect(() => {
    detectHardware().then(d => {
      setHwDetails(d)
      const score = computeScore(d)
      setTier(scoreToTier(score))
    })
  }, [])

  const finish = () => {
    setWorkspaceName(name || 'My Workspace')
    setActiveTier(tier)
    markInitialized()
    onComplete()
  }

  const steps = [
    // Step 0: Welcome + HW detection
    <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-6 text-center">
      <span className="text-6xl">🌙</span>
      <h1 className="text-3xl font-semibold text-[var(--moon-text-primary)]">Welcome to MoonOS</h1>
      <p className="text-sm text-[var(--moon-text-secondary)] max-w-md">Your personal workspace, adapted to your hardware.</p>
      {hwDetails && (
        <div className="text-xs text-[var(--moon-text-muted)] space-y-1">
          <p>CPU: {hwDetails.cpuCores} cores • RAM: {hwDetails.ram ?? '?'}GB • GPU: {hwDetails.gpuTier}</p>
          <p className="text-[var(--moon-accent)]">Detected tier: {tier}</p>
        </div>
      )}
      <button onClick={() => setStep(1)} className="px-6 py-2 rounded-lg bg-[var(--moon-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">Continue</button>
    </motion.div>,

    // Step 1: Name
    <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--moon-text-primary)]">Name your workspace</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="My Workspace"
        className="w-64 px-4 py-2 rounded-lg bg-[var(--moon-bg-elevated)] text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-muted)] outline-none border border-[var(--moon-border)] focus:border-[var(--moon-accent)] text-sm text-center"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && setStep(2)}
      />
      <button onClick={() => setStep(2)} className="px-6 py-2 rounded-lg bg-[var(--moon-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">Next</button>
    </motion.div>,

    // Step 2: Theme + Accent
    <motion.div key="theme" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--moon-text-primary)]">Choose your style</h2>
      <div className="flex gap-3">
        <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-lg text-sm border ${theme === 'dark' ? 'border-[var(--moon-accent)] bg-[var(--moon-accent-muted)]' : 'border-[var(--moon-border)]'} text-[var(--moon-text-primary)]`}>🌙 Dark</button>
        <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-lg text-sm border ${theme === 'light' ? 'border-[var(--moon-accent)] bg-[var(--moon-accent-muted)]' : 'border-[var(--moon-border)]'} text-[var(--moon-text-primary)]`}>☀️ Light</button>
      </div>
      <div className="flex gap-3">
        {accents.map(a => (
          <button key={a.id} onClick={() => setAccent(a.id)} className={`w-8 h-8 rounded-full border-2 ${accent === a.id ? 'border-white scale-110' : 'border-transparent'} transition-all`} style={{ background: a.color }} title={a.label} />
        ))}
      </div>
      <button onClick={() => setStep(3)} className="px-6 py-2 rounded-lg bg-[var(--moon-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">Next</button>
    </motion.div>,

    // Step 3: Ready
    <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-6 text-center">
      <span className="text-5xl">✨</span>
      <h2 className="text-2xl font-semibold text-[var(--moon-text-primary)]">You're all set</h2>
      <p className="text-sm text-[var(--moon-text-secondary)]">
        <b>Ctrl+Space</b> to launch apps • <b>Ctrl+K</b> for commands • <b>Ctrl+1-4</b> for workspaces
      </p>
      <button onClick={finish} className="px-8 py-3 rounded-lg bg-[var(--moon-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">Launch MoonOS</button>
    </motion.div>,
  ]

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #202840, #050814)' }}>
      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      <button onClick={finish} className="absolute top-4 right-4 text-xs text-[var(--moon-text-muted)] hover:text-[var(--moon-text-secondary)]">Skip →</button>
    </div>
  )
}
