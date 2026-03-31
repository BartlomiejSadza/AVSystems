/**
 * Mutable signal controller: GREEN / YELLOW / ALL_RED, actuation, adaptive selection,
 * emergency preemption. Invoked once per tick after discharge.
 */

import type {
  Road,
  RoadPriorities,
  SignalTimingConfig,
  SimulateOptions,
  SimulationState,
} from './types.js';
import { ROADS } from './types.js';
import { dequeueVehicle, peekVehicle } from './queue.js';
import {
  SIGNAL_PHASE_RING,
  type SignalPhaseId,
  demandForPhase,
  isMovementServedInPhase,
  phaseForVehicle,
  roadsInPhase,
  signalPhaseIndex,
} from './signal-phases.js';

/**
 * At tick start, dequeue up to one eligible vehicle per approach when segment is GREEN
 * and the head movement matches the active phase.
 */
export function dischargeEligibleVehicles(state: SimulationState): string[] {
  if (state.segmentKind !== 'GREEN') {
    return [];
  }
  const phase = state.currentSignalPhaseId;
  // Collect all eligible head vehicles first, then sort by insertion order
  // so leftVehicles reflects the global FIFO order across roads.
  const eligible: { addOrder: number; road: Road }[] = [];
  for (const road of roadsInPhase(phase)) {
    const head = peekVehicle(state, road);
    if (head === undefined) {
      continue;
    }
    if (!isMovementServedInPhase(head, phase)) {
      continue;
    }
    eligible.push({ addOrder: head.addOrder ?? Infinity, road });
  }
  eligible.sort((a, b) => a.addOrder - b.addOrder);
  const left: string[] = [];
  for (const { road } of eligible) {
    const v = dequeueVehicle(state, road);
    if (v !== undefined) {
      left.push(v.vehicleId);
    }
  }
  return left;
}

export function effectivePhaseTiming(
  phaseId: SignalPhaseId,
  cfg: SignalTimingConfig
): { minGreenTicks: number; maxGreenTicks: number; yellowTicks: number; allRedTicks: number } {
  const o = cfg.perPhase[phaseId];
  return {
    minGreenTicks: Math.max(0, o?.minGreenTicks ?? cfg.minGreenTicks),
    maxGreenTicks: Math.max(0, o?.maxGreenTicks ?? cfg.maxGreenTicks),
    yellowTicks: Math.max(0, cfg.yellowTicks),
    allRedTicks: Math.max(0, cfg.allRedTicks),
  };
}

/**
 * Weighted adaptive selection after clearance (§6). `lastServedPhaseIndex` is the ring index
 * of the phase that last entered GREEN from selection (-1 = none).
 */
export function pickNextGreenPhase(
  state: SimulationState,
  priorities: RoadPriorities | undefined,
  lastServedPhaseIndex: number
): SignalPhaseId {
  const demands = SIGNAL_PHASE_RING.map((id) => ({
    id,
    d: demandForPhase(state, id, priorities),
  }));
  const maxD = Math.max(...demands.map((x) => x.d));
  const tied = demands.filter((x) => x.d === maxD).map((x) => x.id);
  if (tied.length === 1) {
    return tied[0]!;
  }
  const last = lastServedPhaseIndex;
  for (let k = 1; k <= 4; k++) {
    const idx = (last + k + 4) % 4;
    const id = SIGNAL_PHASE_RING[idx]!;
    if (tied.includes(id)) {
      return id;
    }
  }
  return tied[0]!;
}

/** Exposed for tests — queue-head emergency target phase (§8). */
export function getEmergencyTargetPhase(state: SimulationState): SignalPhaseId | null {
  return computeEmergencyTargetPhase(state);
}

function computeEmergencyTargetPhase(state: SimulationState): SignalPhaseId | null {
  const entries: { vehicleId: string; phaseId: SignalPhaseId }[] = [];
  for (const road of ROADS) {
    const head = peekVehicle(state, road);
    if (head === undefined) {
      continue;
    }
    if ((head.priority ?? 'normal') !== 'emergency') {
      continue;
    }
    entries.push({ vehicleId: head.vehicleId, phaseId: phaseForVehicle(head) });
  }
  if (entries.length === 0) {
    return null;
  }
  entries.sort((a, b) => {
    const ia = signalPhaseIndex(a.phaseId);
    const ib = signalPhaseIndex(b.phaseId);
    if (ia !== ib) {
      return ia - ib;
    }
    return a.vehicleId.localeCompare(b.vehicleId);
  });
  return entries[0]!.phaseId;
}

function enterGreenFromSelection(
  state: SimulationState,
  phaseId: SignalPhaseId,
  priorities: RoadPriorities | undefined
): void {
  let p: SignalPhaseId = phaseId;
  for (let skip = 0; skip < 5; skip++) {
    state.currentSignalPhaseId = p;
    state.segmentKind = 'GREEN';
    state.greenTicksElapsedInCurrentGreen = 0;
    state.segmentTicksRemaining = 0;
    state.lastServedPhaseIndex = signalPhaseIndex(p);
    if (!state.signalTiming.skipEmptyPhases || demandForPhase(state, p, priorities) > 0) {
      return;
    }
    p = pickNextGreenPhase(state, priorities, signalPhaseIndex(p));
  }
}

