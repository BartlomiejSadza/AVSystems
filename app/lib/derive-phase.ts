import type { Command, StepStatus, Road } from './simulation-adapter';
import type { DisplayPhase } from './phase-display';
import { phaseForVehicle } from '../../src/simulator/phase';

export interface SimulationUiStateInput {
  commands: readonly Command[];
  stepStatuses: readonly StepStatus[];
  currentStepIndex: number;
  isPlaying: boolean;
}

export interface SimulationUiState {
  phases: (DisplayPhase | null)[];
  activePhase: DisplayPhase | null;
  queues: Record<Road, string[]>;
  emergencyQueues: Record<Road, string[]>;
  totalQueued: number;
  totalEmergencyQueued: number;
  totalDeparted: number;
  stepCount: number;
  isPlaying: boolean;
}

/**
 * For each step, derive which signal phase (including YELLOW / ALL_RED) was active.
 *
 * Prefers `status.displayPhase` emitted directly by the engine (accurate, includes
 * YELLOW and ALL_RED segments).  Falls back to the legacy leftVehicles heuristic
 * for older StepStatus objects that do not carry displayPhase.
 */
export function derivePhasePerStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[]
): (DisplayPhase | null)[] {
  const vehicles = new Map<string, { startRoad: Road; endRoad: Road }>();
  for (const cmd of commands) {
    if (cmd.type === 'addVehicle') {
      vehicles.set(cmd.vehicleId, { startRoad: cmd.startRoad, endRoad: cmd.endRoad });
    }
  }

  return stepStatuses.map((status) => {
    // Prefer the authoritative displayPhase from the engine.
    if (status.displayPhase !== undefined) {
      return (status.displayPhase as DisplayPhase) ?? null;
    }

    // Legacy fallback: infer phase from the first departing vehicle.
    if (status.leftVehicles.length === 0) return null;
    const firstVehicleId = status.leftVehicles[0];
    if (firstVehicleId === undefined) return null;
    const v = vehicles.get(firstVehicleId);
    if (!v) return null;
    return phaseForVehicle({
      vehicleId: firstVehicleId,
      startRoad: v.startRoad,
      endRoad: v.endRoad,
    }) as DisplayPhase | null;
  });
}

/**
 * Reconstruct the per-road queues as they would appear after processing
 * steps up to and including targetStepIndex.
 *
 * Vehicles that departed in steps 0..targetStepIndex are excluded.
 * The order within each road queue follows simulator insertion rules, including
 * emergency vehicles being grouped at the front while preserving emergency FIFO.
 */
export function deriveQueuesAtStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[],
  targetStepIndex: number
): Record<Road, string[]> {
  return deriveFilteredQueuesAtStep(commands, stepStatuses, targetStepIndex, () => true);
}

/**
 * Reconstruct only emergency queues after processing steps up to targetStepIndex.
 */
export function deriveEmergencyQueuesAtStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[],
  targetStepIndex: number
): Record<Road, string[]> {
  return deriveFilteredQueuesAtStep(
    commands,
    stepStatuses,
    targetStepIndex,
    (cmd) => (cmd.priority ?? 'normal') === 'emergency'
  );
}

/**
 * Single source of truth for deriving view-ready UI state from simulation state.
 */
export function selectSimulationUiState(input: SimulationUiStateInput): SimulationUiState {
  const phases = derivePhasePerStep(input.commands, input.stepStatuses);
  const activePhase = [...phases].reverse().find((p) => p !== null) ?? null;
  const queues = deriveQueuesAtStep(input.commands, input.stepStatuses, input.currentStepIndex);
  const emergencyQueues = deriveEmergencyQueuesAtStep(
    input.commands,
    input.stepStatuses,
    input.currentStepIndex
  );

  return {
    phases,
    activePhase,
    queues,
    emergencyQueues,
    totalQueued: Object.values(queues).reduce((sum, queue) => sum + queue.length, 0),
    totalEmergencyQueued: Object.values(emergencyQueues).reduce(
      (sum, queue) => sum + queue.length,
      0
    ),
    totalDeparted: input.stepStatuses.reduce((sum, st) => sum + st.leftVehicles.length, 0),
    stepCount: input.stepStatuses.length,
    isPlaying: input.isPlaying,
  };
}

function deriveFilteredQueuesAtStep(
  commands: readonly Command[],
  stepStatuses: readonly StepStatus[],
  targetStepIndex: number,
  include: (cmd: Extract<Command, { type: 'addVehicle' }>) => boolean
): Record<Road, string[]> {
  const queues: Record<Road, DerivedQueuedVehicle[]> = createEmptyQueuesWithMeta();

  const departed = new Set<string>();
  for (let i = 0; i <= targetStepIndex && i < stepStatuses.length; i++) {
    const status = stepStatuses[i];
    if (!status) continue;
    for (const vehicleId of status.leftVehicles) {
      departed.add(vehicleId);
    }
  }

  for (const command of commands) {
    if (command.type !== 'addVehicle') continue;
    if (departed.has(command.vehicleId) || !include(command)) continue;
    enqueueDerivedVehicle(queues[command.startRoad], command.vehicleId, command.priority);
  }

  return {
    north: queues.north.map((vehicle) => vehicle.vehicleId),
    south: queues.south.map((vehicle) => vehicle.vehicleId),
    east: queues.east.map((vehicle) => vehicle.vehicleId),
    west: queues.west.map((vehicle) => vehicle.vehicleId),
  };
}

function enqueueDerivedVehicle(
  queue: DerivedQueuedVehicle[],
  vehicleId: string,
  priority: 'normal' | 'emergency' | undefined
): void {
  if ((priority ?? 'normal') !== 'emergency') {
    queue.push({ vehicleId, priority: 'normal' });
    return;
  }

  let insertAt = 0;
  while (insertAt < queue.length && queue[insertAt]?.priority === 'emergency') {
    insertAt += 1;
  }
  queue.splice(insertAt, 0, { vehicleId, priority: 'emergency' });
}

interface DerivedQueuedVehicle {
  vehicleId: string;
  priority: 'normal' | 'emergency';
}

function createEmptyQueuesWithMeta(): Record<Road, DerivedQueuedVehicle[]> {
  return { north: [], south: [], east: [], west: [] };
}
