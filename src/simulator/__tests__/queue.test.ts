/**
 * Tests for vehicle queue management (FIFO semantics).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createQueues,
  enqueueVehicle,
  dequeueVehicle,
  queueLength,
  totalVehicles,
  peekVehicle,
} from '../queue.js';
import type { SimulationState, Vehicle } from '../types.js';
import { ROADS } from '../types.js';

function makeState(): SimulationState {
  return {
    queues: createQueues(),
    stepCount: 0,
    lastPhaseIndex: -1,
  };
}

function makeVehicle(id: string, startRoad: Vehicle['startRoad'] = 'north'): Vehicle {
  return { vehicleId: id, startRoad, endRoad: 'south' };
}

describe('createQueues', () => {
  it('creates a map with all four roads', () => {
    const q = createQueues();
    for (const road of ROADS) {
      expect(q.has(road)).toBe(true);
    }
  });

  it('all queues start empty', () => {
    const q = createQueues();
    for (const road of ROADS) {
      expect(q.get(road)).toHaveLength(0);
    }
  });
});

describe('enqueueVehicle', () => {
  let state: SimulationState;
  beforeEach(() => {
    state = makeState();
  });

  it('adds a vehicle to the correct road queue', () => {
    const v = makeVehicle('V1', 'north');
    enqueueVehicle(state, v);
    expect(queueLength(state, 'north')).toBe(1);
  });

  it('preserves insertion order (FIFO: first in, first out)', () => {
    const v1 = makeVehicle('V1', 'north');
    const v2 = makeVehicle('V2', 'north');
    const v3 = makeVehicle('V3', 'north');
    enqueueVehicle(state, v1);
    enqueueVehicle(state, v2);
    enqueueVehicle(state, v3);
    expect(state.queues.get('north')).toEqual([v1, v2, v3]);
  });

  it('does not affect other roads', () => {
    enqueueVehicle(state, makeVehicle('V1', 'north'));
    expect(queueLength(state, 'south')).toBe(0);
    expect(queueLength(state, 'east')).toBe(0);
    expect(queueLength(state, 'west')).toBe(0);
  });

  it('throws when startRoad is not a recognised road', () => {
    const badVehicle = {
      vehicleId: 'V9',
      startRoad: 'diagonal' as never,
      endRoad: 'north' as const,
    };
    expect(() => enqueueVehicle(state, badVehicle)).toThrow();
  });
});

describe('dequeueVehicle', () => {
  let state: SimulationState;
  beforeEach(() => {
    state = makeState();
  });

  it('returns the first inserted vehicle (FIFO)', () => {
    const v1 = makeVehicle('V1', 'south');
    const v2 = makeVehicle('V2', 'south');
    enqueueVehicle(state, v1);
    enqueueVehicle(state, v2);
    expect(dequeueVehicle(state, 'south')).toEqual(v1);
  });

  it('removes the vehicle from the queue', () => {
    enqueueVehicle(state, makeVehicle('V1', 'east'));
    dequeueVehicle(state, 'east');
    expect(queueLength(state, 'east')).toBe(0);
  });

  it('returns undefined when the queue is empty', () => {
    expect(dequeueVehicle(state, 'west')).toBeUndefined();
  });

  it('dequeues in FIFO order across multiple calls', () => {
    const vehicles = ['A', 'B', 'C'].map((id) => makeVehicle(id, 'north'));
    vehicles.forEach((v) => enqueueVehicle(state, v));
    expect(dequeueVehicle(state, 'north')?.vehicleId).toBe('A');
    expect(dequeueVehicle(state, 'north')?.vehicleId).toBe('B');
    expect(dequeueVehicle(state, 'north')?.vehicleId).toBe('C');
    expect(dequeueVehicle(state, 'north')).toBeUndefined();
  });
});

describe('queueLength', () => {
  let state: SimulationState;
  beforeEach(() => {
    state = makeState();
  });

  it('returns 0 for an empty queue', () => {
    expect(queueLength(state, 'north')).toBe(0);
  });

  it('reflects the current queue size after enqueue/dequeue', () => {
    enqueueVehicle(state, makeVehicle('V1', 'north'));
    enqueueVehicle(state, makeVehicle('V2', 'north'));
    expect(queueLength(state, 'north')).toBe(2);
    dequeueVehicle(state, 'north');
    expect(queueLength(state, 'north')).toBe(1);
  });
});

describe('totalVehicles', () => {
  let state: SimulationState;
  beforeEach(() => {
    state = makeState();
  });

  it('returns 0 when no vehicles are present', () => {
    expect(totalVehicles(state)).toBe(0);
  });

  it('sums vehicles across all roads', () => {
    enqueueVehicle(state, makeVehicle('V1', 'north'));
    enqueueVehicle(state, makeVehicle('V2', 'south'));
    enqueueVehicle(state, makeVehicle('V3', 'east'));
    expect(totalVehicles(state)).toBe(3);
  });

  it('decreases after dequeue', () => {
    enqueueVehicle(state, makeVehicle('V1', 'north'));
    dequeueVehicle(state, 'north');
    expect(totalVehicles(state)).toBe(0);
  });
});

describe('peekVehicle', () => {
  let state: SimulationState;
  beforeEach(() => {
    state = makeState();
  });

  it('returns the front vehicle without removing it', () => {
    const v = makeVehicle('V1', 'north');
    enqueueVehicle(state, v);
    expect(peekVehicle(state, 'north')).toEqual(v);
    expect(queueLength(state, 'north')).toBe(1);
  });

  it('returns undefined for an empty queue', () => {
    expect(peekVehicle(state, 'north')).toBeUndefined();
  });
});
