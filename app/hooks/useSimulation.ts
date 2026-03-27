'use client';

import { useReducer, useEffect } from 'react';
import {
  runSimulation,
  type Command,
  type StepStatus,
  type SimulateOptions,
  type TelemetryData,
  type Road,
} from '../lib/simulation-adapter';

export interface SimulationState {
  commands: Command[];
  stepStatuses: StepStatus[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  options: SimulateOptions;
  telemetry: TelemetryData | null;
  error: string | null;
}

export type SimulationAction =
  | {
      type: 'ADD_VEHICLE';
      payload: {
        vehicleId: string;
        startRoad: Road;
        endRoad: Road;
        priority?: 'normal' | 'emergency';
      };
    }
  | { type: 'STEP' }
  | { type: 'STEP_RESULT'; payload: { stepStatuses: StepStatus[]; telemetry?: TelemetryData } }
  | { type: 'STEP_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_ROAD_PRIORITIES'; payload: Partial<Record<Road, number>> }
  | { type: 'SET_OPTIONS'; payload: Partial<SimulateOptions> }
  | { type: 'IMPORT_COMMANDS'; payload: Command[] }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'CLEAR_ERROR' };

export const initialState: SimulationState = {
  commands: [],
  stepStatuses: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 500,
  options: {
    enableInvariantChecks: true,
    enableTelemetry: false,
    roadPriorities: { north: 1, south: 1, east: 1, west: 1 },
  },
  telemetry: null,
  error: null,
};

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case 'ADD_VEHICLE':
      return {
        ...state,
        commands: [...state.commands, { type: 'addVehicle' as const, ...action.payload }],
        error: null,
      };
    case 'STEP':
      return {
        ...state,
        commands: [...state.commands, { type: 'step' as const }],
        error: null,
      };
    case 'STEP_RESULT': {
      const stepStatuses = action.payload.stepStatuses;
      return {
        ...state,
        stepStatuses,
        currentStepIndex: stepStatuses.length - 1,
        telemetry: action.payload.telemetry ?? state.telemetry,
      };
    }
    case 'STEP_ERROR':
      return {
        ...state,
        error: action.payload,
        isPlaying: false,
      };
    case 'RESET':
      return { ...initialState };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'SET_ROAD_PRIORITIES':
      return {
        ...state,
        options: {
          ...state.options,
          roadPriorities: { ...state.options.roadPriorities, ...action.payload },
        },
      };
    case 'SET_OPTIONS':
      return {
        ...state,
        options: { ...state.options, ...action.payload },
      };
    case 'IMPORT_COMMANDS':
      return {
        ...state,
        commands: action.payload,
        stepStatuses: [],
        currentStepIndex: -1,
        telemetry: null,
        error: null,
      };
    case 'TOGGLE_AUTO_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  // Reactive simulation: re-run engine whenever commands or options change
  useEffect(() => {
    if (state.commands.length === 0) return;
    const result = runSimulation(state.commands, state.options);
    if (result.ok) {
      dispatch({
        type: 'STEP_RESULT',
        payload: { stepStatuses: result.stepStatuses, telemetry: result.telemetry },
      });
    } else {
      dispatch({ type: 'STEP_ERROR', payload: result.error });
    }
  }, [state.commands, state.options]);

  return { state, dispatch };
}