function completeAllRed(state: SimulationState, priorities: RoadPriorities | undefined): void {
  if (state.signalTiming.lazyGreenSelection && state.forcedPhaseAfterAllRed === null) {
    // Defer phase selection to the start of the next step so that vehicles
    // added between steps are visible to the demand calculation.
    state.pendingGreenSelection = true;
    state.segmentKind = 'GREEN'; // Placeholder; currentSignalPhaseId will be resolved at step start.
    state.greenTicksElapsedInCurrentGreen = 0;
    state.segmentTicksRemaining = 0;
    return;
  }
  const forced = state.forcedPhaseAfterAllRed;
  state.forcedPhaseAfterAllRed = null;
  const next = forced ?? pickNextGreenPhase(state, priorities, state.lastServedPhaseIndex);
  enterGreenFromSelection(state, next, priorities);
}

function beginAllRed(state: SimulationState, priorities: RoadPriorities | undefined): void {
  const ar = Math.max(0, state.signalTiming.allRedTicks);
  if (ar > 0) {
    state.segmentKind = 'ALL_RED';
    state.segmentTicksRemaining = ar;
  } else {
    completeAllRed(state, priorities);
  }
}

function startYellow(state: SimulationState, priorities: RoadPriorities | undefined): void {
  const t = effectivePhaseTiming(state.currentSignalPhaseId, state.signalTiming);
  if (t.yellowTicks > 0) {
    state.segmentKind = 'YELLOW';
    state.segmentTicksRemaining = t.yellowTicks;
  } else {
    beginAllRed(state, priorities);
  }
}

/**
 * If `pendingGreenSelection` is set, select the best green phase now using
 * current demand (which may include vehicles added since the last step ended).
 * Must be called at step start, before discharge.
 */
export function resolveGreenSelection(state: SimulationState, options: SimulateOptions): void {
  if (!state.pendingGreenSelection) {
    return;
  }
  state.pendingGreenSelection = false;
  const priorities = options.roadPriorities;
  const next = pickNextGreenPhase(state, priorities, state.lastServedPhaseIndex);
  enterGreenFromSelection(state, next, priorities);
}

/**
 * Before discharge: if a queue-head emergency needs a different GREEN than the active one,
 * chain zero-duration segments until that GREEN is active, or stop on a timed YELLOW/ALL_RED
 * (timers advance only in `advanceSignalController`).
 */
export function reconcileEmergencyBeforeDischarge(
  state: SimulationState,
  options: SimulateOptions
): void {
  const priorities = options.roadPriorities;
  for (let guard = 0; guard < 32; guard++) {
    const emg = computeEmergencyTargetPhase(state);
    if (emg === null) {
      return;
    }
    if (state.segmentKind === 'GREEN' && state.currentSignalPhaseId === emg) {
      return;
    }
    if (state.segmentKind !== 'GREEN') {
      return;
    }
    state.forcedPhaseAfterAllRed = emg;
    startYellow(state, priorities);
  }
}

function advanceGreen(
  state: SimulationState,
  phaseId: SignalPhaseId,
  priorities: RoadPriorities | undefined
): void {
  state.greenTicksElapsedInCurrentGreen += 1;
  const t = effectivePhaseTiming(phaseId, state.signalTiming);
  const maxGreen = Math.max(t.minGreenTicks, t.maxGreenTicks);
  const demand = demandForPhase(state, phaseId, priorities);
  if (state.greenTicksElapsedInCurrentGreen >= maxGreen) {
    startYellow(state, priorities);
    return;
  }
  if (state.greenTicksElapsedInCurrentGreen >= t.minGreenTicks && demand === 0) {
    startYellow(state, priorities);
  }
}

function handleEmergency(state: SimulationState, priorities: RoadPriorities | undefined): void {
  const emg = computeEmergencyTargetPhase(state);
  if (emg === null) {
    handleNormal(state, priorities);
    return;
  }

  if (state.segmentKind === 'GREEN' && state.currentSignalPhaseId === emg) {
    advanceGreen(state, emg, priorities);
    return;
  }

  if (state.segmentKind === 'GREEN' && state.currentSignalPhaseId !== emg) {
    state.forcedPhaseAfterAllRed = emg;
    startYellow(state, priorities);
    return;
  }

  if (state.segmentKind === 'YELLOW') {
    state.segmentTicksRemaining -= 1;
    if (state.segmentTicksRemaining <= 0) {
      state.forcedPhaseAfterAllRed = emg;
      beginAllRed(state, priorities);
    }
    return;
  }

  if (state.segmentKind === 'ALL_RED') {
    state.segmentTicksRemaining -= 1;
    if (state.segmentTicksRemaining <= 0) {
      state.forcedPhaseAfterAllRed = emg;
      completeAllRed(state, priorities);
    }
  }
}

function handleNormal(state: SimulationState, priorities: RoadPriorities | undefined): void {
  if (state.segmentKind === 'GREEN') {
    advanceGreen(state, state.currentSignalPhaseId, priorities);
    return;
  }

  if (state.segmentKind === 'YELLOW') {
    state.segmentTicksRemaining -= 1;
    if (state.segmentTicksRemaining <= 0) {
      state.forcedPhaseAfterAllRed = null;
      beginAllRed(state, priorities);
    }
    return;
  }

  if (state.segmentKind === 'ALL_RED') {
    state.segmentTicksRemaining -= 1;
    if (state.segmentTicksRemaining <= 0) {
      completeAllRed(state, priorities);
    }
  }
}

/**
 * Advance controller by one tick after vehicles have been discharged.
 */
export function advanceSignalController(state: SimulationState, options: SimulateOptions): void {
  const priorities = options.roadPriorities;
  const emg = computeEmergencyTargetPhase(state);
  if (emg !== null) {
    handleEmergency(state, priorities);
  } else {
    handleNormal(state, priorities);
  }
}
