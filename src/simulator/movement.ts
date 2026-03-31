/**
 * Movement classification from approach (startRoad) and destination (endRoad).
 * Ring: N=0, E=1, S=2, W=3 (clockwise). See specs/REALISTIC-SIGNALIZATION.md §2.
 */

import type { Road } from './types.js';

const ROAD_INDEX: Record<Road, number> = {
  north: 0,
  east: 1,
  south: 2,
  west: 3,
};

export type Movement = 'straight' | 'left' | 'right' | 'u_turn';

/**
 * Classify relative movement using endRoad and the clockwise ring rule.
 */
export function classifyMovement(startRoad: Road, endRoad: Road): Movement {
  if (endRoad === startRoad) {
    return 'u_turn';
  }
  const iS = ROAD_INDEX[startRoad];
  const iE = ROAD_INDEX[endRoad];
  const d = (iE - iS + 4) % 4;
  if (d === 0) {
    return 'u_turn';
  }
  if (d === 1) {
    return 'right';
  }
  if (d === 2) {
    return 'straight';
  }
  return 'left';
}
