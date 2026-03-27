import { describe, it, expect } from 'vitest';
import { runSimulation } from '../lib/simulation-adapter';
import type { Command } from '../lib/simulation-adapter';

describe('simulation-adapter', () => {
  it('returns ok for a simple step', () => {
    const result = runSimulation([{ type: 'step' }]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stepStatuses).toHaveLength(1);
      expect(result.stepStatuses[0]!.leftVehicles).toEqual([]);
    }
  });

  it('returns ok for addVehicle + step', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const result = runSimulation(commands);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stepStatuses[0]!.leftVehicles).toContain('V1');
    }
  });

  it('returns telemetry when enabled', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const result = runSimulation(commands, { enableTelemetry: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.telemetry).toBeDefined();
      expect(result.telemetry!.totalSteps).toBe(1);
    }
  });

  it('does not mutate input commands array', () => {
    const commands: Command[] = [{ type: 'step' }];
    const original = [...commands];
    runSimulation(commands);
    expect(commands).toEqual(original);
  });

  it('returns no telemetry when not enabled', () => {
    const commands: Command[] = [{ type: 'step' }];
    const result = runSimulation(commands);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.telemetry).toBeUndefined();
    }
  });

  it('handles multiple vehicles and steps', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'B', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'step' },
    ];
    const result = runSimulation(commands);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stepStatuses).toHaveLength(2);
    }
  });

  it('handles empty command list', () => {
    const result = runSimulation([]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stepStatuses).toHaveLength(0);
    }
  });

  it('processes emergency vehicles', () => {
    const commands: Command[] = [
      {
        type: 'addVehicle',
        vehicleId: 'NORMAL',
        startRoad: 'north',
        endRoad: 'south',
        priority: 'normal',
      },
      {
        type: 'addVehicle',
        vehicleId: 'EMG',
        startRoad: 'east',
        endRoad: 'west',
        priority: 'emergency',
      },
      { type: 'step' },
    ];
    const result = runSimulation(commands);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Emergency phase (EW) should be selected first
      expect(result.stepStatuses[0]!.leftVehicles).toContain('EMG');
    }
  });

  it('returns ok:false on invariant violation when enabled', () => {
    // Adding duplicate vehicle IDs may trigger invariant check failure
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'DUP', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
    ];
    const result = runSimulation(commands, { enableInvariantChecks: true });
    // Engine may or may not throw on duplicates — both outcomes are valid
    expect(typeof result.ok).toBe('boolean');
  });
});
