/**
 * Zod schemas for input and output JSON contract.
 *
 * These schemas are the single source of truth for what the simulator
 * accepts and produces.  Both the CLI and future API layers reference them.
 */

import { z } from 'zod';
import { ROADS } from '../simulator/types.js';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Literal union of the four road names, validated by Zod. */
export const RoadSchema = z.enum(ROADS);

/** Vehicle ID must be a non-empty string. */
export const VehicleIdSchema = z.string().min(1, 'vehicleId must not be empty');

// ---------------------------------------------------------------------------
// Command schemas
// ---------------------------------------------------------------------------

/** Vehicle priority level schema — optional field, defaults to 'normal' at engine level. */
export const VehiclePrioritySchema = z.enum(['normal', 'emergency']);

export const AddVehicleCommandSchema = z.object({
  type: z.literal('addVehicle'),
  vehicleId: VehicleIdSchema,
  startRoad: RoadSchema,
  endRoad: RoadSchema,
  /** Optional priority. Emergency vehicles jump to the front of their road queue. */
  priority: VehiclePrioritySchema.optional(),
});

export const StepCommandSchema = z.object({
  type: z.literal('step'),
});

export const CommandSchema = z.discriminatedUnion('type', [
  AddVehicleCommandSchema,
  StepCommandSchema,
]);

// ---------------------------------------------------------------------------
// Simulate options (optional top-level `options`, specs/REALISTIC-SIGNALIZATION.md §9)
// ---------------------------------------------------------------------------

/** Non-negative integer tick count (signal segments, min/max green). */
const NonNegativeIntSchema = z.number().int('must be an integer').min(0, 'must be >= 0');

/**
 * Per-phase min/max green overrides. All numeric fields optional; each must be >= 0 when set.
 */
export const PerPhaseTimingOverrideSchema = z
  .object({
    minGreenTicks: NonNegativeIntSchema.optional(),
    maxGreenTicks: NonNegativeIntSchema.optional(),
  })
  .strict();

/**
 * Partial signal timing overrides from JSON. Omitted keys use engine defaults
 * (`DEFAULT_SIGNAL_TIMING_CONFIG` / `mergeSignalTimingConfig` in simulator types).
 */
export const SignalTimingsPartialSchema = z
  .object({
    minGreenTicks: NonNegativeIntSchema.optional(),
    maxGreenTicks: NonNegativeIntSchema.optional(),
    yellowTicks: NonNegativeIntSchema.optional(),
    allRedTicks: NonNegativeIntSchema.optional(),
    skipEmptyPhases: z.boolean().optional(),
    perPhase: z
      .object({
        NS_THROUGH: PerPhaseTimingOverrideSchema.optional(),
        NS_LEFT: PerPhaseTimingOverrideSchema.optional(),
        EW_THROUGH: PerPhaseTimingOverrideSchema.optional(),
        EW_LEFT: PerPhaseTimingOverrideSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/** Non-negative number (road priority weights may be fractional). */
const NonNegativeNumberSchema = z.number().min(0, 'must be >= 0');

/**
 * Per-road priority weights from JSON. Omitted roads use engine default (1.0).
 * Unknown keys are rejected (strict).
 */
export const RoadPrioritiesSchema = z
  .object({
    north: NonNegativeNumberSchema.optional(),
    south: NonNegativeNumberSchema.optional(),
    east: NonNegativeNumberSchema.optional(),
    west: NonNegativeNumberSchema.optional(),
  })
  .strict();

/**
 * Optional CLI/API input options. Only documented keys allowed (strict).
 */
export const OptionsSchema = z
  .object({
    signalTimings: SignalTimingsPartialSchema.optional(),
    roadPriorities: RoadPrioritiesSchema.optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Top-level input schema
// ---------------------------------------------------------------------------

export const InputSchema = z.object({
  commands: z.array(CommandSchema).min(0),
  /** Optional simulation options (e.g. signal timing profile). */
  options: OptionsSchema.optional(),
});

export type InputSchemaType = z.infer<typeof InputSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const StepStatusSchema = z.object({
  leftVehicles: z.array(VehicleIdSchema),
});

export const OutputSchema = z.object({
  stepStatuses: z.array(StepStatusSchema),
});

export type OutputSchemaType = z.infer<typeof OutputSchema>;
