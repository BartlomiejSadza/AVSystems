/**
 * Tests for emergency vehicle mode (T12).
 *
 * Emergency vehicles:
 *  - Jump to the front of their road queue (after other emergency vehicles).
 *  - If any road queue has an emergency vehicle at front, that phase is forced.
 *  - Normal FIFO ordering is preserved for non-emergency vehicles.
 */

import { describe, it, expect } from 'vitest';
import { simulate, createInitialState } from '../engine.js';
import { enqueueVehicle, queueLength } from '../queue.js';
import { getEmergencyTargetPhase } from '../signal-controller.js';
import type { Command, SimulationState, Vehicle } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OPP_CMD: Record<Vehicle['startRoad'], Vehicle['startRoad']> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

function addVehicle(
  vehicleId: string,
  startRoad: Vehicle['startRoad'],
  endRoad?: Vehicle['startRoad'],
  priority: 'normal' | 'emergency' = 'normal'
): Command {
  return {
    type: 'addVehicle',
    vehicleId,
    startRoad,
    endRoad: endRoad ?? OPP_CMD[startRoad],
    priority,
  };
}

function addEmergency(
  vehicleId: string,
  startRoad: Vehicle['startRoad'],
  endRoad?: Vehicle['startRoad']
): Command {
  return addVehicle(vehicleId, startRoad, endRoad, 'emergency');
}

const step: Command = { type: 'step' };

function makeState(): SimulationState {
  return createInitialState(FAST_SIGNAL_TIMINGS);
}

const OPPOSITE: Record<Vehicle['startRoad'], Vehicle['startRoad']> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

function enqueue(
  state: SimulationState,
  id: string,
  road: Vehicle['startRoad'],
  priority: 'normal' | 'emergency' = 'normal'
): void {
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: OPPOSITE[road], priority });
}

// ---------------------------------------------------------------------------
// Queue ordering — emergency vehicles jump ahead of normal vehicles
// ---------------------------------------------------------------------------

describe('enqueueVehicle — emergency priority ordering', () => {
  it('places emergency vehicle at front of an otherwise empty queue', () => {
    const state = makeState();
    enqueue(state, 'E1', 'north', 'emergency');

    const queue = state.queues.get('north')!;
    expect(queue[0]!.vehicleId).toBe('E1');
    expect(queue[0]!.priority).toBe('emergency');
  });

  it('inserts emergency vehicle ahead of all normal vehicles', () => {
    const state = makeState();
    enqueue(state, 'N1', 'north', 'normal');
    enqueue(state, 'N2', 'north', 'normal');
    enqueue(state, 'E1', 'north', 'emergency');

    const queue = state.queues.get('north')!;
    // E1 should be first, N1 and N2 behind it in their original order
    expect(queue[0]!.vehicleId).toBe('E1');
    expect(queue[1]!.vehicleId).toBe('N1');
    expect(queue[2]!.vehicleId).toBe('N2');
  });

  it('places second emergency vehicle after the first emergency vehicle', () => {
    const state = makeState();
    enqueue(state, 'N1', 'north', 'normal');
    enqueue(state, 'E1', 'north', 'emergency');
    enqueue(state, 'E2', 'north', 'emergency');

    const queue = state.queues.get('north')!;
    expect(queue[0]!.vehicleId).toBe('E1');
    expect(queue[1]!.vehicleId).toBe('E2');
    expect(queue[2]!.vehicleId).toBe('N1');
  });

  it('maintains FIFO order among multiple emergency vehicles', () => {
    const state = makeState();
    enqueue(state, 'EA', 'east', 'emergency');
    enqueue(state, 'EB', 'east', 'emergency');
    enqueue(state, 'EC', 'east', 'emergency');
    enqueue(state, 'N1', 'east', 'normal');

    const queue = state.queues.get('east')!;
    expect(queue.map((v) => v.vehicleId)).toEqual(['EA', 'EB', 'EC', 'N1']);
  });

  it('does not disturb other road queues when inserting emergency vehicle', () => {
    const state = makeState();
    enqueue(state, 'S1', 'south', 'normal');
    enqueue(state, 'E1', 'north', 'emergency');

    expect(queueLength(state, 'south')).toBe(1);
    expect(state.queues.get('south')![0]!.vehicleId).toBe('S1');
  });

  it('appends normal vehicle to tail even when emergency vehicles are present', () => {
    const state = makeState();
    enqueue(state, 'E1', 'west', 'emergency');
    enqueue(state, 'N1', 'west', 'normal');
    enqueue(state, 'N2', 'west', 'normal');

    const queue = state.queues.get('west')!;
    expect(queue.map((v) => v.vehicleId)).toEqual(['E1', 'N1', 'N2']);
  });
});

