/**
 * Safety invariant tests — unit checks + property-based tests via fast-check.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  checkQueuesComplete,
  checkNoDuplicateVehicles,
  checkVehicleRoadConsistency,
  checkStepCount,
  checkSignalControllerState,
  checkPhaseRoadsNonConflicting,
  checkAllInvariants,
  assertInvariants,
} from '../invariants.js';
import { enqueueVehicle } from '../queue.js';
import { ROADS, type Command, type SimulationState, type Road } from '../types.js';
import { simulate, createInitialState } from '../engine.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const fast = { signalTimings: FAST_SIGNAL_TIMINGS };

function makeValidState(): SimulationState {
  return createInitialState(FAST_SIGNAL_TIMINGS);
}

function addVehicleToState(state: SimulationState, id: string, road: Road): void {
  const opposite: Record<Road, Road> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
  };
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: opposite[road] });
}

// ---------------------------------------------------------------------------
// checkQueuesComplete
// ---------------------------------------------------------------------------

describe('checkQueuesComplete', () => {
  it('passes for a valid empty state', () => {
    expect(checkQueuesComplete(makeValidState()).ok).toBe(true);
  });

  it('fails when a road is missing from the queues map', () => {
    const state = makeValidState();
    state.queues.delete('north');
    expect(checkQueuesComplete(state).ok).toBe(false);
  });

  it('fails when the map has extra unexpected keys', () => {
    const state = makeValidState();
    // @ts-expect-error — injecting an illegal road for testing
    state.queues.set('diagonal', []);
    expect(checkQueuesComplete(state).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkNoDuplicateVehicles
// ---------------------------------------------------------------------------

describe('checkNoDuplicateVehicles', () => {
  it('passes when all vehicle IDs are unique', () => {
    const state = makeValidState();
    addVehicleToState(state, 'V1', 'north');
    addVehicleToState(state, 'V2', 'south');
    expect(checkNoDuplicateVehicles(state).ok).toBe(true);
  });

  it('fails when the same vehicleId appears on two roads', () => {
    const state = makeValidState();
    state.queues.get('north')!.push({ vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' });
    state.queues.get('south')!.push({ vehicleId: 'DUP', startRoad: 'south', endRoad: 'north' });
    const result = checkNoDuplicateVehicles(state);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('DUP');
    }
  });
});

// ---------------------------------------------------------------------------
// checkVehicleRoadConsistency
// ---------------------------------------------------------------------------

describe('checkVehicleRoadConsistency', () => {
  it('passes when every vehicle.startRoad matches its queue road', () => {
    const state = makeValidState();
    addVehicleToState(state, 'V1', 'east');
    expect(checkVehicleRoadConsistency(state).ok).toBe(true);
  });

  it('fails when a vehicle is in the wrong road queue', () => {
    const state = makeValidState();
    state.queues.get('north')!.push({ vehicleId: 'WRONG', startRoad: 'south', endRoad: 'east' });
    const result = checkVehicleRoadConsistency(state);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('WRONG');
    }
  });
});

// ---------------------------------------------------------------------------
// checkStepCount
// ---------------------------------------------------------------------------

describe('checkStepCount', () => {
  it('passes for 0', () => {
    expect(checkStepCount(makeValidState()).ok).toBe(true);
  });

  it('passes for positive integers', () => {
    const state = makeValidState();
    state.stepCount = 999;
    expect(checkStepCount(state).ok).toBe(true);
  });

  it('fails for negative values', () => {
    const state = makeValidState();
    state.stepCount = -1;
    expect(checkStepCount(state).ok).toBe(false);
  });

  it('fails for non-integers', () => {
    const state = makeValidState();
    state.stepCount = 1.5;
    expect(checkStepCount(state).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkSignalControllerState
// ---------------------------------------------------------------------------

describe('checkSignalControllerState', () => {
  it('passes for createInitialState', () => {
    expect(checkSignalControllerState(makeValidState()).ok).toBe(true);
  });

  it('fails for an invalid lastServedPhaseIndex', () => {
    const state = makeValidState();
    state.lastServedPhaseIndex = 99;
    expect(checkSignalControllerState(state).ok).toBe(false);
  });

  it('fails for unknown currentSignalPhaseId', () => {
    const state = makeValidState();
    // @ts-expect-error — inject invalid id
    state.currentSignalPhaseId = 'INVALID';
    expect(checkSignalControllerState(state).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkPhaseRoadsNonConflicting
// ---------------------------------------------------------------------------

describe('checkPhaseRoadsNonConflicting', () => {
  it('passes for the built-in phase definitions', () => {
    const result = checkPhaseRoadsNonConflicting(makeValidState());
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkAllInvariants + assertInvariants
// ---------------------------------------------------------------------------

describe('checkAllInvariants', () => {
  it('returns an empty array for a pristine state', () => {
    const failures = checkAllInvariants(makeValidState());
    expect(failures).toHaveLength(0);
  });

  it('returns failures for an obviously broken state', () => {
    const state = makeValidState();
    state.stepCount = -1;
    state.queues.delete('north');
    const failures = checkAllInvariants(state);
    expect(failures.length).toBeGreaterThanOrEqual(2);
  });
});

describe('assertInvariants', () => {
  it('does not throw for a valid state', () => {
    expect(() => assertInvariants(makeValidState())).not.toThrow();
  });

  it('throws with failure details for an invalid state', () => {
    const state = makeValidState();
    state.stepCount = -5;
    expect(() => assertInvariants(state)).toThrow(/invariant/i);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests (fast-check)
// ---------------------------------------------------------------------------

const arbRoad = fc.constantFrom(...ROADS);

const arbVehicleId = fc
  .tuple(fc.string({ minLength: 1, maxLength: 8 }), fc.nat(999))
  .map(([s, n]) => `${s}-${n}`);

describe('property-based invariant tests', () => {
  it('a fresh state always satisfies all invariants', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const failures = checkAllInvariants(makeValidState());
        expect(failures).toHaveLength(0);
      })
    );
  });

  it('adding unique vehicles with matching startRoad never violates invariants', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.record({ id: arbVehicleId, road: arbRoad }), {
          selector: (v) => v.id,
          minLength: 0,
          maxLength: 20,
        }),
        (entries) => {
          const state = makeValidState();
          const opposite: Record<Road, Road> = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east',
          };
          for (const { id, road } of entries) {
            enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: opposite[road] });
          }
          const failures = checkAllInvariants(state);
          expect(failures).toHaveLength(0);
        }
      )
    );
  });

  it('stepCount is always non-negative after simulate runs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({
              type: fc.constant('addVehicle' as const),
              vehicleId: arbVehicleId,
              startRoad: arbRoad,
              endRoad: arbRoad,
            }),
            fc.record({ type: fc.constant('step' as const) })
          ),
          { minLength: 0, maxLength: 30 }
        ),
        (commands) => {
          const stepCommandCount = commands.filter((c) => c.type === 'step').length;
          const results = simulate(commands, fast);
          expect(results).toHaveLength(stepCommandCount);
        }
      )
    );
  });

  it('no vehicle departs more than once across all steps', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.record({
            vehicleId: arbVehicleId,
            startRoad: arbRoad,
            endRoad: arbRoad,
          }),
          { selector: (v) => v.vehicleId, minLength: 1, maxLength: 20 }
        ),
        fc.nat({ max: 20 }),
        (vehicles, extraSteps) => {
          const commands = [
            ...vehicles.map((v) => ({ type: 'addVehicle' as const, ...v })),
            ...Array.from({ length: vehicles.length + extraSteps }, () => ({
              type: 'step' as const,
            })),
          ];
          const results = simulate(commands, fast);
          const allLeft = results.flatMap((s: { leftVehicles: string[] }) => s.leftVehicles);
          expect(new Set(allLeft).size).toBe(allLeft.length);
        }
      )
    );
  });

  it('vehicles that depart were in the simulation', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(arbVehicleId, { minLength: 1, maxLength: 15 }),
        fc.nat({ max: 15 }),
        (ids, extraSteps) => {
          const roads: Road[] = ['north', 'south', 'east', 'west'];
          const commands = [
            ...ids.map((id, i) => ({
              type: 'addVehicle' as const,
              vehicleId: id,
              startRoad: roads[i % 4]!,
              endRoad: roads[(i + 1) % 4]!,
            })),
            ...Array.from({ length: ids.length + extraSteps }, () => ({ type: 'step' as const })),
          ];
          const results = simulate(commands, fast);
          const allLeft = results.flatMap((s: { leftVehicles: string[] }) => s.leftVehicles);
          const idSet = new Set(ids);
          for (const departed of allLeft) {
            expect(idSet.has(departed)).toBe(true);
          }
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// T8 — same-phase departures (movement-qualified green)
// ---------------------------------------------------------------------------

describe('T8 — departures under movement-qualified green', () => {
  it('vehicles only depart when their movement matches the active sub-phase', () => {
    const commands = [
      {
        type: 'addVehicle' as const,
        vehicleId: 'N1',
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
        vehicleId: 'E1',
        startRoad: 'east' as Road,
        endRoad: 'west' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'W1',
        startRoad: 'west' as Road,
        endRoad: 'east' as Road,
      },
      { type: 'step' as const },
      { type: 'step' as const },
    ];

    const nsVehicles = new Set(['N1', 'S1']);
    const ewVehicles = new Set(['E1', 'W1']);

    const result = simulate(commands, { ...fast, enableInvariantChecks: true });
    expect(result).toHaveLength(2);

    for (const stepResult of result) {
      for (const id of stepResult.leftVehicles) {
        const inNS = nsVehicles.has(id);
        const inEW = ewVehicles.has(id);
        expect(inNS || inEW).toBe(true);
        if (stepResult.leftVehicles.length > 0) {
          const firstId = stepResult.leftVehicles[0]!;
          const firstInNS = nsVehicles.has(firstId);
          expect(nsVehicles.has(id)).toBe(firstInNS);
        }
      }
    }
  });

  it('no vehicle appears in leftVehicles more than once across all steps (no phantom dequeues)', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.record({ id: arbVehicleId, road: arbRoad }), {
          selector: (v) => v.id,
          minLength: 0,
          maxLength: 15,
        }),
        fc.nat({ max: 20 }),
        (entries, extraSteps) => {
          const opposite: Record<Road, Road> = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east',
          };
          const commands = [
            ...entries.map(({ id, road }) => ({
              type: 'addVehicle' as const,
              vehicleId: id,
              startRoad: road,
              endRoad: opposite[road],
            })),
            ...Array.from({ length: entries.length + extraSteps }, () => ({
              type: 'step' as const,
            })),
          ];
          const results = simulate(commands, { ...fast, enableInvariantChecks: true });
          const allLeft = results.flatMap((s) => s.leftVehicles);
          expect(new Set(allLeft).size).toBe(allLeft.length);
        }
      )
    );
  });

  it('invariants hold at every step boundary with transition-heavy scenarios', () => {
    const commands: Command[] = [];
    const roads: Road[] = ['north', 'south', 'east', 'west'];
    for (let i = 0; i < 20; i++) {
      commands.push({
        type: 'addVehicle' as const,
        vehicleId: `V${i}`,
        startRoad: roads[i % 4]!,
        endRoad: roads[(i + 1) % 4]!,
      });
      commands.push({ type: 'step' as const });
    }
    expect(() => simulate(commands, { ...fast, enableInvariantChecks: true })).not.toThrow();
  });

  it('same input produces same step results (determinism)', () => {
    const commands = [
      {
        type: 'addVehicle' as const,
        vehicleId: 'A',
        startRoad: 'north' as Road,
        endRoad: 'south' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'B',
        startRoad: 'east' as Road,
        endRoad: 'west' as Road,
      },
      { type: 'step' as const },
      { type: 'step' as const },
      { type: 'step' as const },
    ];

    const run1 = simulate(commands, fast);
    const run2 = simulate(commands, fast);

    expect(run1).toEqual(run2);
  });
});
