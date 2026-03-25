# ADR-003: Domain Model — Types, Aggregates, and State

## Status
Accepted

## Date
2026-03-25

---

## Context

The simulation requires a clean, typed domain model that:

1. Represents all entities described in the recruitment task.
2. Is completely independent of the GUI layer (`app/`).
3. Maps directly to the JSON input/output contract.
4. Can be validated at runtime using zod schemas.
5. Is strict enough that TypeScript catches invalid states at compile time where possible.

This ADR defines the canonical types for the `src/simulator/` module.
All implementation tasks (T1–T5) derive their type signatures from this document.

---

## Decision

### Core domain types

#### Road

```typescript
// src/simulator/types.ts

export type Road = "north" | "south" | "east" | "west"

export const ROADS: Road[] = ["north", "south", "east", "west"]

export const ROAD_PRIORITY: Road[] = ["north", "south", "east", "west"]
// Used for deterministic tie-breaking in phase selection (ADR-001)
```

Rationale: union type instead of enum. Union types are lighter weight in TypeScript,
serialize cleanly to/from JSON without enum mapping, and are directly expressible in zod.

#### Vehicle

```typescript
export interface Vehicle {
  readonly vehicleId: string
  readonly startRoad: Road
  readonly endRoad: Road
}
```

Rationale: `readonly` on all fields — a vehicle's identity and route are immutable once created.
`endRoad` is stored for completeness and future extensions (e.g., turn-lane routing in T11),
but the base simulation does not use it for phase or conflict logic.

#### Command

```typescript
export type Command =
  | { type: "addVehicle"; vehicleId: string; startRoad: Road; endRoad: Road }
  | { type: "step" }
```

Rationale: discriminated union — TypeScript narrows the type after checking `command.type`.
This eliminates the need for runtime casts inside the processing loop.

#### Phase

```typescript
export type PhaseId = "NS" | "EW"

export interface Phase {
  readonly id: PhaseId
  readonly greenRoads: Readonly<Road[]>
}

export const PHASES: Record<PhaseId, Phase> = {
  NS: { id: "NS", greenRoads: ["north", "south"] },
  EW: { id: "EW", greenRoads: ["east", "west"] },
}
```

Rationale: `PHASES` is a constant lookup table. `greenRoads` is a readonly array to prevent
accidental mutation. Phase objects are value types — they are never mutated, only referenced.

#### SimulationState

```typescript
export interface SimulationState {
  queues: Map<Road, Vehicle[]>
  currentPhase: PhaseId
  stepCount: number
}
```

Rationale: `Map<Road, Vehicle[]>` provides O(1) lookup by road name and is idiomatic for
key-value stores in TypeScript. The array per road is the FIFO queue — mutations are
controlled through the simulator API (push/shift only).

`currentPhase` stores only the PhaseId (not the full Phase object) to keep state lean.
The full Phase object is resolved from `PHASES[currentPhase]` when needed.

`stepCount` is a diagnostic field used by the CLI and future telemetry (T14).

#### StepStatus

```typescript
export interface StepStatus {
  readonly leftVehicles: string[]
}
```

Rationale: `leftVehicles` contains vehicleId strings only — the output contract does not
require full Vehicle objects. `readonly` on the interface prevents callers from accidentally
mutating a returned status.

#### SimulationResult

```typescript
export interface SimulationResult {
  stepStatuses: StepStatus[]
}
```

This is the top-level output type written to the output JSON file.

---

### Zod schemas (src/io/schemas.ts)

These schemas validate the JSON input contract at runtime:

```typescript
import { z } from "zod"

export const RoadSchema = z.enum(["north", "south", "east", "west"])

export const AddVehicleCommandSchema = z.object({
  type: z.literal("addVehicle"),
  vehicleId: z.string().min(1),
  startRoad: RoadSchema,
  endRoad: RoadSchema,
})

export const StepCommandSchema = z.object({
  type: z.literal("step"),
})

export const CommandSchema = z.discriminatedUnion("type", [
  AddVehicleCommandSchema,
  StepCommandSchema,
])

export const InputSchema = z.object({
  commands: z.array(CommandSchema),
})

export const StepStatusSchema = z.object({
  leftVehicles: z.array(z.string()),
})

export const OutputSchema = z.object({
  stepStatuses: z.array(StepStatusSchema),
})
```

