/**
 * Tests for phase definitions and the adaptive phase selection algorithm.
 */

import { describe, it, expect } from 'vitest';
import { PHASES, selectPhase, phaseLoad } from '../phase.js';
import { createQueues, enqueueVehicle } from '../queue.js';
import type { SimulationState, Vehicle } from '../types.js';

function makeState(lastPhaseIndex = -1): SimulationState {
  return {
    queues: createQueues(),
    stepCount: 0,
    lastPhaseIndex,
  };
}

function addVehicle(state: SimulationState, id: string, road: Vehicle['startRoad']): void {
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: 'north' });
}

describe('PHASES constant', () => {
  it('has exactly two phases', () => {
    expect(PHASES).toHaveLength(2);
  });

  it('Phase 0 covers north + south', () => {
    const ns = PHASES.find((p) => p.id === 'NS_STRAIGHT');
    expect(ns).toBeDefined();
    expect(ns!.roads).toContain('north');
    expect(ns!.roads).toContain('south');
    expect(ns!.roads).toHaveLength(2);
  });

  it('Phase 1 covers east + west', () => {
    const ew = PHASES.find((p) => p.id === 'EW_STRAIGHT');
    expect(ew).toBeDefined();
    expect(ew!.roads).toContain('east');
    expect(ew!.roads).toContain('west');
    expect(ew!.roads).toHaveLength(2);
  });

  it('indices are 0 and 1', () => {
    const indices = PHASES.map((p) => p.index).sort();
    expect(indices).toEqual([0, 1]);
  });
});

describe('phaseLoad', () => {
  it('returns 0 when queues are empty', () => {
    const state = makeState();
    expect(phaseLoad(state, PHASES[0]!)).toBe(0);
    expect(phaseLoad(state, PHASES[1]!)).toBe(0);
  });

  it('counts vehicles on phase roads only', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'north');
    addVehicle(state, 'V2', 'north');
    addVehicle(state, 'V3', 'east');

    const nsPhase = PHASES.find((p) => p.id === 'NS_STRAIGHT')!;
    const ewPhase = PHASES.find((p) => p.id === 'EW_STRAIGHT')!;

    expect(phaseLoad(state, nsPhase)).toBe(2); // north=2, south=0
    expect(phaseLoad(state, ewPhase)).toBe(1); // east=1, west=0
  });
});

describe('selectPhase — clear winner', () => {
  it('picks NS when north + south have more vehicles than east + west', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'north');
    addVehicle(state, 'V2', 'south');
    addVehicle(state, 'V3', 'east'); // EW total = 1, NS total = 2

    const chosen = selectPhase(state);
    expect(chosen.id).toBe('NS_STRAIGHT');
  });

  it('picks EW when east + west have more vehicles than north + south', () => {
    const state = makeState();
    addVehicle(state, 'V1', 'east');
    addVehicle(state, 'V2', 'west');
    addVehicle(state, 'V3', 'north'); // NS total = 1, EW total = 2

    const chosen = selectPhase(state);
    expect(chosen.id).toBe('EW_STRAIGHT');
  });
});

describe('selectPhase — tie-breaking', () => {
  it('defaults to Phase 0 (NS) when no step has been run yet (lastPhaseIndex = -1)', () => {
    const state = makeState(-1); // no prior phase
    // Equal load (0 vs 0)
    const chosen = selectPhase(state);
    expect(chosen.index).toBe(0);
    expect(chosen.id).toBe('NS_STRAIGHT');
  });

  it('alternates to Phase 1 (EW) when last phase was 0 and loads are equal', () => {
    const state = makeState(0); // last was NS
    addVehicle(state, 'V1', 'north');
    addVehicle(state, 'V2', 'east'); // tie: 1 vs 1

    const chosen = selectPhase(state);
    expect(chosen.index).toBe(1);
    expect(chosen.id).toBe('EW_STRAIGHT');
  });

  it('alternates back to Phase 0 (NS) when last phase was 1 and loads are equal', () => {
    const state = makeState(1); // last was EW
    addVehicle(state, 'V1', 'north');
    addVehicle(state, 'V2', 'east'); // tie: 1 vs 1

    const chosen = selectPhase(state);
    expect(chosen.index).toBe(0);
    expect(chosen.id).toBe('NS_STRAIGHT');
  });

  it('alternates even when both loads are 0', () => {
    const state0 = makeState(0);
    expect(selectPhase(state0).index).toBe(1);

    const state1 = makeState(1);
    expect(selectPhase(state1).index).toBe(0);
  });
});

describe('selectPhase — determinism', () => {
  it('returns the same phase for identical state inputs', () => {
    const state1 = makeState(0);
    addVehicle(state1, 'A', 'east');

    const state2 = makeState(0);
    addVehicle(state2, 'B', 'east');

    expect(selectPhase(state1).id).toBe(selectPhase(state2).id);
  });
});
