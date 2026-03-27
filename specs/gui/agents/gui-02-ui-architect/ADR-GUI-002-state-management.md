# ADR-GUI-002: State Management

## Status

Accepted

## Metadata

| Pole       | Wartosc             |
|------------|---------------------|
| Data       | 2026-03-25          |
| Wersja     | 1.0                 |
| Wlasciciel | gui-02-ui-architect |

---

## Context

The simulation GUI needs to manage:

1. A growing list of user commands (addVehicle, step).
2. The corresponding simulation results (StepStatus per step).
3. Playback controls (isPlaying, speed).
4. Engine options (roadPriorities, invariant checks, telemetry).
5. Transient UI state (errors, config panel open/closed).

Options considered:

| Option            | Pros                                   | Cons                                              |
|-------------------|----------------------------------------|---------------------------------------------------|
| useReducer + Context | Zero dependencies, idiomatic React, testable reducer | Re-renders on all context changes        |
| Zustand           | Minimal re-renders, simple API         | Extra dependency, not approved in tech stack      |
| Redux Toolkit     | Devtools, large ecosystem              | Heavy boilerplate, overkill for this scope        |
| Jotai / Recoil    | Atomic updates, minimal re-renders     | Extra dependency, learning curve                  |

The tech stack in `CLAUDE.md` does not list any state management library. The team is small. The simulation state fits in one object. The re-render concern is mitigated by `React.memo` on leaf components.

---

## Decision

Use `useReducer` with a single `SimulationState` object, distributed via React Context. No external state management library.

---

## State Shape

```typescript
import type { Command, StepStatus, TelemetryData, SimulateOptions } from '@/app/lib/simulation-adapter';

interface SimulationState {
  // Input history — append-only list of all commands issued
  commands: Command[];

  // Output history — one StepStatus per 'step' command executed
  stepStatuses: StepStatus[];

  // Index of the step currently rendered (-1 when no steps yet)
  currentStepIndex: number;

  // Playback state
  isPlaying: boolean;
  speed: number;  // auto-play interval in milliseconds, range [100, 2000]

  // Engine options forwarded to simulation-adapter
  options: SimulateOptions;

  // Telemetry — populated only when options.enableTelemetry = true
  telemetry: TelemetryData | null;

  // Error message from engine or validation — null when no error
  error: string | null;
}
```

### Initial State

```typescript
const initialState: SimulationState = {
  commands: [],
  stepStatuses: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 500,
  options: {
    enableInvariantChecks: true,
    enableTelemetry: false,
    roadPriorities: { north: 1, south: 1, east: 1, west: 1 },
  },
  telemetry: null,
  error: null,
};
```

---

## Actions Catalogue

```typescript
type SimulationAction =
  // User adds a vehicle — appends addVehicle command to commands[]
  | { type: 'ADD_VEHICLE'; payload: { vehicleId: string; startRoad: Road; endRoad: Road } }

  // User triggers one step — appends step command to commands[]
  | { type: 'STEP' }

  // Simulation engine returned results successfully
  | { type: 'STEP_RESULT'; payload: { stepStatuses: StepStatus[]; telemetry?: TelemetryData } }

  // Simulation engine threw an error
  | { type: 'STEP_ERROR'; payload: string }

  // User resets everything — returns to initialState
  | { type: 'RESET' }

  // User changes auto-play interval
  | { type: 'SET_SPEED'; payload: number }

  // User changes road priorities in ConfigPanel
  | { type: 'SET_ROAD_PRIORITIES'; payload: Record<Road, number> }

  // User changes any SimulateOptions field
  | { type: 'SET_OPTIONS'; payload: Partial<SimulateOptions> }

  // User imports commands from JSON file
  | { type: 'IMPORT_COMMANDS'; payload: Command[] }

  // User toggles auto-play on or off
  | { type: 'TOGGLE_AUTO_PLAY' }

  // User dismisses error banner
  | { type: 'CLEAR_ERROR' };
```

---

## Reducer Invariants

The reducer must preserve these invariants at all times:

| Invariant | Rule                                                                     |
|-----------|--------------------------------------------------------------------------|
| R-INV-1   | `commands` is append-only — RESET is the only action that clears it      |
| R-INV-2   | `currentStepIndex` is always `-1` or a valid index into `stepStatuses`   |
| R-INV-3   | `isPlaying` is set to `false` on STEP_ERROR and RESET                    |
| R-INV-4   | `error` is set to `null` on ADD_VEHICLE, STEP, RESET, IMPORT_COMMANDS    |
| R-INV-5   | `telemetry` is only updated by STEP_RESULT — never by other actions      |
| R-INV-6   | IMPORT_COMMANDS resets `stepStatuses`, `currentStepIndex`, and `telemetry` |

---

## Reactive Simulation Execution

The reducer handles user intent synchronously. The simulation engine is invoked reactively by `useSimulation`:

```typescript
// Inside useSimulation hook:
useEffect(() => {
  if (state.commands.length === 0) return;

  const result = runSimulation(state.commands, state.options);

  if (result.ok) {
    dispatch({ type: 'STEP_RESULT', payload: { stepStatuses: result.stepStatuses, telemetry: result.telemetry } });
  } else {
    dispatch({ type: 'STEP_ERROR', payload: result.error });
  }
}, [state.commands, state.options]);
```

This means every change to `commands` or `options` triggers a full re-simulation from the beginning. This is correct because the engine is deterministic — same input always produces the same output.

**Performance note**: The engine processes 100K commands in ~9ms. A typical GUI session of 500 commands takes <0.5ms. Re-simulation is not a bottleneck in the expected usage range.

---

## Context and Hook API

```typescript
// Context value exposed to all components
interface SimulationContextValue {
  state: SimulationState;
  dispatch: Dispatch<SimulationAction>;
}

// Convenience selectors (computed from state, not stored)
function useActivePhase(): PhaseId | null;
function useCurrentQueues(): Record<Road, string[]>;
function useLeavingVehicles(): string[];
```

The selector functions are implemented as standalone hooks that call `useSimulationContext()` internally. They prevent components from importing the full state shape when they only need one slice.

---

## Consequences

**Easier because of this decision:**
- Zero dependencies to install or upgrade.
- Reducer is a pure function — trivially testable with `simulationReducer(state, action)`.
- Full state is serializable — easy to snapshot in tests and compare.
- Actions are a discriminated union — TypeScript exhaustiveness checking catches missing cases.

**Harder because of this decision:**
- Any context consumer re-renders when any part of state changes. Mitigation: `React.memo` on TrafficLight and VehicleMarker (high-frequency render components).
- No devtools out-of-the-box. Mitigation: log actions in development mode inside the reducer or via a middleware wrapper.
- Async side effects live in `useEffect`, not in the reducer — requires discipline to keep clean.

---

## Rejected Alternatives

**Zustand**: Would solve the re-render problem with atomic subscriptions, but adds a dependency not in the approved tech stack and the re-render problem is theoretical at this scale.

**React Query**: Appropriate for server state (fetch/cache/sync), not for local simulation state that has no remote endpoint.

**XState**: Models state machines formally, which fits traffic lights conceptually. Rejected because the learning curve and setup cost exceed the benefit for a single-page simulation UI.
