/**
 * T10 — End-to-End Regression Pack
 *
 * Tests the full pipeline: JSON string → parseInput → simulate → writeOutput → verify.
 *
 * Each scenario is self-contained and exercises a distinct behaviour:
 *
 *  1.  Empty commands array
 *  2.  Single addVehicle with no step — vehicle never departs
 *  3.  Canonical specification example (V1/V2)
 *  4.  Multiple steps with mixed NS/EW loading
 *  5.  Step-only commands (no vehicles)
 *  6.  Interleaved addVehicle/step
 *  7.  Large input (100 vehicles, 60 steps)
 *  8.  All vehicles on one road — FIFO drains in order
 *  9.  Error: invalid JSON
 * 10.  Error: unknown command type
 * 11.  Error: invalid road name
 * 12.  Error: missing vehicleId
 * 13.  Error: empty-string vehicleId
 * 14.  Output schema conformance — every output is valid JSON with `stepStatuses`
 * 15.  Fixture file round-trip — canonical spec fixture matches expected fixture
 * 16.  100-command stress test — no vehicle departs twice
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseInput, ParseError } from '../../io/parser.js';
import { writeOutput } from '../../io/writer.js';
import { simulate } from '../../simulator/engine.js';
import { OutputSchema } from '../../io/schemas.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run the full pipeline and return the parsed output object. */
function pipeline(rawJson: string): { stepStatuses: { leftVehicles: string[] }[] } {
  const commands = parseInput(rawJson);
  const statuses = simulate(commands);
  const outputJson = writeOutput(statuses);
  return JSON.parse(outputJson) as { stepStatuses: { leftVehicles: string[] }[] };
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

const fixturesDir = resolve(import.meta.dirname ?? __dirname, '../fixtures');

function fixture(name: string): string {
  return readFileSync(resolve(fixturesDir, name), 'utf-8');
}

// ---------------------------------------------------------------------------
// 1. Empty commands array
// ---------------------------------------------------------------------------

describe('E2E — empty commands', () => {
  it('returns stepStatuses: [] for an empty commands array', () => {
    const output = pipeline(json({ commands: [] }));
    expect(output.stepStatuses).toEqual([]);
  });

  it('empty commands fixture file produces empty stepStatuses', () => {
    const output = pipeline(fixture('empty.json'));
    expect(output.stepStatuses).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Single addVehicle, no step
// ---------------------------------------------------------------------------

describe('E2E — single addVehicle, no step', () => {
  it('produces no step statuses when there is no step command', () => {
    const output = pipeline(
      json({
        commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' }],
      })
    );
    expect(output.stepStatuses).toEqual([]);
  });

  it('fixture: single-add-no-step.json produces no step statuses', () => {
    const output = pipeline(fixture('single-add-no-step.json'));
    expect(output.stepStatuses).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Canonical specification example
// ---------------------------------------------------------------------------

describe('E2E — canonical specification example', () => {
  it('produces the exact output described in the specification', () => {
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    });

    const output = pipeline(input);

    expect(output.stepStatuses).toHaveLength(2);
    expect(output.stepStatuses[0]?.leftVehicles).toContain('V1');
    expect(output.stepStatuses[1]?.leftVehicles).toContain('V2');
  });

  it('fixture: canonical-spec.json matches canonical-spec-expected.json', () => {
    const output = pipeline(fixture('canonical-spec.json'));
    const expected = JSON.parse(fixture('canonical-spec-expected.json')) as {
      stepStatuses: { leftVehicles: string[] }[];
    };

    expect(output.stepStatuses).toHaveLength(expected.stepStatuses.length);
    for (let i = 0; i < expected.stepStatuses.length; i++) {
      const got = output.stepStatuses[i]?.leftVehicles ?? [];
      const want = expected.stepStatuses[i]?.leftVehicles ?? [];
      // Use set comparison so ordering within a single step is irrelevant
      expect(new Set(got)).toEqual(new Set(want));
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Multiple steps with mixed NS/EW loading
// ---------------------------------------------------------------------------

describe('E2E — multiple steps, mixed loading', () => {
  it('drains NS first when NS is heavier, then switches to EW', () => {
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'N2', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'S1', startRoad: 'south', endRoad: 'north' },
        { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
        { type: 'addVehicle', vehicleId: 'W1', startRoad: 'west', endRoad: 'east' },
        { type: 'step' }, // NS wins (3 > 2): N1+S1 depart
        { type: 'step' }, // NS wins (1 < 2): EW wins: E1+W1 depart
        { type: 'step' }, // NS wins: N2 departs
        { type: 'step' }, // empty
      ],
    });

    const output = pipeline(input);
    expect(output.stepStatuses).toHaveLength(4);

    const step1 = output.stepStatuses[0]?.leftVehicles ?? [];
    const step2 = output.stepStatuses[1]?.leftVehicles ?? [];
    const step3 = output.stepStatuses[2]?.leftVehicles ?? [];
    const step4 = output.stepStatuses[3]?.leftVehicles ?? [];

    // Step 1: NS phase (load 3 > EW load 2) — N1 and S1
    expect(new Set(step1)).toEqual(new Set(['N1', 'S1']));
    // Step 2: EW phase (load 2 > NS load 1) — E1 and W1
    expect(new Set(step2)).toEqual(new Set(['E1', 'W1']));
    // Step 3: NS phase (only N2 remains)
    expect(step3).toContain('N2');
    // Step 4: all empty
    expect(step4).toHaveLength(0);
  });

  it('fixture: multi-step.json produces correct vehicle counts', () => {
    const output = pipeline(fixture('multi-step.json'));
    expect(output.stepStatuses).toHaveLength(4);

    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    // 5 vehicles total; after 4 steps (each clears up to 2) all should have departed
    expect(allLeft).toHaveLength(5);
    expect(new Set(allLeft).size).toBe(5); // no duplicates
  });
});

// ---------------------------------------------------------------------------
// 5. Step-only commands (no vehicles)
// ---------------------------------------------------------------------------

describe('E2E — step-only commands', () => {
  it('produces leftVehicles: [] for every step when no vehicles are added', () => {
    const input = json({ commands: Array.from({ length: 5 }, () => ({ type: 'step' })) });
    const output = pipeline(input);
    expect(output.stepStatuses).toHaveLength(5);
    output.stepStatuses.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });
});

// ---------------------------------------------------------------------------
// 6. Interleaved addVehicle / step
// ---------------------------------------------------------------------------

describe('E2E — interleaved addVehicle/step', () => {
  it('processes each vehicle at the correct step', () => {
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
        { type: 'step' }, // A departs (NS phase wins with 1 vs 0)
        { type: 'addVehicle', vehicleId: 'B', startRoad: 'east', endRoad: 'west' },
        { type: 'step' }, // B departs (EW phase wins with 1 vs 0)
        { type: 'addVehicle', vehicleId: 'C', startRoad: 'south', endRoad: 'north' },
        { type: 'addVehicle', vehicleId: 'D', startRoad: 'west', endRoad: 'east' },
        { type: 'step' }, // tied: NS first (alternated from EW last used), C departs
        { type: 'step' }, // D departs
      ],
    });

    const output = pipeline(input);
    expect(output.stepStatuses).toHaveLength(4);
    expect(output.stepStatuses[0]?.leftVehicles).toContain('A');
    expect(output.stepStatuses[1]?.leftVehicles).toContain('B');
    expect(output.stepStatuses[2]?.leftVehicles).toContain('C');
    expect(output.stepStatuses[3]?.leftVehicles).toContain('D');
  });
});

// ---------------------------------------------------------------------------
// 7. Large input (100 vehicles, 60 steps)
// ---------------------------------------------------------------------------

describe('E2E — large input', () => {
  it('processes 100 vehicles and 60 steps without error', () => {
    const output = pipeline(fixture('large-100-vehicles.json'));
    expect(output.stepStatuses).toHaveLength(60);

    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    // At most 100 vehicles can depart (we only have 100); 60 steps × 2 roads = 120 slots
    expect(allLeft.length).toBeLessThanOrEqual(100);
    // No vehicle departs twice
    expect(new Set(allLeft).size).toBe(allLeft.length);
  });

  it('large input: all departed vehicle IDs are in the original set (V0–V99)', () => {
    const output = pipeline(fixture('large-100-vehicles.json'));
    const validIds = new Set(Array.from({ length: 100 }, (_, i) => `V${i}`));
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    for (const id of allLeft) {
      expect(validIds.has(id)).toBe(true);
    }
  });

  it('large input: 60 steps are sufficient to drain all 100 vehicles (each step clears 2)', () => {
    const output = pipeline(fixture('large-100-vehicles.json'));
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    // 60 steps × up to 2 departures each = 120 capacity — all 100 should have departed
    expect(allLeft).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
// 8. All vehicles on one road — FIFO drain order
// ---------------------------------------------------------------------------

describe('E2E — FIFO drain order', () => {
  it('vehicles on a single road depart in insertion order', () => {
    const vehicleIds = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'];
    const commands = [
      ...vehicleIds.map((id) => ({
        type: 'addVehicle' as const,
        vehicleId: id,
        startRoad: 'north' as const,
        endRoad: 'south' as const,
      })),
      ...Array.from({ length: 5 }, () => ({ type: 'step' as const })),
    ];

    const output = pipeline(json({ commands }));
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);

    // All five must depart
    expect(allLeft).toHaveLength(5);
    // They must depart in insertion order (since NS phase wins every time)
    expect(allLeft).toEqual(vehicleIds);
  });
});

// ---------------------------------------------------------------------------
// 9–13. Error scenarios
// ---------------------------------------------------------------------------

describe('E2E — error: invalid JSON', () => {
  it('throws ParseError for malformed JSON input', () => {
    expect(() => pipeline('{not valid json')).toThrow(ParseError);
  });

  it('ParseError message indicates the JSON parse failure', () => {
    try {
      pipeline('{bad');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toMatch(/json/i);
    }
  });
});

describe('E2E — error: unknown command type', () => {
  it('throws ParseError for an unrecognised command type', () => {
    const input = json({ commands: [{ type: 'teleportVehicle', vehicleId: 'V1' }] });
    expect(() => pipeline(input)).toThrow(ParseError);
  });
});

describe('E2E — error: invalid road name', () => {
  it('throws ParseError for a non-cardinal startRoad', () => {
    expect(() => pipeline(fixture('error-invalid-road.json'))).toThrow(ParseError);
  });

  it('throws ParseError for an endRoad with wrong casing', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'SOUTH' }],
    });
    expect(() => pipeline(input)).toThrow(ParseError);
  });
});

describe('E2E — error: missing vehicleId', () => {
  it('throws ParseError when vehicleId is absent from addVehicle', () => {
    const input = json({
      commands: [{ type: 'addVehicle', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => pipeline(input)).toThrow(ParseError);
  });
});

describe('E2E — error: empty-string vehicleId', () => {
  it('throws ParseError when vehicleId is an empty string', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: '', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => pipeline(input)).toThrow(ParseError);
  });
});

// ---------------------------------------------------------------------------
// 14. Output schema conformance
// ---------------------------------------------------------------------------

describe('E2E — output schema conformance', () => {
  const scenarios = [
    json({ commands: [] }),
    json({ commands: [{ type: 'step' }] }),
    json({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    }),
    json({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'east', endRoad: 'west' },
        { type: 'step' },
      ],
    }),
  ];

  for (const [idx, input] of scenarios.entries()) {
    it(`scenario #${idx + 1} produces output that validates against OutputSchema`, () => {
      const commands = parseInput(input);
      const statuses = simulate(commands);
      const outputJson = writeOutput(statuses);
      const parsed = JSON.parse(outputJson);
      const result = OutputSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    });
  }

  it('every leftVehicles entry is a non-empty string', () => {
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'south', endRoad: 'north' },
        { type: 'addVehicle', vehicleId: 'V3', startRoad: 'east', endRoad: 'west' },
        { type: 'step' },
        { type: 'step' },
      ],
    });
    const output = pipeline(input);
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    for (const id of allLeft) {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it('output JSON always has a top-level "stepStatuses" key', () => {
    const input = json({ commands: [{ type: 'step' }] });
    const outputJson = writeOutput(simulate(parseInput(input)));
    const obj = JSON.parse(outputJson) as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(obj, 'stepStatuses')).toBe(true);
    expect(Array.isArray(obj['stepStatuses'])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 15. Fixture file round-trip
// ---------------------------------------------------------------------------

describe('E2E — fixture round-trip', () => {
  it('re-running canonical-spec.json produces the same output on every call', () => {
    const run1 = pipeline(fixture('canonical-spec.json'));
    const run2 = pipeline(fixture('canonical-spec.json'));
    expect(run1).toEqual(run2);
  });

  it('re-running large-100-vehicles.json produces the same output on every call', () => {
    const run1 = pipeline(fixture('large-100-vehicles.json'));
    const run2 = pipeline(fixture('large-100-vehicles.json'));
    expect(run1).toEqual(run2);
  });
});

// ---------------------------------------------------------------------------
// 16. No vehicle departs twice (100-command stress test)
// ---------------------------------------------------------------------------

describe('E2E — 100-command stress test, no double departures', () => {
  it('no vehicle ID appears in leftVehicles more than once across all step statuses', () => {
    const output = pipeline(fixture('large-100-vehicles.json'));
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    expect(new Set(allLeft).size).toBe(allLeft.length);
  });

  it('all vehicles eventually depart given enough steps', () => {
    // Build a 100-vehicle scenario with exactly enough steps to drain all queues
    // (100 vehicles across 4 roads; each step clears 2 roads = 2 vehicles max → 50 steps needed)
    const commands = [];
    for (let i = 0; i < 100; i++) {
      const roads = ['north', 'south', 'east', 'west'] as const;
      commands.push({
        type: 'addVehicle' as const,
        vehicleId: `X${i}`,
        startRoad: roads[i % 4]!,
        endRoad: roads[(i + 2) % 4]!,
      });
    }
    // 50 NS steps × 2 + 50 EW steps × 2 = 200 vehicle slots — more than enough
    for (let i = 0; i < 60; i++) {
      commands.push({ type: 'step' as const });
    }

    const output = pipeline(json({ commands }));
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    expect(allLeft).toHaveLength(100);
    expect(new Set(allLeft).size).toBe(100);
  });
});
