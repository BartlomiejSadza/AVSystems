/**
 * Tests for configurable road priority weights (T11).
 *
 * Road priorities bias phase selection by multiplying each vehicle's contribution
 * in demandForPhase before comparing phase loads.
 */

import { describe, it, expect } from 'vitest';
import { simulate, createInitialState } from '../engine.js';
import { phaseLoad, PHASES } from '../phase.js';
import { pickNextGreenPhase } from '../signal-controller.js';
import { enqueueVehicle } from '../queue.js';
import type { Command, SimulationState, Vehicle } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const OPPOSITE: Record<'north' | 'south' | 'east' | 'west', 'north' | 'south' | 'east' | 'west'> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

function addVehicle(
  vehicleId: string,
  startRoad: 'north' | 'south' | 'east' | 'west',
  endRoad?: 'north' | 'south' | 'east' | 'west'
): Command {
  return { type: 'addVehicle', vehicleId, startRoad, endRoad: endRoad ?? OPPOSITE[startRoad] };
}

const step: Command = { type: 'step' };

function makeState(lastServedPhaseIndex = -1): SimulationState {
  const s = createInitialState(FAST_SIGNAL_TIMINGS);
  s.lastServedPhaseIndex = lastServedPhaseIndex;
  return s;
}

function addVehicleToState(state: SimulationState, id: string, road: Vehicle['startRoad']): void {
  enqueueVehicle(state, {
    vehicleId: id,
    startRoad: road,
    endRoad: OPPOSITE[road],
    priority: 'normal',
  });
}

// ---------------------------------------------------------------------------
// phaseLoad with priorities
// ---------------------------------------------------------------------------

describe('phaseLoad — priority weights', () => {
  it('returns unweighted count when no priorities are provided', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'N2', 'north');

    const nsPhase = PHASES.find((p) => p.id === 'NS_THROUGH')!;
    expect(phaseLoad(state, nsPhase, undefined)).toBe(2);
  });

  it('applies weight multiplier to each road individually', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'S1', 'south');

    const nsPhase = PHASES.find((p) => p.id === 'NS_THROUGH')!;

    expect(phaseLoad(state, nsPhase, { north: 3.0, south: 1.0 })).toBe(4);
  });

  it('treats missing road priorities as weight 1.0', () => {
    const state = makeState();
    addVehicleToState(state, 'E1', 'east');
    addVehicleToState(state, 'W1', 'west');

    const ewPhase = PHASES.find((p) => p.id === 'EW_THROUGH')!;
    expect(phaseLoad(state, ewPhase, { east: 2.0 })).toBe(3);
  });

  it('returns 0 for an empty phase regardless of weights', () => {
    const state = makeState();
    const nsPhase = PHASES.find((p) => p.id === 'NS_THROUGH')!;
    expect(phaseLoad(state, nsPhase, { north: 100, south: 100 })).toBe(0);
  });

  it('clamps negative weights to 0', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');

    const nsPhase = PHASES.find((p) => p.id === 'NS_THROUGH')!;
    expect(phaseLoad(state, nsPhase, { north: -5 })).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// pickNextGreenPhase with priorities
// ---------------------------------------------------------------------------

describe('pickNextGreenPhase — priority weights influence selection', () => {
  it('promotes EW_THROUGH when east/west weights overcome NS vehicle advantage', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'N2', 'north');
    addVehicleToState(state, 'S1', 'south');
    addVehicleToState(state, 'E1', 'east');

    expect(pickNextGreenPhase(state, undefined, -1)).toBe('NS_THROUGH');
    expect(pickNextGreenPhase(state, { east: 4.0 }, -1)).toBe('EW_THROUGH');
  });

  it('keeps NS_THROUGH winner when weights do not flip the advantage', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'N2', 'north');
    addVehicleToState(state, 'E1', 'east');

    expect(pickNextGreenPhase(state, { east: 1.5 }, -1)).toBe('NS_THROUGH');
  });

  it('falls through to tie-breaking when weighted loads are exactly equal', () => {
    const state = makeState(-1);
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'E1', 'east');

    expect(pickNextGreenPhase(state, { north: 1.0, east: 1.0 }, -1)).toBe('NS_THROUGH');
  });
});

// ---------------------------------------------------------------------------
// simulate() with roadPriorities option
// ---------------------------------------------------------------------------

const simOpts = { signalTimings: FAST_SIGNAL_TIMINGS };

describe('simulate — roadPriorities option', () => {
  it('accepts roadPriorities via SimulateOptions without error', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];

    expect(() =>
      simulate(commands, { ...simOpts, roadPriorities: { north: 2.0, east: 0.5 } })
    ).not.toThrow();
  });

  it('higher-weighted road increases EW through demand so EW is chosen sooner after NS clears', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('E1', 'east'),
      ...Array.from({ length: 6 }, () => step),
    ];

    const defaultOrder = simulate(commands, simOpts).flatMap((s) => s.leftVehicles);
    const weightedOrder = simulate(commands, {
      ...simOpts,
      roadPriorities: { north: 0.5, east: 4.0 },
    }).flatMap((s) => s.leftVehicles);

    expect(new Set(defaultOrder)).toEqual(new Set(['N1', 'E1']));
    expect(new Set(weightedOrder)).toEqual(new Set(['N1', 'E1']));
    const e1Default = defaultOrder.indexOf('E1');
    const e1Weighted = weightedOrder.indexOf('E1');
    expect(e1Weighted).toBeLessThanOrEqual(e1Default);
  });

  it('equal weights behave identically to default (no weights)', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step,
      addVehicle('E1', 'east'),
      step,
    ];

    const resultDefault = simulate(commands, simOpts);
    const resultEqual = simulate(commands, {
      ...simOpts,
      roadPriorities: { north: 1.0, south: 1.0, east: 1.0, west: 1.0 },
    });

    expect(resultDefault).toEqual(resultEqual);
  });

  it('works with invariant checks enabled alongside road priorities', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];

    expect(() =>
      simulate(commands, {
        ...simOpts,
        roadPriorities: { north: 1.5 },
        enableInvariantChecks: true,
      })
    ).not.toThrow();
  });

  it('handles all-zero weights gracefully (no division-by-zero)', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];

    expect(() =>
      simulate(commands, {
        ...simOpts,
        roadPriorities: { north: 0, south: 0, east: 0, west: 0 },
      })
    ).not.toThrow();

    const result = simulate(commands, {
      ...simOpts,
      roadPriorities: { north: 0, south: 0, east: 0, west: 0 },
    });
    expect(result[0]?.leftVehicles).toContain('N1');
  });

  it('weight > 1 on a single road does not affect the other road in the same phase', () => {
    const commands: Command[] = [
      addVehicle('S1', 'south'),
      addVehicle('S2', 'south'),
      addVehicle('E1', 'east'),
      step,
      step,
      step,
    ];

    const result = simulate(commands, { ...simOpts, roadPriorities: { south: 3.0 } });
    const allLeft = result.flatMap((s) => s.leftVehicles);
    expect(allLeft).toContain('S1');
    expect(allLeft).toContain('S2');
  });
});

// ---------------------------------------------------------------------------
// Backwards compatibility — boolean argument still works
// ---------------------------------------------------------------------------

describe('simulate — backwards-compatible boolean argument', () => {
  it('accepts plain boolean false for invariant checks (legacy API)', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() => simulate(commands, false)).not.toThrow();
  });

  it('accepts plain boolean true for invariant checks (legacy API)', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() => simulate(commands, true)).not.toThrow();
  });
});
