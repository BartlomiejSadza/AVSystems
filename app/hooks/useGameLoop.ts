'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { createGameLoop } from '../canvas/game-loop';
import { createInitialAnimationState } from '../canvas/animation';
import type { SimulationSnapshot, AnimationState, LayerDrawFn } from '../canvas/types';

export function useGameLoop(
  canvas: HTMLCanvasElement | null,
  snapshotRef: MutableRefObject<SimulationSnapshot>,
  layers: LayerDrawFn[]
): { animationStateRef: MutableRefObject<AnimationState> } {
  const animationStateRef = useRef<AnimationState>(createInitialAnimationState());

  useEffect(() => {
    if (!canvas) return;

    const loop = createGameLoop(
      canvas,
      () => snapshotRef.current,
      () => animationStateRef.current,
      layers
    );

    loop.start();
    return () => loop.stop();
  }, [canvas, snapshotRef, layers]);

  return { animationStateRef };
}
