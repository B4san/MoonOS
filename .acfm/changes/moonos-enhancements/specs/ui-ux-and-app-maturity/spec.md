# Spec: UI/UX and App Maturity

## MODIFIED

### System App Upgrades
- **Terminal**: Supports tabs management, panel splitting, autocomplete suggestions, and style themes.
- **Notes**: Supports backlinks (`[[note-name]]`), full-text search, and markdown syntax preview highlighting.
- **Files**: Integrates search inputs, grid/list layout toggle, sidebar bookmarks, and zip compression.
- **Calculator**: Adds Programmer/Scientific mode tabs, memory registers, and operations history side tape.
- **Browser**: Emulates sandboxed iframe navigation, tabbed browsing, and search query integration.
- **Top Panel & Dock**: Introduces logo options menu, network/battery meters, grouped notification tabs, auto-hiding dock.

---

## Scenarios

### Scenario 1: Accessing system about/restart details
- **WHEN**: The user clicks the Moon logo on the Top Panel
- **THEN**: A dropdown menu presents options: "About MoonOS", "Settings", "Lock Screen", "Restart"

### Scenario 2: Splitting terminal window
- **WHEN**: The user clicks "Split Window" in the Terminal options bar
- **THEN**: The Terminal splits its main viewport into two parallel console components, sharing input focus
