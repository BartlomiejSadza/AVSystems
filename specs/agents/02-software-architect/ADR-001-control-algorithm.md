# ADR-001: Control Algorithm — Adaptive Round-Robin with Traffic Density Priority

## Status

Accepted

## Date

2026-03-25

---

## Context

The simulation must decide, at each `step` command, which phase (group of roads) receives
a green light. The recruitment task does not prescribe a specific algorithm, but it implies
intelligent, traffic-responsive behaviour: the simulator should let more vehicles through
when queues are larger.

Two candidate approaches were evaluated:

**Option A: Fixed round-robin**
Phases alternate in a predetermined cycle (P1 -> P2 -> P1 -> ...) regardless of queue state.

- Simple to implement and reason about.
- Wastes green time when one direction has no vehicles.
- Fails the implicit "smart simulation" expectation from the task description.

**Option B: Adaptive round-robin with density priority**
At each step, compute the total queue load for each phase candidate. Select the phase with
the highest load. Apply a deterministic tie-breaker when loads are equal.

- Slightly more complex but still O(1) per step.
- Produces better throughput for uneven traffic distributions.
- Fully deterministic (tie-breaker ensures reproducibility).
- Easy to test: any scenario with unequal queues has a verifiable expected phase.

**Option C: Min-cost flow or signal timing optimisation**
Globally optimal scheduling using graph algorithms.

- Disproportionate complexity for a simulation with 4 roads.
- Non-trivial to make deterministic without seeding.
- Not justified by the problem scope.

---

## Decision

Use **Option B: adaptive round-robin with traffic density priority**.

### Algorithm specification

```
function selectPhase(state: SimulationState): Phase {
  const ns_load = state.queues.get("north").length + state.queues.get("south").length
  const ew_load = state.queues.get("east").length  + state.queues.get("west").length

  if (ns_load > ew_load) return Phase.NS  // P1
  if (ew_load > ns_load) return Phase.EW  // P2

  // Tie-breaker: scan roads in fixed priority order
  // Priority order: north > south > east > west
  const priority: Road[] = ["north", "south", "east", "west"]
  for (const road of priority) {
    if (state.queues.get(road).length > 0) {
      return roadToPhase(road)  // north/south -> P1, east/west -> P2
    }
  }

  // All queues empty: retain current phase (no unnecessary switch)
  return state.currentPhase
}
```

### Properties

| Property         | Value                           |
| ---------------- | ------------------------------- |
| Time complexity  | O(1) per step                   |
| Space complexity | O(1) additional                 |
| Deterministic    | YES — no random elements        |
| Minimum phase    | 1 step per activation           |
| Maximum phase    | Unbounded — serves until outbid |
| Initial phase    | P1 (NS-straight)                |

### Tie-breaker priority order

Fixed: north > south > east > west.

Rationale: a fixed, documented order is sufficient. Any permutation would work;
this one is chosen because it is alphabetically and geographically intuitive.
The order is hardcoded, not configurable, to keep the model simple.

### Minimum 1 step per phase

The algorithm re-evaluates at every step. There is no minimum dwell counter beyond the
single step already spent. This means a phase can switch immediately if the other direction
becomes dominant on the next step. This is by design — maximum responsiveness.

---

## Consequences

### What becomes easier

- Throughput test scenarios are predictable: given known queue lengths, the expected
  active phase is deterministic and directly verifiable.
- No timer or clock dependency — the algorithm is purely a function of state.
- Replay of any scenario gives identical results (INV determinism requirement).
- T7 (adaptive algorithm task) has a clear, testable specification.

### What becomes harder

- Fixed round-robin scenarios cannot be directly simulated without injecting equal queues.
- The algorithm does not model minimum green-phase durations used in real traffic systems.
  If that requirement is added (T8), the algorithm must be extended with a step counter.

### Trade-offs accepted

- **Simplicity over real-world accuracy**: real intersections use timed cycles with minimum
  and maximum green durations. This model omits those constraints intentionally.
- **Throughput over fairness**: a continuously dominant direction could starve the other
  indefinitely. This is acceptable for the simulation scope; a future fairness extension
  (T11) could add a maximum starvation counter.

### Risks

- If both phases have equal load for many consecutive steps, the tie-breaker always favours
  P1 (north/south). This is a documented, intentional bias, not a bug.

---

## Spec-to-ADR traceability

| Workflow section                            | Covered here |
| ------------------------------------------- | ------------ |
| WF-4: Phase Selection algorithm             | YES          |
| WF-3: step uses phase result                | YES          |
| WORKFLOW-traffic-light-cycle.md Phase Table | YES          |
| Tie-breaker from REGISTRY.md WF-4           | YES          |

---

## Test cases for this ADR

### Test: EW dominant load selects P2

```
queues: { north: 0, south: 0, east: 3, west: 1 }
expected phase: P2 (EW-straight)
```

### Test: NS dominant load selects P1

```
queues: { north: 2, south: 1, east: 0, west: 0 }
expected phase: P1 (NS-straight)
```

### Test: tie with north non-empty selects P1

```
queues: { north: 2, south: 0, east: 1, west: 1 }
ns_load = 2, ew_load = 2 → tie
priority scan: north(2) → P1
expected phase: P1
```

### Test: all empty retains current phase

```
queues: all empty, currentPhase: P2
expected phase: P2 (retained)
```

All test cases: PASS (logical verification).
