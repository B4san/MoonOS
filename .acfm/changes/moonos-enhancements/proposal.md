# Proposal: MoonOS Innovation Roadmap & Core Enhancements

## Why
Currently, MoonOS has a functional and minimal web OS foundation, but it lacks the visual magic, contextual awareness, and immersive features that define a truly premium user experience. To move it from a functional toy to an operating system users love and want to work in daily, we need to transform it into a cohesive, tactile, and living workspace ("Calm Power"). 

Implementing the roadmap detailed in `new.md` will elevate MoonOS by introducing adaptive physics, generative audio, context-aware workspaces, and micro-interactions that degrade gracefully across hardware tiers.

## What Changes
We are implementing the comprehensive Feature Vision & Innovation Roadmap from `new.md`. This involves introducing core subsystem engines (Circadian, Physics, Audio, State/Scenes) and upgrading the Desktop visual shell, Top Panel, Dock, and all standard apps (Notes, Terminal, Files, Calendar, Calculator, Browser) with advanced features and micro-interactions.

## Capabilities

### New Capabilities
- `circadian-system`: Visual adaptation engine that shifts colors, particles, lighting, and shadow angles based on current time of day or custom time-shifts.
- `ambient-soundscapes`: Generative audio system using Web Audio API to synthesize focus soundscapes and reactive interface acoustic feedback dynamically.
- `window-physics`: A lightweight rigid-body movement and snap system featuring window momentum, bounce-back boundaries, spring-snapping, and magnetic connections.
- `flows-and-scenes`: Advanced workspaces containing intent configuration, activity timeline, flow-local notes, and system-wide state snapshots for save/restore.
- `focus-sessions`: Workspace distraction-free mode which hides the dock, dims background windows, displays a Pomodoro visual dial, and queues incoming notifications.
- `lock-screen-cinematic`: Typographic-responsive time screen saver featuring cosmic/philosophical quotes, slide-to-unlock physics, and PIN verification.
- `smart-shelf-and-clipboard`: Contextual predictive sidebar for recent files/commands and an IndexedDB clipboard history space supporting quick-paste command overlays.
- `window-stacks-and-ghost`: Window tabs overlay manager for grouping windows together and click-through ghost window overlays.
- `peripheral-awareness-and-transitions`: Ambient status edges for task progress and shared-element morphing transitions.
- `living-wallpapers`: Generative canvas backgrounds (Nebula, Tidal, Aurora) reacting to mouse position, system load, and circadian state.

### Modified Capabilities
- `ui-ux-and-app-maturity`: Enhancements to the Dock (magnification, launch bounce, active indicators), Top Panel (logo menu, system meters), Terminal (tabs, splitting, themes), Notes (backlinks, markdown previews), Files (search, favorite sidebars), Calculator (scientific modes), and Browser (sandboxed active tabs).

## Impact
- **Core Shell (`src/App.tsx`, `src/ui/Desktop.tsx`, `src/ui/Window.tsx`, `src/ui/Dock.tsx`)**: Integrates physics dragging, morph transitions, soundscape reactive triggers, and focus session dimming.
- **State Management (`src/stores/*`)**: Extends store models for windows, settings, and new subsystems (Circadian, Audio, Flows, Clipboard).
- **Dependencies**: Uses existing `motion` library for animations. Utilizes browser native APIs (Web Audio, Canvas 2D, IndexedDB) to keep bundle impact minimal.
