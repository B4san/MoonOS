# Spec: Living Wallpapers

## ADDED

### Generative Canvas Wallpapers
- Interactive background options rendered directly on a canvas element:
  - **Nebula Flow**: Perlin noise fields creating slow drifting plasma gases that pull away from the cursor coordinate.
  - **Tidal Grid**: A grid of dot nodes undulating in sine waves. Clicking the desktop triggers circular wave ripples.
  - **Aurora Borealis**: Sweeping vertical bands of gradient colors that shift speed and frequency to match active ambient sounds.
- Automatically adjusts resolution and fps down (from 60fps to 30fps or off) based on the current Hardware Tier.

---

## Scenarios

### Scenario 1: Changing background to Tidal Grid
- **WHEN**: The user selects "Tidal Grid" in the Background settings
- **THEN**: The desktop background canvas switches rendering loop to calculate wave nodes
- **AND**: Clicking on any desktop empty area initiates expanding circular wave ripples from the click coordinate

### Scenario 2: Adapting to low hardware performance
- **WHEN**: The hardware detector reports a "Performance" tier
- **THEN**: Canvas rendering ticks are bypassed or limited to a static state
- **AND**: Wallpapers fall back to low-cost CSS gradients or static imagery
