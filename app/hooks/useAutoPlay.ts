'use client';

import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { SimulationAction } from './useSimulation';

export function useAutoPlay(
  isPlaying: boolean,
  speed: number,
  dispatch: Dispatch<SimulationAction>
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'STEP' });
      }, speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, dispatch]);
}
