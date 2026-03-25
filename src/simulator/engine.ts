/**
 * Simulation engine — the central coordinator.
 *
 * Exposes:
 *  - `simulate(commands, options?)` — returns StepStatus[] (backwards-compatible).
 *  - `simulateWithTelemetry(commands, options)` — returns { stepStatuses, telemetry }.
 *
 * The engine is completely free of I/O and framework dependencies.
 */

import type { Command, SimulateOptions, SimulationState, StepStatus, Vehicle } from './types.js';
import { createQueues, dequeueVehicle, enqueueVehicle } from './queue.js';
import { selectPhase } from './phase.js';
import { assertInvariants } from './invariants.js';
import {
  createAccumulator,
  finalizeTelemetry,
  isTelemetryEnabled,
  recordStep,
  type SimulationResult,
  type TelemetryAccumulator,
} from './telemetry.js';

/**
 * Create a blank, valid initial simulation state.
 */
export function createInitialState(): SimulationState {
  return {
    queues: createQueues(),
    stepCount: 0,
    lastPhaseIndex: -1,
  };
}

/**
 * Process a single `step` command against the current state.
 *
 * Steps:
 *  1. Select the active phase using adaptive load balancing (with optional weights).
 *  2. For each road in the phase, dequeue the front vehicle (if any).
 *  3. Record departed vehicle IDs in the returned StepStatus.
 *  4. Advance stepCount and remember the chosen phase index.
 *
 * Mutates `state` in place.
 *
 * NOTE — Transition phases:
 *   Real-world traffic lights include yellow and all-red clearance intervals
 *   between green phases.  This simulation models those transitions as
 *   **instantaneous** — there is no intermediate tick where roads are neither
 *   green nor red.  Each `step` command moves directly from the previous phase
 *   to the next phase with no in-between state.
 */
function processStep(
  state: SimulationState,
  options: SimulateOptions,
  acc: TelemetryAccumulator | null
): StepStatus {
  const phase = selectPhase(state, options.roadPriorities);
  const leftVehicles: string[] = [];

  for (const road of phase.roads) {
    const vehicle: Vehicle | undefined = dequeueVehicle(state, road);
    if (vehicle !== undefined) {
      leftVehicles.push(vehicle.vehicleId);
    }
  }

  state.stepCount += 1;
  state.lastPhaseIndex = phase.index;

  const status: StepStatus = { leftVehicles };

  if (acc !== null) {
    recordStep(acc, state, phase.id, status);
  }

  return status;
}

// ---------------------------------------------------------------------------
// Internal run loop shared by both public entry points
// ---------------------------------------------------------------------------

function runCommands(
  commands: Command[],
  options: SimulateOptions,
  acc: TelemetryAccumulator | null
): StepStatus[] {
  const state = createInitialState();
  const results: StepStatus[] = [];

  for (const command of commands) {
    if (command.type === 'addVehicle') {
      const vehicle: Vehicle = {
        vehicleId: command.vehicleId,
        startRoad: command.startRoad,
        endRoad: command.endRoad,
        priority: command.priority ?? 'normal',
      };
      enqueueVehicle(state, vehicle);
    } else if (command.type === 'step') {
      const status = processStep(state, options, acc);
      results.push(status);
    }

    if (options.enableInvariantChecks) {
      assertInvariants(state);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full simulation over an ordered sequence of commands.
 *
 * @param commands - Validated command list from the input JSON.
 * @param optionsOrChecks - Either a SimulateOptions object (preferred) or a
 *   legacy boolean `enableInvariantChecks` for backwards compatibility.
 * @returns One `StepStatus` per `step` command, in command order.
 */
export function simulate(
  commands: Command[],
  optionsOrChecks: SimulateOptions | boolean = {}
): StepStatus[] {
  // Backwards-compatible overload: accept plain boolean as enableInvariantChecks.
  const options: SimulateOptions =
    typeof optionsOrChecks === 'boolean'
      ? { enableInvariantChecks: optionsOrChecks }
      : optionsOrChecks;

  const acc = isTelemetryEnabled(options) ? createAccumulator() : null;
  return runCommands(commands, options, acc);
}

/**
 * Run the simulation and return both step statuses and aggregated telemetry.
 *
 * @param commands - Validated command list from the input JSON.
 * @param options - SimulateOptions (enableTelemetry is implicitly true here).
 * @returns Object with `stepStatuses` array and `telemetry` metrics.
 */
export function simulateWithTelemetry(
  commands: Command[],
  options: SimulateOptions = {}
): SimulationResult {
  const acc = createAccumulator();
  const stepStatuses = runCommands(commands, options, acc);
  return {
    stepStatuses,
    telemetry: finalizeTelemetry(acc),
  };
}
