/**
 * Tests for domain types and their structural contracts.
 */

import { describe, it, expect } from 'vitest';
import { ROADS } from '../types.js';
import type { Road, Vehicle, AddVehicleCommand, StepCommand } from '../types.js';
import { createInitialState } from '../engine.js';

describe('ROADS constant', () => {
  it('contains exactly four cardinal directions', () => {
    expect(ROADS).toHaveLength(4);
  });

  it('contains north, south, east, west', () => {
    expect(ROADS).toContain('north');
    expect(ROADS).toContain('south');
    expect(ROADS).toContain('east');
    expect(ROADS).toContain('west');
  });

  it('is readonly at the TypeScript type level', () => {
    // `as const` enforces readonly at compile time. At runtime the array is a
    // plain JS array (not Object.frozen), so we simply verify it is an array
    // and that TypeScript would reject mutation (validated by tsc --noEmit).
    expect(Array.isArray(ROADS)).toBe(true);
    // Verify no element is undefined (ensures the tuple is fully populated)
    for (const road of ROADS) {
      expect(typeof road).toBe('string');
    }
  });
});

describe('Vehicle shape', () => {
  it('satisfies the Vehicle interface when all fields are present', () => {
    const v: Vehicle = {
      vehicleId: 'V1',
      startRoad: 'north',
      endRoad: 'south',
    };
    expect(v.vehicleId).toBe('V1');
    expect(v.startRoad).toBe('north');
    expect(v.endRoad).toBe('south');
  });
});

describe('Command discriminated union', () => {
  it('AddVehicleCommand has type "addVehicle"', () => {
    const cmd: AddVehicleCommand = {
      type: 'addVehicle',
      vehicleId: 'V2',
      startRoad: 'east',
      endRoad: 'west',
    };
    expect(cmd.type).toBe('addVehicle');
  });

  it('StepCommand has type "step"', () => {
    const cmd: StepCommand = { type: 'step' };
    expect(cmd.type).toBe('step');
  });
});

describe('SimulationState shape', () => {
  it('createInitialState returns expected core fields', () => {
    const state = createInitialState();
    expect(state.queues).toBeInstanceOf(Map);
    expect(state.stepCount).toBe(0);
    expect(state.currentSignalPhaseId).toBe('NS_THROUGH');
    expect(state.segmentKind).toBe('GREEN');
    expect(state.lastServedPhaseIndex).toBe(-1);
    expect(state.forcedPhaseAfterAllRed).toBeNull();
  });
});
