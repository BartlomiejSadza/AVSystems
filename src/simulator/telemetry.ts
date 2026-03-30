/**
 * Telemetry and diagnostics for the simulation engine (T14).
 *
 * When `enableTelemetry` is set in SimulateOptions, the simulate function
 * returns a `TelemetryData` object alongside the step statuses.
 * Telemetry is zero-overhead when disabled — no extra objects are allocated.
 */

import type { Road, SimulateOptions, SimulationState, StepStatus } from './types.js';
import { ROADS } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Phase label for a single step: active green/yellow sub-phase or ALL_RED clearance.
 */
export type TelemetryPhaseKey = 'NS_THROUGH' | 'NS_LEFT' | 'EW_THROUGH' | 'EW_LEFT' | 'ALL_RED';

/**
 * Distribution of how often each telemetry phase key was active at step start.
 */
export type PhaseDistribution = Record<TelemetryPhaseKey, number>;

/**
 * Telemetry snapshot produced by a single simulate() run.
 *
 * All metrics refer to the entire command sequence — not just the last step.
 */
export interface TelemetryData {
  /** Total number of `step` commands processed. */
  totalSteps: number;
  /**
   * Total number of vehicles that cleared the intersection
   * (sum of `leftVehicles.length` across all step statuses).
   */
  totalVehiclesProcessed: number;
  /**
   * Average queue length across all roads and all steps.
   * Computed as the mean of per-road queue snapshots taken AFTER each step's dequeue.
   * Returns 0 if there were no steps.
   */
  averageQueueLength: number;
  /**
   * How many steps had each phase key active at tick start (discharge basis).
   */
  phaseDistribution: PhaseDistribution;
}

// ---------------------------------------------------------------------------
// Internal accumulator (mutable, not exported)
// ---------------------------------------------------------------------------

export interface TelemetryAccumulator {
  totalSteps: number;
  totalVehiclesProcessed: number;
  /** Running sum of queue snapshots (all roads, all steps). */
  queueLengthSum: number;
  /** Number of individual road-step snapshots taken (roads × steps). */
  queueLengthSampleCount: number;
  phaseDistribution: PhaseDistribution;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const ZERO_DISTRIBUTION: PhaseDistribution = {
  NS_THROUGH: 0,
  NS_LEFT: 0,
  EW_THROUGH: 0,
  EW_LEFT: 0,
  ALL_RED: 0,
};

/**
 * Phase key at tick start (before discharge) for telemetry bucketing.
 */
export function telemetryPhaseKeyAtStepStart(state: SimulationState): TelemetryPhaseKey {
  if (state.segmentKind === 'ALL_RED') {
    return 'ALL_RED';
  }
  return state.currentSignalPhaseId;
}

/**
 * Create a fresh accumulator with all counters at zero.
 */
export function createAccumulator(): TelemetryAccumulator {
  return {
    totalSteps: 0,
    totalVehiclesProcessed: 0,
    queueLengthSum: 0,
    queueLengthSampleCount: 0,
    phaseDistribution: { ...ZERO_DISTRIBUTION },
  };
}

// ---------------------------------------------------------------------------
// Accumulation helpers (called by the engine on each step)
// ---------------------------------------------------------------------------

/**
 * Record per-step telemetry: queue snapshot (after dequeue), step count, phase at tick start,
 * and vehicle throughput.
 *
 * @param acc - The running accumulator (mutated in place).
 * @param state - The current simulation state (after dequeue and controller advance).
 * @param phaseKeyAtStepStart - Signal phase active at the beginning of the tick.
 * @param stepResult - The StepStatus produced by this step.
 */
export function recordStep(
  acc: TelemetryAccumulator,
  state: SimulationState,
  phaseKeyAtStepStart: TelemetryPhaseKey,
  stepResult: StepStatus
): void {
  acc.totalSteps += 1;
  acc.totalVehiclesProcessed += stepResult.leftVehicles.length;

  for (const road of ROADS) {
    const queue = state.queues.get(road as Road);
    acc.queueLengthSum += queue?.length ?? 0;
    acc.queueLengthSampleCount += 1;
  }

  acc.phaseDistribution[phaseKeyAtStepStart] =
    (acc.phaseDistribution[phaseKeyAtStepStart] ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Finalisation
// ---------------------------------------------------------------------------

/**
 * Convert a finalized accumulator into the public `TelemetryData` snapshot.
 */
export function finalizeTelemetry(acc: TelemetryAccumulator): TelemetryData {
  const averageQueueLength =
    acc.queueLengthSampleCount > 0 ? acc.queueLengthSum / acc.queueLengthSampleCount : 0;

  return {
    totalSteps: acc.totalSteps,
    totalVehiclesProcessed: acc.totalVehiclesProcessed,
    averageQueueLength,
    phaseDistribution: { ...acc.phaseDistribution },
  };
}

// ---------------------------------------------------------------------------
// Result type for simulate() with telemetry enabled
// ---------------------------------------------------------------------------

/**
 * Return value of `simulateWithTelemetry()`.
 * Contains both the step-by-step results and the aggregated metrics.
 */
export interface SimulationResult {
  stepStatuses: StepStatus[];
  telemetry: TelemetryData;
}

/**
 * Guard: narrow options to confirm telemetry is requested.
 */
export function isTelemetryEnabled(options: SimulateOptions): boolean {
  return options.enableTelemetry === true;
}
