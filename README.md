<p align="center">
  <img src="public/moon.svg" width="80" alt="MoonOS Logo" />
</p>

<h1 align="center">MoonOS</h1>

<p align="center">
  <b>A web-based operating system that adapts to your hardware.</b><br/>
  Minimal. Beautiful. Intelligent.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Bundle-137KB_gzip-green" alt="Bundle Size" />
</p>

---

## What is MoonOS?

MoonOS is a **web operating system** that runs entirely in your browser. It detects your device's capabilities — CPU, RAM, GPU, battery, network — and automatically adjusts its visual fidelity between three tiers:

| Tier | Hardware | Experience |
|------|----------|------------|
| 🚀 **Quality** | 8+ cores, 8GB+ RAM, GPU | Full glassmorphism, 500 particles, rich shadows |
| ⚡ **Balanced** | 4 cores, 4GB RAM | Moderate blur, 200 particles, simple shadows |
| 🔋 **Performance** | Low-end / battery saving | No blur, no particles, minimal effects |

No configuration needed. It just works.

---

## Features

- **🪟 Window Manager** — Drag, resize, minimize, maximize, snap to edges/halves/corners. macOS-style traffic light controls. 60fps pointer-driven movement. Tiling mode (auto-arrange all windows in grid).
- **🖥️ Virtual Workspaces** — 4 workspaces with `Ctrl+1-4` instant switching and visual overview (`Ctrl+Tab`).
- **🔍 Launcher** — `Ctrl+Space` opens Spotlight-style search with fuzzy matching.
- **⌨️ Command Palette** — `Ctrl+K` for system commands: change theme, switch tier, tile windows, open apps.
- **🎨 Adaptive Theming** — Dark/Light modes + 4 accent colors (Moonlight, Nebula, Aurora, Solar). Instant CSS variable swap. Visual Theme Editor app.
- **🌌 Dynamic Wallpaper** — Canvas 2D star field with mouse parallax, particle count adapts to hardware tier.
- **📱 Hardware Detection** — WebGPU/WebGL2/WebGL1 GPU detection, CPU cores, RAM, battery monitoring, network. Auto-tiering with 24h cache.
- **💾 Real Filesystem** — localForage + IndexedDB persistent storage. Create, upload, rename, delete files. Storage quota detection shows available space.
- **🔔 Notifications** — Toast notifications + notification center panel with history.
- **🧩 Desktop Widgets** — Clock, system info widgets on desktop.
- **📁 9 Built-in Apps** — Terminal (with real filesystem), Notes (markdown + preview), Files (browser + upload), Tasks (todo with states), Calendar, Settings, Task Manager, Theme Editor, Browser (placeholder).
- **🖱️ Context Menus** — Right-click desktop and dock items for contextual actions.
- **♿ Accessible** — Radix UI primitives, keyboard navigation, ARIA labels.
- **🧪 Tested** — 25 unit tests (Vitest) + 9 E2E tests (Playwright).

---

## Quick Start

```bash
git clone https://github.com/B4san/MoonOS.git
cd MoonOS
npm install
npm run dev
```

Open `http://localhost:5173` — the onboarding will guide you through setup.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Space` | Open Launcher |
| `Ctrl + K` | Command Palette |
| `Ctrl + 1-4` | Switch Workspace |
| `Ctrl + Tab` | Workspace Overview |
| Double-click titlebar | Maximize / Restore |

---

## Architecture

```
src/
├── core/           # Hardware detection, adaptive rendering, theming, hotkeys, persistence
├── stores/         # Zustand + Immer state (windows, settings, app registry)
├── ui/             # Shell components (Desktop, Window, Dock, Panel, Launcher, etc.)
├── hooks/          # React hooks (useHardwareTier, useAdaptiveValue, useHotkey)
├── apps/           # Application shells (Notes, Terminal, Settings)
└── types/          # Shared TypeScript types
```

**Key Design Decisions:**
- **Vite + React** (not Next.js) — 100% client-side, no SSR overhead
- **Canvas 2D** (not Three.js) — Small bundle, sufficient for particle effects
- **Pointer Events + RAF** — No drag library, maximum performance control
- **CSS Variables** — Theme switching without re-renders
- **Zustand granular selectors** — Only the affected window re-renders

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Build | Vite 8 |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v4 + CSS Variables |
| State | Zustand + Immer |
| Animation | Motion (WAAPI hybrid) |
| Primitives | Radix UI |
| Storage | localForage (IndexedDB) |
| Testing | Vitest + Playwright |

---

## Roadmap

- [x] **Phase 1** — Core Shell (window manager, dock, panel, launcher, workspaces, hardware detection)
- [x] **Phase 2** — Apps (Markdown notes, task manager, file system, real terminal)
- [x] **Phase 3** — Advanced customization (theme editor, widget grid, layout presets)
- [ ] **Phase 4** — Sync & auth (optional cloud backup, multi-device)
- [ ] **Phase 5** — App SDK (third-party microapps)

---

## License

MIT

---

<p align="center">
  <sub>Built with obsessive attention to detail. Every pixel matters.</sub>
</p>


