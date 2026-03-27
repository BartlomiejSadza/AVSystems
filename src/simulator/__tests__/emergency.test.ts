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
import { selectPhase } from '../phase.js';
import type { Command, SimulationState, Vehicle } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addVehicle(
  vehicleId: string,
  startRoad: Vehicle['startRoad'],
  endRoad: Vehicle['startRoad'] = 'south',
  priority: 'normal' | 'emergency' = 'normal'
): Command {
  return { type: 'addVehicle', vehicleId, startRoad, endRoad, priority };
}

function addEmergency(
  vehicleId: string,
  startRoad: Vehicle['startRoad'],
  endRoad: Vehicle['startRoad'] = 'south'
): Command {
  return addVehicle(vehicleId, startRoad, endRoad, 'emergency');
}

const step: Command = { type: 'step' };

function makeState(): SimulationState {
  return createInitialState();
}

function enqueue(
  state: SimulationState,
  id: string,
  road: Vehicle['startRoad'],
  priority: 'normal' | 'emergency' = 'normal'
): void {
  enqueueVehicle(state, { vehicleId: id, startRoad: road, endRoad: 'south', priority });
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

describe('selectPhase — emergency vehicle phase forcing', () => {
  it('forces EW phase when east queue has an emergency vehicle at front', () => {
    const state = makeState();
    // NS has more vehicles — would normally win
    enqueue(state, 'N1', 'north', 'normal');
    enqueue(state, 'N2', 'north', 'normal');
    enqueue(state, 'S1', 'south', 'normal');
    // EW has one emergency vehicle
    enqueue(state, 'E_EMG', 'east', 'emergency');

    // Emergency override: EW phase forced
    const chosen = selectPhase(state);
    expect(chosen.id).toBe('EW_STRAIGHT');
  });

  it('forces NS phase when south queue has an emergency vehicle at front', () => {
    const state = makeState();
    // EW would normally win by vehicle count
    enqueue(state, 'E1', 'east', 'normal');
    enqueue(state, 'W1', 'west', 'normal');
    enqueue(state, 'W2', 'west', 'normal');
    // NS has one emergency on south
    enqueue(state, 'S_EMG', 'south', 'emergency');

    const chosen = selectPhase(state);
    expect(chosen.id).toBe('NS_STRAIGHT');
  });

  it('does NOT force a phase when emergency vehicle is not at the head of the queue', () => {
    // A normal vehicle is at the front; emergency is behind it.
    // This means the emergency has already been queued behind a normal vehicle,
    // which cannot happen with valid insertions — but we test the guard anyway.
    const state = makeState();

    // Manually construct: put normal first, emergency second (bypass enqueue)
    const queue = state.queues.get('east')!;
    queue.push({ vehicleId: 'N1', startRoad: 'east', endRoad: 'south', priority: 'normal' });
    queue.push({ vehicleId: 'E_EMG', startRoad: 'east', endRoad: 'south', priority: 'emergency' });

    // NS has more vehicles
    enqueue(state, 'NV1', 'north', 'normal');
    enqueue(state, 'NV2', 'north', 'normal');

    // Emergency is NOT at head → no override → NS wins by load
    const chosen = selectPhase(state);
    expect(chosen.id).toBe('NS_STRAIGHT');
  });

  it('returns a valid phase when no queues are present at all', () => {
    const state = makeState();
    expect(() => selectPhase(state)).not.toThrow();
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

    const result = simulate(commands);
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

    const result = simulate(commands);
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

    const result = simulate(commands);
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
    const result = simulate(commands);
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

    const result = simulate(commands);
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

    const result = simulate(commands);
    // V1 is emergency → departs first
    expect(result[0]?.leftVehicles).toContain('V1');
  });

  it('omitting priority defaults to normal behavior (no breakage)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'B', startRoad: 'south', endRoad: 'north' },
      step,
    ];

    expect(() => simulate(commands)).not.toThrow();
    const result = simulate(commands);
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

    const result = simulate(commands);
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
