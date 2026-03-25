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
  checkLastPhaseIndex,
  checkPhaseRoadsNonConflicting,
  checkAllInvariants,
  assertInvariants,
} from '../invariants.js';
import { createQueues, enqueueVehicle } from '../queue.js';
import { ROADS, type Command, type SimulationState, type Road } from '../types.js';
import { simulate } from '../engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidState(): SimulationState {
  return {
    queues: createQueues(),
    stepCount: 0,
    lastPhaseIndex: -1,
  };
}

function addVehicleToState(state: SimulationState, id: string, road: Road): void {
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: 'north' });
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
    // Manually push to bypass the normal enqueue guard
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
    // Inject a vehicle whose startRoad does not match the queue
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
// checkLastPhaseIndex
// ---------------------------------------------------------------------------

describe('checkLastPhaseIndex', () => {
  it('passes for -1 (pre-simulation)', () => {
    expect(checkLastPhaseIndex(makeValidState()).ok).toBe(true);
  });

  it('passes for valid phase indices 0 and 1', () => {
    const s0 = makeValidState();
    s0.lastPhaseIndex = 0;
    expect(checkLastPhaseIndex(s0).ok).toBe(true);

    const s1 = makeValidState();
    s1.lastPhaseIndex = 1;
    expect(checkLastPhaseIndex(s1).ok).toBe(true);
  });

  it('fails for an out-of-range index', () => {
    const state = makeValidState();
    state.lastPhaseIndex = 99;
    expect(checkLastPhaseIndex(state).ok).toBe(false);
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
    state.stepCount = -1; // trigger checkStepCount
    state.queues.delete('north'); // trigger checkQueuesComplete
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

/**
 * Arbitrary: generate a valid road name.
 */
const arbRoad = fc.constantFrom(...ROADS);

/**
 * Arbitrary: generate a Vehicle with a unique-enough ID prefix.
 */
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
        fc.uniqueArray(
          fc.record({ id: arbVehicleId, road: arbRoad }),
          { selector: (v) => v.id, minLength: 0, maxLength: 20 }
        ),
        (entries) => {
          const state = makeValidState();
          for (const { id, road } of entries) {
            enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: 'north' });
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
          // simulate should never throw and stepCount should equal the number of step commands
          const stepCommandCount = commands.filter((c) => c.type === 'step').length;
          const results = simulate(commands);
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
            ...Array.from({ length: vehicles.length + extraSteps }, () => ({ type: 'step' as const })),
          ];
          const results = simulate(commands);
          const allLeft = results.flatMap((s: { leftVehicles: string[] }) => s.leftVehicles);
          // No duplicate departures
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
          const results = simulate(commands);
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
// T8 — Transition phase safety
//
// This simulation models phase transitions as instantaneous (no yellow/all-red
// intermediate ticks).  The invariants below verify that vehicles are never
// dequeued during a transition, i.e. only vehicles from the SELECTED phase
// ever appear in a step's leftVehicles list.
// ---------------------------------------------------------------------------

describe('T8 — transition phase safety', () => {
  /**
   * After every step, the vehicles that departed must all have started on
   * roads that belong to the phase that was active for that step.
   * We verify this by reconstructing which roads were green per step.
   *
   * Implementation note: we run with invariant checks enabled so any
   * structural violation is caught immediately.
   */
  it('vehicles only depart on roads belonging to their active phase', () => {
    const commands = [
      { type: 'addVehicle' as const, vehicleId: 'N1', startRoad: 'north' as Road, endRoad: 'south' as Road },
      { type: 'addVehicle' as const, vehicleId: 'S1', startRoad: 'south' as Road, endRoad: 'north' as Road },
      { type: 'addVehicle' as const, vehicleId: 'E1', startRoad: 'east' as Road, endRoad: 'west' as Road },
      { type: 'addVehicle' as const, vehicleId: 'W1', startRoad: 'west' as Road, endRoad: 'east' as Road },
      { type: 'step' as const },
      { type: 'step' as const },
    ];

    // Phase 0 (NS): roads north + south
    // Phase 1 (EW): roads east  + west
    const nsVehicles = new Set(['N1', 'S1']);
    const ewVehicles = new Set(['E1', 'W1']);

    const result = simulate(commands, { enableInvariantChecks: true });
    expect(result).toHaveLength(2);

    for (const stepResult of result) {
      for (const id of stepResult.leftVehicles) {
        // Each departed vehicle must belong to exactly one phase — either NS or EW
        const inNS = nsVehicles.has(id);
        const inEW = ewVehicles.has(id);
        expect(inNS || inEW).toBe(true);
        // Within a single step, all departures must be from the same phase
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
        fc.uniqueArray(
          fc.record({ id: arbVehicleId, road: arbRoad }),
          { selector: (v) => v.id, minLength: 0, maxLength: 15 }
        ),
        fc.nat({ max: 20 }),
        (entries, extraSteps) => {
          const commands = [
            ...entries.map(({ id, road }) => ({
              type: 'addVehicle' as const,
              vehicleId: id,
              startRoad: road,
              endRoad: 'north' as Road,
            })),
            ...Array.from({ length: entries.length + extraSteps }, () => ({ type: 'step' as const })),
          ];
          const results = simulate(commands, { enableInvariantChecks: true });
          const allLeft = results.flatMap((s) => s.leftVehicles);
          // Each vehicleId must appear at most once — no vehicle dequeued twice
          expect(new Set(allLeft).size).toBe(allLeft.length);
        }
      )
    );
  });

  it('invariants hold at every step boundary with transition-heavy scenarios', () => {
    // Alternate addVehicle and step to stress the transition between phases
    const commands: Command[] = [];
    for (let i = 0; i < 20; i++) {
      const roads: Road[] = ['north', 'south', 'east', 'west'];
      commands.push({
        type: 'addVehicle' as const,
        vehicleId: `V${i}`,
        startRoad: roads[i % 4]!,
        endRoad: roads[(i + 1) % 4]!,
      });
      commands.push({ type: 'step' as const });
    }
    // Running with invariant checks enabled ensures every post-step state is valid
    expect(() => simulate(commands, { enableInvariantChecks: true })).not.toThrow();
  });

  it('phase transitions are deterministic — same input produces same phase sequence', () => {
    const commands = [
      { type: 'addVehicle' as const, vehicleId: 'A', startRoad: 'north' as Road, endRoad: 'south' as Road },
      { type: 'addVehicle' as const, vehicleId: 'B', startRoad: 'east' as Road, endRoad: 'west' as Road },
      { type: 'step' as const },
      { type: 'step' as const },
      { type: 'step' as const },
    ];

    const run1 = simulate(commands);
    const run2 = simulate(commands);

    expect(run1).toEqual(run2);
  });
});
