# Spec: Peripheral Awareness and Transitions

## ADDED

### Peripheral Awareness Zones
- **Top Edge Progress Line**: A thin 2px gradient line reflecting background file operations or task completions.
- **Left Edge Alert pulses**: Vertical glow notifications flashing softly to indicate background workspace messages.

### Shared Element Transitions
- Open transitions morph the file icon from the virtual directory directly into the window dimensions of the editor app.
- Dock icon clicks zoom windows out from the corresponding icon center.

---

## Scenarios

### Scenario 1: Morphing open a file
- **WHEN**: The user double-clicks a file icon in the File Manager
- **THEN**: A visual clone of the icon expands outwards in size and coordinates
- **AND**: Decelerates and fades into the Window container bounding box over 350ms

### Scenario 2: Background file download progress
- **WHEN**: A mock download is running in the background
- **THEN**: A 2px height progress bar fills from left to right along the top-most boundary of the viewport
