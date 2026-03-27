# ADR-002: Safety Invariants — Collision-Free Traffic Light Logic

## Status

Accepted

## Date

2026-03-25

---

## Context

A traffic light simulation that permits conflicting green signals is unsafe and incorrect.
The primary correctness obligation of this system is to guarantee that no two conflicting
directions can simultaneously have a green phase.

Beyond the collision-free constraint, additional invariants govern queue integrity,
vehicle lifecycle, and state consistency. These invariants must be:

1. Formally stated (precise enough to write a test for).
2. Exhaustive (cover all safety-critical properties).
3. Enforced at every step, not just at boundaries.

This ADR formalises the five invariants that the implementation in `src/simulator/` must uphold.
These invariants are the acceptance criteria for T3 (conflict matrix) and T4 (step engine)
and are the primary input for the `fast-check` property-based tests.

---

## Decision

The following five invariants are formally adopted. All must hold at every point in time
during simulation execution.

---

### INV-1: No two conflicting directions green simultaneously

**Statement:**
For any active phase P, for all pairs of roads (r1, r2) included in P,
conflict(r1, r2) must be false.

**Formally:**

```
forall step s, forall phase P = activePhase(s):
  forall r1, r2 in P.greenRoads:
    r1 != r2 => NOT conflict(r1, r2)
```

**Conflict pairs** (from WORKFLOW-traffic-light-cycle.md):

- (north, east), (north, west)
- (south, east), (south, west)
- (north-left, south), (north-left, east)
- (south-left, north), (south-left, west)
- (east-left, west), (east-left, north)
- (west-left, east), (west-left, south)

For the base implementation (P1/P2 only):

- P1 green set: {north, south} — no conflict pair. SAFE.
- P2 green set: {east, west} — no conflict pair. SAFE.

**Testable as:** property-based test that generates arbitrary sequences of addVehicle/step
commands and asserts that currentPhase.greenRoads never contains a conflicting pair.

---

### INV-2: All-red gap between phase transitions

**Statement:**
When transitioning between two different phases, there is a defined all-red gap period.

**Simplified model:**
The all-red gap duration is **0** in the base implementation. This means transitions are
instantaneous — a step that ends P1 immediately begins P2 in the next step without an
intermediate all-red step.

**Rationale for gap = 0:**

- The simulation uses discrete logical steps, not time-continuous ticks.
- A single step already represents a quanta of time in which one phase is active.
- The transition happens between steps, which is an implicit all-red boundary.
- T8 may extend this with a configurable gap > 0.

**Formally:**

```
forall consecutive steps (s, s+1):
  if activePhase(s) != activePhase(s+1):
    allRedGapSteps >= 0   // currently 0; invariant is trivially satisfied
```

**Testable as:** verify that phase transitions do not produce impossible intermediate states
(e.g., two phases simultaneously active). Since the implementation uses a single currentPhase
scalar, this is structurally guaranteed by the type system.

---

### INV-3: Vehicle can only depart if its startRoad has green

**Statement:**
A vehicle V with V.startRoad = R may only appear in leftVehicles during a step in which
R is part of the active phase's green roads.

**Formally:**

```
forall step s, forall vehicleId v in stepStatus(s).leftVehicles:
  let V = findVehicle(v)
  V.startRoad in activePhase(s).greenRoads
```

**Testable as:** for every step result, assert that each vehicleId in leftVehicles
was enqueued on a road that is green in the current phase. This can be verified by
tracking vehicle-to-road mappings throughout the simulation.

---

### INV-4: FIFO ordering preserved per queue

**Statement:**
For any road R, if vehicle V1 was enqueued before vehicle V2, then V1 departs before V2.
No vehicle is skipped, reordered, or bypassed.

**Formally:**

```
forall road R:
  forall vehicles V1, V2 enqueued on R where enqueue_time(V1) < enqueue_time(V2):
    departure_step(V1) < departure_step(V2)
    OR V2 has not yet departed
```

**Testable as:** unit test that enqueues n vehicles on a single road, then executes n steps
with that road always green, and asserts departure order matches enqueue order.

**Implementation constraint:** the queue data structure must be a FIFO array (push to end,
shift from front). No priority queue, no random access removal.

---

### INV-5: Each vehicle crosses exactly once

**Statement:**
Each vehicle, identified by vehicleId, appears in leftVehicles at most once across the
entire simulation.

**Formally:**

```
let allDeparted = union of leftVehicles across all steps
forall v1, v2 in allDeparted where v1.vehicleId == v2.vehicleId:
  v1 == v2   // same entry, not two separate departures
```

**Testable as:** property-based test that accumulates all vehicleIds from all leftVehicles
arrays and checks for duplicates using a Set comparison.

**Implementation constraint:** once a vehicle is dequeued (departed), it must not re-enter
any queue. The dequeue operation is final.

---

## Invariant Test Matrix

| Invariant | Test type         | Tool       | Priority    |
| --------- | ----------------- | ---------- | ----------- |
| INV-1     | Property-based    | fast-check | CRITICAL    |
| INV-2     | Structural / type | TypeScript | LOW (gap=0) |
| INV-3     | Property-based    | fast-check | CRITICAL    |
| INV-4     | Unit test         | Vitest     | HIGH        |
| INV-5     | Property-based    | fast-check | HIGH        |

---

## All-red gap: extended model (future T8)

If T8 introduces a configurable all-red gap G > 0, INV-2 must be strengthened:

```
forall consecutive steps (s, s+1) where phase changes:
  exists steps [s+1, s+G] where activePhase = ALL_RED
  activePhase(s+G+1) = new phase
```

This is a future concern and does not affect the base implementation.

---

## Consequences

### What becomes easier

- Every invariant is expressed as a checkable predicate — direct mapping to
  `fast-check` property-based tests in T3 and T4.
- Code reviewers (agent 05) have a precise checklist for verifying implementation correctness.
- The reality checker (agent 08) can run invariant tests as part of the go/no-go gate.

### What becomes harder

- INV-5 requires the implementation to never re-enqueue a departed vehicle. This means
  vehicleId uniqueness tracking is a soft constraint (the system does not enforce it
  at addVehicle time, but departure logic must not produce duplicates by construction).

### Trade-offs accepted

- INV-2 with gap=0 is a simplification. Real traffic systems require a yellow phase and
  an all-red clearance interval. The simulation is intentionally simplified.
- INV-5 does not require uniqueness enforcement at addVehicle time — duplicate vehicleIds
  can be enqueued (they will produce duplicate strings in leftVehicles, which is the
  caller's responsibility to avoid).

---

## Spec-to-ADR traceability

| Workflow / requirement          | Covered by invariant |
| ------------------------------- | -------------------- |
| WF-1: conflict matrix           | INV-1                |
| WF-3: vehicle departure rules   | INV-3                |
| WF-2: FIFO queue constraint     | INV-4                |
| WF-5: one departure per vehicle | INV-5                |
| WF-1: phase transition safety   | INV-2                |
