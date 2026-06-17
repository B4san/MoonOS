# Spec: Circadian Time System

## ADDED

### Dynamic Theme Adaptation
The system automatically adapts the theme colors, particles, and visual temperature based on the time of day.
- **Dawn (05:00 - 08:00)**: Soft violets and light orange tones. Low particle count.
- **Morning (08:00 - 12:00)**: Light blues, high energy.
- **Day (12:00 - 17:00)**: Neutral whites/light mode, maximum clarity.
- **Golden Hour (17:00 - 20:00)**: Gold/amber tones, long shadow lengths.
- **Dusk (20:00 - 23:00)**: Deep purples, high blur.
- **Night (23:00 - 05:00)**: Deep night blues, low/calm particles, low brightness.

### Timezone and Offset Shifts
Users can manually offset the time phase to match their personal circadian rhythm (e.g., "shift day start to 2 PM").

---

## Scenarios

### Scenario 1: Circadian phase transition at specified time
- **WHEN**: The system clock reaches 20:00 (Dusk)
- **THEN**: The CSS custom properties for background, text, and accents smoothly transition over a 30-minute period to deep purple colors
- **AND**: The desktop blur increases to match the Dusk setting

### Scenario 2: User shifts timezone/offset
- **WHEN**: The user changes the circadian offset to "+4 hours"
- **THEN**: The system calculations shift the active phase forward by 4 hours
- **AND**: The visual styling updates immediately to match the offset phase