// ---------------------------------------------------------------------------
// Phase selection — emergency vehicle forces the phase
// ---------------------------------------------------------------------------

describe('getEmergencyTargetPhase — queue-head emergency', () => {
  it('targets EW_THROUGH when east queue head is emergency (straight movement)', () => {
    const state = makeState();
    enqueue(state, 'N1', 'north', 'normal');
    enqueue(state, 'N2', 'north', 'normal');
    enqueue(state, 'S1', 'south', 'normal');
    enqueue(state, 'E_EMG', 'east', 'emergency');

    expect(getEmergencyTargetPhase(state)).toBe('EW_THROUGH');
  });

  it('targets NS_THROUGH when south queue head is emergency (straight movement)', () => {
    const state = makeState();
    enqueue(state, 'E1', 'east', 'normal');
    enqueue(state, 'W1', 'west', 'normal');
    enqueue(state, 'W2', 'west', 'normal');
    enqueue(state, 'S_EMG', 'south', 'emergency');

    expect(getEmergencyTargetPhase(state)).toBe('NS_THROUGH');
  });

  it('returns null when emergency vehicle is not at the head of the queue', () => {
    const state = makeState();

    const queue = state.queues.get('east')!;
    queue.push({ vehicleId: 'N1', startRoad: 'east', endRoad: 'south', priority: 'normal' });
    queue.push({ vehicleId: 'E_EMG', startRoad: 'east', endRoad: 'south', priority: 'emergency' });

    enqueue(state, 'NV1', 'north', 'normal');
    enqueue(state, 'NV2', 'north', 'normal');

    expect(getEmergencyTargetPhase(state)).toBeNull();
  });

  it('returns null when no queues are present at all', () => {
    const state = makeState();
    expect(getEmergencyTargetPhase(state)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Full simulation — emergency vehicle integration
// ---------------------------------------------------------------------------

describe('simulate — emergency vehicle end-to-end', () => {
  it('emergency vehicle departs before normal vehicles on the same road', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'), // normal, enqueued first
      addVehicle('N2', 'north'), // normal, enqueued second
      addEmergency('NE', 'north'), // emergency — should jump to front
      step, // NS phase: NE should depart (not N1)
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('NE');
    expect(result[0]?.leftVehicles).not.toContain('N1');
    expect(result[0]?.leftVehicles).not.toContain('N2');
  });

  it('forces EW phase even when NS has more normal vehicles', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('N2', 'north'),
      addVehicle('S1', 'south'), // NS total = 3 (would normally win)
      addEmergency('E_EMG', 'east'), // emergency on east → EW forced
      step,
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    // EW phase forced — only east/west vehicles depart
    expect(result[0]?.leftVehicles).toContain('E_EMG');
    expect(result[0]?.leftVehicles).not.toContain('N1');
    expect(result[0]?.leftVehicles).not.toContain('S1');
  });

  it('returns to normal adaptive selection after emergency vehicle departs', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('N2', 'north'), // NS total = 2
      addEmergency('E_EMG', 'east'), // EW forced for step 1
      step, // step 1: EW forced → E_EMG departs
      step, // step 2: no emergency → NS wins (2 vs 0) → N1 departs
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('E_EMG');
    expect(result[1]?.leftVehicles).toContain('N1');
  });

  it('handles emergency vehicles on both opposing phases — picks heavier phase', () => {
    const commands: Command[] = [
      addEmergency('NE', 'north'), // NS emergency
      addEmergency('EE', 'east'), // EW emergency — tie on emergency phases
      addVehicle('S1', 'south'), // extra vehicle on NS
      step,
    ];

    // Both phases have emergency at front → fall back to weighted load
    // NS: north(emergency)=1 + south(normal)=1 = 2, EW: east(emergency)=1 + west=0 = 1
    // NS wins by load
    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('NE');
    expect(result[0]?.leftVehicles).toContain('S1');
    expect(result[0]?.leftVehicles).not.toContain('EE');
  });

  it('emergency vehicle on an otherwise empty phase still forces that phase', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'), // NS has 2, EW has 0 except emergency
      addEmergency('WE', 'west'), // EW emergency
      step,
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('WE');
  });

  it('accepts priority field through Zod parser path (schema accepts optional priority)', () => {
    // This test exercises the full pipeline: addVehicle with priority field
    const commands: Command[] = [
      {
        type: 'addVehicle',
        vehicleId: 'V1',
        startRoad: 'north',
        endRoad: 'south',
        priority: 'emergency',
      },
      { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' }, // no priority field
      step,
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    // V1 is emergency → departs first
    expect(result[0]?.leftVehicles).toContain('V1');
  });

  it('omitting priority defaults to normal behavior (no breakage)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'B', startRoad: 'south', endRoad: 'north' },
      step,
    ];

    expect(() => simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS })).not.toThrow();
    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('A');
    expect(result[0]?.leftVehicles).toContain('B');
  });

  it('two consecutive emergency vehicles depart in FIFO order among themselves', () => {
    const commands: Command[] = [
      addEmergency('EA', 'north'),
      addEmergency('EB', 'north'),
      step, // EA departs (first emergency)
      step, // EB departs (second emergency)
    ];

    const result = simulate(commands, { signalTimings: FAST_SIGNAL_TIMINGS });
    expect(result[0]?.leftVehicles).toContain('EA');
    expect(result[1]?.leftVehicles).toContain('EB');
  });
});

