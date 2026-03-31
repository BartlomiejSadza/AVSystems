/**
 * Safety invariant checks for the simulation state.
 *
 * These are runtime assertions that document and enforce key correctness
 * properties.  They are intended to be called after every mutating operation
 * during testing and in development builds.
 *
 * Each check returns a `{ ok: true }` on success or `{ ok: false, reason: string }`
 * on failure — never throws — so callers decide how to handle violations.
 */

import { ROADS, type Road, type SimulationState } from './types.js';
import { PHASES, SIGNAL_PHASE_RING } from './phase.js';

export type InvariantResult = { ok: true } | { ok: false; reason: string };

const SEGMENTS = new Set(['GREEN', 'YELLOW', 'ALL_RED']);

/** Check that the queues map contains exactly the four road keys. */
export function checkQueuesComplete(state: SimulationState): InvariantResult {
  for (const road of ROADS) {
    if (!state.queues.has(road)) {
      return { ok: false, reason: `Queue missing for road: ${road}` };
    }
  }
  if (state.queues.size !== ROADS.length) {
    return {
      ok: false,
      reason: `Expected ${ROADS.length} road queues, got ${state.queues.size}`,
    };
  }
  return { ok: true };
}

/** Check that no vehicle ID appears more than once across all queues. */
export function checkNoDuplicateVehicles(state: SimulationState): InvariantResult {
  const seen = new Set<string>();
  for (const [road, queue] of state.queues) {
    for (const vehicle of queue) {
      if (seen.has(vehicle.vehicleId)) {
        return {
          ok: false,
          reason: `Duplicate vehicleId "${vehicle.vehicleId}" found on road "${road}"`,
        };
      }
      seen.add(vehicle.vehicleId);
    }
  }
  return { ok: true };
}

/** Check that all vehicle startRoad values match their containing queue. */
export function checkVehicleRoadConsistency(state: SimulationState): InvariantResult {
  for (const [road, queue] of state.queues) {
    for (const vehicle of queue) {
      if (vehicle.startRoad !== road) {
        return {
          ok: false,
          reason: `Vehicle "${vehicle.vehicleId}" has startRoad "${vehicle.startRoad}" but is in queue for "${road}"`,
        };
      }
    }
  }
  return { ok: true };
}

/** Check that stepCount is a non-negative integer. */
export function checkStepCount(state: SimulationState): InvariantResult {
  if (!Number.isInteger(state.stepCount) || state.stepCount < 0) {
    return {
      ok: false,
      reason: `stepCount must be a non-negative integer, got ${state.stepCount}`,
    };
  }
  return { ok: true };
}

/** Check signal phase id and segment fields. */
export function checkSignalControllerState(state: SimulationState): InvariantResult {
  if (!SIGNAL_PHASE_RING.includes(state.currentSignalPhaseId)) {
    return {
      ok: false,
      reason: `currentSignalPhaseId must be a known phase, got ${state.currentSignalPhaseId}`,
    };
  }
  if (!SEGMENTS.has(state.segmentKind)) {
    return {
      ok: false,
      reason: `segmentKind must be GREEN, YELLOW, or ALL_RED, got ${state.segmentKind}`,
    };
  }
  if (!Number.isInteger(state.segmentTicksRemaining) || state.segmentTicksRemaining < 0) {
    return {
      ok: false,
      reason: `segmentTicksRemaining must be a non-negative integer, got ${state.segmentTicksRemaining}`,
    };
  }
  if (
    !Number.isInteger(state.greenTicksElapsedInCurrentGreen) ||
    state.greenTicksElapsedInCurrentGreen < 0
  ) {
    return {
      ok: false,
      reason: `greenTicksElapsedInCurrentGreen must be a non-negative integer, got ${state.greenTicksElapsedInCurrentGreen}`,
    };
  }
  if (
    !Number.isInteger(state.lastServedPhaseIndex) ||
    state.lastServedPhaseIndex < -1 ||
    state.lastServedPhaseIndex > 3
  ) {
    return {
      ok: false,
      reason: `lastServedPhaseIndex must be -1..3, got ${state.lastServedPhaseIndex}`,
    };
  }
  const f = state.forcedPhaseAfterAllRed;
  if (f !== null && !SIGNAL_PHASE_RING.includes(f)) {
    return {
      ok: false,
      reason: `forcedPhaseAfterAllRed must be null or a known phase, got ${f}`,
    };
  }
  return { ok: true };
}

/** Check that roads in any active phase do not conflict (no NS mixed with EW in one row). */
export function checkPhaseRoadsNonConflicting(_state: SimulationState): InvariantResult {
  const nsRoads = new Set<Road>(['north', 'south']);
  const ewRoads = new Set<Road>(['east', 'west']);

  for (const phase of PHASES) {
    const hasNS = phase.roads.some((r) => nsRoads.has(r));
    const hasEW = phase.roads.some((r) => ewRoads.has(r));
    if (hasNS && hasEW) {
      return {
        ok: false,
        reason: `Phase "${phase.id}" mixes NS and EW roads — this would cause a collision`,
      };
    }
  }
  return { ok: true };
}

/** Run all invariants and return all failures (empty array = all pass). */
export function checkAllInvariants(state: SimulationState): InvariantResult[] {
  const checks = [
    checkQueuesComplete,
    checkNoDuplicateVehicles,
    checkVehicleRoadConsistency,
    checkStepCount,
    checkSignalControllerState,
    checkPhaseRoadsNonConflicting,
  ];
  return checks.map((fn) => fn(state)).filter((r) => !r.ok);
}

/**
 * Assert all invariants hold; throw an `Error` with all failure reasons
 * if any check fails.  Intended for test setup and development guards.
 */
export function assertInvariants(state: SimulationState): void {
  const failures = checkAllInvariants(state);
  if (failures.length > 0) {
    const reasons = failures
      .filter((r): r is { ok: false; reason: string } => !r.ok)
      .map((r) => r.reason)
      .join('\n  ');
    throw new Error(`Simulation invariant violation(s):\n  ${reasons}`);
  }
}
