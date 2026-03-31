/**
 * Traffic-light phase definitions (protected movements) and load helpers.
 *
 * Legacy `phaseLoad(state, phase, priorities)` maps to movement-weighted `demandForPhase`.
 */

import type { SimulationState } from './types.js';
import type { RoadPriorities } from './types.js';
import { demandForPhase, PHASES, type SignalPhaseRow } from './signal-phases.js';

export type { SignalPhaseId as PhaseId } from './signal-phases.js';
export {
  SIGNAL_PHASE_RING,
  PHASES,
  demandForPhase,
  isMovementServedInPhase,
  roadsInPhase,
  phaseForVehicle,
  movementsServedInPhase,
  signalPhaseIndex,
} from './signal-phases.js';

/** Describes a single protected signal phase (ring index + axis roads). */
export type Phase = SignalPhaseRow;

/**
 * Weighted demand for adaptive selection (all queued vehicles whose movement matches the phase).
 */
export function phaseLoad(
  state: SimulationState,
  phase: Phase,
  priorities?: RoadPriorities
): number {
  return demandForPhase(state, phase.id, priorities);
}
