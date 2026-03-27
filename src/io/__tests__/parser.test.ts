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
    expect(result).toEqual([]);
  });

  it('parses a single addVehicle command', () => {
    const raw = JSON.stringify({
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' }],
    });
    const result = parseInput(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: 'addVehicle', vehicleId: 'V1' });
  });

  it('parses a single step command', () => {
    const raw = JSON.stringify({ commands: [{ type: 'step' }] });
    const result = parseInput(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: 'step' });
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
    expect(result).toHaveLength(4);
    expect(result[0]?.type).toBe('addVehicle');
    expect(result[1]?.type).toBe('step');
    expect(result[2]?.type).toBe('addVehicle');
    expect(result[3]?.type).toBe('step');
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
    expect(result).toHaveLength(4);
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
