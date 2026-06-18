import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'motion/react'
import { useSettingsStore } from '@/stores/settings-store'
import { audioEngine } from '@/core/audio-engine'

const quotes = [
  { text: "The moon does not fight. It attacks no one.", author: "Deng Ming-Dao" },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  { text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.", author: "Carl Sagan" },
  { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
  { text: "Look at the stars. See their beauty. And in that beauty, see yourself.", author: "Unknown" },
  { text: "We are all like the bright moon, we still have our darker side.", author: "Kahlil Gibran" },
  { text: "The moon will guide you through the night with her brightness.", author: "Unknown" }
]

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { lockScreenPin } = useSettingsStore()
  const [time, setTime] = useState(new Date())
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [pinEntryMode, setPinEntryMode] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')

  const controls = useAnimation()
  const pinControls = useAnimation()

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (t: Date) => {
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  };

  const formatDate = (t: Date) => {
    return t.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  };

  const getClockWeight = () => {
    const h = time.getHours()
    if (h >= 23 || h < 5) return 100 // Thin
    if (h >= 5 && h < 8) return 300 // Light
    if (h >= 8 && h < 17) return 800 // Extra Bold
    return 500 // Medium
  }

  // Drag unlock gesture check
  const handleDragEnd = async (_event: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = -120
    const velocityThreshold = -300

    if (info.offset.y < threshold || info.velocity.y < velocityThreshold) {
      // Successful slide up
      if (lockScreenPin) {
        // Show PIN keypad
        setPinEntryMode(true)
        controls.start({ y: '-100vh', opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } })
      } else {
        // Direct unlock
        await controls.start({ y: '-100vh', opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } })
        onUnlock()
      }
    } else {
      // Snap back
      controls.start({ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  const handleKeyPress = (num: string) => {
    audioEngine.playKeyboardClick()
    if (enteredPin.length >= 6) return
    const nextPin = enteredPin + num
    setEnteredPin(nextPin)

    if (lockScreenPin && nextPin === lockScreenPin) {
      // Correct PIN - unlock
      audioEngine.playUIEvent('open')
      onUnlock()
    } else if (lockScreenPin && nextPin.length >= lockScreenPin.length) {
      // Incorrect PIN - shake and clear
      setTimeout(() => {
        audioEngine.playUIEvent('error')
        pinControls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }).then(() => {
          setEnteredPin('')
        })
      }, 150)
    }
  }

  const handleBackspace = () => {
    audioEngine.playKeyboardClick()
    setEnteredPin(prev => prev.slice(0, -1))
  }

  const handleCancelPin = () => {
    audioEngine.playKeyboardClick()
    setPinEntryMode(false)
    setEnteredPin('')
    controls.start({ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 250, damping: 22 } })
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden select-none bg-black">
      {/* Background with circadian variable ambient tints and blurs */}
      <div 
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: 'var(--moon-wallpaper, radial-gradient(circle, #0e1227 0%, #030408 100%))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px) brightness(40%)',
        }}
      />

      <AnimatePresence>
        {/* Main Clock / Info Card (Slides Up) */}
        {!pinEntryMode && (
          <motion.div
            drag="y"
            dragConstraints={{ top: -1000, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0 }}
            dragMomentum={true}
            onDragEnd={handleDragEnd}
            animate={controls}
            onClick={() => {
              if (lockScreenPin) {
                setPinEntryMode(true)
                controls.start({ y: '-100vh', opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } })
              } else {
                onUnlock()
              }
            }}
            className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 cursor-grab active:cursor-grabbing text-white"
          >
            {/* Top Area: Battery Status and Lock indicator */}
            <div className="flex flex-col items-center gap-1.5 opacity-80">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span className="text-[10px] tracking-widest uppercase">Locked</span>
            </div>

            {/* Middle Area: Clock and Date */}
            <div className="flex flex-col items-center text-center">
              <h1 
                className="text-7xl font-sans tracking-tight leading-none"
                style={{ fontWeight: getClockWeight(), transition: 'font-weight 0.5s ease' }}
              >
                {formatTime(time)}
              </h1>
              <p className="text-sm font-light text-[var(--moon-text-secondary)] opacity-90 mt-3">
                {formatDate(time)}
              </p>

              {/* Quote details */}
              <div className="max-w-sm mt-12 px-6 py-4 rounded-xl border border-white/5 bg-white/2">
                <p className="text-xs italic font-light leading-relaxed opacity-80">
                  "{quote.text}"
                </p>
                <p className="text-[10px] font-medium opacity-60 mt-1.5">
                  — {quote.author}
                </p>
              </div>
            </div>

            {/* Bottom Area: Lock Swipe prompt */}
            <div className="flex flex-col items-center gap-2 opacity-60 animate-bounce">
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              <span className="text-[9px] tracking-wider uppercase font-medium">Swipe Up to Unlock</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional PIN Keyboard (Fades in) */}
      <AnimatePresence>
        {pinEntryMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col items-center justify-center py-12 px-6"
          >
            <motion.div 
              animate={pinControls}
              className="flex flex-col items-center w-72"
            >
              {/* Header */}
              <h2 className="text-xs tracking-widest uppercase text-white/70 mb-4">Enter Passcode</h2>

              {/* PIN Code Circles */}
              <div className="flex gap-4 mb-10 h-3 items-center justify-center">
                {Array.from({ length: lockScreenPin?.length || 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border border-white/40 transition-all duration-150 ${
                      i < enteredPin.length ? 'bg-white scale-110 shadow-md' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Numeric Keypad Grid */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full justify-items-center">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/15 active:bg-white/20 active:scale-95 text-xl font-light text-white transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Backspace */}
                <button
                  onClick={handleBackspace}
                  className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 text-xs text-white/70 transition-all cursor-pointer"
                  title="Backspace"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                  </svg>
                </button>

                {/* 0 */}
                <button
                  onClick={() => handleKeyPress('0')}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/15 active:bg-white/20 active:scale-95 text-xl font-light text-white transition-all cursor-pointer"
                >
                  0
                </button>

                {/* Cancel */}
                <button
                  onClick={handleCancelPin}
                  className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 text-[11px] font-medium uppercase tracking-wider text-white/70 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
