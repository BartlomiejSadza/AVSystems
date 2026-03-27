/**
 * Tests for the telemetry and diagnostics module (T14).
 *
 * Covers:
 *  - TelemetryData fields: totalSteps, totalVehiclesProcessed,
 *    averageQueueLength, phaseDistribution
 *  - simulateWithTelemetry() API
 *  - simulate() with enableTelemetry option
 *  - Edge cases: zero steps, mixed commands, priority interactions
 */

import { describe, it, expect } from 'vitest';
import { simulate, simulateWithTelemetry } from '../engine.js';
import { createAccumulator, finalizeTelemetry, recordStep } from '../telemetry.js';
import type { Command } from '../types.js';
import { createInitialState } from '../engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addVehicle(
  vehicleId: string,
  startRoad: 'north' | 'south' | 'east' | 'west',
  endRoad: 'north' | 'south' | 'east' | 'west' = 'south'
): Command {
  return { type: 'addVehicle', vehicleId, startRoad, endRoad };
}

const step: Command = { type: 'step' };

// ---------------------------------------------------------------------------
// Unit tests for accumulator internals
// ---------------------------------------------------------------------------

describe('createAccumulator', () => {
  it('initialises all counters to zero', () => {
    const acc = createAccumulator();
    expect(acc.totalSteps).toBe(0);
    expect(acc.totalVehiclesProcessed).toBe(0);
    expect(acc.queueLengthSum).toBe(0);
    expect(acc.queueLengthSampleCount).toBe(0);
  });

  it('initialises phaseDistribution with zero counts for all phases', () => {
    const acc = createAccumulator();
    expect(acc.phaseDistribution['NS_STRAIGHT']).toBe(0);
    expect(acc.phaseDistribution['EW_STRAIGHT']).toBe(0);
  });
});

describe('finalizeTelemetry', () => {
  it('returns averageQueueLength of 0 when no steps were recorded', () => {
    const acc = createAccumulator();
    const tel = finalizeTelemetry(acc);
    expect(tel.averageQueueLength).toBe(0);
    expect(tel.totalSteps).toBe(0);
    expect(tel.totalVehiclesProcessed).toBe(0);
  });

  it('computes correct averageQueueLength from accumulator', () => {
    // 2 steps, 4 roads each = 8 samples. Total queue sum = 8. Average = 1.
    const acc = createAccumulator();
    acc.queueLengthSum = 8;
    acc.queueLengthSampleCount = 8;
    const tel = finalizeTelemetry(acc);
    expect(tel.averageQueueLength).toBe(1);
  });

  it('does not mutate the accumulator when finalizing', () => {
    const acc = createAccumulator();
    acc.totalSteps = 5;
    acc.phaseDistribution['NS_STRAIGHT'] = 3;
    finalizeTelemetry(acc);
    expect(acc.totalSteps).toBe(5);
    expect(acc.phaseDistribution['NS_STRAIGHT']).toBe(3);
  });

  it('returns a copy of phaseDistribution, not a shared reference', () => {
    const acc = createAccumulator();
    acc.phaseDistribution['NS_STRAIGHT'] = 2;
    const tel = finalizeTelemetry(acc);
    tel.phaseDistribution['NS_STRAIGHT'] = 99;
    expect(acc.phaseDistribution['NS_STRAIGHT']).toBe(2);
  });
});

describe('recordStep', () => {
  it('increments totalSteps by 1', () => {
    const acc = createAccumulator();
    const state = createInitialState();
    recordStep(acc, state, 'NS_STRAIGHT', { leftVehicles: [] });
    expect(acc.totalSteps).toBe(1);
  });

  it('accumulates vehicles processed', () => {
    const acc = createAccumulator();
    const state = createInitialState();
    recordStep(acc, state, 'NS_STRAIGHT', { leftVehicles: ['V1', 'V2'] });
    recordStep(acc, state, 'EW_STRAIGHT', { leftVehicles: ['V3'] });
    expect(acc.totalVehiclesProcessed).toBe(3);
  });

  it('records queue snapshots — 4 roads sampled per step', () => {
    const acc = createAccumulator();
    const state = createInitialState();
    recordStep(acc, state, 'NS_STRAIGHT', { leftVehicles: [] });
    expect(acc.queueLengthSampleCount).toBe(4); // 4 roads × 1 step
  });

  it('increments the correct phase counter', () => {
    const acc = createAccumulator();
    const state = createInitialState();
    recordStep(acc, state, 'NS_STRAIGHT', { leftVehicles: [] });
    recordStep(acc, state, 'NS_STRAIGHT', { leftVehicles: [] });
    recordStep(acc, state, 'EW_STRAIGHT', { leftVehicles: [] });
    expect(acc.phaseDistribution['NS_STRAIGHT']).toBe(2);
    expect(acc.phaseDistribution['EW_STRAIGHT']).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// simulateWithTelemetry integration tests
// ---------------------------------------------------------------------------

describe('simulateWithTelemetry — basic', () => {
  it('returns stepStatuses identical to simulate()', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step,
      addVehicle('E1', 'east'),
      step,
    ];

    const regular = simulate(commands);
    const { stepStatuses } = simulateWithTelemetry(commands);

    expect(stepStatuses).toEqual(regular);
  });

  it('totalSteps equals number of step commands', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), step, step, step];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.totalSteps).toBe(3);
  });

  it('totalVehiclesProcessed counts all departed vehicles', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step, // 2 vehicles depart
      addVehicle('E1', 'east'),
      step, // 1 vehicle departs
    ];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.totalVehiclesProcessed).toBe(3);
  });

  it('totalVehiclesProcessed is 0 when no vehicles were added', () => {
    const commands: Command[] = [step, step, step];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.totalVehiclesProcessed).toBe(0);
    expect(telemetry.totalSteps).toBe(3);
  });

  it('returns zero metrics when no commands are given', () => {
    const { telemetry } = simulateWithTelemetry([]);
    expect(telemetry.totalSteps).toBe(0);
    expect(telemetry.totalVehiclesProcessed).toBe(0);
    expect(telemetry.averageQueueLength).toBe(0);
    expect(telemetry.phaseDistribution['NS_STRAIGHT']).toBe(0);
    expect(telemetry.phaseDistribution['EW_STRAIGHT']).toBe(0);
  });
});

