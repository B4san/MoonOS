import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSettingsStore } from '@/stores/settings-store'

export function FocusTimer() {
  const {
    focusTimeRemaining,
    focusDuration,
    focusBreakDuration,
    focusTimerActive,
    focusBreakActive,
    toggleFocusTimer,
    resetFocusTimer,
    stopFocusSession
  } = useSettingsStore()

  const [hovered, setHovered] = useState(false)

  const minutes = Math.floor(focusTimeRemaining / 60)
  const seconds = focusTimeRemaining % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const totalSeconds = focusBreakActive ? (focusBreakDuration || 5) * 60 : (focusDuration || 25) * 60
  const progress = Math.max(0, Math.min(1, focusTimeRemaining / totalSeconds))

  // SVG parameters
  const radius = 28
  const stroke = 3
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-12 right-4 z-[9990] flex items-center gap-3 p-2.5 rounded-2xl select-none"
      style={{
        background: 'var(--moon-bg-surface)',
        backdropFilter: 'blur(var(--moon-blur))',
        border: '1px solid var(--moon-border)',
        boxShadow: 'var(--moon-shadow)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial Ring and Timer */}
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="absolute w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="var(--moon-border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <motion.circle
            stroke={focusBreakActive ? 'var(--moon-success)' : 'var(--moon-accent)'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transition={{ strokeDashoffset: { type: 'tween', ease: 'linear', duration: 1 } }}
          />
        </svg>
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-[10px] font-bold text-[var(--moon-text-primary)] font-mono leading-none">
            {timeString}
          </span>
          <span className="text-[7px] font-semibold text-[var(--moon-text-muted)] tracking-wider mt-0.5 uppercase">
            {focusBreakActive ? 'Break' : 'Focus'}
          </span>
        </div>
      </div>

      {/* Slide-out controls on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden flex items-center gap-1.5 pr-1"
          >
            {/* Play / Pause */}
            <button
              onClick={toggleFocusTimer}
              className="p-1.5 rounded-lg bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] hover:text-[var(--moon-accent)] active:scale-95 transition-all text-xs cursor-pointer"
              title={focusTimerActive ? 'Pause' : 'Resume'}
            >
              {focusTimerActive ? (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Reset */}
            <button
              onClick={resetFocusTimer}
              className="p-1.5 rounded-lg bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-bg-tertiary)] text-[var(--moon-text-secondary)] active:scale-95 transition-all text-xs cursor-pointer"
              title="Reset Timer"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Stop / End Session */}
            <button
              onClick={stopFocusSession}
              className="p-1.5 rounded-lg bg-[var(--moon-danger)]/15 hover:bg-[var(--moon-danger)] text-[var(--moon-danger)] hover:text-white active:scale-95 transition-all text-xs cursor-pointer"
              title="End Focus Session"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
