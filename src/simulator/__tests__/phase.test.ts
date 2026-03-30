/**
 * Tests for protected phase definitions, demand, and adaptive selection (pickNextGreenPhase).
 */

import { describe, it, expect } from 'vitest';
import { PHASES, demandForPhase } from '../phase.js';
import { pickNextGreenPhase } from '../signal-controller.js';
import { createInitialState } from '../engine.js';
import { enqueueVehicle } from '../queue.js';
import type { SimulationState, Vehicle } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

function makeState(lastServedPhaseIndex = -1): SimulationState {
  const s = createInitialState(FAST_SIGNAL_TIMINGS);
  s.lastServedPhaseIndex = lastServedPhaseIndex;
  return s;
}

function addVehicle(
  state: SimulationState,
  id: string,
  road: Vehicle['startRoad'],
  endRoad: Vehicle['endRoad'] = 'north'
): void {
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad });
}

describe('PHASES constant', () => {
  it('has exactly four protected phases', () => {
    expect(PHASES).toHaveLength(4);
  });

  it('NS_THROUGH and NS_LEFT cover north + south', () => {
    const nt = PHASES.find((p) => p.id === 'NS_THROUGH');
    const nl = PHASES.find((p) => p.id === 'NS_LEFT');
    expect(nt?.roads).toEqual(['north', 'south']);
    expect(nl?.roads).toEqual(['north', 'south']);
  });

  it('EW_THROUGH and EW_LEFT cover east + west', () => {
    const et = PHASES.find((p) => p.id === 'EW_THROUGH');
    const el = PHASES.find((p) => p.id === 'EW_LEFT');
    expect(et?.roads).toEqual(['east', 'west']);
    expect(el?.roads).toEqual(['east', 'west']);
  });

  it('indices are 0..3 in ring order', () => {
    expect(PHASES.map((p) => p.index)).toEqual([0, 1, 2, 3]);
  });
});

describe('demandForPhase', () => {
  it('returns 0 when queues are empty', () => {
    const state = makeState();
    expect(demandForPhase(state, 'NS_THROUGH')).toBe(0);
    expect(demandForPhase(state, 'EW_THROUGH')).toBe(0);
  });

  it('counts only vehicles whose movement matches the phase', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'north', 'south'); // straight → NS_THROUGH
    addVehicle(state, 'V2', 'north', 'west'); // left → NS_LEFT
    addVehicle(state, 'V3', 'east', 'west'); // straight → EW_THROUGH

    expect(demandForPhase(state, 'NS_THROUGH')).toBe(1);
    expect(demandForPhase(state, 'NS_LEFT')).toBe(1);
    expect(demandForPhase(state, 'EW_THROUGH')).toBe(1);
    expect(demandForPhase(state, 'EW_LEFT')).toBe(0);
  });
});

describe('pickNextGreenPhase — clear winner', () => {
  it('picks NS_THROUGH when north+south through demand exceeds EW', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'north', 'south');
    addVehicle(state, 'V2', 'south', 'north');
    addVehicle(state, 'V3', 'east', 'north'); // left on east → EW_LEFT, not THROUGH

    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
  });

  it('picks EW_THROUGH when east+west through demand dominates', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'east', 'west');
    addVehicle(state, 'V2', 'west', 'east');
    addVehicle(state, 'V3', 'north', 'south');

    expect(pickNextGreenPhase(state, undefined, -1)).toBe('EW_THROUGH');
  });
});

describe('pickNextGreenPhase — tie-breaking (full ring)', () => {
  it('when all demands are 0 and lastServed is -1, picks NS_THROUGH (next after -1 → index 0)', () => {
    const state = makeState(-1);
    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
  });

  it('among tied positive demand, picks next ring index after lastServed', () => {
    const state = makeState(0); // last NS_THROUGH
    addVehicle(state, 'N', 'north', 'south'); // NS_THROUGH
    addVehicle(state, 'E', 'east', 'west'); // EW_THROUGH — same weighted 1 vs 1 for “through” phases only…
    // NS_LEFT and EW_LEFT have 0; tied max might be NS_THROUGH and EW_THROUGH at 1.
    const chosen = pickNextGreenPhase(state, undefined, 0);
    expect(chosen).toBe('EW_THROUGH');
  });

  it('when lastServed is EW_THROUGH (index 2), tie wraps to NS_THROUGH', () => {
    const state = makeState(2);
    addVehicle(state, 'N', 'north', 'south');
    addVehicle(state, 'E', 'east', 'west');
    expect(pickNextGreenPhase(state, undefined, 2)).toBe('NS_THROUGH');
  });
});

describe('pickNextGreenPhase — determinism', () => {
  it('returns the same phase for identical state inputs', () => {
    const state1 = makeState(0);
    addVehicle(state1, 'A', 'east', 'west');
    const state2 = makeState(0);
    addVehicle(state2, 'B', 'east', 'west');

    expect(pickNextGreenPhase(state1, undefined, 0)).toBe(pickNextGreenPhase(state2, undefined, 0));
  });
});
