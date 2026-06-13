# MoonOS Project Constitution

## Project Identity

**Project Name:** MoonOS
**Project Type:** Web OS - Minimalista, Personalizable, Ultra-Performante
**Core Vision:** Un sistema operativo web que se sienta como macOS en belleza, Linux en personalización, y supera ambos en performance web

---

## Core Principles

### Principle 1: Visual Excellence as Non-Negotiable
**Rule:** Cada pixel debe sentirse intencional. MoonOS debe alcanzar paridad visual con macOS en pulcritud, microinteracciones y coherencia de motion design.

**Rationale:** La primera impresión determina si el usuario considera MoonOS un "juguete" o un entorno serio. 70fps mínimo en interacciones críticas, animaciones con cubic-bezier(0.22, 0.61, 0.36, 1), glassmorphism controlado, blur suave.

**Testable Criteria:**
- Lighthouse Performance ≥ 90
- Animation frame drops < 1% en transiciones principales
- Zero layout shift (CLS = 0) en desktop load

---

### Principle 2: Performance-First Architecture
**Rule:** Performance no es optimización posterior; es constraint de diseño. Cada decisión arquitectural se evalúa por su impacto en FPS y memoria.

**Rationale:** Un Web OS que laggea rompe la ilusión de "sistema operativo real". Debe sentirse nativo.

**Testable Criteria:**
- Bundle initial < 150KB gzipped (core shell)
- Time to Interactive < 2s en 3G
- Memoria < 100MB con 5 apps abiertas
- Zero memory leaks en 30min de uso continuo

---

### Principle 3: Extreme Personalization Without Complexity
**Rule:** Por defecto: perfecto. En profundidad: infinito. Usuario novato ve 3 opciones; usuario experto ve 300.

**Rationale:** La personalización es el diferenciador clave vs macOS/Windows. Pero abrumar al usuario rompe la adopción.

**Testable Criteria:**
- Onboarding completa en < 3 minutos
- Theme switch < 100ms
- Layout preset apply < 200ms
- Configuración exportable/importable como JSON

---

### Principle 4: Hardware-Aware Adaptive Optimization
**Rule:** MoonOS detecta capacidades del dispositivo (GPU, RAM, CPU, battery, display) y adapta automáticamente: efectos pesados en hardware potente, modo rendimiento agresivo en hardware limitado.

**Rationale:** Un OS web corre en cualquier cosa: desde MacBook M3 hasta Chromebook de $200. Debe ser excelente en ambos extremos.

**Testable Criteria:**
- Device detection < 50ms al load
- Auto-tier: "Performance" | "Balanced" | "Quality" tiers
- Manual override siempre disponible
- Preference persistida en localStorage

---

### Principle 5: Local-First, Cloud-Optional
**Rule:** Funciona 100% offline. Backend solo para sync multi-device y auth opcional. localStorage/IndexedDB como source of truth primario.

**Rationale:** Privacidad, velocidad, y resiliencia. El usuario posee su workspace.

**Testable Criteria:**
- Full funcionalidad sin network
- Sync conflict resolution automático
- Data export estándar (JSON)
- Zero tracking por defecto

---

### Principle 6: Developer Experience as Product Feature
**Rule:** MoonOS es extensible. API de apps, theming, widgets documentada y versionada. Cualquier dev puede crear una "microapp" en < 30 min.

**Rationale:** Ecosistema = longevidad. Los power users extienden el OS.

**Testable Criteria:**
- App SDK < 5KB
- TypeScript types first-class
- Hot reload en dev mode
- Ejemplo "Hello World" app en docs

---

### Principle 7: Accessibility Built-In, Not Bolted-On
**Rule:** WCAG 2.1 AA mínimo. Focus visible, contraste, screen readers, reduced motion, high contrast mode nativo.

**Rationale:** Un OS que excluye no es un OS. Es un requisito ético y legal.

**Testable Criteria:**
- axe-core score 100% en CI
- Keyboard navigation completa
- prefers-reduced-motion respetado
- High contrast theme incluido

---

## Governance

### Amendment Procedure
1. Propuesta via `acfm spec new constitution-amendment-<topic>`
2. Discusión en proposal.md (mínimo 48h para cambios MAJOR)
3. Aprobación: consenso del equipo o majority vote
4. Version bump semántico aplicado
5. `LAST_AMENDED_DATE` actualizada

### Versioning Policy
- **MAJOR**: Principio removido/redefinido, cambio breaking en API pública
- **MINOR**: Nuevo principio, expansión material de guía existente
- **PATCH**: Clarificaciones, typos, refinamientos no-semánticos

**Current Version:** 1.0.0
**Ratification Date:** 2026-06-13
**Last Amended Date:** 2026-06-13

### Compliance Review
- **Pre-implementation**: spec-analysis verifica alineación con principios
- **Post-implementation**: code-review valida adherence
- **Quarterly**: Revisión de principios vs realidad del producto

---

## Tech Stack Constraints (Binding)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 15 (App Router) | React Server Components, streaming, optimal bundling |
| Language | TypeScript (strict) | Type safety para system-level code |
| Styling | TailwindCSS + CSS Variables | Theming dinámico, zero-runtime, design tokens |
| State | Zustand + Immer | Granular updates, immutable patterns, tiny bundle |
| Animation | Motion One (WAAPI) | 60fps guaranteed, no JS main thread blocking |
| UI Primitives | Radix UI | Accesibilidad nativa, unstyled, composable |
| Build | Turbopack / Vite | Fast HMR, optimized production builds |

**Forbidden:** Heavy UI libraries (MUI, AntD), CSS-in-JS runtime (styled-components emotion), Class components, Any `any` types in core shell.

---

## Sync Impact Report

<!-- 
Version Change: N/A → 1.0.0 (Initial Constitution)
Modified Principles: All 7 principles newly defined
Added Sections: Core Principles (7), Governance, Tech Stack Constraints
Templates Requiring Updates: 
  - .acfm/templates/proposal-template.md ✅ (align principles reference)
  - .acfm/templates/spec-template.md ✅ (add principle compliance section)
  - .acfm/templates/design-template.md ✅ (add hardware-tier considerations)
  - .acfm/templates/tasks-template.md ✅ (add performance budgets per task)
Follow-up TODOs:
  - Create template files in .acfm/templates/
  - Add constitution compliance check to CI pipeline
-->