describe('simulateWithTelemetry — phaseDistribution', () => {
  it('records NS_STRAIGHT when NS is active', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.phaseDistribution['NS_STRAIGHT']).toBe(1);
    expect(telemetry.phaseDistribution['EW_STRAIGHT']).toBe(0);
  });

  it('records EW_STRAIGHT when EW is active', () => {
    const commands: Command[] = [addVehicle('E1', 'east'), addVehicle('W1', 'west'), step];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.phaseDistribution['EW_STRAIGHT']).toBe(1);
    expect(telemetry.phaseDistribution['NS_STRAIGHT']).toBe(0);
  });

  it('counts alternating phases when loads are equal', () => {
    const commands: Command[] = [step, step, step, step];
    const { telemetry } = simulateWithTelemetry(commands);
    // 4 empty steps: tie-breaking alternates NS, EW, NS, EW
    expect(telemetry.phaseDistribution['NS_STRAIGHT']).toBe(2);
    expect(telemetry.phaseDistribution['EW_STRAIGHT']).toBe(2);
    expect(telemetry.totalSteps).toBe(4);
  });

  it('phase counts sum to totalSteps', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      step,
      addVehicle('E1', 'east'),
      step,
      step,
      step,
    ];
    const { telemetry } = simulateWithTelemetry(commands);
    const phaseSum = Object.values(telemetry.phaseDistribution).reduce((a, b) => a + b, 0);
    expect(phaseSum).toBe(telemetry.totalSteps);
  });
});

describe('simulateWithTelemetry — averageQueueLength', () => {
  it('averageQueueLength is 0 when queues are always empty', () => {
    const { telemetry } = simulateWithTelemetry([step, step]);
    expect(telemetry.averageQueueLength).toBe(0);
  });

  it('averageQueueLength reflects vehicles still in queue at time of step', () => {
    // Add 2 north vehicles; step: N1 departs, N2 stays.
    // Queue snapshot for step 1 (after dequeue):
    //   north=1 (N2 remains), south=0, east=0, west=0 → sum=1, samples=4, avg=0.25
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('N2', 'north'), step];
    const { telemetry } = simulateWithTelemetry(commands);
    // After the dequeue, north queue has 1 vehicle remaining.
    // 4 roads sampled: north=1, others=0 → avg = 1/4 = 0.25
    expect(telemetry.averageQueueLength).toBe(0.25);
  });

  it('averageQueueLength is non-negative', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('E1', 'east'),
      step,
      step,
      step,
    ];
    const { telemetry } = simulateWithTelemetry(commands);
    expect(telemetry.averageQueueLength).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// simulate() with enableTelemetry option (no return value change)
// ---------------------------------------------------------------------------

describe('simulate — enableTelemetry option', () => {
  it('does not throw when enableTelemetry is true', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() => simulate(commands, { enableTelemetry: true })).not.toThrow();
  });

  it('returns same StepStatus[] whether telemetry is enabled or not', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), step, addVehicle('E1', 'east'), step];
    const withTel = simulate(commands, { enableTelemetry: true });
    const withoutTel = simulate(commands, { enableTelemetry: false });
    expect(withTel).toEqual(withoutTel);
  });
});

// ---------------------------------------------------------------------------
// simulateWithTelemetry — integration with other options
// ---------------------------------------------------------------------------

describe('simulateWithTelemetry — combined options', () => {
  it('works with road priorities', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];
    expect(() => simulateWithTelemetry(commands, { roadPriorities: { east: 2.0 } })).not.toThrow();
  });

  it('works with emergency vehicles', () => {
    const commands: Command[] = [
      {
        type: 'addVehicle',
        vehicleId: 'EMG',
        startRoad: 'east',
        endRoad: 'west',
        priority: 'emergency',
      },
      addVehicle('N1', 'north'),
      step,
    ];
    const { telemetry, stepStatuses } = simulateWithTelemetry(commands);
    expect(telemetry.totalSteps).toBe(1);
    expect(stepStatuses[0]?.leftVehicles).toContain('EMG');
  });

  it('works with invariant checks enabled', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() => simulateWithTelemetry(commands, { enableInvariantChecks: true })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Large-scale smoke test
// ---------------------------------------------------------------------------

describe('simulateWithTelemetry — large scale', () => {
  it('processes 1000 vehicles across 500 steps without errors', () => {
    const commands: Command[] = [];
    const roads = ['north', 'south', 'east', 'west'] as const;
    for (let i = 0; i < 1000; i++) {
      commands.push(addVehicle(`V${i}`, roads[i % 4]!));
    }
    for (let i = 0; i < 500; i++) {
      commands.push(step);
    }

    const { telemetry, stepStatuses } = simulateWithTelemetry(commands);

    expect(telemetry.totalSteps).toBe(500);
    expect(stepStatuses).toHaveLength(500);
    // All vehicles should depart in 500 steps (1000 vehicles, 2 roads per phase, 500 steps)
    expect(telemetry.totalVehiclesProcessed).toBe(1000);

    const phaseSum = Object.values(telemetry.phaseDistribution).reduce((a, b) => a + b, 0);
    expect(phaseSum).toBe(500);
    expect(telemetry.averageQueueLength).toBeGreaterThanOrEqual(0);
  });
});
