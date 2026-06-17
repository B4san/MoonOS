# Spec: Smart Shelf and Clipboard

## ADDED

### Smart Shelf Sidebar
- An auto-hiding right-edge sidebar that slides out when the cursor hovers near the boundary.
- Displays predictive recent items: last 5 modified files, last 3 copied text clips, and last terminal commands.

### Clipboard Universe
- A persistent clipboard manager utilizing IndexedDB.
- Listens to system copy events to log text, hex colors, code, and links.
- Key combinations (`Ctrl+Shift+V`) open a quick-paste search overlay.
- Visual swatches for colors and syntax highlighter for code snippets.

---

## Scenarios

### Scenario 1: Accessing the Smart Shelf
- **WHEN**: The user hovers the cursor within 5px of the right screen edge
- **THEN**: The Smart Shelf slides in from the right containing shortcuts to recent files and clipboards

### Scenario 2: Quick pasting from clipboard history
- **WHEN**: The user presses `Ctrl+Shift+V`
- **THEN**: A clean overlay list opens in the center showing clipboard history
- **AND**: Pressing Enter on a selected item copies it back to the clipboard and hides the overlay
