/**
 * Traffic-light phase definitions and adaptive phase selection.
 *
 * A "phase" is a set of roads that share a green light simultaneously.
 * The two phases below are collision-free (no crossing paths):
 *
 *   Phase 0 — NS_STRAIGHT : north + south move simultaneously
 *   Phase 1 — EW_STRAIGHT : east  + west  move simultaneously
 *
 * Phase selection is adaptive: the phase whose roads have the highest
 * combined weighted queue length is preferred.  When both phases are tied
 * (including when both are empty), the system alternates starting with Phase 0.
 *
 * Road priority weights (default 1.0) can be supplied to bias phase selection
 * in favour of high-priority roads (e.g. a bus lane or emergency corridor).
 */

import type { Road, RoadPriorities, SimulationState } from './types.js';
import { queueLength } from './queue.js';

/** Human-readable phase identifier. */
export type PhaseId = 'NS_STRAIGHT' | 'EW_STRAIGHT';

/** Describes a single traffic-light phase. */
export interface Phase {
  /** Unique index used internally for tie-breaking and sequencing. */
  index: number;
  /** Semantic name of this phase. */
  id: PhaseId;
  /** Roads that receive a green light in this phase. */
  roads: readonly Road[];
}

/** Ordered list of all phases.  Index must match array position. */
export const PHASES: readonly Phase[] = [
  { index: 0, id: 'NS_STRAIGHT', roads: ['north', 'south'] },
  { index: 1, id: 'EW_STRAIGHT', roads: ['east', 'west'] },
] as const;

/**
 * Resolve the effective weight for a road.
 * Falls back to 1.0 when the road is not listed in priorities.
 * Clamps to a minimum of 0 to avoid negative-load anomalies.
 */
function resolveWeight(road: Road, priorities?: RoadPriorities): number {
  const w = priorities?.[road] ?? 1.0;
  return Math.max(0, w);
}

/**
 * Compute the combined weighted queue length for all roads in a phase.
 *
 * weightedLoad = Σ (queueLength(road) * weight(road))
 *
 * With default weights of 1.0 this is identical to the unweighted load.
 */
export function phaseLoad(
  state: SimulationState,
  phase: Phase,
  priorities?: RoadPriorities
): number {
  return phase.roads.reduce((sum, road) => {
    const len = queueLength(state, road);
    const weight = resolveWeight(road, priorities);
    return sum + len * weight;
  }, 0);
}

/**
 * Select the phase that should be active for the next simulation step.
 *
 * Algorithm:
 *  1. Compute weighted load for every phase (weights default to 1.0).
 *  2. Check if any road in any phase has an emergency vehicle at front —
 *     if so, that phase is forced (emergency override).
 *  3. Pick the phase with the highest weighted load.
 *  4. On a tie (including when all loads are 0), alternate: choose the
 *     phase whose index is *different* from `lastPhaseIndex`.
 *     If `lastPhaseIndex` is -1 (simulation start), default to Phase 0.
 *
 * The function is pure: it does not mutate state.
 */
export function selectPhase(state: SimulationState, priorities?: RoadPriorities): Phase {
  // --- Emergency vehicle override ---
  // If any road has an emergency vehicle at the front, collect the phases
  // that contain at least one such road. The first matching phase wins
  // (preserves determinism across ties among emergency phases).
  const emergencyPhases = PHASES.filter((phase) =>
    phase.roads.some((road) => {
      const queue = state.queues.get(road);
      return (
        queue !== undefined &&
        queue.length > 0 &&
        (queue[0]!.priority ?? 'normal') === 'emergency'
      );
    })
  );

  if (emergencyPhases.length === 1) {
    return emergencyPhases[0]!;
  }

  // Multiple emergency phases tie — fall through to weighted load so the
  // heavier phase still wins (emergency vehicles on both axes is unusual
  // but must not deadlock).
  const phasePool: readonly Phase[] = emergencyPhases.length > 1 ? emergencyPhases : PHASES;

  const loads = phasePool.map((phase) => ({
    phase,
    load: phaseLoad(state, phase, priorities),
  }));

  // Find the maximum load value.
  const maxLoad = Math.max(...loads.map((l) => l.load));

  // Collect all phases that share the maximum load.
  const candidates = loads.filter((l) => l.load === maxLoad);

  // Single winner — no tie-breaking needed.
  if (candidates.length === 1) {
    return candidates[0]!.phase;
  }

  // Tie: alternate from the last-used phase.
  // If no phase has been used yet (lastPhaseIndex === -1), pick index 0.
  const lastIndex = state.lastPhaseIndex;
  const nextIndex = lastIndex === -1 ? 0 : (lastIndex + 1) % PHASES.length;

  // Prefer the candidate whose index matches nextIndex; fall back to first candidate.
  const chosen =
    candidates.find((c) => c.phase.index === nextIndex) ?? candidates[0];
  return chosen!.phase;
}
