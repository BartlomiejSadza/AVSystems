# REGISTRY: Workflow Architect — Traffic Lights Simulation

## Registry version: 1.0
## Date: 2026-03-25
## Owner: 01-workflow-architect

---

## Overview

This registry catalogues every workflow in the Traffic Lights Simulation system.
Each entry records the trigger, preconditions, expected output, side effects, and recovery path.
This document is the authoritative map used by downstream agents (02, 03, 04) to allocate
implementation tasks and define tests.

---

## Workflow Index

| ID   | Name                          | Trigger              | Owner Layer      | Status   |
|------|-------------------------------|----------------------|------------------|----------|
| WF-1 | Traffic Light Cycle           | simulation bootstrap | src/simulator    | defined  |
| WF-2 | addVehicle Command Processing | JSON command         | src/simulator    | defined  |
| WF-3 | step Command Processing       | JSON command         | src/simulator    | defined  |
| WF-4 | Phase Selection (adaptive)    | step execution       | src/simulator    | defined  |
| WF-5 | Vehicle Departure             | step execution       | src/simulator    | defined  |
| WF-6 | JSON Input Parsing            | CLI invocation       | src/io           | defined  |
| WF-7 | JSON Output Writing           | CLI invocation       | src/io           | defined  |
| WF-8 | Error Handling                | any invalid input    | src/io + simulator | defined |

---

## WF-1: Traffic Light Cycle

**Trigger:** Simulation is initialised (first command processed or state initialised).

**Preconditions:**
- SimulationState is empty (stepCount = 0, all queues empty).

**Output:**
- An active phase is selected (initial default: NS-straight).
- Phase duration counter is set to 1 (minimum steps per phase).

**Side effects:**
- currentPhase is set in SimulationState.

**Recovery path:**
- If no valid initial phase exists (invariant violation), throw SimulationInitError.

**Reference:** WORKFLOW-traffic-light-cycle.md

---

## WF-2: addVehicle Command Processing

**Trigger:** A command of `type: "addVehicle"` appears in the command array.

**Preconditions:**
- Fields `vehicleId`, `startRoad`, `endRoad` are present and non-empty.
- `startRoad` and `endRoad` are valid Road enum values.

**Output:**
- Vehicle is appended to the FIFO queue for `startRoad`.
- No stepStatus entry is produced (addVehicle does not advance time).

**Side effects:**
- queues[startRoad] grows by one entry.

**Recovery path:**
- Missing field → ValidationError with field name.
- Invalid road name → ValidationError with allowed values.
- Duplicate vehicleId → accepted (no deduplication requirement in base spec).

**Reference:** WORKFLOW-command-processing.md

---

## WF-3: step Command Processing

**Trigger:** A command of `type: "step"` appears in the command array.

**Preconditions:**
- SimulationState is initialised.
- currentPhase is set.

**Output:**
- One StepStatus entry appended to stepStatuses.
- StepStatus.leftVehicles contains vehicleIds of vehicles that crossed this step.

**Side effects:**
- Vehicles are dequeued from roads whose startRoad matches the active green phase.
- stepCount incremented by 1.
- currentPhase may change (via WF-4).

**Recovery path:**
- Empty queues on all green roads → leftVehicles = [].
- Phase with no matching vehicles still produces a StepStatus entry.

**Reference:** WORKFLOW-command-processing.md

---

## WF-4: Phase Selection (Adaptive)

**Trigger:** Invoked at the start of each step execution (WF-3).

**Preconditions:**
- Current queue lengths are known.
- Conflict matrix is loaded.

**Output:**
- Next active phase is determined.
- Tie-breaker applied if queue lengths are equal.

**Side effects:**
- currentPhase in SimulationState is updated.

**Recovery path:**
- All queues empty → retain current phase (no starvation risk, no transition needed).
- Tie-breaker is deterministic: north > south > east > west road priority order.

**Reference:** ADR-001-control-algorithm.md (Agent 02)

---

## WF-5: Vehicle Departure

**Trigger:** Invoked during step execution after phase is confirmed active.

**Preconditions:**
- currentPhase is active.
- At least one road with green light has a non-empty queue.

**Output:**
- Up to one vehicle per green road is dequeued and added to leftVehicles.

**Side effects:**
- queues[road].shift() for each road with green status in currentPhase.

**Recovery path:**
- If queue is empty for a green road → skip silently, no error.

**Reference:** WORKFLOW-command-processing.md, ADR-002-safety-invariants.md (Agent 02)

---

## WF-6: JSON Input Parsing

**Trigger:** CLI receives `--input <file>` argument.

**Preconditions:**
- File exists and is readable.
- File content is valid UTF-8 JSON.

**Output:**
- Array of Command objects validated against zod schema.

**Side effects:** None (pure parse, no state mutation).

**Recovery path:**
- File not found → FileNotFoundError with path.
- Malformed JSON → ParseError with line hint.
- Schema violation → ValidationError per field via zod.

**Reference:** WORKFLOW-error-handling.md

---

## WF-7: JSON Output Writing

**Trigger:** All commands processed; simulation complete.

**Preconditions:**
- stepStatuses array is populated (may be empty if no step commands).

**Output:**
- JSON file written to `--output <file>` path with structure `{ "stepStatuses": [...] }`.

**Side effects:**
- Creates or overwrites the output file.

**Recovery path:**
- Write permission error → IOError with path.
- Empty stepStatuses → write `{ "stepStatuses": [] }` (valid output).

**Reference:** WORKFLOW-command-processing.md

---

## WF-8: Error Handling

**Trigger:** Any validation failure during WF-2, WF-3, WF-6, or WF-7.

**Preconditions:** N/A — reactive workflow.

**Output:**
- Structured error written to stderr.
- Process exits with non-zero code.

**Side effects:**
- Simulation state is NOT mutated after an error.

**Recovery path:**
- Partial command arrays: commands before the error may have executed.
- Error message format: `{ "error": "<type>", "message": "<detail>", "field": "<name>" }`.

**Reference:** WORKFLOW-error-handling.md

---

## Conflict Matrix Summary

| Road A direction | Road B direction | Conflict? |
|------------------|------------------|-----------|
| north-straight   | south-straight   | NO        |
| north-straight   | east-straight    | YES       |
| north-straight   | west-straight    | YES       |
| east-straight    | west-straight    | NO        |
| north-left       | east-straight    | YES       |
| north-left       | south-straight   | YES       |
| east-left        | north-straight   | YES       |
| east-left        | west-straight    | YES       |

Full conflict matrix is in WORKFLOW-traffic-light-cycle.md.

---

## Coverage Verification (Test: completeness)

| Requirement                          | Covered by Workflow |
|--------------------------------------|---------------------|
| addVehicle enqueues to correct road  | WF-2                |
| FIFO order preserved                 | WF-2, WF-5          |
| step produces leftVehicles           | WF-3, WF-5          |
| No collision between green phases    | WF-4, WF-1          |
| Error on invalid command type        | WF-8                |
| Error on invalid road name           | WF-2, WF-8          |
| Empty commands array is valid        | WF-6, WF-7          |
| JSON contract on output              | WF-7                |
| CLI single command invocation        | WF-6, WF-7          |

All 9 requirements are covered. Completeness gate: PASS.
