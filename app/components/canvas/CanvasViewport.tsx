'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CANVAS_CSS_WIDTH, CANVAS_CSS_HEIGHT } from '../../canvas/constants';
import { useSimulationContext } from '../SimulationProvider';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useHitDetection, type TooltipState } from '../../hooks/useHitDetection';
import { layers } from '../../canvas/layers';
import { selectSimulationUiState } from '../../lib/derive-phase';
import type { SimulationSnapshot } from '../../canvas/types';
import type { HitZone } from '../../canvas/hit-detection';

interface CanvasViewportProps {
  onTooltipChange?: (tooltip: TooltipState | null) => void;
}

export function CanvasViewport({ onTooltipChange }: CanvasViewportProps) {
  const { state } = useSimulationContext();
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasEl(node);
  }, []);

  const uiState = selectSimulationUiState(state);

  // Snapshot ref — updated by useEffect, read by game loop
  const snapshotRef = useRef<SimulationSnapshot>({
    phase: null,
    queues: { north: [], south: [], east: [], west: [] },
    stepCount: 0,
    totalDeparted: 0,
    isPlaying: false,
  });

  useEffect(() => {
    snapshotRef.current = {
      phase: uiState.activePhase,
      queues: uiState.queues,
      stepCount: uiState.stepCount,
      totalDeparted: uiState.totalDeparted,
      isPlaying: uiState.isPlaying,
    };
  }, [uiState]);

  // Game loop
  useGameLoop(canvasEl, snapshotRef, layers);

  // Hit detection
  const hitZonesRef = useRef<readonly HitZone[]>([]);
  const { tooltip } = useHitDetection(canvasEl, hitZonesRef);

  // Propagate tooltip to parent
  useEffect(() => {
    onTooltipChange?.(tooltip);
  }, [tooltip, onTooltipChange]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_CSS_WIDTH}
      height={CANVAS_CSS_HEIGHT}
      style={{
        width: '100%',
        maxWidth: `${CANVAS_CSS_WIDTH}px`,
        imageRendering: 'pixelated',
        aspectRatio: '320 / 240',
      }}
    />
  );
}
