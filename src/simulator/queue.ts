/**
 * Vehicle queue management.
 *
 * Each road owns an independent FIFO queue of Vehicle objects.
 * All operations are pure functions over `Map<Road, Vehicle[]>`.
 */

import type { Road, Vehicle, SimulationState } from './types.js';
import { ROADS } from './types.js';

/**
 * Create a fresh queue map with empty arrays for every road.
 * This is the canonical factory — use it to initialise SimulationState.queues.
 */
export function createQueues(): Map<Road, Vehicle[]> {
  const queues = new Map<Road, Vehicle[]>();
  for (const road of ROADS) {
    queues.set(road, []);
  }
  return queues;
}

/**
 * Add a vehicle to its startRoad queue.
 *
 * Normal vehicles are appended to the tail (FIFO).
 * Emergency vehicles are inserted immediately after the last emergency
 * vehicle already in the queue — this keeps emergency vehicles ordered
 * among themselves while still jumping ahead of all normal vehicles.
 *
 * Mutates the map in-place; returns void so call-sites are explicit about mutation.
 */
export function enqueueVehicle(state: SimulationState, vehicle: Vehicle): void {
  const queue = state.queues.get(vehicle.startRoad);
  if (queue === undefined) {
    throw new Error(`Unknown road: ${vehicle.startRoad}`);
  }

  // Stamp insertion order if not already set (allows engine to pre-assign it too).
  if (vehicle.addOrder === undefined) {
    vehicle.addOrder = state.vehicleAddCount;
  }
  state.vehicleAddCount += 1;

  if ((vehicle.priority ?? 'normal') === 'emergency') {
    // Find the index after the last emergency vehicle in the queue.
    let insertAt = 0;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i]!.priority === 'emergency') {
        insertAt = i + 1;
      } else {
        break; // emergency vehicles are always at the front, so first normal ends the run
      }
    }
    queue.splice(insertAt, 0, vehicle);
  } else {
    queue.push(vehicle);
  }
}

/**
 * Remove and return the vehicle at the head of the given road queue (dequeue).
 * Returns `undefined` if the queue is empty.
 * Mutates the queue in-place.
 */
export function dequeueVehicle(state: SimulationState, road: Road): Vehicle | undefined {
  const queue = state.queues.get(road);
  if (queue === undefined) {
    throw new Error(`Unknown road: ${road}`);
  }
  return queue.shift();
}

/**
 * Return the current length of the queue for a given road without modifying it.
 */
export function queueLength(state: SimulationState, road: Road): number {
  const queue = state.queues.get(road);
  if (queue === undefined) {
    throw new Error(`Unknown road: ${road}`);
  }
  return queue.length;
}

/**
 * Return the total number of vehicles across all roads.
 */
export function totalVehicles(state: SimulationState): number {
  let total = 0;
  for (const queue of state.queues.values()) {
    total += queue.length;
  }
  return total;
}

/**
 * Peek at (but do not remove) the vehicle at the head of a road queue.
 * Returns `undefined` if the queue is empty.
 */
export function peekVehicle(state: SimulationState, road: Road): Vehicle | undefined {
  const queue = state.queues.get(road);
  if (queue === undefined) {
    throw new Error(`Unknown road: ${road}`);
  }
  return queue[0];
}
