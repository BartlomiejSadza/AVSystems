/**
 * Tests for the telemetry and diagnostics module (T14).
 */

import { describe, it, expect } from 'vitest';
import { simulate, simulateWithTelemetry, createInitialState } from '../engine.js';
import { createAccumulator, finalizeTelemetry, recordStep } from '../telemetry.js';
import type { Command } from '../types.js';
import { FAST_SIGNAL_TIMINGS } from './fast-signal-timings.js';

const fast = { signalTimings: FAST_SIGNAL_TIMINGS };

const OPP: Record<'north' | 'south' | 'east' | 'west', 'north' | 'south' | 'east' | 'west'> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

function addVehicle(
  vehicleId: string,
  startRoad: 'north' | 'south' | 'east' | 'west',
  endRoad?: 'north' | 'south' | 'east' | 'west'
): Command {
  return { type: 'addVehicle', vehicleId, startRoad, endRoad: endRoad ?? OPP[startRoad] };
}

const step: Command = { type: 'step' };

describe('createAccumulator', () => {
  it('initialises all counters to zero', () => {
    const acc = createAccumulator();
    expect(acc.totalSteps).toBe(0);
    expect(acc.totalVehiclesProcessed).toBe(0);
    expect(acc.queueLengthSum).toBe(0);
    expect(acc.queueLengthSampleCount).toBe(0);
  });

  it('initialises phaseDistribution with zero counts for all phase keys', () => {
    const acc = createAccumulator();
    expect(acc.phaseDistribution.NS_THROUGH).toBe(0);
    expect(acc.phaseDistribution.NS_LEFT).toBe(0);
    expect(acc.phaseDistribution.EW_THROUGH).toBe(0);
    expect(acc.phaseDistribution.EW_LEFT).toBe(0);
    expect(acc.phaseDistribution.ALL_RED).toBe(0);
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
    const acc = createAccumulator();
    acc.queueLengthSum = 8;
    acc.queueLengthSampleCount = 8;
    const tel = finalizeTelemetry(acc);
    expect(tel.averageQueueLength).toBe(1);
  });

  it('does not mutate the accumulator when finalizing', () => {
    const acc = createAccumulator();
    acc.totalSteps = 5;
    acc.phaseDistribution.NS_THROUGH = 3;
    finalizeTelemetry(acc);
    expect(acc.totalSteps).toBe(5);
    expect(acc.phaseDistribution.NS_THROUGH).toBe(3);
  });

  it('returns a copy of phaseDistribution, not a shared reference', () => {
    const acc = createAccumulator();
    acc.phaseDistribution.NS_THROUGH = 2;
    const tel = finalizeTelemetry(acc);
    tel.phaseDistribution.NS_THROUGH = 99;
    expect(acc.phaseDistribution.NS_THROUGH).toBe(2);
  });
});

describe('recordStep', () => {
  it('increments totalSteps by 1', () => {
    const acc = createAccumulator();
    const state = createInitialState(FAST_SIGNAL_TIMINGS);
    recordStep(acc, state, 'NS_THROUGH', { leftVehicles: [] });
    expect(acc.totalSteps).toBe(1);
  });

  it('accumulates vehicles processed', () => {
    const acc = createAccumulator();
    const state = createInitialState(FAST_SIGNAL_TIMINGS);
    recordStep(acc, state, 'NS_THROUGH', { leftVehicles: ['V1', 'V2'] });
    recordStep(acc, state, 'EW_THROUGH', { leftVehicles: ['V3'] });
    expect(acc.totalVehiclesProcessed).toBe(3);
  });

  it('records queue snapshots — 4 roads sampled per step', () => {
    const acc = createAccumulator();
    const state = createInitialState(FAST_SIGNAL_TIMINGS);
    recordStep(acc, state, 'NS_THROUGH', { leftVehicles: [] });
    expect(acc.queueLengthSampleCount).toBe(4);
  });

  it('increments the correct phase counter', () => {
    const acc = createAccumulator();
    const state = createInitialState(FAST_SIGNAL_TIMINGS);
    recordStep(acc, state, 'NS_THROUGH', { leftVehicles: [] });
    recordStep(acc, state, 'NS_THROUGH', { leftVehicles: [] });
    recordStep(acc, state, 'EW_THROUGH', { leftVehicles: [] });
    expect(acc.phaseDistribution.NS_THROUGH).toBe(2);
    expect(acc.phaseDistribution.EW_THROUGH).toBe(1);
  });
});

