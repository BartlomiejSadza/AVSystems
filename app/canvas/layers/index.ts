import type { LayerDrawFn } from '../types';
import { drawBackground } from './background';
import { drawRoads } from './roads';
import { drawTrafficLights } from './traffic-lights';
import { drawVehicles } from './vehicles';
import { drawNpc } from './npc';
import { drawOverlayEffects } from './effects';

/** Ordered array of all canvas layers, back-to-front. */
export const layers: LayerDrawFn[] = [
  drawBackground, // Layer 0
  drawRoads, // Layer 1
  drawTrafficLights, // Layer 2
  drawVehicles, // Layer 3
  drawNpc, // Layer 4
  drawOverlayEffects, // Layer 5
];

export { drawBackground, drawRoads, drawTrafficLights, drawVehicles, drawNpc, drawOverlayEffects };
