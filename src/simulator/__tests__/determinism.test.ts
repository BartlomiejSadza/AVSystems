/**
 * T9 — Determinism and Reproducibility Tests
 *
 * The simulation is a pure function: given the same input it must always
 * produce byte-for-byte identical output, regardless of how many times it
 * is called or in what order.
 *
 * Coverage:
 *  - Fixed replay: same command list → same StepStatus array
 *  - Property-based replay: fast-check generates random command sequences
 *    and verifies that two independent runs yield the same result
 *  - Independence: two concurrent simulation instances do not share state
 *  - Serialisation round-trip: JSON output is deterministic
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { simulate } from '../engine.js';
import { parseInput } from '../../io/parser.js';
import { writeOutput } from '../../io/writer.js';
import type { Command, Road } from '../types.js';
import { ROADS } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const fast = { signalTimings: FAST_SIGNAL_TIMINGS };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROAD_LIST: readonly Road[] = ROADS;

function buildCommands(seed: number): Command[] {
  // Deterministic pseudo-random command list based on seed
  const commands: Command[] = [];
  let vehicleCounter = 0;
  for (let i = 0; i < 20; i++) {
    const action = (seed * 17 + i * 31) % 3; // 0 or 1 = addVehicle, 2 = step
    if (action < 2) {
      const startIdx = (seed + i) % 4;
      const endIdx = (seed + i + 1) % 4;
      commands.push({
        type: 'addVehicle',
        vehicleId: `V${seed}-${vehicleCounter++}`,
        startRoad: ROAD_LIST[startIdx]!,
        endRoad: ROAD_LIST[endIdx]!,
      });
    } else {
      commands.push({ type: 'step' });
    }
  }
  return commands;
}

// ---------------------------------------------------------------------------
// Fixed replay tests
// ---------------------------------------------------------------------------

describe('T9 — fixed replay determinism', () => {
  it('canonical spec example produces identical output on every run', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
      { type: 'step' },
      { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];

    const run1 = simulate(commands, fast);
    const run2 = simulate(commands, fast);
    const run3 = simulate(commands, fast);

    expect(run1).toEqual(run2);
    expect(run2).toEqual(run3);
  });

  it('empty command list always returns an empty array', () => {
    for (let i = 0; i < 5; i++) {
      expect(simulate([])).toEqual([]);
    }
  });

  it('step-only commands always produce empty leftVehicles arrays', () => {
    const commands: Command[] = Array.from({ length: 5 }, () => ({ type: 'step' }));
    const run1 = simulate(commands, fast);
    const run2 = simulate(commands, fast);
    expect(run1).toEqual(run2);
    run1.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });

  it('NS-heavy scenario repeats identically 10 times', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'N2', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'N3', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'S1', startRoad: 'south', endRoad: 'north' },
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'step' },
      { type: 'step' },
    ];

    const reference = simulate(commands, fast);
    for (let i = 0; i < 10; i++) {
      expect(simulate(commands, fast)).toEqual(reference);
    }
  });

  it('alternating addVehicle/step pattern repeats identically', () => {
    const commands: Command[] = [];
    for (let i = 0; i < 8; i++) {
      commands.push({
        type: 'addVehicle',
        vehicleId: `V${i}`,
        startRoad: ROAD_LIST[i % 4]!,
        endRoad: ROAD_LIST[(i + 1) % 4]!,
      });
      commands.push({ type: 'step' });
    }

    const reference = simulate(commands, fast);
    for (let i = 0; i < 5; i++) {
      expect(simulate(commands, fast)).toEqual(reference);
    }
  });
});

// ---------------------------------------------------------------------------
// Independence: two instances do not share state
// ---------------------------------------------------------------------------

describe('T9 — simulation instance independence', () => {
  it('two simulation calls with the same input are independent (no shared mutable state)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];

    // Start run1, then run2 — they must not affect each other
    const run1 = simulate(commands, fast);
    const run2 = simulate(commands, fast);
    expect(run1).toEqual(run2);
  });

  it('running a longer simulation after a shorter one gives the same result as running it alone', () => {
    const short: Command[] = [
      { type: 'addVehicle', vehicleId: 'A', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
    ];
    const long: Command[] = [
      { type: 'addVehicle', vehicleId: 'B', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'C', startRoad: 'south', endRoad: 'north' },
      { type: 'step' },
      { type: 'step' },
    ];

    simulate(short, fast); // run and discard
    const longResult = simulate(long, fast);
    const longAlone = simulate(long, fast);
    expect(longResult).toEqual(longAlone);
  });
});

// ---------------------------------------------------------------------------
// JSON serialisation determinism
// ---------------------------------------------------------------------------

describe('T9 — JSON output determinism', () => {
  it('writeOutput produces identical JSON strings for identical inputs', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
      { type: 'step' },
    ];

    const result = simulate(commands, fast);
    const json1 = writeOutput(result);
    const json2 = writeOutput(result);
    expect(json1).toBe(json2);
  });

  it('parse → simulate → write pipeline is deterministic end-to-end', () => {
    const rawJson = JSON.stringify({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'east', endRoad: 'west' },
        { type: 'step' },
        { type: 'step' },
      ],
    });

    const pipeline = () => {
      const { commands } = parseInput(rawJson);
      return writeOutput(simulate(commands));
    };

    const out1 = pipeline();
    const out2 = pipeline();
    const out3 = pipeline();

    expect(out1).toBe(out2);
    expect(out2).toBe(out3);
  });

  it('compact and pretty JSON are both deterministic', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];

    const result = simulate(commands, fast);
    const pretty1 = writeOutput(result, true);
    const pretty2 = writeOutput(result, true);
    const compact1 = writeOutput(result, false);
    const compact2 = writeOutput(result, false);

    expect(pretty1).toBe(pretty2);
    expect(compact1).toBe(compact2);
  });
});

// ---------------------------------------------------------------------------
// Property-based replay tests (fast-check)
// ---------------------------------------------------------------------------

const arbRoad = fc.constantFrom(...ROADS);
const arbVehicleId = fc
  .tuple(fc.string({ minLength: 1, maxLength: 6 }), fc.nat(999))
  .map(([s, n]) => `${s}-${n}`);

/**
 * Generate a random but valid sequence of commands.
 * Uses uniqueArray to avoid duplicate vehicleIds within a single run.
 */
