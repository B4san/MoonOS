# Spec: Ambient Soundscapes

## ADDED

### Generative Audio Engine
A zero-byte audio engine built with the Web Audio API that synthesizes procedural focus atmospheres and UI sounds.
- **Atmospheres**: Generates continuous audio streams (e.g. Deep Space synth drones, procedural Rain wind/white noise, Digital Garden chimes).
- **Tactile Sound Effects**: Custom low-latency synth effects for system triggers:
  - Window Open: Gentle rising pitch (50ms).
  - Window Close: Falling pitch (50ms).
  - Window Snap: Satisfying click-lock high-frequency ping.
  - Switch Workspace: Smooth low-pass swoosh sweep.
  - System Errors: Soft short low-frequency buzz.
- **Terminal Keypress Clicks**: Procedural feedback clicks representing mechanical keyboard typing (switchable).

---

## Scenarios

### Scenario 1: Focus soundscape selection
- **WHEN**: The user activates the "Rain Studio" soundscape
- **THEN**: The AudioContext starts and generates procedural white-noise/pink-noise bands filtered to simulate rain
- **AND**: Random periodic bursts of filtered noise simulate distant thunder crashes

### Scenario 2: Window action audio feedback
- **WHEN**: The user clicks to close a window while UI sounds are enabled
- **THEN**: The system triggers a Web Audio synthesizer callback
- **AND**: A 50ms sine wave sweep from 400Hz to 150Hz is played through the output node
