# Traffic Lights Simulation

> A 4-way intersection traffic light simulator: feed it JSON commands, get back which vehicles cleared the intersection each tick.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-1095%2B%20passing-brightgreen.svg)](#run-tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why This Exists

Traffic intersections require provably safe light sequencing — at no point should two conflicting directions be green at the same time. This simulator models a 4-way intersection with an adaptive phase-selection algorithm that maximises throughput while enforcing the collision-free safety invariant. It is designed as a pure domain engine: deterministic, fully tested, and completely independent from any GUI or I/O framework.

## Quick Start

```bash
pnpm simulate --input ./input.json --output ./output.json
```

## Installation

**Prerequisites:**

- Node.js >= 22
- pnpm >= 10

```bash
# Clone the repository
git clone https://github.com/your-org/traffic-lights-simulation.git
cd traffic-lights-simulation

# Install dependencies
pnpm install
```

## CLI Usage

```bash
pnpm simulate --input <path-to-input.json> --output <path-to-output.json>
```

**Options:**

| Flag | Description |
|------|-------------|
| `--input <path>` | Path to the input JSON file (required) |
| `--output <path>` | Path to write the output JSON file (required) |
| `--help` | Print usage information |

**Example with the included sample files:**

```bash
pnpm simulate --input ./input.json --output ./output.json
```

On success, the CLI prints:

```
Simulation complete. 4 step(s) written to "./output.json".
```

## Input / Output Format

### Input

The input file contains a JSON object with a `commands` array. Two command types are supported.

**`addVehicle`** — places a vehicle in the queue for its starting road:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"addVehicle"` | yes | Command discriminator |
| `vehicleId` | `string` | yes | Unique vehicle identifier |
| `startRoad` | `"north" \| "south" \| "east" \| "west"` | yes | Road the vehicle enters from |
| `endRoad` | `"north" \| "south" \| "east" \| "west"` | yes | Road the vehicle exits onto |
| `priority` | `"normal" \| "emergency"` | no | Defaults to `"normal"`. Emergency vehicles jump to the front of their road queue and force their phase active. |

**`step`** — advances the simulation by one tick. The engine selects the active phase, dequeues the front vehicle from each road in that phase, and records which vehicles left.

**Full example (`input.json`):**

```json
{
  "commands": [
    { "type": "addVehicle", "vehicleId": "vehicle1", "startRoad": "south", "endRoad": "north" },
    { "type": "addVehicle", "vehicleId": "vehicle2", "startRoad": "north", "endRoad": "south" },
    { "type": "step" },
    { "type": "step" },
    { "type": "addVehicle", "vehicleId": "vehicle3", "startRoad": "west", "endRoad": "south" },
    { "type": "addVehicle", "vehicleId": "vehicle4", "startRoad": "west", "endRoad": "south" },
    { "type": "step" },
    { "type": "step" }
  ]
}
```

### Output

The output file contains a JSON object with a `stepStatuses` array — one entry per `step` command, in order.

| Field | Type | Description |
|-------|------|-------------|
| `leftVehicles` | `string[]` | IDs of vehicles that cleared the intersection this tick. Empty array if no vehicle departed. |

**Full example (`output.json`):**

```json
{
  "stepStatuses": [
    { "leftVehicles": ["vehicle21", "vehicle1"] },
    { "leftVehicles": [] },
    { "leftVehicles": ["vehicle3"] },
    { "leftVehicles": ["vehicle4"] }
  ]
}
```

> Note: `vehicle21` in the sample output is a vehicle pre-loaded in the state before the example commands run.

## Algorithm

### Adaptive Phase Selection

The intersection operates with two mutually exclusive phases:

| Phase | Roads with green light |
|-------|----------------------|
| `NS_STRAIGHT` | north + south |
| `EW_STRAIGHT` | east + west |

Each `step` command, the engine selects one phase using this algorithm:

1. **Emergency override.** If any road has an emergency vehicle at the front of its queue, the phase containing that road is forced active immediately. This ensures emergency vehicles are never delayed by normal traffic.

2. **Weighted load comparison.** For each phase, the engine computes the combined weighted queue length across its roads (`weightedLoad = Σ queueLength(road) × weight(road)`). The phase with the higher weighted load wins.

3. **Tie-breaking.** When both phases have equal load (including when all queues are empty), the engine alternates: it picks the phase whose index differs from the last active phase. At simulation start, phase 0 (`NS_STRAIGHT`) goes first.

**Why adaptive?** A fixed round-robin wastes green time when one axis is empty and the other has queued vehicles. Adaptive selection prioritises whichever direction has more vehicles, reducing average wait time.

**Road priority weights** (optional, programmatic API only) let you bias phase selection — for example, giving a bus lane weight `2.0` means that road is treated as if it had twice as many vehicles when comparing phase loads.

### Safety Invariant

The simulator enforces a structural safety guarantee: **no two conflicting directions are ever green at the same time**. North/south and east/west are the only two phase groups; they never overlap. This invariant is checked at runtime (`assertInvariants`) and is verified by 1095+ automated tests including property-based tests using fast-check.

### Transition Phases

Real-world intersections use amber and all-red clearance intervals between green phases. This simulation models those transitions as **instantaneous** — each `step` moves directly from one green phase to the next with no intermediate tick. The design prioritises simplicity and throughput for the simulation use case.

## Run Tests

```bash
pnpm test
```

This runs 1095+ tests covering:

- Unit tests (queue, phase selection, engine, invariants, telemetry)
- Contract tests (JSON schema validation via zod)
- Integration tests (multi-command sequences)
- Golden tests (input/output fixture regression)
- Invariant tests (safety properties)
- Property-based tests (fast-check randomised inputs)
- End-to-end tests (CLI smoke tests)
- Smoke tests

**Additional test commands:**

```bash
pnpm test:watch      # Watch mode — re-runs on file changes
pnpm test:coverage   # Generate coverage report
pnpm typecheck       # TypeScript strict-mode check (no emit)
```

## Run Benchmarks

```bash
pnpm bench
```

Benchmarks exercise the simulation engine at multiple scales: 100, 1 000, 10 000, and 100 000 commands. Typical result: **100 000 commands in ~9ms average**.

## GUI

The project includes a pixel-art canvas-based GUI built with Next.js 15 and React 19. The GUI renders the 4-way intersection with animated traffic lights, moving vehicles, and NPC pedestrians.

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The GUI is a visual layer only — it calls the same pure simulator engine used by the CLI.

## Programmatic API

You can use the simulator directly from TypeScript without the CLI:

```typescript
import { simulate } from './src/simulator/engine.js';
import type { Command } from './src/simulator/types.js';

const commands: Command[] = [
  { type: 'addVehicle', vehicleId: 'v1', startRoad: 'north', endRoad: 'south' },
  { type: 'addVehicle', vehicleId: 'v2', startRoad: 'east', endRoad: 'west' },
  { type: 'step' },
  { type: 'step' },
];

const results = simulate(commands);
// results[0].leftVehicles => ['v1']  (NS_STRAIGHT phase)
// results[1].leftVehicles => ['v2']  (EW_STRAIGHT phase)
```

For telemetry data alongside step results:

```typescript
import { simulateWithTelemetry } from './src/simulator/engine.js';

const { stepStatuses, telemetry } = simulateWithTelemetry(commands);
```

## Architecture

```
src/simulator/   # Pure domain logic — no I/O, no framework dependencies
  engine.ts      # simulate() and simulateWithTelemetry() entry points
  phase.ts       # Phase definitions and adaptive selectPhase() algorithm
  queue.ts       # Per-road FIFO queues with emergency-priority insertion
  invariants.ts  # Runtime safety assertion checks
  types.ts       # Core domain types (Vehicle, Command, StepStatus, etc.)
  telemetry.ts   # Optional per-step metrics accumulator

src/io/          # JSON parsing (input) and serialisation (output)
scripts/         # CLI entry point (simulate.ts) and benchmarks (bench.ts)
app/             # Next.js GUI (pages, canvas renderer, React components)
specs/           # Spec Control Tower — single source of truth for project state
```

Key constraint: `src/simulator/` has zero dependencies on the GUI layer, I/O layer, or any external framework. It accepts plain TypeScript objects and returns plain TypeScript objects.

## Limitations and Possible Extensions

### Current Limitations

- **Two phases only.** The simulator models straight-through movement on two axes (NS and EW). Left-turn and right-turn dedicated phases are not implemented.
- **One vehicle per road per step.** Each `step` dequeues at most one vehicle per road in the active phase. Real intersections may clear multiple vehicles per green cycle.
- **Instantaneous transitions.** Amber and all-red clearance ticks are modelled as zero-duration. Adding explicit transition ticks would require changes to the phase state machine.
- **No vehicle routing.** The `endRoad` field is stored but not used for routing decisions. All vehicles on a road are treated identically regardless of their destination.
- **Single intersection.** The simulator models one isolated intersection. Multi-intersection coordination (green waves, coordinated signals) is out of scope.
- **No persistence.** Simulation state is in-memory only. There is no checkpoint/resume mechanism.

### Possible Extensions

- **Turn phases.** Add `NS_LEFT_TURN` and `EW_LEFT_TURN` phases with protected left-turn signals.
- **Variable green duration.** Allow a phase to hold for multiple ticks based on queue depth rather than switching every tick.
- **Explicit transition ticks.** Model amber and all-red intervals as distinct simulation ticks.
- **Multi-intersection network.** Connect multiple simulator instances to model arterial roads with coordinated signal timing.
- **Persistent state.** Serialise and resume simulation state from a checkpoint file.
- **Metrics dashboard.** Surface per-road wait times, average throughput, and phase utilisation via the telemetry API.

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Next.js | >=15 | GUI framework |
| TypeScript | >=5.6 (strict) | Language |
| pnpm | >=10 | Package manager |
| Node.js | >=22 | Runtime |
| Vitest | >=2 | Test runner |
| fast-check | >=3 | Property-based testing |
| zod | >=3 | JSON schema validation |
| tinybench | >=2 | Performance benchmarks |
| ESLint + Prettier | latest | Linting and formatting |
| GitHub Actions | — | CI |

## Contributing

1. Create a short-lived branch from `main`.
2. Follow conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
3. Every PR requires a description, test plan, test results, and green CI.
4. Spec documents are written in Polish. Code, commits, and documentation are in English.

## License

MIT
