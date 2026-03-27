# WORKFLOW: Command Processing

## ID: WF-2, WF-3, WF-5

## Version: 1.0

## Date: 2026-03-25

---

## 1. JSON Input Contract

### Input schema

```json
{
  "commands": [
    {
      "type": "addVehicle",
      "vehicleId": "string",
      "startRoad": "north|south|east|west",
      "endRoad": "north|south|east|west"
    },
    { "type": "step" }
  ]
}
```

### Output schema

```json
{
  "stepStatuses": [{ "leftVehicles": ["vehicleId1", "vehicleId2"] }]
}
```

Rules:

- One StepStatus entry is produced per `step` command, in order.
- `addVehicle` commands produce no entry in `stepStatuses`.
- `leftVehicles` may be empty `[]` if no vehicle crossed in that step.

---

## 2. addVehicle Flow (WF-2)

### Trigger

A command object with `type: "addVehicle"` is encountered during command processing.

### Precondition checks (in order)

1. `type` field exists and equals `"addVehicle"`.
2. `vehicleId` is present and is a non-empty string.
3. `startRoad` is present and is one of: `north`, `south`, `east`, `west`.
4. `endRoad` is present and is one of: `north`, `south`, `east`, `west`.

If any check fails, throw ValidationError and halt processing (see WORKFLOW-error-handling.md).

### Execution steps

```
1. Validate fields (above).
2. Construct Vehicle object: { vehicleId, startRoad, endRoad }.
3. Look up queue: state.queues.get(startRoad).
4. Push vehicle to end of queue (FIFO append).
5. Return — no stepStatus produced.
```

### State mutation

```
BEFORE: state.queues[startRoad] = [v1, v2, ..., vN]
AFTER:  state.queues[startRoad] = [v1, v2, ..., vN, newVehicle]
```

No other state fields are mutated.

### FIFO invariant (INV-4)

Vehicles depart from a road in the same order they were enqueued.
The queue is a strict FIFO structure (array with push/shift semantics).
No reordering, sorting, or priority insertion is permitted.

---

## 3. step Flow (WF-3 + WF-4 + WF-5)

### Trigger

A command object with `type: "step"` is encountered during command processing.

### Execution steps (ordered)

```
1. Invoke Phase Selection (WF-4) to determine activePhase for this step.
2. Collect green roads: greenRoads = activePhase.roads.
3. For each road in greenRoads (in road priority order: N, S, E, W):
   a. If queue[road] is non-empty:
      i.  Dequeue front vehicle: vehicle = queue[road].shift().
      ii. Append vehicle.vehicleId to leftVehicles[].
4. Construct StepStatus: { leftVehicles }.
5. Append StepStatus to stepStatuses[].
6. Increment state.stepCount by 1.
7. Return StepStatus.
```

### State mutation per step

```
BEFORE:
  state.queues[road_i] = [v_front, v_next, ...]
  state.stepCount = N
  state.currentPhase = P_old

AFTER:
  state.queues[road_i] = [v_next, ...]     (front vehicle removed if road had green)
  state.stepCount = N + 1
  state.currentPhase = P_new               (may equal P_old)
  stepStatuses = [..., { leftVehicles: [v_front.vehicleId, ...] }]
```

### Edge cases

| Scenario                           | Behaviour                              |
| ---------------------------------- | -------------------------------------- |
| All queues empty                   | leftVehicles = [], StepStatus produced |
| Green road queue empty             | That road contributes nothing          |
| Red road queue non-empty           | Vehicles wait; not dequeued            |
| Multiple green roads with vehicles | One vehicle per road dequeued per step |

---

## 4. Phase Selection Sub-flow (WF-4)

### Purpose

Determines which phase (P1 or P2) is active for the current step.

### Algorithm: Adaptive round-robin with density priority

```
1. Compute queue length for each phase candidate:
   - NS_load = len(queues[north]) + len(queues[south])
   - EW_load = len(queues[east]) + len(queues[west])

2. Compare loads:
   a. If NS_load > EW_load  → select P1 (NS-straight).
   b. If EW_load > NS_load  → select P2 (EW-straight).
   c. If NS_load == EW_load → apply tie-breaker (see below).

3. Tie-breaker (deterministic):
   - Road priority order: north > south > east > west.
   - Check roads in priority order; the first road with a non-empty queue wins.
   - If all queues are empty: retain currentPhase (no switch).
   - If all relevant queues are empty and tied at 0: retain currentPhase.

4. Set state.currentPhase to selected phase.
5. Return selected phase.
```

### Tie-breaker example

```
queues: { north: 0, south: 2, east: 2, west: 0 }
NS_load = 2, EW_load = 2 → tie
Priority scan: north(0) skip, south(2) → south is non-empty → P1 selected
```

### Minimum phase duration

A phase may be active for a minimum of 1 step. There is no maximum.
The algorithm re-evaluates every step, allowing immediate phase switches.

---

## 5. Full Processing Pipeline

```
parse_input(file)
  -> validate JSON schema (zod)
  -> for each command in commands[]:
       if command.type == "addVehicle":
         addVehicle(state, command)        // WF-2
       else if command.type == "step":
         result = step(state)              // WF-3 + WF-4 + WF-5
         stepStatuses.push(result)
       else:
         throw UnknownCommandError
  -> write_output(file, { stepStatuses })  // WF-7
```

---

## 6. State Transitions Summary

| Event              | stepCount | currentPhase | queues               | stepStatuses |
| ------------------ | --------- | ------------ | -------------------- | ------------ |
| Init               | 0         | P1 (default) | all empty            | []           |
| addVehicle         | unchanged | unchanged    | startRoad +1         | unchanged    |
| step (vehicles)    | +1        | recalculated | green roads -1 front | +1 entry     |
| step (no vehicles) | +1        | recalculated | unchanged            | +1 entry     |

---

## 7. Test Evidence

### Test: happy path addVehicle

Input: `{ "type": "addVehicle", "vehicleId": "V1", "startRoad": "north", "endRoad": "south" }`
Expected: queues[north] = [V1], stepStatuses unchanged.
Result: PASS

### Test: happy path step with vehicle

State: queues[north] = [V1], queues[south] = [V2], currentPhase = P1
Step executed.
Expected: leftVehicles = ["V1", "V2"], queues[north] = [], queues[south] = [].
Result: PASS

### Test: step with empty queues

State: all queues empty, currentPhase = P1.
Step executed.
Expected: leftVehicles = [], StepStatus produced.
Result: PASS

### Test: FIFO ordering

Enqueue V1, V2, V3 on north. Step (P1 active).
Expected: V1 dequeued first, V2 second, V3 third across successive steps.
Result: PASS

### Test: phase selection tie-breaker

NS_load = EW_load = 2, north is empty, south has 2. Expected: P1 selected.
Result: PASS

### Test: phase switches when EW dominant

NS_load = 0, EW_load = 3. Expected: P2 selected.
Result: PASS
