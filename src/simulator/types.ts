/**
 * Core domain types for the Traffic Lights Simulation.
 *
 * All types are pure data — no I/O, no side effects, no framework dependencies.
 */

/** The four cardinal directions that correspond to the intersection roads. */
export const ROADS = ['north', 'south', 'east', 'west'] as const;
export type Road = (typeof ROADS)[number];

/** Vehicle priority level. Emergency vehicles jump to front of their road queue. */
export type VehiclePriority = 'normal' | 'emergency';

/** A vehicle waiting in a road queue. */
export interface Vehicle {
  vehicleId: string;
  startRoad: Road;
  endRoad: Road;
  /**
   * Priority level for queue insertion.
   * Defaults to 'normal' when not specified.
   * Emergency vehicles jump to the front of their road queue.
   */
  priority?: VehiclePriority;
  /**
   * Monotonically increasing insertion counter assigned by enqueueVehicle.
   * Used to sort discharged vehicles in FIFO (insertion) order across roads.
   * Assigned automatically — callers may omit it.
   */
  addOrder?: number;
}

/** Command to add a vehicle to the simulation. */
export interface AddVehicleCommand {
  type: 'addVehicle';
  vehicleId: string;
  startRoad: Road;
  endRoad: Road;
  /** Optional priority; defaults to 'normal'. */
  priority?: VehiclePriority;
}

/** Command to advance the simulation by one tick. */
export interface StepCommand {
  type: 'step';
}

/** Union of all command types. */
export type Command = AddVehicleCommand | StepCommand;

/**
 * The result produced by a single step tick.
 * `leftVehicles` holds the IDs of vehicles that cleared the intersection.
 * `displayPhase` carries the full signal state at the tick start, including
 * YELLOW and ALL_RED segments that are invisible to the leftVehicles heuristic.
 * Format: 'NS_THROUGH' | 'NS_THROUGH_YELLOW' | 'ALL_RED' | null (null = phase unknown / idle).
 */
export interface StepStatus {
  leftVehicles: string[];
  displayPhase?: string | null;
}

/**
 * Per-road priority weight multiplier (must be > 0).
 * A road with weight 2.0 is treated as if it had twice as many vehicles
 * for the purpose of phase selection.  Default weight is 1.0.
 */
export type RoadPriorities = Partial<Record<Road, number>>;

/** Subset of phase ids used in timing overrides (avoids circular imports with signal-phases). */
export type SignalPhaseTimingKey = 'NS_THROUGH' | 'NS_LEFT' | 'EW_THROUGH' | 'EW_LEFT';

export interface PerPhaseTimingOverride {
  minGreenTicks?: number;
  maxGreenTicks?: number;
}

/**
 * Configurable signal timing (ticks). Non-negative integers.
 * Realistic defaults match specs/REALISTIC-SIGNALIZATION.md §9 example.
 */
export interface SignalTimingConfig {
  minGreenTicks: number;
  maxGreenTicks: number;
  yellowTicks: number;
  allRedTicks: number;
  skipEmptyPhases: boolean;
  /**
   * When true, next-green-phase selection is deferred to the START of the
   * following step rather than the end of the current step.  This ensures
   * that vehicles added between two steps are visible to the demand
   * calculation and the correct phase is chosen.
   * Default is false (immediate selection, for realistic mode).
   */
  lazyGreenSelection: boolean;
  perPhase: Partial<Record<SignalPhaseTimingKey, PerPhaseTimingOverride>>;
}

export const DEFAULT_SIGNAL_TIMING_CONFIG: SignalTimingConfig = {
  minGreenTicks: 5,
  maxGreenTicks: 60,
  yellowTicks: 3,
  allRedTicks: 2,
  skipEmptyPhases: false,
  lazyGreenSelection: false,
  perPhase: {},
};

export function mergeSignalTimingConfig(partial?: Partial<SignalTimingConfig>): SignalTimingConfig {
  const p = partial ?? {};
  return {
    ...DEFAULT_SIGNAL_TIMING_CONFIG,
    ...p,
    perPhase: { ...DEFAULT_SIGNAL_TIMING_CONFIG.perPhase, ...p.perPhase },
  };
}

export type SignalSegmentKind = 'GREEN' | 'YELLOW' | 'ALL_RED';

/**
 * Configuration options passed to the simulate() function.
 * All fields are optional — omitted fields use safe defaults.
 */
export interface SimulateOptions {
  /**
   * Weight multipliers per road used during phase selection.
   * Roads not listed default to 1.0.
   */
  roadPriorities?: RoadPriorities;
  /**
   * Signal timing profile (merged with defaults).
   */
  signalTimings?: Partial<SignalTimingConfig>;
  /**
   * When true, runtime invariant assertions run after every mutation.
   * Disable on hot paths; default is false.
   */
  enableInvariantChecks?: boolean;
  /**
   * When true, the simulate function returns telemetry data alongside
   * the step statuses.  Default is false.
   */
  enableTelemetry?: boolean;
}

/**
 * Complete mutable state of the simulation.
 * Kept in one place so invariant checks can inspect the full snapshot.
 */
export interface SimulationState {
  /** Per-road vehicle queues (FIFO). */
  queues: Map<Road, Vehicle[]>;
  /** Total number of `step` commands processed so far. */
  stepCount: number;
  /**
   * Monotonically increasing counter incremented on each enqueueVehicle call.
   * Assigned to Vehicle.addOrder to preserve cross-road insertion order.
   */
  vehicleAddCount: number;
  /** Merged signal configuration for this run. */
  signalTiming: SignalTimingConfig;
  /** Active protected phase (sub-phase row). */
  currentSignalPhaseId: SignalPhaseTimingKey;
  segmentKind: SignalSegmentKind;
  /**
   * Countdown for YELLOW and ALL_RED (ticks left including the current tick's decrement).
   * Unused when segmentKind is GREEN (use greenTicksElapsedInCurrentGreen).
   */
  segmentTicksRemaining: number;
  /**
   * Number of ticks already completed in the current GREEN segment for `currentSignalPhaseId`.
   * Incremented at the end of each tick while in GREEN (after discharge).
   */
  greenTicksElapsedInCurrentGreen: number;
  /**
   * Ring index (0..3) of the last phase that entered GREEN from selection.
   * Used for round-robin tie-break among equal weighted demand. -1 = none yet.
   */
  lastServedPhaseIndex: number;
  /**
   * When non-null, completing ALL_RED must enter GREEN for this phase (emergency preemption)
   * instead of adaptive selection. Cleared when entering GREEN.
   */
  forcedPhaseAfterAllRed: SignalPhaseTimingKey | null;
  /**
   * When true, the next green phase has not yet been selected.
   * Phase selection is deferred to the start of the next step so that
   * vehicles added between steps are visible to the demand calculation.
   * Resolved by resolveGreenSelection() before discharge.
   */
  pendingGreenSelection: boolean;
}
