import { motion } from 'motion/react'

function MoonSvg() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none">
      <defs>
        <linearGradient id="welcome-moon-g" x1="10" y1="6" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id="welcome-glow" cx="0.3" cy="0.3" r="0.7">
          <stop stopColor="rgba(139,92,246,0.4)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="27" fill="url(#welcome-glow)" />
      <path d="M44 28.8A18 18 0 1 1 23.2 10 14 14 0 0 0 44 28.8z" fill="url(#welcome-moon-g)" />
    </svg>
  )
}

function KeyHint({ keys }: { keys: string }) {
  return (
    <kbd className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
      {keys}
    </kbd>
  )
}

const hints = [
  { keys: 'Ctrl + Space', label: 'Open Launcher' },
  { keys: 'Ctrl + K', label: 'Commands' },
  { keys: 'Ctrl + 1-4', label: 'Workspaces' },
]

export function WelcomeWindow({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Card */}
      <motion.div
        className="relative w-[400px] max-w-[88vw]"
        style={{
          background: 'rgba(15, 15, 30, 0.85)',
          backdropFilter: 'blur(40px) saturate(1.5)',
          borderRadius: '24px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          boxShadow: '0 0 80px rgba(99, 102, 241, 0.08), 0 32px 64px rgba(0,0,0,0.4)',
        }}
        initial={{ scale: 0.92, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-[20%] right-[20%] h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

        <div className="px-10 pt-12 pb-10 flex flex-col items-center text-center">
          {/* Moon icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
          >
            <MoonSvg />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mt-6 text-[1.75rem] font-extralight tracking-tight"
            style={{ color: 'rgba(255,255,255,0.95)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Welcome to <span className="font-normal" style={{ color: '#a78bfa' }}>MoonOS</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-2 text-[13px] font-light leading-relaxed max-w-[280px]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Your workspace adapts to your hardware. Explore, create, and make it yours.
          </motion.p>

          {/* Keyboard hints */}
          <motion.div
            className="mt-8 w-full space-y-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            {hints.map(h => (
              <div key={h.keys} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.label}</span>
                <KeyHint keys={h.keys} />
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            onClick={onClose}
            className="mt-9 w-full py-3 rounded-xl text-[13px] font-medium tracking-wide transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))',
              color: '#fff',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.2)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            Enter MoonOS
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
