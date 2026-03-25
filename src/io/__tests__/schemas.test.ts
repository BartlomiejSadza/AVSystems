/**
 * Contract tests for Zod schemas — validate the input/output boundary.
 */

import { describe, it, expect } from 'vitest';
import {
  RoadSchema,
  VehicleIdSchema,
  AddVehicleCommandSchema,
  StepCommandSchema,
  CommandSchema,
  InputSchema,
  StepStatusSchema,
  OutputSchema,
} from '../schemas.js';

// ---------------------------------------------------------------------------
// RoadSchema
// ---------------------------------------------------------------------------

describe('RoadSchema', () => {
  const validRoads = ['north', 'south', 'east', 'west'];

  validRoads.forEach((road) => {
    it(`accepts "${road}"`, () => {
      expect(RoadSchema.safeParse(road).success).toBe(true);
    });
  });

  it('rejects unknown road names', () => {
    expect(RoadSchema.safeParse('diagonal').success).toBe(false);
    expect(RoadSchema.safeParse('').success).toBe(false);
    expect(RoadSchema.safeParse(null).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VehicleIdSchema
// ---------------------------------------------------------------------------

describe('VehicleIdSchema', () => {
  it('accepts a non-empty string', () => {
    expect(VehicleIdSchema.safeParse('V1').success).toBe(true);
    expect(VehicleIdSchema.safeParse('vehicle-with-dashes-123').success).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(VehicleIdSchema.safeParse('').success).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(VehicleIdSchema.safeParse(42).success).toBe(false);
    expect(VehicleIdSchema.safeParse(null).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AddVehicleCommandSchema
// ---------------------------------------------------------------------------

describe('AddVehicleCommandSchema', () => {
  const valid = {
    type: 'addVehicle',
    vehicleId: 'V1',
    startRoad: 'north',
    endRoad: 'south',
  };

  it('accepts a valid addVehicle command', () => {
    expect(AddVehicleCommandSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when type is wrong', () => {
    expect(AddVehicleCommandSchema.safeParse({ ...valid, type: 'step' }).success).toBe(false);
  });

  it('rejects when vehicleId is missing', () => {
    const { vehicleId: _, ...rest } = valid;
    expect(AddVehicleCommandSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects when startRoad is not a valid road', () => {
    expect(AddVehicleCommandSchema.safeParse({ ...valid, startRoad: 'up' }).success).toBe(false);
  });

  it('rejects when endRoad is not a valid road', () => {
    expect(AddVehicleCommandSchema.safeParse({ ...valid, endRoad: 'down' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// StepCommandSchema
// ---------------------------------------------------------------------------

describe('StepCommandSchema', () => {
  it('accepts { type: "step" }', () => {
    expect(StepCommandSchema.safeParse({ type: 'step' }).success).toBe(true);
  });

  it('rejects wrong type literal', () => {
    expect(StepCommandSchema.safeParse({ type: 'addVehicle' }).success).toBe(false);
  });

  it('rejects missing type field', () => {
    expect(StepCommandSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CommandSchema (discriminated union)
// ---------------------------------------------------------------------------

describe('CommandSchema', () => {
  it('accepts a valid addVehicle command', () => {
    const cmd = { type: 'addVehicle', vehicleId: 'X', startRoad: 'east', endRoad: 'west' };
    expect(CommandSchema.safeParse(cmd).success).toBe(true);
  });

  it('accepts a valid step command', () => {
    expect(CommandSchema.safeParse({ type: 'step' }).success).toBe(true);
  });

  it('rejects an unknown command type', () => {
    expect(CommandSchema.safeParse({ type: 'unknown' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// InputSchema
// ---------------------------------------------------------------------------

describe('InputSchema', () => {
  it('accepts an empty commands array', () => {
    expect(InputSchema.safeParse({ commands: [] }).success).toBe(true);
  });

  it('accepts a valid mixed command list', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    };
    expect(InputSchema.safeParse(input).success).toBe(true);
  });

  it('rejects when commands is not an array', () => {
    expect(InputSchema.safeParse({ commands: 'not-an-array' }).success).toBe(false);
  });

  it('rejects when commands is missing', () => {
    expect(InputSchema.safeParse({}).success).toBe(false);
  });

  it('rejects when a command inside the array is invalid', () => {
    const input = { commands: [{ type: 'addVehicle' }] }; // missing required fields
    expect(InputSchema.safeParse(input).success).toBe(false);
  });

  it('preserves parsed types correctly', () => {
    const raw = {
      commands: [
        { type: 'addVehicle', vehicleId: 'V99', startRoad: 'west', endRoad: 'east' },
        { type: 'step' },
      ],
    };
    const result = InputSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.commands[0]).toMatchObject({ type: 'addVehicle', vehicleId: 'V99' });
      expect(result.data.commands[1]).toMatchObject({ type: 'step' });
    }
  });
});

// ---------------------------------------------------------------------------
// StepStatusSchema
// ---------------------------------------------------------------------------

describe('StepStatusSchema', () => {
  it('accepts empty leftVehicles', () => {
    expect(StepStatusSchema.safeParse({ leftVehicles: [] }).success).toBe(true);
  });

  it('accepts non-empty leftVehicles', () => {
    expect(StepStatusSchema.safeParse({ leftVehicles: ['V1', 'V2'] }).success).toBe(true);
  });

  it('rejects when leftVehicles contains empty string', () => {
    expect(StepStatusSchema.safeParse({ leftVehicles: [''] }).success).toBe(false);
  });

  it('rejects when leftVehicles is missing', () => {
    expect(StepStatusSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// OutputSchema
// ---------------------------------------------------------------------------

describe('OutputSchema', () => {
  it('accepts empty stepStatuses', () => {
    expect(OutputSchema.safeParse({ stepStatuses: [] }).success).toBe(true);
  });

  it('accepts valid stepStatuses', () => {
    const output = {
      stepStatuses: [{ leftVehicles: ['V1'] }, { leftVehicles: [] }],
    };
    expect(OutputSchema.safeParse(output).success).toBe(true);
  });

  it('rejects when stepStatuses is missing', () => {
    expect(OutputSchema.safeParse({}).success).toBe(false);
  });
});
