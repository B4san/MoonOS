# Spec: Lock Screen Cinematic

## ADDED

### Cinematic Screen Locker
- Displays a prominent typographic clock that adjusts its weight according to time (thinner during night, bolder during the day).
- Renders random rotating quotes about astronomy, peace, or focus.
- Slide-up gesture with inertia physics transitions to the desktop.
- Offers an optional numeric PIN verification entry pad.

---

## Scenarios

### Scenario 1: Locking the screen
- **WHEN**: The user activates Lock Screen or goes idle
- **THEN**: A full-screen overlay mounts over the desktop with a blurred backdrop
- **AND**: A typographic clock and daily quote are rendered in the center of the display

### Scenario 2: Slide up unlock gesture
- **WHEN**: The user drags the Lock Screen card upwards with high speed and releases it
- **THEN**: The card slides off the top of the viewport with momentum physics
- **AND**: The desktop is revealed underneath with a smooth blur-out transition
