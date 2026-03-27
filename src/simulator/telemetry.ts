/**
 * Telemetry and diagnostics for the simulation engine (T14).
 *
 * When `enableTelemetry` is set in SimulateOptions, the simulate function
 * returns a `TelemetryData` object alongside the step statuses.
 * Telemetry is zero-overhead when disabled — no extra objects are allocated.
 */

import type { Road, SimulateOptions, SimulationState, StepStatus } from './types.js';
import { ROADS } from './types.js';
import { PHASES } from './phase.js';
import type { PhaseId } from './phase.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Distribution of how often each phase was selected across all steps.
 * Keys are PhaseId strings; values are the count of steps that used that phase.
 */
export type PhaseDistribution = Record<PhaseId, number>;

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
   * Computed as the mean of per-road queue snapshots taken BEFORE each dequeue.
   * Returns 0 if there were no steps.
   */
  averageQueueLength: number;
  /**
   * How many steps used each phase.
   * All phases are always present as keys; absent phases have a count of 0.
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

/**
 * Create a fresh accumulator with all counters at zero.
 */
export function createAccumulator(): TelemetryAccumulator {
  const phaseDistribution = Object.fromEntries(PHASES.map((p) => [p.id, 0])) as PhaseDistribution;

  return {
    totalSteps: 0,
    totalVehiclesProcessed: 0,
    queueLengthSum: 0,
    queueLengthSampleCount: 0,
    phaseDistribution,
  };
}

// ---------------------------------------------------------------------------
// Accumulation helpers (called by the engine on each step)
// ---------------------------------------------------------------------------

/**
 * Record per-step telemetry: queue snapshot (before dequeue), step count, phase,
 * and vehicle throughput.
 *
 * @param acc - The running accumulator (mutated in place).
 * @param state - The current simulation state (read-only after the snapshot is taken).
 * @param phaseId - The phase selected for this step.
 * @param stepResult - The StepStatus produced by this step.
 */
export function recordStep(
  acc: TelemetryAccumulator,
  state: SimulationState,
  phaseId: PhaseId,
  stepResult: StepStatus
): void {
  acc.totalSteps += 1;
  acc.totalVehiclesProcessed += stepResult.leftVehicles.length;

  // Snapshot current queue lengths across all roads.
  for (const road of ROADS) {
    const queue = state.queues.get(road as Road);
    acc.queueLengthSum += queue?.length ?? 0;
    acc.queueLengthSampleCount += 1;
  }

  acc.phaseDistribution[phaseId] = (acc.phaseDistribution[phaseId] ?? 0) + 1;
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
