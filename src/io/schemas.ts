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
// Top-level input schema
// ---------------------------------------------------------------------------

export const InputSchema = z.object({
  commands: z.array(CommandSchema).min(0),
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
