# Spec: Window Physics Engine

## ADDED

### Momentum and Inertia Drag
- Dragging a window and releasing it continues its motion with smooth deceleration.
- Boundary collisions result in a subtle springy bounce back instead of a hard stop.

### Magnetic Edges
- Windows within a 20px proximity snap and align to each other's borders.
- Connected windows show a soft linking indicator line and can be dragged together.

### Spring Snapping and Breathing Attention Glow
- Snapping to screen quarters or halves triggers a spring bounce animation.
- Windows requiring attention pulse their borders with a breathing cycle (glow fades in and out every 1.5 seconds).

---

## Scenarios

### Scenario 1: Releasing a window during drag
- **WHEN**: The user drags a window with high velocity and releases it
- **THEN**: The window continues to slide in the release direction
- **AND**: Decelerates smoothly using a friction coefficient until velocity reaches zero

### Scenario 2: Snapping proximity alignment
- **WHEN**: A window is dragged within 20px of another window's edge
- **THEN**: The window snaps to perfectly align with the border of the adjacent window
- **AND**: A temporary connecting line of accent light is rendered between the aligned edges
