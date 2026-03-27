'use client';

import { createContext, useContext, type ReactNode, type Dispatch } from 'react';
import { useSimulation, type SimulationState, type SimulationAction } from '../hooks/useSimulation';
import { useAutoPlay } from '../hooks/useAutoPlay';

interface SimulationContextValue {
  state: SimulationState;
  dispatch: Dispatch<SimulationAction>;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulationContext(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulationContext must be used within SimulationProvider');
  return ctx;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useSimulation();
  useAutoPlay(state.isPlaying, state.speed, dispatch);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>{children}</SimulationContext.Provider>
  );
}
