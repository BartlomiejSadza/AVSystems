import type { Command, StepStatus, PhaseId, Road } from './simulation-adapter';
import { PHASES } from './simulation-adapter';

/**
 * For each step, derive which phase was likely active by inspecting
 * which vehicles departed. The startRoad of the first departing vehicle
 * indicates which phase was green. Falls back to null when no vehicles left.
 */
export function derivePhasePerStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[]
): (PhaseId | null)[] {
  // Build a vehicle → startRoad map
  const vehicleRoads = new Map<string, Road>();
  for (const cmd of commands) {
    if (cmd.type === 'addVehicle') {
      vehicleRoads.set(cmd.vehicleId, cmd.startRoad);
    }
  }

  return stepStatuses.map(status => {
    if (status.leftVehicles.length === 0) return null;
    const firstVehicleId = status.leftVehicles[0];
    if (firstVehicleId === undefined) return null;
    const road = vehicleRoads.get(firstVehicleId);
    if (!road) return null;
    const phase = PHASES.find(p => (p.roads as readonly string[]).includes(road));
    return phase?.id ?? null;
  });
}

/**
 * Reconstruct the per-road queues as they would appear after processing
 * steps up to and including targetStepIndex.
 *
 * Vehicles that departed in steps 0..targetStepIndex are excluded.
 * The order within each road queue matches the order addVehicle commands appear.
 */
export function deriveQueuesAtStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[],
  targetStepIndex: number
): Record<Road, string[]> {
  const queues: Record<Road, string[]> = { north: [], south: [], east: [], west: [] };

  // Collect all departed vehicles up to and including targetStepIndex
  const departed = new Set<string>();
  for (let i = 0; i <= targetStepIndex && i < stepStatuses.length; i++) {
    const status = stepStatuses[i];
    if (status) {
      for (const vid of status.leftVehicles) {
        departed.add(vid);
      }
    }
  }

  // Build queues from addVehicle commands, excluding departed vehicles
  for (const cmd of commands) {
    if (cmd.type === 'addVehicle' && !departed.has(cmd.vehicleId)) {
      queues[cmd.startRoad].push(cmd.vehicleId);
    }
  }

  return queues;
}
