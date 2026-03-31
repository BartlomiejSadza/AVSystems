/**
 * Integration tests for the main simulation engine.
 * Covers the canonical examples from the specification plus edge cases.
 */

import { describe, it, expect } from 'vitest';
import { simulate, createInitialState } from '../engine.js';
import type { Command } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const fast = { signalTimings: FAST_SIGNAL_TIMINGS };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

describe('createInitialState', () => {
  it('returns an empty state with stepCount 0 and NS_THROUGH GREEN', () => {
    const state = createInitialState();
    expect(state.stepCount).toBe(0);
    expect(state.lastServedPhaseIndex).toBe(0);
    expect(state.currentSignalPhaseId).toBe('NS_THROUGH');
    expect(state.segmentKind).toBe('GREEN');
    expect(state.forcedPhaseAfterAllRed).toBeNull();
    for (const q of state.queues.values()) {
      expect(q).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Canonical specification example
// ---------------------------------------------------------------------------

describe('simulate — canonical spec example', () => {
  it('matches the example from the specification', () => {
    const commands: Command[] = [
      addVehicle('V1', 'south', 'north'),
      step,
      addVehicle('V2', 'north', 'south'),
      step,
    ];

    const result = simulate(commands);
    expect(result).toHaveLength(2);
    expect(result[0]?.leftVehicles).toContain('V1');
    expect(result[1]?.leftVehicles).toContain('V2');
  });
});

// ---------------------------------------------------------------------------
// Empty input
// ---------------------------------------------------------------------------

describe('simulate — edge cases', () => {
  it('returns empty array for empty command list', () => {
    expect(simulate([])).toEqual([]);
  });

  it('returns empty step statuses when only step commands are given', () => {
    const result = simulate([step, step, step], fast);
    expect(result).toHaveLength(3);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });

  it('addVehicle before any step does not produce output', () => {
    const result = simulate([addVehicle('V1', 'north')]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// FIFO ordering
// ---------------------------------------------------------------------------

describe('simulate — FIFO ordering', () => {
  it('dequeues the first vehicle added to a road, not the last', () => {
    const commands: Command[] = [addVehicle('FIRST', 'north'), addVehicle('SECOND', 'north'), step];
    const result = simulate(commands, fast);
    expect(result[0]?.leftVehicles).toContain('FIRST');
    expect(result[0]?.leftVehicles).not.toContain('SECOND');
  });

  it('dequeues in insertion order over multiple steps', () => {
    const commands: Command[] = [
      addVehicle('A', 'north'),
      addVehicle('B', 'north'),
      addVehicle('C', 'north'),
      step,
      step,
      step,
    ];
    const result = simulate(commands, fast);
    const allLeft = result.flatMap((s) => s.leftVehicles);
    const northLeft = allLeft.filter((id) => ['A', 'B', 'C'].includes(id));
    expect(northLeft).toEqual(['A', 'B', 'C']);
  });
});

// ---------------------------------------------------------------------------
// Phase selection and adaptive load balancing
// ---------------------------------------------------------------------------

describe('simulate — adaptive phase selection', () => {
  it('gives green to NS when north/south have more vehicles', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];
    const result = simulate(commands, fast);
    const left = result[0]!.leftVehicles;
    expect(left).toContain('N1');
    expect(left).toContain('S1');
  });

  it('gives green to EW when east/west have more vehicles (after initial NS_THROUGH cycle)', () => {
    const commands: Command[] = [addVehicle('E1', 'east'), addVehicle('W1', 'west'), step, step];
    const result = simulate(commands, fast);
    const ewStep = result.find((s) => s.leftVehicles.includes('E1'));
    expect(ewStep?.leftVehicles).toEqual(expect.arrayContaining(['E1', 'W1']));
  });

  it('alternates phase when loads are equal, starting with NS', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step, step];
    const result = simulate(commands, fast);
    expect(result[0]?.leftVehicles).toContain('N1');
    expect(result[0]?.leftVehicles).not.toContain('E1');
    expect(result[1]?.leftVehicles).toContain('E1');
  });

  it('alternates when both phases are empty (tie on 0)', () => {
    const commands: Command[] = [step, step, step, step];
    const result = simulate(commands, fast);
    result.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
    expect(result).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// Multiple roads cleared per step
// ---------------------------------------------------------------------------

describe('simulate — simultaneous clearing', () => {
  it('clears both north and south in the same step', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];
    const result = simulate(commands, fast);
    expect(result[0]?.leftVehicles).toHaveLength(2);
    expect(result[0]?.leftVehicles).toContain('N1');
    expect(result[0]?.leftVehicles).toContain('S1');
  });

  it('clears both east and west in the same step once EW through is active', () => {
    const commands: Command[] = [addVehicle('E1', 'east'), addVehicle('W1', 'west'), step, step];
    const result = simulate(commands, fast);
    const ewStep = result.find((s) => s.leftVehicles.length === 2 && s.leftVehicles.includes('E1'));
    expect(ewStep?.leftVehicles).toContain('E1');
    expect(ewStep?.leftVehicles).toContain('W1');
  });
});

// ---------------------------------------------------------------------------
// Step with no vehicles on green roads
// ---------------------------------------------------------------------------

describe('simulate — empty green roads', () => {
  it('returns leftVehicles = [] when no vehicles are present at all', () => {
    const commands: Command[] = [step];
    const result = simulate(commands, fast);
    expect(result[0]?.leftVehicles).toHaveLength(0);
  });

  it('returns leftVehicles = [] for the phase that has no waiting vehicles', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step, step];
    const result = simulate(commands, fast);
    expect(result[0]?.leftVehicles).toHaveLength(2);
    expect(result[1]?.leftVehicles).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Long sequence — stepCount
// ---------------------------------------------------------------------------

describe('simulate — many steps', () => {
  it('handles 100 vehicles across many steps without error', () => {
    const commands: Command[] = [];
    for (let i = 0; i < 100; i++) {
      const roads = ['north', 'south', 'east', 'west'] as const;
      const road = roads[i % 4]!;
      commands.push(addVehicle(`V${i}`, road));
    }
    for (let i = 0; i < 120; i++) {
      commands.push(step);
    }

    const result = simulate(commands, fast);
    expect(result).toHaveLength(120);
    const allLeft = result.flatMap((s) => s.leftVehicles);
    expect(new Set(allLeft).size).toBe(allLeft.length);
  });
});

// ---------------------------------------------------------------------------
// Invariant checks enabled
// ---------------------------------------------------------------------------

describe('simulate — with invariant checks enabled', () => {
  it('does not throw for valid input when invariant checks are on', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step, addVehicle('V2', 'east'), step];
    expect(() => simulate(commands, { ...fast, enableInvariantChecks: true })).not.toThrow();
  });
});
