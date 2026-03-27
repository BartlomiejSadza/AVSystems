/**
 * Tests for configurable road priority weights (T11).
 *
 * Road priorities bias phase selection by multiplying each road's queue
 * length by the corresponding weight before comparing phase loads.
 * A road with weight 2.0 is treated as twice as busy for selection purposes.
 */

import { describe, it, expect } from 'vitest';
import { simulate, createInitialState } from '../engine.js';
import { phaseLoad, PHASES, selectPhase } from '../phase.js';
import { enqueueVehicle } from '../queue.js';
import type { Command, SimulationState, Vehicle } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addVehicle(
  vehicleId: string,
  startRoad: 'north' | 'south' | 'east' | 'west',
  endRoad: 'north' | 'south' | 'east' | 'west' = 'south'
): Command {
  return { type: 'addVehicle', vehicleId, startRoad, endRoad };
}

const step: Command = { type: 'step' };

function makeState(lastPhaseIndex = -1): SimulationState {
  return {
    ...createInitialState(),
    lastPhaseIndex,
  };
}

function addVehicleToState(state: SimulationState, id: string, road: Vehicle['startRoad']): void {
  enqueueVehicle(state, {
    vehicleId: id,
    startRoad: road,
    endRoad: 'south',
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

    const nsPhase = PHASES.find((p) => p.id === 'NS_STRAIGHT')!;
    expect(phaseLoad(state, nsPhase, undefined)).toBe(2);
  });

  it('applies weight multiplier to each road individually', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north'); // 1 vehicle on north
    addVehicleToState(state, 'S1', 'south'); // 1 vehicle on south

    const nsPhase = PHASES.find((p) => p.id === 'NS_STRAIGHT')!;

    // north weight 3.0, south weight 1.0 → total = 1*3 + 1*1 = 4
    expect(phaseLoad(state, nsPhase, { north: 3.0, south: 1.0 })).toBe(4);
  });

  it('treats missing road priorities as weight 1.0', () => {
    const state = makeState();
    addVehicleToState(state, 'E1', 'east');
    addVehicleToState(state, 'W1', 'west');

    const ewPhase = PHASES.find((p) => p.id === 'EW_STRAIGHT')!;
    // Only east is listed — west defaults to 1.0
    expect(phaseLoad(state, ewPhase, { east: 2.0 })).toBe(3); // 1*2 + 1*1
  });

  it('returns 0 for an empty phase regardless of weights', () => {
    const state = makeState();
    const nsPhase = PHASES.find((p) => p.id === 'NS_STRAIGHT')!;
    expect(phaseLoad(state, nsPhase, { north: 100, south: 100 })).toBe(0);
  });

  it('clamps negative weights to 0', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');

    const nsPhase = PHASES.find((p) => p.id === 'NS_STRAIGHT')!;
    // Negative weight → clamped to 0 → load = 0 + (south=0)*1 = 0
    expect(phaseLoad(state, nsPhase, { north: -5 })).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// selectPhase with priorities
// ---------------------------------------------------------------------------

describe('selectPhase — priority weights influence selection', () => {
  it('promotes EW phase when east/west weights are high enough to overcome NS vehicle advantage', () => {
    const state = makeState();
    // NS has 3 vehicles, EW has 1 — normally NS wins.
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'N2', 'north');
    addVehicleToState(state, 'S1', 'south');
    addVehicleToState(state, 'E1', 'east');

    // Without weights: NS=3, EW=1 → NS wins
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');

    // With east weight 4.0: EW weighted load = 1*4 + 0*1 = 4 > NS load = 3
    expect(selectPhase(state, { east: 4.0 }).id).toBe('EW_STRAIGHT');
  });

  it('keeps NS winner when weights do not flip the advantage', () => {
    const state = makeState();
    addVehicleToState(state, 'N1', 'north');
    addVehicleToState(state, 'N2', 'north');
    addVehicleToState(state, 'E1', 'east');

    // NS=2, EW weighted load = 1*1.5 = 1.5 → NS still wins
    expect(selectPhase(state, { east: 1.5 }).id).toBe('NS_STRAIGHT');
  });

  it('falls through to tie-breaking when weighted loads are exactly equal', () => {
    const state = makeState(-1);
    addVehicleToState(state, 'N1', 'north'); // NS=1
    addVehicleToState(state, 'E1', 'east'); // EW=1

    // weight east=1.0, north=1.0 → tie → lastPhaseIndex=-1 → NS default
    expect(selectPhase(state, { north: 1.0, east: 1.0 }).id).toBe('NS_STRAIGHT');
  });
});

// ---------------------------------------------------------------------------
// simulate() with roadPriorities option
// ---------------------------------------------------------------------------

describe('simulate — roadPriorities option', () => {
  it('accepts roadPriorities via SimulateOptions without error', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];

    expect(() => simulate(commands, { roadPriorities: { north: 2.0, east: 0.5 } })).not.toThrow();
  });

  it('higher-weighted road wins phase selection over an otherwise tied road', () => {
    // N and E each have 1 vehicle — normally a tie → NS wins (Phase 0).
    // With north weight 0.5 and east weight 2.0, EW load > NS load → EW wins.
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];

    const resultDefault = simulate(commands);
    // Default: tie → NS wins → N1 departs
    expect(resultDefault[0]?.leftVehicles).toContain('N1');
    expect(resultDefault[0]?.leftVehicles).not.toContain('E1');

    const resultWeighted = simulate(commands, {
      roadPriorities: { north: 0.5, east: 2.0 },
    });
    // Weighted: EW load = 2.0 > NS load = 0.5 → EW wins → E1 departs
    expect(resultWeighted[0]?.leftVehicles).toContain('E1');
    expect(resultWeighted[0]?.leftVehicles).not.toContain('N1');
  });

  it('equal weights behave identically to default (no weights)', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step,
      addVehicle('E1', 'east'),
      step,
    ];

    const resultDefault = simulate(commands);
    const resultEqual = simulate(commands, {
      roadPriorities: { north: 1.0, south: 1.0, east: 1.0, west: 1.0 },
    });

    expect(resultDefault).toEqual(resultEqual);
  });

  it('works with invariant checks enabled alongside road priorities', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];

    expect(() =>
      simulate(commands, {
        roadPriorities: { north: 1.5 },
        enableInvariantChecks: true,
      })
    ).not.toThrow();
  });

  it('handles all-zero weights gracefully (no division-by-zero)', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];

    // All loads become 0 — falls through to tie-break → Phase 0 by default
    expect(() =>
      simulate(commands, {
        roadPriorities: { north: 0, south: 0, east: 0, west: 0 },
      })
    ).not.toThrow();

    const result = simulate(commands, {
      roadPriorities: { north: 0, south: 0, east: 0, west: 0 },
    });
    // Tie on 0 → Phase 0 (NS) wins → N1 departs
    expect(result[0]?.leftVehicles).toContain('N1');
  });

  it('weight > 1 on a single road does not affect the other road in the same phase', () => {
    // south road has 2 vehicles, north has 0. EW has 1.
    // NS unweighted = 2, EW = 1 → NS wins regardless.
    // With south weight 3.0: NS weighted = 0*1 + 2*3 = 6, EW = 1 → NS still wins.
    const commands: Command[] = [
      addVehicle('S1', 'south'),
      addVehicle('S2', 'south'),
      addVehicle('E1', 'east'),
      step,
      step,
      step,
    ];

    const result = simulate(commands, { roadPriorities: { south: 3.0 } });
    const allLeft = result.flatMap((s) => s.leftVehicles);
    // S1 and S2 should both eventually depart
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
