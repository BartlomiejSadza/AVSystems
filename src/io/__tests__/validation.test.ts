/**
 * T6 — Input Error Validation Tests
 *
 * Verifies that the parser rejects malformed input with clear, actionable
 * error messages. The zod-backed InputSchema and the ParseError class are
 * the primary subjects under test.
 *
 * Categories covered:
 *  - Missing required fields on addVehicle commands
 *  - Unknown / unsupported command types
 *  - Invalid road names (values outside north/south/east/west)
 *  - Duplicate vehicleId values in the command list (engine-level guard)
 *  - Empty-string vehicleId
 */

import { describe, it, expect } from 'vitest';
import { parseInput, ParseError } from '../parser.js';
import { simulate } from '../../simulator/engine.js';
import type { Command } from '../../simulator/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(value: unknown): string {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// Missing required fields on addVehicle
// ---------------------------------------------------------------------------

describe('T6 — missing required fields on addVehicle', () => {
  it('throws ParseError when vehicleId is absent', () => {
    const input = json({
      commands: [{ type: 'addVehicle', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('error message mentions the missing field path for vehicleId', () => {
    const input = json({
      commands: [{ type: 'addVehicle', startRoad: 'north', endRoad: 'south' }],
    });
    try {
      parseInput(input);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toMatch(/vehicleId/i);
    }
  });

  it('throws ParseError when startRoad is absent', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError when endRoad is absent', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError when all three fields are absent', () => {
    const input = json({
      commands: [{ type: 'addVehicle' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('succeeds when all required fields are present', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' }],
    });
    const commands = parseInput(input);
    expect(commands).toHaveLength(1);
    expect(commands[0]?.type).toBe('addVehicle');
  });
});

// ---------------------------------------------------------------------------
// Unknown command types
// ---------------------------------------------------------------------------

describe('T6 — unknown command types', () => {
  it('throws ParseError for an unrecognised command type', () => {
    const input = json({
      commands: [{ type: 'removeVehicle', vehicleId: 'V1' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for a numeric command type', () => {
    const input = json({
      commands: [{ type: 42 }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for a command with no type field', () => {
    const input = json({
      commands: [{ vehicleId: 'V1', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for an empty-object command', () => {
    const input = json({ commands: [{}] });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('accepts "addVehicle" and "step" as the only valid types', () => {
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    });
    expect(() => parseInput(input)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Invalid road names
// ---------------------------------------------------------------------------

describe('T6 — invalid road names', () => {
  it('throws ParseError when startRoad is not a cardinal direction', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'diagonal', endRoad: 'north' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError when endRoad is not a cardinal direction', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'up' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for road names with wrong casing (case-sensitive)', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'North', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for numeric road values', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 1, endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('accepts all four valid road names', () => {
    const roads = ['north', 'south', 'east', 'west'] as const;
    for (const road of roads) {
      const input = json({
        commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: road, endRoad: road }],
      });
      expect(() => parseInput(input)).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Empty-string vehicleId
// ---------------------------------------------------------------------------

describe('T6 — empty-string vehicleId', () => {
  it('throws ParseError when vehicleId is an empty string', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: '', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('error message mentions vehicleId for the empty-string case', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: '', startRoad: 'north', endRoad: 'south' }],
    });
    try {
      parseInput(input);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toMatch(/vehicleId/i);
    }
  });

  it('accepts a single-character vehicleId', () => {
    const input = json({
      commands: [{ type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(input)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Duplicate vehicleId — engine-level guard
// ---------------------------------------------------------------------------

describe('T6 — duplicate vehicleId in simulation', () => {
  /**
   * The parser does not de-duplicate vehicleIds across commands — that would
   * require multi-pass validation and is an engine concern. The invariant
   * check in invariants.ts (`checkNoDuplicateVehicles`) catches this at
   * runtime when `enableInvariantChecks` is enabled.
   *
   * When invariant checks are disabled (default production path), the second
   * duplicate vehicle simply joins the queue and both eventually depart.
   * This is an intentional trade-off documented here.
   */
  it('the simulation runs without throwing when duplicates exist and checks are off', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    // With invariant checks off (default), the engine does not throw
    expect(() => simulate(commands, false)).not.toThrow();
  });

  it('the simulation throws when invariant checks are enabled and a duplicate is enqueued', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    expect(() => simulate(commands, true)).toThrow(/invariant/i);
  });

  it('the parser accepts duplicate vehicleIds (parse-time validation does not scan across commands)', () => {
    // Parsing succeeds — the contract is that schema-level validation only checks
    // per-command field shapes, not cross-command business rules.
    const input = json({
      commands: [
        { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'east', endRoad: 'west' },
      ],
    });
    expect(() => parseInput(input)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Malformed top-level structure
// ---------------------------------------------------------------------------

describe('T6 — malformed top-level JSON structure', () => {
  it('throws ParseError for invalid JSON', () => {
    expect(() => parseInput('{not valid json')).toThrow(ParseError);
  });

  it('throws ParseError when commands field is missing', () => {
    const input = json({ vehicles: [] });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError when commands is not an array', () => {
    const input = json({ commands: 'not an array' });
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('throws ParseError for a null input', () => {
    const input = json(null);
    expect(() => parseInput(input)).toThrow(ParseError);
  });

  it('accepts an empty commands array', () => {
    const input = json({ commands: [] });
    expect(() => parseInput(input)).not.toThrow();
    expect(parseInput(input)).toHaveLength(0);
  });
});
