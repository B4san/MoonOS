# Design Document: MoonOS Core Subsystems and Innovations

## Context
MoonOS contains a minimal desktop shell with a basic drag-and-resize windowing system, a static wallpaper background, and elementary app layouts. This change will build out the advanced components of the roadmap to turn the OS into a highly tactile, living environment.

## Goals
- Add a Circadian Time Engine modifying visual theme properties dynamically.
- Synthesize generative ambient audio and low-latency feedback sound effects entirely in the client using the Web Audio API.
- Introduce motion physics (momentum, spring alignment, magnetic borders) to windows.
- Provide user focus states, lock screen kinematics, and persistent clipboard history utilities.
- Upgrade app models (Terminal, Notes, Calendar, Files, Browser, Calculator) to high fidelity.

## Non-Goals
- Real-time cloud accounts sync (out of scope, focus remains on local-first storage).
- Real WebGL rendering pipeline (rely on lightweight 2D canvas/CSS variables to save resources).
- Kernel-level multi-threading emulation (keep standard single-threaded JS model).

## Design Decisions

### Decision: Circadian Color and Asset Engine
- **Approach:** Introduce a `circadian` store tracking time-phases. Interpolate CSS custom variables (colors, particle velocity, shadow sources, blur ratios) on the `:root` element.
- **Rationale:** Modifying CSS custom variables on the document root changes style parameters immediately across the DOM without triggering React virtual DOM tree diffing. This keeps rendering performance high (70+ FPS).
- **Alternatives considered:** React-state-driven context themes. Rejected because passing theme colors via React state triggers global tree re-renders, causing significant animation frame drops.

### Decision: Web Audio API Procedural Acoustics
- **Approach:** A centralized audio manager class utilizing procedural Web Audio nodes (Oscillators, GainNodes, BiquadFilterNodes, AudioBuffer).
- **Rationale:** Audio files are large and slow to load. Procedural synthesis generates chimes, drones, keyboard taps, and wind/rain atmospheres entirely in code, requiring zero asset requests.
- **Alternatives considered:** Playing short MP3/OGG sound files. Rejected due to asset loading delays and network payload limits.

### Decision: requestAnimationFrame Velocity and Physics Loop
- **Approach:** Add pointer momentum velocity tracking during dragging. Upon release, a recursive `requestAnimationFrame` tick calculates kinetic friction and deceleration, adjusting style properties of the Window container element directly.
- **Rationale:** Bypassing React render loops for dragging and animations ensures fluid transitions at native refresh rates.
- **Alternatives considered:** standard CSS keyframe transitions. Rejected because dynamic physics properties (friction, elastic bounce back, drag momentum) cannot be represented dynamically in standard CSS animations.

### Decision: Local Storage for Workspaces and Scenes
- **Approach:** Save serialized state arrays (window coordinates, open applications, workspace names, notes) into IndexedDB utilizing the existing `localforage` library.
- **Rationale:** Local-first persistence. Large snapshot data fits safely inside IndexedDB without exceeding the strict size limits of standard LocalStorage.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       TopPanel & Dock                       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      SettingsStore &         │ │        WindowStore         │
│      Circadian Subsystem     │ │    (Positioning/Physics)   │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      DOM Custom Properties   │ │      Window Physics Loop   │
│      (:root styles)          │ │     (requestAnimationFrame)│
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Desktop Component                      │
│        (Living Wallpaper Canvas & Audio Engine)             │
└─────────────────────────────────────────────────────────────┘
```

The system components interact as follows:
1. **SettingsStore** drives the active themes and the clock system. It sets Circadian phases.
2. The **Circadian Subsystem** modifies the document root variables, which style the **Desktop** background, particles, and window elements immediately.
3. The **WindowStore** handles coordinates and active states.
4. When dragging a window, custom mouse movement handlers in the **Window Component** compute displacement and trigger physics animations in high-frequency rendering ticks.
5. The **Audio Engine** runs in the background, listening to system events and window coordinates to synthesize soundscapes.
