'use client';

import { useEffect, useState, useCallback, useRef, type MutableRefObject } from 'react';
import { cssToGame } from '../canvas/viewport';
import { findHitZone, type HitZone } from '../canvas/hit-detection';

export interface TooltipState {
  content: string;
  cssX: number;
  cssY: number;
}

const THROTTLE_MS = 60;

export function useHitDetection(
  canvas: HTMLCanvasElement | null,
  zonesRef: MutableRefObject<readonly HitZone[]>
): { tooltip: TooltipState | null } {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const lastCallRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastCallRef.current < THROTTLE_MS) return;
      lastCallRef.current = now;

      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { gx, gy } = cssToGame(e.clientX, e.clientY, rect);
      const zone = findHitZone(zonesRef.current, gx, gy);

      if (zone) {
        setTooltip({ content: zone.getTooltip(), cssX: e.clientX, cssY: e.clientY });
      } else {
        setTooltip(null);
      }
    },
    [canvas, zonesRef]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  useEffect(() => {
    if (!canvas) return;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvas, handleMouseMove, handleMouseLeave]);

  return { tooltip };
}
