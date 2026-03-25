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
 */
export interface StepStatus {
  leftVehicles: string[];
}

/**
 * Per-road priority weight multiplier (must be > 0).
 * A road with weight 2.0 is treated as if it had twice as many vehicles
 * for the purpose of phase selection.  Default weight is 1.0.
 */
export type RoadPriorities = Partial<Record<Road, number>>;

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
   * Index (0 or 1) of the phase that was active in the most recent step.
   * Used as tie-breaker when both phases have equal vehicle counts.
   * Starts at -1 (no phase yet run).
   */
  lastPhaseIndex: number;
}
