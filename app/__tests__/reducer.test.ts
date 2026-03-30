import { describe, it, expect } from 'vitest';
import { simulationReducer, initialState } from '../hooks/useSimulation';
import type { SimulationState, SimulationAction } from '../hooks/useSimulation';

// Helper to apply a sequence of actions
function applyActions(
  actions: SimulationAction[],
  start: SimulationState = initialState
): SimulationState {
  return actions.reduce((state, action) => simulationReducer(state, action), start);
}

describe('simulationReducer', () => {
  // --- ADD_VEHICLE ---
  describe('ADD_VEHICLE', () => {
    it('appends an addVehicle command', () => {
      const state = simulationReducer(initialState, {
        type: 'ADD_VEHICLE',
        payload: { vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
      });
      expect(state.commands).toHaveLength(1);
      expect(state.commands[0]).toMatchObject({
        type: 'addVehicle',
        vehicleId: 'V1',
        startRoad: 'north',
        endRoad: 'south',
      });
    });

    it('clears any existing error', () => {
      const errState: SimulationState = { ...initialState, error: 'previous error' };
      const state = simulationReducer(errState, {
        type: 'ADD_VEHICLE',
        payload: { vehicleId: 'V2', startRoad: 'east', endRoad: 'west' },
      });
      expect(state.error).toBeNull();
    });

    it('sets priority when provided', () => {
      const state = simulationReducer(initialState, {
        type: 'ADD_VEHICLE',
        payload: {
          vehicleId: 'EMG1',
          startRoad: 'north',
          endRoad: 'south',
          priority: 'emergency',
        },
      });
      expect(state.commands[0]).toMatchObject({ priority: 'emergency' });
    });

    it('does not mutate previous state', () => {
      const prev = initialState;
      simulationReducer(prev, {
        type: 'ADD_VEHICLE',
        payload: { vehicleId: 'V3', startRoad: 'north', endRoad: 'south' },
      });
      expect(prev.commands).toHaveLength(0);
    });
  });

  // --- STEP ---
  describe('STEP', () => {
    it('appends a step command', () => {
      const state = simulationReducer(initialState, { type: 'STEP' });
      expect(state.commands).toHaveLength(1);
      expect(state.commands[0]).toEqual({ type: 'step' });
    });

    it('clears any existing error', () => {
      const errState: SimulationState = { ...initialState, error: 'oops' };
      const state = simulationReducer(errState, { type: 'STEP' });
      expect(state.error).toBeNull();
    });

    it('accumulates multiple steps', () => {
      const state = applyActions([{ type: 'STEP' }, { type: 'STEP' }, { type: 'STEP' }]);
      expect(state.commands.filter((c) => c.type === 'step')).toHaveLength(3);
    });
  });

  // --- STEP_RESULT ---
  describe('STEP_RESULT', () => {
    it('sets stepStatuses and advances currentStepIndex', () => {
      const statuses = [{ leftVehicles: ['V1'] }, { leftVehicles: [] }];
      const state = simulationReducer(initialState, {
        type: 'STEP_RESULT',
        payload: { stepStatuses: statuses },
      });
      expect(state.stepStatuses).toEqual(statuses);
      expect(state.currentStepIndex).toBe(1);
    });

    it('updates telemetry when provided', () => {
      const telemetry = {
        totalSteps: 2,
        totalVehiclesProcessed: 1,
        averageQueueLength: 0.5,
        phaseDistribution: {
          NS_THROUGH: 1,
          NS_LEFT: 0,
          EW_THROUGH: 1,
          EW_LEFT: 0,
          ALL_RED: 0,
        },
      };
      const state = simulationReducer(initialState, {
        type: 'STEP_RESULT',
        payload: { stepStatuses: [], telemetry },
      });
      expect(state.telemetry).toEqual(telemetry);
    });

    it('keeps existing telemetry when not provided in payload', () => {
      const existing = {
        totalSteps: 1,
        totalVehiclesProcessed: 0,
        averageQueueLength: 0,
        phaseDistribution: {
          NS_THROUGH: 1,
          NS_LEFT: 0,
          EW_THROUGH: 0,
          EW_LEFT: 0,
          ALL_RED: 0,
        },
      };
      const stateWithTelemetry: SimulationState = { ...initialState, telemetry: existing };
      const state = simulationReducer(stateWithTelemetry, {
        type: 'STEP_RESULT',
        payload: { stepStatuses: [] },
      });
      expect(state.telemetry).toEqual(existing);
    });
  });

  // --- STEP_ERROR ---
  describe('STEP_ERROR', () => {
    it('sets error message', () => {
      const state = simulationReducer(initialState, {
        type: 'STEP_ERROR',
        payload: 'Invariant violated',
      });
      expect(state.error).toBe('Invariant violated');
    });

    it('stops auto-play on error', () => {
      const playingState: SimulationState = { ...initialState, isPlaying: true };
      const state = simulationReducer(playingState, {
        type: 'STEP_ERROR',
        payload: 'engine crash',
      });
      expect(state.isPlaying).toBe(false);
    });
  });

  // --- RESET ---
  describe('RESET', () => {
    it('returns initial state', () => {
      const dirtyState = applyActions([
        {
          type: 'ADD_VEHICLE',
          payload: { vehicleId: 'V1', startRoad: 'north', endRoad: 'south' },
        },
        { type: 'STEP' },
      ]);
      const state = simulationReducer(dirtyState, { type: 'RESET' });
      expect(state).toEqual(initialState);
    });
  });

  // --- SET_SPEED ---
  describe('SET_SPEED', () => {
    it('updates the speed', () => {
      const state = simulationReducer(initialState, { type: 'SET_SPEED', payload: 1000 });
      expect(state.speed).toBe(1000);
    });

    it('does not change other state', () => {
      const state = simulationReducer(initialState, { type: 'SET_SPEED', payload: 200 });
      expect(state.commands).toEqual(initialState.commands);
      expect(state.isPlaying).toBe(initialState.isPlaying);
    });
  });

  // --- SET_ROAD_PRIORITIES ---
  describe('SET_ROAD_PRIORITIES', () => {
    it('merges road priority into options', () => {
      const state = simulationReducer(initialState, {
        type: 'SET_ROAD_PRIORITIES',
        payload: { north: 3 },
      });
      expect(state.options.roadPriorities?.north).toBe(3);
    });

    it('preserves existing road priorities', () => {
      const baseState: SimulationState = {
        ...initialState,
        options: {
          ...initialState.options,
          roadPriorities: { north: 2, south: 1, east: 1, west: 1 },
        },
      };
      const state = simulationReducer(baseState, {
        type: 'SET_ROAD_PRIORITIES',
        payload: { east: 5 },
      });
      expect(state.options.roadPriorities?.north).toBe(2);
      expect(state.options.roadPriorities?.east).toBe(5);
    });
  });

  // --- SET_OPTIONS ---
  describe('SET_OPTIONS', () => {
    it('merges options', () => {
      const state = simulationReducer(initialState, {
        type: 'SET_OPTIONS',
        payload: { enableTelemetry: true },
      });
      expect(state.options.enableTelemetry).toBe(true);
    });

    it('preserves other options when merging', () => {
      const state = simulationReducer(initialState, {
        type: 'SET_OPTIONS',
        payload: { enableInvariantChecks: false },
      });
      expect(state.options.enableInvariantChecks).toBe(false);
      // Telemetry option should remain as initialised
      expect(state.options.enableTelemetry).toBe(initialState.options.enableTelemetry);
    });
  });

  // --- IMPORT_COMMANDS ---
  describe('IMPORT_COMMANDS', () => {
    it('replaces commands and resets simulation state', () => {
      const dirtyState = applyActions([
        {
          type: 'ADD_VEHICLE',
          payload: { vehicleId: 'V9', startRoad: 'north', endRoad: 'south' },
        },
        { type: 'STEP' },
      ]);
      const imported = [
        {
          type: 'addVehicle' as const,
          vehicleId: 'NEW',
          startRoad: 'east' as const,
          endRoad: 'west' as const,
        },
      ];
      const state = simulationReducer(dirtyState, {
        type: 'IMPORT_COMMANDS',
        payload: imported,
      });
      expect(state.commands).toEqual(imported);
      expect(state.stepStatuses).toHaveLength(0);
      expect(state.currentStepIndex).toBe(-1);
      expect(state.telemetry).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  // --- TOGGLE_AUTO_PLAY ---
  describe('TOGGLE_AUTO_PLAY', () => {
    it('toggles isPlaying from false to true', () => {
      const state = simulationReducer(initialState, { type: 'TOGGLE_AUTO_PLAY' });
      expect(state.isPlaying).toBe(true);
    });

    it('toggles isPlaying from true to false', () => {
      const playingState: SimulationState = { ...initialState, isPlaying: true };
      const state = simulationReducer(playingState, { type: 'TOGGLE_AUTO_PLAY' });
      expect(state.isPlaying).toBe(false);
    });
  });

  // --- CLEAR_ERROR ---
  describe('CLEAR_ERROR', () => {
    it('clears the error', () => {
      const errState: SimulationState = { ...initialState, error: 'something went wrong' };
      const state = simulationReducer(errState, { type: 'CLEAR_ERROR' });
      expect(state.error).toBeNull();
    });

    it('is a no-op when error is already null', () => {
      const state = simulationReducer(initialState, { type: 'CLEAR_ERROR' });
      expect(state.error).toBeNull();
    });
  });

  // --- Invariants (R-INV-1..6) ---
  describe('state invariants', () => {
    // R-INV-1: commands array is never undefined
    it('R-INV-1: commands is always an array', () => {
      expect(Array.isArray(initialState.commands)).toBe(true);
      const state = simulationReducer(initialState, { type: 'RESET' });
      expect(Array.isArray(state.commands)).toBe(true);
    });

    // R-INV-2: stepStatuses length <= number of step commands
    it('R-INV-2: stepStatuses length matches reported step commands after STEP_RESULT', () => {
      const withSteps = applyActions([{ type: 'STEP' }, { type: 'STEP' }]);
      const state = simulationReducer(withSteps, {
        type: 'STEP_RESULT',
        payload: { stepStatuses: [{ leftVehicles: [] }, { leftVehicles: [] }] },
      });
      const stepCommandCount = state.commands.filter((c) => c.type === 'step').length;
      expect(state.stepStatuses.length).toBeLessThanOrEqual(stepCommandCount);
    });

    // R-INV-3: currentStepIndex is -1 or within bounds of stepStatuses
    it('R-INV-3: currentStepIndex is -1 initially', () => {
      expect(initialState.currentStepIndex).toBe(-1);
    });

    it('R-INV-3: currentStepIndex matches stepStatuses length - 1 after STEP_RESULT', () => {
      const statuses = [{ leftVehicles: [] }, { leftVehicles: ['V1'] }];
      const state = simulationReducer(initialState, {
        type: 'STEP_RESULT',
        payload: { stepStatuses: statuses },
      });
      expect(state.currentStepIndex).toBe(statuses.length - 1);
    });

    // R-INV-4: speed is a positive number
    it('R-INV-4: speed is positive in initial state', () => {
      expect(initialState.speed).toBeGreaterThan(0);
    });

    it('R-INV-4: speed remains positive after SET_SPEED', () => {
      const state = simulationReducer(initialState, { type: 'SET_SPEED', payload: 100 });
      expect(state.speed).toBeGreaterThan(0);
    });

    // R-INV-5: error is null or a non-empty string
    it('R-INV-5: error is null in initial state', () => {
      expect(initialState.error).toBeNull();
    });

    it('R-INV-5: error is a string after STEP_ERROR', () => {
      const state = simulationReducer(initialState, {
        type: 'STEP_ERROR',
        payload: 'boom',
      });
      expect(typeof state.error).toBe('string');
      expect(state.error!.length).toBeGreaterThan(0);
    });

    // R-INV-6: isPlaying is always boolean
    it('R-INV-6: isPlaying is boolean in initial state', () => {
      expect(typeof initialState.isPlaying).toBe('boolean');
    });

    it('R-INV-6: isPlaying is boolean after TOGGLE_AUTO_PLAY', () => {
      const state = simulationReducer(initialState, { type: 'TOGGLE_AUTO_PLAY' });
      expect(typeof state.isPlaying).toBe('boolean');
    });
  });
});
