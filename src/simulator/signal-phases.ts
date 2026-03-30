/**
 * Protected signal phases and movement / demand helpers.
 * See specs/REALISTIC-SIGNALIZATION.md §3 and §6.
 */

import type {
  Road,
  RoadPriorities,
  SignalPhaseTimingKey,
  SimulationState,
  Vehicle,
} from './types.js';
import { ROADS } from './types.js';
import { classifyMovement, type Movement } from './movement.js';

export type SignalPhaseId = SignalPhaseTimingKey;

/** Canonical ring order for round-robin tie-break (indices match array position). */
export const SIGNAL_PHASE_RING: readonly SignalPhaseId[] = [
  'NS_THROUGH',
  'NS_LEFT',
  'EW_THROUGH',
  'EW_LEFT',
] as const;

export function signalPhaseIndex(id: SignalPhaseId): number {
  const i = SIGNAL_PHASE_RING.indexOf(id);
  if (i < 0) {
    throw new Error(`Unknown signal phase: ${id}`);
  }
  return i;
}

const NS_ROADS: readonly Road[] = ['north', 'south'];
const EW_ROADS: readonly Road[] = ['east', 'west'];

/**
 * Roads (approaches) that belong to this phase's axis.
 */
export function roadsInPhase(phaseId: SignalPhaseId): readonly Road[] {
  switch (phaseId) {
    case 'NS_THROUGH':
    case 'NS_LEFT':
      return NS_ROADS;
    case 'EW_THROUGH':
    case 'EW_LEFT':
      return EW_ROADS;
    default: {
      const _exhaustive: never = phaseId;
      return _exhaustive;
    }
  }
}

function axisForRoad(road: Road): 'NS' | 'EW' {
  return road === 'north' || road === 'south' ? 'NS' : 'EW';
}

/**
 * Movements served by a phase (from approaches on that axis).
 */
export function movementsServedInPhase(phaseId: SignalPhaseId): readonly Movement[] {
  switch (phaseId) {
    case 'NS_THROUGH':
    case 'EW_THROUGH':
      return ['straight', 'right'];
    case 'NS_LEFT':
    case 'EW_LEFT':
      return ['left', 'u_turn'];
    default: {
      const _exhaustive: never = phaseId;
      return _exhaustive;
    }
  }
}

/**
 * True iff the vehicle's startRoad and derived movement match this phase.
 */
/**
 * The unique protected phase that serves this vehicle's movement from its approach.
 */
export function phaseForVehicle(vehicle: Vehicle): SignalPhaseId {
  const m = classifyMovement(vehicle.startRoad, vehicle.endRoad);
  const ns = vehicle.startRoad === 'north' || vehicle.startRoad === 'south';
  if (ns) {
    return m === 'straight' || m === 'right' ? 'NS_THROUGH' : 'NS_LEFT';
  }
  return m === 'straight' || m === 'right' ? 'EW_THROUGH' : 'EW_LEFT';
}

export function isMovementServedInPhase(vehicle: Vehicle, phaseId: SignalPhaseId): boolean {
  const axis = axisForRoad(vehicle.startRoad);
  const phaseAxis = phaseId === 'NS_THROUGH' || phaseId === 'NS_LEFT' ? 'NS' : 'EW';
  if (axis !== phaseAxis) {
    return false;
  }
  const m = classifyMovement(vehicle.startRoad, vehicle.endRoad);
  return (movementsServedInPhase(phaseId) as readonly Movement[]).includes(m);
}

function resolveRoadWeight(road: Road, priorities?: RoadPriorities): number {
  const w = priorities?.[road] ?? 1;
  return Math.max(0, w);
}

/**
 * Weighted demand D(phase): sum over every queued vehicle v on startRoad r
 * where v's movement is served in `phase`, contribution = w(r).
 */
export function demandForPhase(
  state: SimulationState,
  phaseId: SignalPhaseId,
  priorities?: RoadPriorities
): number {
  let sum = 0;
  for (const road of roadsInPhase(phaseId)) {
    const queue = state.queues.get(road);
    if (queue === undefined) {
      continue;
    }
    const w = resolveRoadWeight(road, priorities);
    if (w === 0) {
      continue;
    }
    for (const v of queue) {
      if (isMovementServedInPhase(v, phaseId)) {
        sum += w;
      }
    }
  }
  return sum;
}

/**
 * Demand from vehicles whose movement matches the phase (head-only), same weighting.
 * Used to mirror legacy emergency "phase load" when multiple axes have emergency heads.
 */
export function headWeightedDemandForPhaseAxis(
  state: SimulationState,
  phaseId: SignalPhaseId,
  priorities?: RoadPriorities
): number {
  let sum = 0;
  for (const road of roadsInPhase(phaseId)) {
    const head = state.queues.get(road)?.[0];
    if (head === undefined) {
      continue;
    }
    if (!isMovementServedInPhase(head, phaseId)) {
      continue;
    }
    sum += resolveRoadWeight(road, priorities);
  }
  return sum;
}

/** Legacy-shaped phase row for adapters/tests: id, ring index, roads on green axis. */
export interface SignalPhaseRow {
  index: number;
  id: SignalPhaseId;
  roads: readonly Road[];
}

/** Same order as SIGNAL_PHASE_RING; index matches ring position. */
export const PHASES: readonly SignalPhaseRow[] = SIGNAL_PHASE_RING.map((id, index) => ({
  index,
  id,
  roads: roadsInPhase(id),
})) as SignalPhaseRow[];
