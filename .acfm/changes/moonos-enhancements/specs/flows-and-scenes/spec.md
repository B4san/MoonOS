# Spec: Flows and Scenes

## ADDED

### Intelligent Workspaces (Flows)
- Custom workspace types with names, intentions, overrides (theme, soundscape), and persistent layouts.
- Auto-saves all app instances and coordinates upon switching workspaces.
- Flow timeline tracks files edited and command history.
- Scratchpad floats as a flow-local notepad.

### Desktop Scenes
- Desktop snapshot system that saves the state of all open apps, window coordinates, theme presets, and background modes.
- Saves snapshots to IndexedDB.
- Restores snapshots via the Command Palette or keyboard shortcuts.

---

## Scenarios

### Scenario 1: Creating and switching to a custom Flow
- **WHEN**: The user creates a new Flow named "Coding Session"
- **THEN**: The system assigns a unique Flow ID and initializes its local storage key
- **AND**: Switching to "Coding Session" restores its last active windows and triggers its soundscape override

### Scenario 2: Save and Restore Desktop Scene
- **WHEN**: The user saves the current layout as a Scene named "Planning Layout"
- **THEN**: The system registers all active window positions, sizes, apps, and workspace details into IndexedDB
- **AND**: Activating "Planning Layout" later recreates all window instances at their exact coordinates
