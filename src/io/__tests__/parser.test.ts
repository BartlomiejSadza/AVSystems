/**
 * Tests for the JSON input parser.
 */

import { describe, it, expect } from 'vitest';
import { parseInput, ParseError } from '../parser.js';

// ---------------------------------------------------------------------------
// Valid inputs
// ---------------------------------------------------------------------------

describe('parseInput — valid JSON', () => {
  it('parses an empty commands array', () => {
    const result = parseInput(JSON.stringify({ commands: [] }));
    expect(result.commands).toEqual([]);
    expect(result.options).toBeUndefined();
  });

  it('parses a single addVehicle command', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' }],
    });
    const result = parseInput(raw);
    expect(result.commands).toHaveLength(1);
    expect(result.commands[0]).toMatchObject({ type: 'addVehicle', vehicleId: 'V1' });
  });

  it('parses a single step command', () => {
    const raw = JSON.stringify({ commands: [{ type: 'step' }] });
    const result = parseInput(raw);
    expect(result.commands).toHaveLength(1);
    expect(result.commands[0]).toMatchObject({ type: 'step' });
  });

  it('parses mixed commands in order', () => {
    const raw = JSON.stringify({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    });
    const result = parseInput(raw);
    expect(result.commands).toHaveLength(4);
    expect(result.commands[0]?.type).toBe('addVehicle');
    expect(result.commands[1]?.type).toBe('step');
    expect(result.commands[2]?.type).toBe('addVehicle');
    expect(result.commands[3]?.type).toBe('step');
  });

  it('parses the canonical specification example', () => {
    const raw = JSON.stringify({
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    });
    const result = parseInput(raw);
    expect(result.commands).toHaveLength(4);
  });

  it('accepts optional options.signalTimings with partial fields', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'step' }],
      options: {
        signalTimings: {
          minGreenTicks: 1,
          maxGreenTicks: 1,
          yellowTicks: 0,
          allRedTicks: 0,
          skipEmptyPhases: true,
          perPhase: { NS_THROUGH: { minGreenTicks: 2 } },
        },
      },
    });
    const result = parseInput(raw);
    expect(result.commands).toHaveLength(1);
    expect(result.options?.signalTimings).toMatchObject({
      minGreenTicks: 1,
      maxGreenTicks: 1,
      yellowTicks: 0,
      allRedTicks: 0,
      skipEmptyPhases: true,
      perPhase: { NS_THROUGH: { minGreenTicks: 2 } },
    });
  });

  it('accepts optional options.roadPriorities with partial roads', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'step' }],
      options: { roadPriorities: { north: 2, east: 0.5 } },
    });
    const result = parseInput(raw);
    expect(result.options?.roadPriorities).toEqual({ north: 2, east: 0.5 });
    expect(result.options?.signalTimings).toBeUndefined();
  });

  it('returns both signalTimings and roadPriorities when both are non-empty', () => {
    const raw = JSON.stringify({
      commands: [],
      options: {
        signalTimings: { yellowTicks: 1 },
        roadPriorities: { west: 0 },
      },
    });
    const result = parseInput(raw);
    expect(result.options?.signalTimings).toMatchObject({ yellowTicks: 1 });
    expect(result.options?.roadPriorities).toEqual({ west: 0 });
  });

  it('omits options when options is empty or both option sections are empty', () => {
    expect(parseInput(JSON.stringify({ commands: [], options: {} })).options).toBeUndefined();
    expect(
      parseInput(JSON.stringify({ commands: [], options: { signalTimings: {} } })).options
    ).toBeUndefined();
    expect(
      parseInput(JSON.stringify({ commands: [], options: { roadPriorities: {} } })).options
    ).toBeUndefined();
    expect(
      parseInput(
        JSON.stringify({ commands: [], options: { signalTimings: {}, roadPriorities: {} } })
      ).options
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Invalid JSON
// ---------------------------------------------------------------------------

describe('parseInput — invalid JSON', () => {
  it('throws ParseError for non-JSON strings', () => {
    expect(() => parseInput('not json')).toThrow(ParseError);
  });

  it('throws ParseError for truncated JSON', () => {
    expect(() => parseInput('{"commands": [')).toThrow(ParseError);
  });

  it('throws ParseError for empty string', () => {
    expect(() => parseInput('')).toThrow(ParseError);
  });
});

// ---------------------------------------------------------------------------
// Schema violations
// ---------------------------------------------------------------------------

describe('parseInput — schema violations', () => {
  it('throws ParseError when "commands" field is missing', () => {
    expect(() => parseInput(JSON.stringify({}))).toThrow(ParseError);
  });

  it('throws ParseError when commands is not an array', () => {
    expect(() => parseInput(JSON.stringify({ commands: 'not-array' }))).toThrow(ParseError);
  });

  it('throws ParseError for unknown command type', () => {
    const raw = JSON.stringify({ commands: [{ type: 'unknown' }] });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError when addVehicle is missing vehicleId', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'addVehicle', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError when addVehicle has an invalid startRoad', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'diagonal', endRoad: 'north' }],
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError when addVehicle has an empty vehicleId', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'addVehicle', vehicleId: '', startRoad: 'north', endRoad: 'south' }],
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError for negative signal timing ticks', () => {
    const raw = JSON.stringify({
      commands: [],
      options: { signalTimings: { yellowTicks: -1 } },
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError for unknown keys under options', () => {
    const raw = JSON.stringify({
      commands: [],
      options: { unknownOption: true },
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError for unknown keys under roadPriorities', () => {
    const raw = JSON.stringify({
      commands: [],
      options: { roadPriorities: { north: 1, diagonal: 2 } },
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('throws ParseError for negative road priority weights', () => {
    const raw = JSON.stringify({
      commands: [],
      options: { roadPriorities: { south: -0.1 } },
    });
    expect(() => parseInput(raw)).toThrow(ParseError);
  });

  it('error message mentions the path of the offending field', () => {
    const raw = JSON.stringify({ commands: [{ type: 'addVehicle' }] });
    try {
      parseInput(raw);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toMatch(/validation/i);
    }
  });
});

// ---------------------------------------------------------------------------
// ParseError shape
// ---------------------------------------------------------------------------

describe('ParseError', () => {
  it('has name "ParseError"', () => {
    try {
      parseInput('bad');
    } catch (err) {
      expect((err as ParseError).name).toBe('ParseError');
    }
  });

  it('exposes the original cause', () => {
    try {
      parseInput('bad json {');
    } catch (err) {
      expect((err as ParseError).cause).toBeDefined();
    }
  });
});