describe('simulateWithTelemetry — basic', () => {
  it('returns stepStatuses identical to simulate()', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step,
      addVehicle('E1', 'east'),
      step,
    ];

    const regular = simulate(commands, fast);
    const { stepStatuses } = simulateWithTelemetry(commands, fast);

    expect(stepStatuses).toEqual(regular);
  });

  it('totalSteps equals number of step commands', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), step, step, step];
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.totalSteps).toBe(3);
  });

  it('totalVehiclesProcessed counts all departed vehicles', () => {
    const commands: Command[] = [
      addVehicle('N1', 'north'),
      addVehicle('S1', 'south'),
      step,
      addVehicle('E1', 'east'),
      step,
      step,
    ];
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.totalVehiclesProcessed).toBe(3);
  });

  it('totalVehiclesProcessed is 0 when no vehicles were added', () => {
    const commands: Command[] = [step, step, step];
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.totalVehiclesProcessed).toBe(0);
    expect(telemetry.totalSteps).toBe(3);
  });

  it('returns zero metrics when no commands are given', () => {
    const { telemetry } = simulateWithTelemetry([]);
    expect(telemetry.totalSteps).toBe(0);
    expect(telemetry.totalVehiclesProcessed).toBe(0);
    expect(telemetry.averageQueueLength).toBe(0);
    expect(telemetry.phaseDistribution.NS_THROUGH).toBe(0);
    expect(telemetry.phaseDistribution.ALL_RED).toBe(0);
  });
});

describe('simulateWithTelemetry — phaseDistribution', () => {
  it('records NS_THROUGH when NS through phase is active at step start', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('S1', 'south'), step];
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.phaseDistribution.NS_THROUGH).toBeGreaterThanOrEqual(1);
  });

  it('records EW_THROUGH when EW through phase is active at step start', () => {
    const commands: Command[] = [addVehicle('E1', 'east'), addVehicle('W1', 'west'), step, step];
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.phaseDistribution.EW_THROUGH).toBeGreaterThanOrEqual(1);
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
    const { telemetry } = simulateWithTelemetry(commands, fast);
    const phaseSum = Object.values(telemetry.phaseDistribution).reduce((a, b) => a + b, 0);
    expect(phaseSum).toBe(telemetry.totalSteps);
  });
});

describe('simulateWithTelemetry — averageQueueLength', () => {
  it('averageQueueLength is 0 when queues are always empty', () => {
    const { telemetry } = simulateWithTelemetry([step, step], fast);
    expect(telemetry.averageQueueLength).toBe(0);
  });

  it('averageQueueLength reflects vehicles still in queue at time of step', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('N2', 'north'), step];
    const { telemetry } = simulateWithTelemetry(commands, fast);
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
    const { telemetry } = simulateWithTelemetry(commands, fast);
    expect(telemetry.averageQueueLength).toBeGreaterThanOrEqual(0);
  });
});

describe('simulate — enableTelemetry option', () => {
  it('does not throw when enableTelemetry is true', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() => simulate(commands, { ...fast, enableTelemetry: true })).not.toThrow();
  });

  it('returns same StepStatus[] whether telemetry is enabled or not', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), step, addVehicle('E1', 'east'), step];
    const withTel = simulate(commands, { ...fast, enableTelemetry: true });
    const withoutTel = simulate(commands, { ...fast, enableTelemetry: false });
    expect(withTel).toEqual(withoutTel);
  });
});

describe('simulateWithTelemetry — combined options', () => {
  it('works with road priorities', () => {
    const commands: Command[] = [addVehicle('N1', 'north'), addVehicle('E1', 'east'), step];
    expect(() =>
      simulateWithTelemetry(commands, { ...fast, roadPriorities: { east: 2.0 } })
    ).not.toThrow();
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
    const { telemetry, stepStatuses } = simulateWithTelemetry(commands, fast);
    expect(telemetry.totalSteps).toBe(1);
    expect(stepStatuses[0]?.leftVehicles).toContain('EMG');
  });

  it('works with invariant checks enabled', () => {
    const commands: Command[] = [addVehicle('V1', 'north'), step];
    expect(() =>
      simulateWithTelemetry(commands, { ...fast, enableInvariantChecks: true })
    ).not.toThrow();
  });
});

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

    const { telemetry, stepStatuses } = simulateWithTelemetry(commands, fast);

    expect(telemetry.totalSteps).toBe(500);
    expect(stepStatuses).toHaveLength(500);
    expect(telemetry.totalVehiclesProcessed).toBe(1000);

    const phaseSum = Object.values(telemetry.phaseDistribution).reduce((a, b) => a + b, 0);
    expect(phaseSum).toBe(500);
    expect(telemetry.averageQueueLength).toBeGreaterThanOrEqual(0);
  });
});
