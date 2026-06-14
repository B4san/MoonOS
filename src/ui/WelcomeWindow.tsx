import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const features = [
  { icon: '🪟', title: 'Window Manager', desc: 'Drag, resize, snap to edges. Double-click titlebar to maximize.' },
  { icon: '🔍', title: 'Launcher', desc: 'Press Ctrl+Space to search and open any app instantly.' },
  { icon: '⌨️', title: 'Command Palette', desc: 'Ctrl+K for quick system commands and actions.' },
  { icon: '🖥️', title: 'Workspaces', desc: 'Ctrl+1-4 to switch between virtual desktops.' },
  { icon: '🎨', title: 'Themes', desc: 'Personalize colors, accents, and wallpapers in Settings.' },
]

export function WelcomeWindow({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0)

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-[480px] max-w-[90vw] rounded-2xl overflow-hidden"
          style={{ background: 'var(--moon-bg-surface)', border: '1px solid var(--moon-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header with animated gradient */}
          <div className="relative h-36 overflow-hidden flex items-center justify-center">
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }}
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative text-center">
              <motion.div
                className="text-4xl mb-1"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                🌙
              </motion.div>
              <motion.h1
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to MoonOS
              </motion.h1>
              <motion.p
                className="text-sm text-white/70 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your browser-based operating system
              </motion.p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {page === 0 && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="text-sm text-[var(--moon-text-secondary)] mb-4">Here's what you can do:</p>
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--moon-bg-elevated)] transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-lg shrink-0">{f.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-[var(--moon-text-primary)]">{f.title}</div>
                      <div className="text-[11px] text-[var(--moon-text-muted)]">{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {page === 1 && (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🚀
                </motion.div>
                <h2 className="text-lg font-semibold text-[var(--moon-text-primary)]">You're all set!</h2>
                <p className="text-sm text-[var(--moon-text-muted)] mt-2 max-w-xs mx-auto">
                  Double-click desktop icons or use the dock to open apps. Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--moon-bg-elevated)] text-[var(--moon-accent)] text-[10px] font-mono">Ctrl+Space</kbd> anytime.
                </p>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex gap-1.5">
                {[0, 1].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${page === i ? 'bg-[var(--moon-accent)]' : 'bg-[var(--moon-border)]'}`} />
                ))}
              </div>
              {page === 0 ? (
                <button
                  onClick={() => setPage(1)}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-[var(--moon-accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Next
                </button>
              ) : (
                <motion.button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-[var(--moon-accent)] text-white hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
