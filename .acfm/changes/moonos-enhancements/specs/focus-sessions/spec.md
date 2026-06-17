# Spec: Focus Sessions

## ADDED

### Focus Mode Configuration
- Aggressive auto-hiding of Dock and Top Panel to clear desktop distraction.
- Unfocused windows are dimmed to 40% opacity and desaturated.
- A visual Pomodoro countdown ring is shown on the screen corner.
- Incoming notifications are queued silently without popping up toast banners.
- Screen edges receive a subtle vignette shadow effect to create visual tunnel vision.

---

## Scenarios

### Scenario 1: Starting a Focus Session
- **WHEN**: The user activates a Focus Session of 25 minutes
- **THEN**: The Dock slides off the screen edge
- **AND**: Background windows are dimmed to 40% opacity while the active window remains fully bright
- **AND**: A Pomodoro timer ring overlay mounts in the corner of the screen

### Scenario 2: End of Focus Session timer
- **WHEN**: The Focus Session countdown reaches 00:00
- **THEN**: The system plays a soft bell chime
- **AND**: A full-screen notification prompts a break period
- **AND**: The Dock, Top Panel, and background window brightnesses transition back to normal over 5 seconds
