/**
 * Simulation engine — the central coordinator.
 *
 * Exposes:
 *  - `simulate(commands, options?)` — returns StepStatus[] (backwards-compatible).
 *  - `simulateWithTelemetry(commands, options)` — returns { stepStatuses, telemetry }.
 *
 * The engine is completely free of I/O and framework dependencies.
 */

import type {
  Command,
  SignalSegmentKind,
  SignalTimingConfig,
  SimulateOptions,
  SimulationState,
  StepStatus,
  Vehicle,
} from './types.js';
import { mergeSignalTimingConfig } from './types.js';
import { createQueues, enqueueVehicle } from './queue.js';
import { assertInvariants } from './invariants.js';
import {
  dischargeEligibleVehicles,
  advanceSignalController,
  reconcileEmergencyBeforeDischarge,
  resolveGreenSelection,
} from './signal-controller.js';
import {
  createAccumulator,
  finalizeTelemetry,
  isTelemetryEnabled,
  recordStep,
  telemetryPhaseKeyAtStepStart,
  type SimulationResult,
  type TelemetryAccumulator,
} from './telemetry.js';

const DEFAULT_SIMULATE_OPTIONS: SimulateOptions = {
  enableInvariantChecks: false,
  enableTelemetry: false,
};

function normalizeSimulateOptions(options: SimulateOptions): SimulateOptions {
  return {
    ...DEFAULT_SIMULATE_OPTIONS,
    ...options,
    signalTimings: mergeSignalTimingConfig(options.signalTimings),
  };
}

/**
 * Create a blank, valid initial simulation state.
 * Starts in NS_THROUGH GREEN per specs/REALISTIC-SIGNALIZATION.md.
 */
export function createInitialState(signalTimings?: Partial<SignalTimingConfig>): SimulationState {
  const timing = mergeSignalTimingConfig(signalTimings);
  return {
    queues: createQueues(),
    stepCount: 0,
    vehicleAddCount: 0,
    signalTiming: timing,
    currentSignalPhaseId: 'NS_THROUGH',
    segmentKind: 'GREEN',
    segmentTicksRemaining: 0,
    greenTicksElapsedInCurrentGreen: 0,
    lastServedPhaseIndex: 0, // NS_THROUGH is index 0 — ensures round-robin advances from the initial phase
    forcedPhaseAfterAllRed: null,
    pendingGreenSelection: false,
  };
}

/**
 * Build the displayPhase string from raw signal state.
 * Used to populate StepStatus.displayPhase so the GUI can show YELLOW / ALL_RED.
 */
function buildDisplayPhase(segmentKind: SignalSegmentKind, phaseId: string): string | null {
  if (segmentKind === 'GREEN') return phaseId;
  if (segmentKind === 'YELLOW') return `${phaseId}_YELLOW`;
  if (segmentKind === 'ALL_RED') return 'ALL_RED';
  return null;
}

/**
 * Process a single `step` command against the current state.
 *
 * Order (per spec): apply signal at tick start → dequeue eligible heads → advance controller.
 *
 * Mutates `state` in place.
 */
function processStep(
  state: SimulationState,
  options: SimulateOptions,
  acc: TelemetryAccumulator | null
): StepStatus {
  // Resolve deferred green-phase selection (lazyGreenSelection mode) before discharge.
  resolveGreenSelection(state, options);
  reconcileEmergencyBeforeDischarge(state, options);
  const phaseKeyForTelemetry = telemetryPhaseKeyAtStepStart(state);

  // Capture display phase at tick start (before advanceSignalController mutates segmentKind).
  const displayPhase = buildDisplayPhase(state.segmentKind, state.currentSignalPhaseId);

  const leftVehicles = dischargeEligibleVehicles(state);

  state.stepCount += 1;
  advanceSignalController(state, options);

  const status: StepStatus = { leftVehicles, displayPhase };

  if (acc !== null) {
    recordStep(acc, state, phaseKeyForTelemetry, status);
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
  const state = createInitialState(options.signalTimings);
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
  const options: SimulateOptions =
    typeof optionsOrChecks === 'boolean'
      ? { enableInvariantChecks: optionsOrChecks }
      : optionsOrChecks;

  const normalized = normalizeSimulateOptions(options);
  const acc = isTelemetryEnabled(normalized) ? createAccumulator() : null;
  return runCommands(commands, normalized, acc);
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
  const normalized = normalizeSimulateOptions({ ...options, enableTelemetry: true });
  const acc = createAccumulator();
  const stepStatuses = runCommands(commands, normalized, acc);
  return {
    stepStatuses,
    telemetry: finalizeTelemetry(acc),
  };
}
