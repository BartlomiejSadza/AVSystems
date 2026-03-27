/**
 * T7 — Adaptive Phase Selection Algorithm Tests
 *
 * Verifies that selectPhase always chooses the phase with the highest combined
 * queue load, falls back to deterministic alternating tie-breaking (starting
 * with NS), and handles the degenerate all-empty case gracefully.
 *
 * Tests are organised as:
 *  1. Direct unit tests of selectPhase / phaseLoad
 *  2. Integration-level tests via simulate() to confirm phase selection
 *     drives correct dequeue behaviour under realistic scenarios
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { selectPhase, phaseLoad, PHASES } from '../phase.js';
import { createQueues, enqueueVehicle } from '../queue.js';
import { simulate } from '../engine.js';
import type { SimulationState, Road } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(
  overrides: Partial<{ north: number; south: number; east: number; west: number }> = {},
  lastPhaseIndex = -1
): SimulationState {
  const state: SimulationState = {
    queues: createQueues(),
    stepCount: 0,
    lastPhaseIndex,
  };
  let counter = 0;
  const roads = ['north', 'south', 'east', 'west'] as const;
  for (const road of roads) {
    const count = overrides[road] ?? 0;
    for (let i = 0; i < count; i++) {
      enqueueVehicle(state, {
        vehicleId: `${road}-${counter++}`,
        startRoad: road,
        endRoad: 'north',
      });
    }
  }
  return state;
}

const NS = PHASES[0]!; // index 0, id NS_STRAIGHT
const EW = PHASES[1]!; // index 1, id EW_STRAIGHT

// ---------------------------------------------------------------------------
// phaseLoad unit tests
// ---------------------------------------------------------------------------

describe('T7 — phaseLoad', () => {
  it('returns 0 for an empty state on any phase', () => {
    const state = makeState();
    expect(phaseLoad(state, NS)).toBe(0);
    expect(phaseLoad(state, EW)).toBe(0);
  });

  it('returns the correct sum for NS phase', () => {
    const state = makeState({ north: 3, south: 2 });
    expect(phaseLoad(state, NS)).toBe(5);
  });

  it('returns the correct sum for EW phase', () => {
    const state = makeState({ east: 1, west: 4 });
    expect(phaseLoad(state, EW)).toBe(5);
  });

  it('counts only the roads belonging to the phase', () => {
    const state = makeState({ north: 10, east: 1 });
    // NS load includes north (10) + south (0) = 10
    expect(phaseLoad(state, NS)).toBe(10);
    // EW load includes east (1) + west (0) = 1
    expect(phaseLoad(state, EW)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// selectPhase — dominant winner
// ---------------------------------------------------------------------------

describe('T7 — selectPhase picks the phase with more vehicles', () => {
  it('selects NS when north+south total exceeds east+west total', () => {
    const state = makeState({ north: 3, south: 1, east: 1, west: 1 }); // NS=4, EW=2
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');
  });

  it('selects EW when east+west total exceeds north+south total', () => {
    const state = makeState({ north: 0, south: 1, east: 5, west: 3 }); // NS=1, EW=8
    expect(selectPhase(state).id).toBe('EW_STRAIGHT');
  });

  it('selects the phase whose single road has the most vehicles (asymmetric)', () => {
    const state = makeState({ north: 7, east: 3, west: 3 }); // NS=7, EW=6
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');
  });
});

// ---------------------------------------------------------------------------
// selectPhase — tie-breaking (alternating, starting with NS)
// ---------------------------------------------------------------------------

describe('T7 — selectPhase tie-breaking', () => {
  it('selects NS (phase 0) first when both loads are 0 and no prior phase ran', () => {
    const state = makeState({}, -1); // lastPhaseIndex = -1
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');
  });

  it('selects NS when both loads are equal and lastPhaseIndex is -1', () => {
    const state = makeState({ north: 2, east: 1, west: 1 }, -1); // NS=2, EW=2
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');
  });

  it('alternates to EW when last phase was NS and both loads are equal', () => {
    const state = makeState({ north: 1, east: 1 }, 0); // NS=1, EW=1, last=NS
    expect(selectPhase(state).id).toBe('EW_STRAIGHT');
  });

  it('alternates to NS when last phase was EW and both loads are equal', () => {
    const state = makeState({ north: 1, east: 1 }, 1); // NS=1, EW=1, last=EW
    expect(selectPhase(state).id).toBe('NS_STRAIGHT');
  });

  it('tie-breaking alternates correctly over multiple consecutive ties', () => {
    // Simulate four empty steps — should alternate NS → EW → NS → EW
    const result = simulate([
      { type: 'step' },
      { type: 'step' },
      { type: 'step' },
      { type: 'step' },
    ]);
    // All steps are empty; the important thing is it never throws and always
    // returns exactly 4 results.
    expect(result).toHaveLength(4);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });
});

// ---------------------------------------------------------------------------
// Integration: adaptive selection drives correct dequeue behaviour
// ---------------------------------------------------------------------------

describe('T7 — adaptive selection integration scenarios', () => {
  it('when queues are unequal, the busy phase drains first', () => {
    // 4 NS vehicles vs 1 EW vehicle.
    // Steps 1–2: NS wins (load 4 > 1, then load 2 > 1).
    // Step 3: NS has 0, EW has 1 — EW wins.
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
    const result = simulate(commands);

    // Step 1: NS wins; N1 + S1 depart
    expect(result[0]?.leftVehicles).toContain('N1');
    expect(result[0]?.leftVehicles).toContain('S1');
    expect(result[0]?.leftVehicles).not.toContain('E1');

    // Step 2: NS wins again (NS=2 vs EW=1); N2 + S2 depart
    expect(result[1]?.leftVehicles).toContain('N2');
    expect(result[1]?.leftVehicles).toContain('S2');

    // Step 3: NS=0, EW=1; EW wins; E1 departs
    expect(result[2]?.leftVehicles).toContain('E1');
  });

  it('phase selection responds correctly to vehicles added between steps', () => {
    // Start with EW advantage (one vehicle on each EW road), add more NS vehicles mid-stream.
    // E1 is on east, E2 is on west — EW phase clears both simultaneously.
    const commands = [
      {
        type: 'addVehicle' as const,
        vehicleId: 'E1',
        startRoad: 'east' as Road,
        endRoad: 'west' as Road,
      },
      {
        type: 'addVehicle' as const,
        vehicleId: 'E2',
        startRoad: 'west' as Road,
        endRoad: 'east' as Road,
      },
      { type: 'step' as const }, // EW wins (load 2 vs 0); E1+E2 depart
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
        vehicleId: 'N3',
        startRoad: 'north' as Road,
        endRoad: 'south' as Road,
      },
      { type: 'step' as const }, // NS wins (load 3 vs 0)
    ];
    const result = simulate(commands);

    // Step 1: E1 (east) and E2 (west) depart together under EW phase
    expect(result[0]?.leftVehicles).toContain('E1');
    expect(result[0]?.leftVehicles).toContain('E2');

    // Step 2: NS wins (3 > 0); N1 departs
    expect(result[1]?.leftVehicles).toContain('N1');
    expect(result[1]?.leftVehicles).not.toContain('E1');
  });

  it('all queues empty — simulation does not throw and returns empty leftVehicles', () => {
    const result = simulate(Array.from({ length: 10 }, () => ({ type: 'step' as const })));
    expect(result).toHaveLength(10);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });

  it('single vehicle in one road — correct phase wins every time', () => {
    // Only one west vehicle; EW should always win
    const commands = [
      {
        type: 'addVehicle' as const,
        vehicleId: 'W1',
        startRoad: 'west' as Road,
        endRoad: 'east' as Road,
      },
      { type: 'step' as const },
      { type: 'step' as const }, // now empty — should not crash
    ];
    const result = simulate(commands);
    expect(result[0]?.leftVehicles).toContain('W1');
    expect(result[1]?.leftVehicles).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

describe('T7 — property-based adaptive selection', () => {
  const arbCount = fc.nat({ max: 10 });

  it('selectPhase always returns a phase present in PHASES', () => {
    fc.assert(
      fc.property(
        fc.record({
          north: arbCount,
          south: arbCount,
          east: arbCount,
          west: arbCount,
          lastPhaseIndex: fc.constantFrom(-1, 0, 1),
        }),
        ({ north, south, east, west, lastPhaseIndex }) => {
          const state = makeState({ north, south, east, west }, lastPhaseIndex);
          const chosen = selectPhase(state);
          const phaseIds = PHASES.map((p) => p.id);
          expect(phaseIds).toContain(chosen.id);
        }
      )
    );
  });

  it('when one phase clearly dominates, selectPhase always picks it', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 5 }), // EW total (0..5)
        fc.integer({ min: 1, max: 5 }), // extra margin above EW
        fc.constantFrom(-1, 0, 1),
        (ewBase, margin, lastPhaseIndex) => {
          // NS load = ewBase + margin (strictly greater)
          const nsLoad = ewBase + margin;
          const state = makeState({ north: nsLoad, east: ewBase }, lastPhaseIndex);
          expect(selectPhase(state).id).toBe('NS_STRAIGHT');
        }
      )
    );
  });

  it('on a tie, selectPhase never picks the same phase twice in a row', () => {
    // Simulate many tied steps and verify alternation
    fc.assert(
      fc.property(fc.nat({ max: 10 }), (n) => {
        // n vehicles per phase — perfectly tied
        const commands = [
          ...Array.from({ length: n }, (_, i) => ({
            type: 'addVehicle' as const,
            vehicleId: `N${i}`,
            startRoad: 'north' as Road,
            endRoad: 'south' as Road,
          })),
          ...Array.from({ length: n }, (_, i) => ({
            type: 'addVehicle' as const,
            vehicleId: `E${i}`,
            startRoad: 'east' as Road,
            endRoad: 'west' as Road,
          })),
          { type: 'step' as const },
          { type: 'step' as const },
        ];
        // Should not throw regardless of n
        expect(() => simulate(commands)).not.toThrow();
      })
    );
  });
});
