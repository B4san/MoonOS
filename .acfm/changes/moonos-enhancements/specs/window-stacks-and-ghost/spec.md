# Spec: Window Stacks and Ghost Windows

## ADDED

### Window Stacks (Tabbed Groups)
- Dragging a window titlebar over another window highlights a stack drop-zone.
- Dropping compiles them into a single window unit with header tabs.
- Selecting a tab shifts focus and view to the active app within the stack.
- Dragging a tab header out of the stack container restores it as a standalone window.

### Ghost Windows
- Titlebar options allow converting any active window to "Ghost Mode" (`Ctrl+Shift+G`).
- Ghost windows become 40% transparent, stay always on top, and ignore user click events (click-through).
- Double clicking or keyboard shortcuts unlock them back to normal state.

---

## Scenarios

### Scenario 1: Grouping windows into a Stack
- **WHEN**: The user drags Window A over Window B and drops it on the merge zone
- **THEN**: The windows are merged into a Stack component
- **AND**: The titlebar shows tabs for Window A and Window B, resizing the stack container to fit the active tab

### Scenario 2: Toggling Ghost Mode
- **WHEN**: The user activates Ghost Mode on a text note window
- **THEN**: The window opacity drops to 40%
- **AND**: Clicks on the window area register on the desktop elements beneath it (click-through)
