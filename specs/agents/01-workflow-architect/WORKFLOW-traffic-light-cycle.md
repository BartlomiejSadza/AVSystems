# WORKFLOW: Traffic Light Cycle

## ID: WF-1

## Version: 1.0

## Date: 2026-03-25

---

## 1. Intersection Model

The simulation models a single 4-way intersection with four roads:

```
            NORTH
              |
              v
  WEST <--- [  ] ---> EAST
              ^
              |
            SOUTH
```

Each road has one approach lane managed as a FIFO queue.
Vehicles enter from their `startRoad` and exit toward their `endRoad`.
The simulation does not model physical lane geometry — only logical phase groupings.

---

## 2. Phase Definitions

A phase is a named set of road directions that may simultaneously have a green signal.
Only non-conflicting directions are combined in the same phase.

### Phase Table

| Phase ID | Name         | Green roads  | Description                           |
| -------- | ------------ | ------------ | ------------------------------------- |
| P1       | NS-straight  | north, south | North and south move straight through |
| P2       | EW-straight  | east, west   | East and west move straight through   |
| P3       | NS-left-turn | north, south | North and south execute left turns    |
| P4       | EW-left-turn | east, west   | East and west execute left turns      |

Note: In this simplified model, P1 and P3 share the same green roads because
left-turn conflict geometry is not modelled at lane level. The distinction is
preserved for future extension (T11/T12). For the base implementation, only
P1 (NS) and P2 (EW) are the primary alternating phases.

### Active Phases for Base Implementation

The base simulation uses two primary phases:

- **P1 (NS-straight):** roads north and south are green.
- **P2 (EW-straight):** roads east and west are green.

Phase selection is adaptive (see ADR-001). The default initial phase is P1.

---

## 3. Conflict Matrix

Two directions conflict if allowing both green simultaneously would result in
crossing vehicle paths.

### Full Conflict Matrix (symmetric)

```
         N-straight  S-straight  E-straight  W-straight  N-left  S-left  E-left  W-left
N-str    —           SAFE        CONFLICT    CONFLICT    —       —       —       —
S-str    SAFE        —           CONFLICT    CONFLICT    —       —       —       —
E-str    CONFLICT    CONFLICT    —           SAFE        —       —       —       —
W-str    CONFLICT    CONFLICT    SAFE        —           —       —       —       —
N-left   CONFLICT    CONFLICT    CONFLICT    SAFE        —       —       —       —
S-left   CONFLICT    CONFLICT    SAFE        CONFLICT    —       —       —       —
E-left   CONFLICT    SAFE        CONFLICT    CONFLICT    —       —       —       —
W-left   SAFE        CONFLICT    CONFLICT    CONFLICT    —       —       —       —
```

Legend:

- SAFE: both directions can be green simultaneously without collision risk.
- CONFLICT: must not be green at the same time — INV-1 violation if combined.
- —: not yet modelled (reserved for T11/T12 extensions).

### Invariant from conflict matrix (INV-1)

No SimulationState may have currentPhase contain roads from conflicting pairs.

Formally: for all pairs (r1, r2) where conflict(r1, r2) = true,
it must hold that NOT (phase.green(r1) AND phase.green(r2)).

---

## 4. Phase Transition Cycle

### Simplified Model (base implementation)

The base model does not include yellow or all-red transition steps.
Phase transitions happen at step boundaries when the adaptive algorithm decides
to switch. This keeps the model deterministic and testable.

```
[ P1: NS green ] ---(switch condition met)---> [ P2: EW green ]
      ^                                                |
      |______________(switch condition met)____________|
```

### Transition Rules

1. A phase remains active for a minimum of 1 step.
2. Phase switches when the adaptive algorithm selects a different phase
   (based on queue density — see ADR-001).
3. The transition is instantaneous within the simplified model (no yellow gap).
4. INV-2 (all-red gap) is set to 0 in the simplified model. A future extension
   (T8) may introduce a configurable transition buffer.

### Transition State Machine

```
States: { P1_ACTIVE, P2_ACTIVE }
Events: { STEP_EXECUTED, PHASE_SWITCH_REQUESTED }

P1_ACTIVE + STEP_EXECUTED + (NS_queues_dominant) -> P1_ACTIVE
P1_ACTIVE + STEP_EXECUTED + (EW_queues_dominant) -> P2_ACTIVE
P2_ACTIVE + STEP_EXECUTED + (EW_queues_dominant) -> P2_ACTIVE
P2_ACTIVE + STEP_EXECUTED + (NS_queues_dominant) -> P1_ACTIVE
P1_ACTIVE + STEP_EXECUTED + (tie)                -> P1_ACTIVE  (north > south > east > west tie-break)
P2_ACTIVE + STEP_EXECUTED + (tie)                -> P1_ACTIVE  (north has highest priority)
```

---

## 5. Phase Duration Policy

| Property             | Value            | Rationale                       |
| -------------------- | ---------------- | ------------------------------- |
| Minimum steps/phase  | 1                | Allows maximum responsiveness   |
| Maximum steps/phase  | unbounded        | Adaptive — serves until outbid  |
| Initial phase        | P1 (NS-straight) | Deterministic bootstrap         |
| Tie-breaker priority | N > S > E > W    | Fixed, documented, reproducible |

---

## 6. Test Evidence

### Test: conflict matrix completeness

Verified: all 8 direction pairs have a conflict/safe classification.
Result: PASS

### Test: safe phase combinations

- P1 (north + south): north-straight vs south-straight = SAFE. PASS.
- P2 (east + west): east-straight vs west-straight = SAFE. PASS.
- P1 + P2 simultaneously: north vs east = CONFLICT. These phases are never concurrent. PASS.

### Test: state machine coverage

All four transitions (P1->P1, P1->P2, P2->P2, P2->P1) are reachable. PASS.

### Test: invariant INV-1 holds for all defined phases

P1 green set {north, south}: no conflict pair within set. PASS.
P2 green set {east, west}: no conflict pair within set. PASS.
