/**
 * T7 — Adaptive phase selection (weighted demand + full-ring round-robin).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { pickNextGreenPhase } from '../signal-controller.js';
import { phaseLoad, PHASES } from '../phase.js';
import { enqueueVehicle } from '../queue.js';
import { simulate, createInitialState } from '../engine.js';
import type { SimulationState, Road } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const fast = { signalTimings: FAST_SIGNAL_TIMINGS };

const OPP: Record<Road, Road> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

function makeState(
  overrides: Partial<{ north: number; south: number; east: number; west: number }> = {},
  lastServedPhaseIndex = -1
): SimulationState {
  const state = createInitialState(FAST_SIGNAL_TIMINGS);
  state.lastServedPhaseIndex = lastServedPhaseIndex;
  let counter = 0;
  const roads = ['north', 'south', 'east', 'west'] as const;
  for (const road of roads) {
    const count = overrides[road] ?? 0;
    for (let i = 0; i < count; i++) {
      enqueueVehicle(state, {
        vehicleId: `${road}-${counter++}`,
        startRoad: road,
        endRoad: OPP[road],
      });
    }
  }
  return state;
}

const NS_THROUGH = PHASES.find((p) => p.id === 'NS_THROUGH')!;
const EW_THROUGH = PHASES.find((p) => p.id === 'EW_THROUGH')!;

describe('T7 — phaseLoad (movement-weighted)', () => {
  it('returns 0 for an empty state on any through phase', () => {
    const state = makeState();
    expect(phaseLoad(state, NS_THROUGH)).toBe(0);
    expect(phaseLoad(state, EW_THROUGH)).toBe(0);
  });

  it('returns the correct sum for NS_THROUGH (straight/right only)', () => {
    const state = makeState({ north: 3, south: 2 });
    expect(phaseLoad(state, NS_THROUGH)).toBe(5);
  });

  it('returns the correct sum for EW_THROUGH', () => {
    const state = makeState({ east: 1, west: 4 });
    expect(phaseLoad(state, EW_THROUGH)).toBe(5);
  });

  it('counts only roads belonging to the phase axis', () => {
    const state = makeState({ north: 10, east: 1 });
    expect(phaseLoad(state, NS_THROUGH)).toBe(10);
    expect(phaseLoad(state, EW_THROUGH)).toBe(1);
  });
});

describe('T7 — pickNextGreenPhase picks the phase with more weighted demand', () => {
  it('selects NS_THROUGH when north+south total exceeds east+west (through)', () => {
    const state = makeState({ north: 3, south: 1, east: 1, west: 1 });
    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
  });

  it('selects EW_THROUGH when east+west total exceeds north+south', () => {
    const state = makeState({ north: 0, south: 1, east: 5, west: 3 });
    expect(pickNextGreenPhase(state, undefined, -1)).toBe('EW_THROUGH');
  });

  it('selects the axis whose single road has the most through vehicles', () => {
    const state = makeState({ north: 7, east: 3, west: 3 });
    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
  });
});

describe('T7 — pickNextGreenPhase tie-breaking', () => {
  it('selects NS_THROUGH first when all demands are 0 and lastServed is -1', () => {
    const state = makeState({}, -1);
    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
  });

  it('when through demands tie and last was NS_THROUGH, picks EW_THROUGH next', () => {
    const state = makeState({ north: 1, east: 1 }, 0);
    expect(pickNextGreenPhase(state, undefined, 0)).toBe('EW_THROUGH');
  });

  it('when through demands tie and last was EW_THROUGH (index 2), picks NS_THROUGH', () => {
    const state = makeState({ north: 1, east: 1 }, 2);
    expect(pickNextGreenPhase(state, undefined, 2)).toBe('NS_THROUGH');
  });

  it('tie-breaking over empty steps does not throw', () => {
    const result = simulate(
      [{ type: 'step' }, { type: 'step' }, { type: 'step' }, { type: 'step' }],
      fast
    );
    expect(result).toHaveLength(4);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });
});

describe('T7 — integration via simulate', () => {
  it('when queues are unequal, the busy axis drains first', () => {
    const commands = [
      {
        type: 'addVehicle' as const,
        vehicleId: 'N1',
        startRoad: 'north' as Road,
        endRoad: 'south' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'N2',
        startRoad: 'north' as Road,
        endRoad: 'south' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'S1',
        startRoad: 'south' as Road,
        endRoad: 'north' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'S2',
        startRoad: 'south' as Road,
        endRoad: 'north' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'E1',
        startRoad: 'east' as Road,
        endRoad: 'west' as Road,
      },
      { type: 'step' as const },
      { type: 'step' as const },
      { type: 'step' as const },
    ];
    const result = simulate(commands, fast);

    expect(result[0]?.leftVehicles).toContain('N1');
    expect(result[0]?.leftVehicles).toContain('S1');
    expect(result[0]?.leftVehicles).not.toContain('E1');

    expect(result[1]?.leftVehicles).toContain('N2');
    expect(result[1]?.leftVehicles).toContain('S2');

    expect(result[2]?.leftVehicles).toContain('E1');
  });

  it('all queues empty — simulation does not throw', () => {
    const result = simulate(
      Array.from({ length: 10 }, () => ({ type: 'step' as const })),
      fast
    );
    expect(result).toHaveLength(10);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });
});

describe('T7 — property-based', () => {
  const arbCount = fc.nat({ max: 10 });

  it('pickNextGreenPhase always returns a phase in the ring', () => {
    fc.assert(
      fc.property(
        fc.record({
          north: arbCount,
          south: arbCount,
          east: arbCount,
          west: arbCount,
          lastServedPhaseIndex: fc.constantFrom(-1, 0, 1, 2, 3),
        }),
        ({ north, south, east, west, lastServedPhaseIndex }) => {
          const state = makeState({ north, south, east, west }, lastServedPhaseIndex);
          const chosen = pickNextGreenPhase(state, undefined, lastServedPhaseIndex);
          expect(PHASES.some((p) => p.id === chosen)).toBe(true);
        }
      )
    );
  });

  it('when one axis clearly dominates through demand, pickNextGreenPhase picks it', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.constantFrom(-1, 0, 1, 2, 3),
        (ewBase, margin, lastServedPhaseIndex) => {
          const nsLoad = ewBase + margin;
          const state = makeState({ north: nsLoad, east: ewBase }, lastServedPhaseIndex);
          expect(pickNextGreenPhase(state, undefined, lastServedPhaseIndex)).toBe('NS_THROUGH');
        }
      )
    );
  });
});
