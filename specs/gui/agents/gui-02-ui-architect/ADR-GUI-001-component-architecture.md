# ADR-GUI-001: Component Architecture

## Status

Accepted

## Metadata

| Pole       | Wartosc             |
| ---------- | ------------------- |
| Data       | 2026-03-25          |
| Wersja     | 1.0                 |
| Wlasciciel | gui-02-ui-architect |

---

## Context

The GUI layer must render a real-time traffic intersection simulation. The application has these characteristics:

- All simulation state is derived from `commands[]` — a sequential log of user actions.
- The simulation engine is a pure function in `src/simulator/` — no React, no side effects.
- Next.js 15 with App Router is the framework, giving us Server Components and Client Components.
- The intersection visualization requires DOM manipulation and event listeners — it must be a Client Component.
- The root layout and page can be Server Components for initial HTML delivery.

The key architectural constraint from `CLAUDE.md`: `app/` and `src/simulator/` must have no circular dependencies. The bridge is a single file: `app/lib/simulation-adapter.ts`.

---

## Decision

Use Next.js App Router with a minimal server-rendered shell that immediately hands off to a client-side simulation boundary.

`app/page.tsx` is a Server Component. It renders the page layout and a single `<SimulationProvider>` boundary which is a Client Component. All interactive components live inside this boundary.

---

## Component Tree

```
app/
  layout.tsx                    — Server: root HTML, Tailwind, Google fonts
  page.tsx                      — Server: page shell, metadata, renders SimulationProvider
  globals.css                   — Tailwind @layer imports

  components/
    SimulationProvider.tsx      — Client ('use client'): context + useReducer root
    IntersectionView.tsx        — Client: SVG 600x600, orchestrates lights + queues
    TrafficLight.tsx            — Client: single light indicator (circle, red/green/yellow)
    VehicleQueue.tsx            — Client: ordered list of vehicle markers per road
    VehicleMarker.tsx           — Client: single vehicle rectangle with animation
    ControlPanel.tsx            — Client: Step, Play/Pause, Speed, Reset, Config buttons
    AddVehicleForm.tsx          — Client: controlled form with validation
    ConfigPanel.tsx             — Client: road priorities, invariant/telemetry toggles
    TelemetryDashboard.tsx      — Client: stats cards (reads from context)
    CommandLog.tsx              — Client: scrollable history of commands + results
    JsonPanel.tsx               — Client: import (file input) + export (Blob download)
    ErrorBanner.tsx             — Client: dismissable error message bar

  hooks/
    useSimulation.ts            — Custom hook: useReducer + useEffect for simulation runs
    useAutoPlay.ts              — Custom hook: setInterval-based auto-step with cleanup

  lib/
    simulation-adapter.ts       — THE ONLY import point for src/simulator/
```

### Component Responsibility Summary

| Component          | Reads from context          | Dispatches actions                       |
| ------------------ | --------------------------- | ---------------------------------------- |
| SimulationProvider | —                           | — (provides context)                     |
| IntersectionView   | stepStatuses, commands      | — (display only)                         |
| TrafficLight       | props from IntersectionView | —                                        |
| VehicleQueue       | props from IntersectionView | —                                        |
| VehicleMarker      | props from VehicleQueue     | —                                        |
| ControlPanel       | isPlaying, speed            | STEP, TOGGLE_AUTO_PLAY, SET_SPEED, RESET |
| AddVehicleForm     | error                       | ADD_VEHICLE                              |
| ConfigPanel        | options                     | SET_ROAD_PRIORITIES, SET_OPTIONS         |
| TelemetryDashboard | telemetry, stepStatuses     | —                                        |
| CommandLog         | commands, stepStatuses      | —                                        |
| JsonPanel          | commands                    | IMPORT_COMMANDS                          |
| ErrorBanner        | error                       | CLEAR_ERROR                              |

---

## Page Layout Structure

