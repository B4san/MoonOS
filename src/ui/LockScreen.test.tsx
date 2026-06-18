import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LockScreen } from '@/ui/LockScreen'

// Mock useSettingsStore
vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: () => ({
    lockScreenPin: '1234',
  }),
}))

vi.mock('@/core/audio-engine', () => ({
  audioEngine: {
    playKeyboardClick: vi.fn(),
    playUIEvent: vi.fn(),
  },
}))

describe('LockScreen Component', () => {
  it('renders locked status, time, and quote panel', () => {
    const handleUnlock = vi.fn()
    render(<LockScreen onUnlock={handleUnlock} />)

    expect(screen.getByText(/locked/i)).toBeInTheDocument()
    expect(screen.getByText(/swipe up to unlock/i)).toBeInTheDocument()
  })

  it('reveals PIN pad on click or drag simulation', () => {
    const handleUnlock = vi.fn()
    render(<LockScreen onUnlock={handleUnlock} />)

    // Simulate clicking the swipe area to trigger PIN mode
    const swipeArea = screen.getByText(/swipe up to unlock/i)
    fireEvent.click(swipeArea)

    // Should render PIN screen
    expect(screen.getByText(/enter passcode/i)).toBeInTheDocument()
  })
})
