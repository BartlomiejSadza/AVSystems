import { describe, it, expect } from 'vitest';
import {
  derivePhasePerStep,
  deriveQueuesAtStep,
  deriveEmergencyQueuesAtStep,
  selectSimulationUiState,
} from '../lib/derive-phase';
import type { Command, StepStatus } from '../lib/simulation-adapter';

// ---------------------------------------------------------------------------
// derivePhasePerStep
// ---------------------------------------------------------------------------

describe('derivePhasePerStep', () => {
  it('returns null for a step with no departing vehicles', () => {
    const commands: Command[] = [{ type: 'step' }];
    const statuses: StepStatus[] = [{ leftVehicles: [] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual([null]);
  });

  it('returns NS_THROUGH for a north straight departure', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['N1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['NS_THROUGH']);
  });

  it('returns NS_LEFT for a north left turn (to west)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'L1', startRoad: 'north', endRoad: 'west' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['L1'] }];
    expect(derivePhasePerStep(commands, statuses)).toEqual(['NS_LEFT']);
  });

  it('returns NS_LEFT for u-turn from north', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'U1', startRoad: 'north', endRoad: 'north' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['U1'] }];
    expect(derivePhasePerStep(commands, statuses)).toEqual(['NS_LEFT']);
  });

  it('returns NS_THROUGH for a north right turn (to east)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'R1', startRoad: 'north', endRoad: 'east' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['R1'] }];
    expect(derivePhasePerStep(commands, statuses)).toEqual(['NS_THROUGH']);
  });

  it('returns EW_LEFT for an east left turn (to north)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'L2', startRoad: 'east', endRoad: 'north' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['L2'] }];
    expect(derivePhasePerStep(commands, statuses)).toEqual(['EW_LEFT']);
  });

  it('returns NS_THROUGH for a south departure', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'S1', startRoad: 'south', endRoad: 'north' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['S1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['NS_THROUGH']);
  });

  it('returns EW_THROUGH for an east departure', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['E1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['EW_THROUGH']);
  });

  it('returns EW_THROUGH for a west departure', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'W1', startRoad: 'west', endRoad: 'east' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['W1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['EW_THROUGH']);
  });

  it('handles multiple steps with different phases', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['N1'] }, { leftVehicles: ['E1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['NS_THROUGH', 'EW_THROUGH']);
  });

  it('returns null for steps where departing vehicle has no known startRoad', () => {
    const commands: Command[] = [{ type: 'step' }];
    // The vehicle 'GHOST' was never added
    const statuses: StepStatus[] = [{ leftVehicles: ['GHOST'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual([null]);
  });

  it('handles empty commands and empty statuses', () => {
    const result = derivePhasePerStep([], []);
    expect(result).toEqual([]);
  });

  it('uses only the first vehicle to determine phase', () => {
    // First departed vehicle is from north (NS phase)
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'S1', startRoad: 'south', endRoad: 'north' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['N1', 'S1'] }];
    const result = derivePhasePerStep(commands, statuses);
    expect(result).toEqual(['NS_THROUGH']);
  });

  it('does not mutate input arrays', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: [] }];
    const origCmds = [...commands];
    const origStatuses = [...statuses];
    derivePhasePerStep(commands, statuses);
    expect(commands).toEqual(origCmds);
    expect(statuses).toEqual(origStatuses);
  });
});

// ---------------------------------------------------------------------------
// deriveQueuesAtStep
// ---------------------------------------------------------------------------