```
+------------------------------------------------------------------+
| layout.tsx: <html> + <body> with Tailwind base styles           |
+------------------------------------------------------------------+
| page.tsx (Server): metadata + <SimulationProvider>               |
|  +--------------------------------------------------------------+ |
|  | SimulationProvider (Client boundary)                        | |
|  |  +---------------------------+  +------------------------+  | |
|  |  | IntersectionView (SVG)    |  | Right Panel            |  | |
|  |  |   TrafficLight x4         |  |   ControlPanel         |  | |
|  |  |   VehicleQueue x4         |  |   AddVehicleForm       |  | |
|  |  |   VehicleMarker x N       |  |   CommandLog           |  | |
|  |  +---------------------------+  |   TelemetryDashboard   |  | |
|  |                                 |   ConfigPanel (toggle) |  | |
|  |                                 |   JsonPanel            |  | |
|  |                                 |   ErrorBanner          |  | |
|  |                                 +------------------------+  | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## The Simulation Adapter (Boundary Contract)

`app/lib/simulation-adapter.ts` is the sole file permitted to import from `src/simulator/`. This rule is enforced at architecture review time (gui-05-code-reviewer must reject any PR that violates it).

The adapter exposes:

```typescript
export type AdapterResult =
  | { ok: true; stepStatuses: StepStatus[]; telemetry?: TelemetryData }
  | { ok: false; error: string };

export function runSimulation(commands: Command[], options: SimulateOptions): AdapterResult;
export type {
  Command,
  Road,
  StepStatus,
  PhaseId,
  TelemetryData,
  SimulateOptions,
  SimulationResult,
};
```

All other files in `app/` import types and the adapter function from `'@/app/lib/simulation-adapter'`, never from `'@/src/simulator'`.

---

## Implementation Order

The dependency order for `gui-04-frontend-developer`:

```
G1: Scaffold (layout, page, globals.css, Tailwind config)
  |
G2: simulation-adapter.ts (prerequisite for any simulation logic)
  |
G3: SimulationProvider + useSimulation + useAutoPlay (state management foundation)
  |
G4: Static IntersectionView SVG (no interaction, just render)
  |
G5: TrafficLight phase visualization (reads activePhase from context)
  |
G6: VehicleQueue + VehicleMarker + departure animation
  |
G7: ControlPanel (Step, Play/Pause, Speed, Reset)
  |
G8: AddVehicleForm + CommandLog
  |
G9: TelemetryDashboard
  |
G10: ConfigPanel
  |
G11: JsonPanel (import/export)
  |
G12: Polish (animations, responsive, a11y audit fixes, error handling)
```

---

## Consequences

**Easier because of this decision:**

- Server/client boundary is explicit and minimal — only one `'use client'` at the root of the simulation subtree.
- Simulation adapter pattern makes it trivial to swap the engine or mock it in tests.
- Component tree maps 1:1 to GWF workflows — easy to trace from spec to code.
- No prop drilling beyond 2 levels — context provides shared state.

**Harder because of this decision:**

- All interactive components must be Client Components — they cannot use async Server Component patterns.
- React Context re-renders all consumers on every dispatch — mitigated by `React.memo` on leaf components (`TrafficLight`, `VehicleMarker`) if profiling shows issues.
- The `useEffect` in `useSimulation` runs synchronously after every `commands` change — for very long sessions (>5K commands) this may be slow. Profiling required at GM2 gate.

---

## GWF Traceability

| GWF   | Primary Component(s)                           |
| ----- | ---------------------------------------------- |
| GWF-1 | IntersectionView, TrafficLight, VehicleQueue   |
| GWF-2 | AddVehicleForm, ErrorBanner                    |
| GWF-3 | ControlPanel (Step), VehicleMarker (animation) |
| GWF-4 | ControlPanel (Play/Pause, Speed), useAutoPlay  |
| GWF-5 | TelemetryDashboard                             |
| GWF-6 | ConfigPanel                                    |
| GWF-7 | JsonPanel                                      |
| GWF-8 | ErrorBanner                                    |