Rationale: discriminated union in zod (`z.discriminatedUnion`) produces clear, field-level
error messages and is directly aligned with the TypeScript discriminated union type.

---

### State initialisation

```typescript
export function createInitialState(): SimulationState {
  return {
    queues: new Map([
      ["north", []],
      ["south", []],
      ["east",  []],
      ["west",  []],
    ]),
    currentPhase: "NS",  // default initial phase (P1)
    stepCount: 0,
  }
}
```

The initial phase is `"NS"` (P1) — documented in ADR-001 and WF-1.

---

### Module boundary

```
src/
  simulator/
    types.ts          // All domain types above (Road, Vehicle, Command, Phase, SimulationState, StepStatus)
    phases.ts         // PHASES constant, ROAD_PRIORITY, conflict matrix
    queue.ts          // Queue operations: enqueue, dequeue, peek
    engine.ts         // addVehicle(), step(), selectPhase() — pure functions
    invariants.ts     // INV-1..5 as runtime-checkable predicate functions (used in tests)
  io/
    schemas.ts        // Zod schemas
    parser.ts         // parse(file) -> Command[]
    writer.ts         // write(file, SimulationResult)
scripts/
  simulate.ts         // CLI entry point
app/                  // Future Next.js GUI — must not import from src/simulator directly
                      // GUI uses a service adapter layer
```

**Key constraint:** `src/simulator/` has zero imports from `app/` or Next.js internals.
`app/` may import from `src/simulator/` through an adapter.

---

### Evolution strategy

The domain model is designed for extension without breaking changes:

| Extension scenario           | Required change                                         |
|------------------------------|----------------------------------------------------------|
| Add P3/P4 (left-turn phases) | Add to `PhaseId` union, add entry in `PHASES`, update conflict matrix |
| Add pedestrian phase         | New PhaseId, new greenRoads (empty road list)           |
| Emergency vehicle priority   | Add priority field to Vehicle; engine checks it before FIFO |
| Multiple lanes per road      | Change `queues: Map<Road, Vehicle[]>` to `Map<Road, Vehicle[][]>` |
| Configurable all-red gap     | Add `transitionGap: number` to SimulationState          |

All extensions are additive — no existing types need modification for the base cases above.

---

## Consequences

### What becomes easier

- T1 (domain model task) has precise type signatures to implement directly.
- T5 (JSON contract) has exact zod schemas to implement.
- Agent 04 (backend-architect) receives unambiguous type constraints.
- Agent 05 (code-reviewer) can verify type correctness against this ADR.
- Property-based tests (INV-1..5) can generate `SimulationState` values directly from types.

### What becomes harder

- Using `Map` instead of a plain object for queues is slightly more verbose in tests.
  Mitigation: provide a `createInitialState()` factory function to reduce boilerplate.
- discriminated union types require TypeScript narrowing — callers must switch on `type`
  before accessing type-specific fields.

### Trade-offs accepted

- **Immutability is partial**: `SimulationState.queues` entries are mutable arrays.
  Full immutability (e.g., using immutable.js) is not justified for this scope.
- **No vehicleId uniqueness enforcement** at the type level. The spec does not require it.
  INV-5 prevents double-departure by construction (dequeue is final), not by type constraint.
- **`endRoad` stored but unused in base logic**: this adds a tiny overhead but preserves
  the full vehicle context for extensions without schema changes.

---

## Spec-to-ADR traceability

| Requirement                          | Type / schema            |
|--------------------------------------|--------------------------|
| Roads: north, south, east, west      | Road union type          |
| Vehicle identity and route           | Vehicle interface        |
| addVehicle and step commands         | Command discriminated union |
| Phase groupings                      | Phase + PHASES constant  |
| Simulation state                     | SimulationState interface |
| leftVehicles output                  | StepStatus interface     |
| JSON input validation                | InputSchema (zod)        |
| JSON output contract                 | OutputSchema (zod)       |
