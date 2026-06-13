import type { HardwareTier } from '@/types'

interface TierConfig {
  blur: string
  shadow: string
  transitionDuration: string
  borderOpacity: string
  particleCount: string
}

const TIER_CONFIGS: Record<HardwareTier, TierConfig> = {
  quality: {
    blur: '20px',
    shadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
    transitionDuration: '220ms',
    borderOpacity: '0.15',
    particleCount: '500',
  },
  balanced: {
    blur: '10px',
    shadow: '0 4px 16px rgba(0,0,0,0.3)',
    transitionDuration: '180ms',
    borderOpacity: '0.1',
    particleCount: '200',
  },
  performance: {
    blur: '0px',
    shadow: '0 2px 8px rgba(0,0,0,0.2)',
    transitionDuration: '120ms',
    borderOpacity: '0.05',
    particleCount: '0',
  },
}

export function applyTierToDOM(tier: HardwareTier) {
  const config = TIER_CONFIGS[tier]
  const root = document.documentElement
  root.style.setProperty('--moon-blur', config.blur)
  root.style.setProperty('--moon-shadow', config.shadow)
  root.style.setProperty('--moon-transition-duration', config.transitionDuration)
  root.style.setProperty('--moon-border-opacity', config.borderOpacity)
  root.style.setProperty('--moon-particle-count', config.particleCount)
  root.setAttribute('data-tier', tier)
}

export function getTierConfig(tier: HardwareTier): TierConfig {
  return TIER_CONFIGS[tier]
}

export function getParticleCount(tier: HardwareTier): number {
  return parseInt(TIER_CONFIGS[tier].particleCount, 10)
}