const arbCommandSequence = fc
  .uniqueArray(
    fc.record({
      vehicleId: arbVehicleId,
      startRoad: arbRoad,
      endRoad: arbRoad,
    }),
    { selector: (v) => v.vehicleId, minLength: 0, maxLength: 20 }
  )
  .chain((vehicles) => {
    const addCmds: Command[] = vehicles.map((v) => ({
      type: 'addVehicle',
      vehicleId: v.vehicleId,
      startRoad: v.startRoad,
      endRoad: v.endRoad,
    }));
    return fc
      .array(fc.constantFrom<Command>({ type: 'step' }), { minLength: 0, maxLength: 15 })
      .map((steps) => [...addCmds, ...steps]);
  });

describe('T9 — property-based reproducibility', () => {
  it('any random command sequence produces identical results when replayed', () => {
    fc.assert(
      fc.property(arbCommandSequence, (commands) => {
        const run1 = simulate(commands, fast);
        const run2 = simulate(commands, fast);
        expect(run1).toEqual(run2);
      }),
      { numRuns: 200 }
    );
  });

  it('stepStatuses length equals the number of step commands — always', () => {
    fc.assert(
      fc.property(arbCommandSequence, (commands) => {
        const stepCount = commands.filter((c) => c.type === 'step').length;
        const result = simulate(commands, fast);
        expect(result).toHaveLength(stepCount);
        expect(simulate(commands, fast)).toHaveLength(stepCount);
      }),
      { numRuns: 200 }
    );
  });

  it('JSON output is byte-identical across two runs for any random input', () => {
    fc.assert(
      fc.property(arbCommandSequence, (commands) => {
        const out1 = writeOutput(simulate(commands, fast), false);
        const out2 = writeOutput(simulate(commands, fast), false);
        expect(out1).toBe(out2);
      }),
      { numRuns: 100 }
    );
  });

  it('command order matters — different orderings may produce different results (non-commutativity sanity check)', () => {
    // This test documents that the simulation is NOT order-independent,
    // which is expected and desirable (FIFO queues, adaptive phase selection).
    // We verify that at least some orderings produce different outputs.
    const a: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
    ];

    const b: Command[] = [
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];

    const resultA = simulate(a, fast);
    const resultB = simulate(b, fast);

    expect(simulate(a, fast)).toEqual(resultA);
    expect(simulate(b, fast)).toEqual(resultB);

    expect(resultA[0]?.leftVehicles).toContain('N1');
    expect(resultB.some((s) => s.leftVehicles.includes('E1'))).toBe(true);
    expect(resultB[0]?.leftVehicles).not.toContain('E1');
  });

  it('seed-based deterministic scenarios are reproducible', () => {
    for (let seed = 0; seed < 10; seed++) {
      const commands = buildCommands(seed);
      const reference = simulate(commands, fast);
      for (let run = 0; run < 3; run++) {
        expect(simulate(commands, fast)).toEqual(reference);
      }
    }
  });
});