// ---------------------------------------------------------------------------
// Schema validation — priority field in Zod schema
// ---------------------------------------------------------------------------

describe('schema — addVehicle priority field', () => {
  it('accepts valid priority values via Zod schema', async () => {
    const { AddVehicleCommandSchema } = await import('../../io/schemas.js');

    const normalCmd = {
      type: 'addVehicle' as const,
      vehicleId: 'V1',
      startRoad: 'north' as const,
      endRoad: 'south' as const,
      priority: 'normal' as const,
    };
    expect(AddVehicleCommandSchema.safeParse(normalCmd).success).toBe(true);

    const emergencyCmd = { ...normalCmd, priority: 'emergency' as const };
    expect(AddVehicleCommandSchema.safeParse(emergencyCmd).success).toBe(true);
  });

  it('accepts missing priority field (optional)', async () => {
    const { AddVehicleCommandSchema } = await import('../../io/schemas.js');

    const cmd = {
      type: 'addVehicle' as const,
      vehicleId: 'V1',
      startRoad: 'north' as const,
      endRoad: 'south' as const,
    };
    expect(AddVehicleCommandSchema.safeParse(cmd).success).toBe(true);
  });

  it('rejects invalid priority value', async () => {
    const { AddVehicleCommandSchema } = await import('../../io/schemas.js');

    const cmd = {
      type: 'addVehicle' as const,
      vehicleId: 'V1',
      startRoad: 'north' as const,
      endRoad: 'south' as const,
      priority: 'high',
    };
    expect(AddVehicleCommandSchema.safeParse(cmd).success).toBe(false);
  });
});
