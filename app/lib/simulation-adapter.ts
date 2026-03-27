import { simulate, simulateWithTelemetry } from '../../src/simulator/engine';
import type { Command, StepStatus, SimulateOptions } from '../../src/simulator/types';
import type { TelemetryData, SimulationResult } from '../../src/simulator/telemetry';
import type { PhaseId } from '../../src/simulator/phase';
import type { Road } from '../../src/simulator/types';
import { z } from 'zod';

export type { Command, StepStatus, SimulateOptions, TelemetryData, SimulationResult, PhaseId, Road };
export type { AddVehicleCommand, StepCommand, Vehicle, RoadPriorities, VehiclePriority } from '../../src/simulator/types';
export { ROADS } from '../../src/simulator/types';
export { PHASES } from '../../src/simulator/phase';

// ---------------------------------------------------------------------------
// Zod schemas for JSON import/export validation
// ---------------------------------------------------------------------------

const roadSchema = z.enum(['north', 'south', 'east', 'west']);
const prioritySchema = z.enum(['normal', 'emergency']).optional();

const addVehicleCommandSchema = z.object({
  type: z.literal('addVehicle'),
  vehicleId: z.string().min(1, 'vehicleId must not be empty'),
  startRoad: roadSchema,
  endRoad: roadSchema,
  priority: prioritySchema,
});

const stepCommandSchema = z.object({
  type: z.literal('step'),
});

const commandSchema = z.discriminatedUnion('type', [
  addVehicleCommandSchema,
  stepCommandSchema,
]);

/** Validates an array of commands parsed from JSON (for file import). */
export const commandArraySchema = z.array(commandSchema);

export type AdapterResult =
  | { ok: true; stepStatuses: StepStatus[]; telemetry?: TelemetryData }
  | { ok: false; error: string };

export function runSimulation(commands: Command[], options?: SimulateOptions): AdapterResult {
  try {
    if (options?.enableTelemetry) {
      const result = simulateWithTelemetry(commands, options);
      return { ok: true, stepStatuses: result.stepStatuses, telemetry: result.telemetry };
    }
    const stepStatuses = simulate(commands, options);
    return { ok: true, stepStatuses };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