describe('deriveQueuesAtStep', () => {
  it('returns all vehicles queued after zero steps processed (targetStepIndex = -1)', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'V2', startRoad: 'east', endRoad: 'west' },
    ];
    const statuses: StepStatus[] = [];
    const queues = deriveQueuesAtStep(commands, statuses, -1);
    expect(queues.north).toContain('V1');
    expect(queues.east).toContain('V2');
    expect(queues.south).toHaveLength(0);
    expect(queues.west).toHaveLength(0);
  });

  it('removes vehicles that departed in step 0', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['N1'] }];
    const queues = deriveQueuesAtStep(commands, statuses, 0);
    expect(queues.north).not.toContain('N1');
  });

  it('keeps vehicles that have not yet departed', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'step' },
    ];
    // Only N1 departs in step 0; E1 departs in step 1
    const statuses: StepStatus[] = [{ leftVehicles: ['N1'] }, { leftVehicles: ['E1'] }];
    // At step 0: N1 departed, E1 still queued
    const queues0 = deriveQueuesAtStep(commands, statuses, 0);
    expect(queues0.north).not.toContain('N1');
    expect(queues0.east).toContain('E1');

    // At step 1: both departed
    const queues1 = deriveQueuesAtStep(commands, statuses, 1);
    expect(queues1.north).not.toContain('N1');
    expect(queues1.east).not.toContain('E1');
  });

  it('returns empty queues for all roads when no vehicles added', () => {
    const commands: Command[] = [{ type: 'step' }];
    const statuses: StepStatus[] = [{ leftVehicles: [] }];
    const queues = deriveQueuesAtStep(commands, statuses, 0);
    expect(queues.north).toHaveLength(0);
    expect(queues.south).toHaveLength(0);
    expect(queues.east).toHaveLength(0);
    expect(queues.west).toHaveLength(0);
  });

  it('respects targetStepIndex boundary — does not include future departures', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: [] }, { leftVehicles: ['V1'] }];
    // At step 0, V1 has not departed yet
    const queues0 = deriveQueuesAtStep(commands, statuses, 0);
    expect(queues0.north).toContain('V1');

    // At step 1, V1 has departed
    const queues1 = deriveQueuesAtStep(commands, statuses, 1);
    expect(queues1.north).not.toContain('V1');
  });

  it('handles multiple vehicles on the same road', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'B', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['A'] }];
    const queues = deriveQueuesAtStep(commands, statuses, 0);
    expect(queues.north).not.toContain('A');
    expect(queues.north).toContain('B');
  });

  it('handles empty command list', () => {
    const queues = deriveQueuesAtStep([], [], 0);
    expect(queues.north).toHaveLength(0);
    expect(queues.south).toHaveLength(0);
    expect(queues.east).toHaveLength(0);
    expect(queues.west).toHaveLength(0);
  });
});

describe('deriveEmergencyQueuesAtStep', () => {
  it('returns empty queues when there are no emergency vehicles', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: [] }];
    expect(deriveEmergencyQueuesAtStep(commands, statuses, 0)).toEqual({
      north: [],
      south: [],
      east: [],
      west: [],
    });
  });

  it('keeps emergency vehicles in simulator queue order', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      {
        type: 'addVehicle',
        vehicleId: 'E1',
        startRoad: 'north',
        endRoad: 'south',
        priority: 'emergency',
      },
      {
        type: 'addVehicle',
        vehicleId: 'E2',
        startRoad: 'north',
        endRoad: 'south',
        priority: 'emergency',
      },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: [] }];
    expect(deriveEmergencyQueuesAtStep(commands, statuses, 0).north).toEqual(['E1', 'E2']);
  });

  it('removes emergency vehicles that already departed', () => {
    const commands: Command[] = [
      {
        type: 'addVehicle',
        vehicleId: 'E1',
        startRoad: 'north',
        endRoad: 'south',
        priority: 'emergency',
      },
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'step' },
    ];
    const statuses: StepStatus[] = [{ leftVehicles: ['E1'] }];
    expect(deriveEmergencyQueuesAtStep(commands, statuses, 0)).toEqual({
      north: [],
      south: [],
      east: [],
      west: [],
    });
  });
});

// ---------------------------------------------------------------------------
// selectSimulationUiState
// ---------------------------------------------------------------------------

describe('selectSimulationUiState', () => {
  it('returns empty view state before any step is selected', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
    ];
    const stepStatuses: StepStatus[] = [];

    const uiState = selectSimulationUiState({
      commands,
      stepStatuses,
      currentStepIndex: -1,
      isPlaying: false,
    });

    expect(uiState.activePhase).toBeNull();
    expect(uiState.totalQueued).toBe(1);
    expect(uiState.totalEmergencyQueued).toBe(0);
    expect(uiState.totalDeparted).toBe(0);
    expect(uiState.queues).toEqual({ north: ['V1'], south: [], east: [], west: [] });
    expect(uiState.emergencyQueues).toEqual({ north: [], south: [], east: [], west: [] });
  });

  it('derives active phase, queues, and counters from the selected step', () => {
    const commands: Command[] = [
      { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
      { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
      { type: 'step' },
      { type: 'step' },
    ];
    const stepStatuses: StepStatus[] = [{ leftVehicles: ['N1'] }, { leftVehicles: [] }];

    const uiState = selectSimulationUiState({
      commands,
      stepStatuses,
      currentStepIndex: 0,
      isPlaying: true,
    });

    expect(uiState.activePhase).toBe('NS_THROUGH');
    expect(uiState.queues).toEqual({ north: [], south: [], east: ['E1'], west: [] });
    expect(uiState.totalQueued).toBe(1);
    expect(uiState.totalEmergencyQueued).toBe(0);
    expect(uiState.totalDeparted).toBe(1);
    expect(uiState.stepCount).toBe(2);
    expect(uiState.isPlaying).toBe(true);
  });
});
