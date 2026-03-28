import type { AnimationState, Particle } from './types';

export const TRANSITION_DURATION = 300; // ms

/** Create initial animation state (at rest, no active animations). */
export function createInitialAnimationState(): AnimationState {
  return {
    interpFactor: 1, // at rest (fully arrived)
    vehiclePositions: new Map(),
    npcFrame: 0,
    npcFrameTimer: 0,
    lightGlowPhase: 0,
    particles: [],
  };
}

/** EaseOutQuad easing: decelerating to zero velocity. */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/** Linearly interpolate between two positions with easeOutQuad easing. */
export function lerpPosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const eased = easeOutQuad(Math.max(0, Math.min(1, t)));
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
  };
}

const NPC_FRAME_COUNT = 4;
const NPC_FRAME_DURATION = 300; // ms per frame for idle animation

/** Update animation state for one frame. Mutates and returns the state. */
export function updateAnimationState(state: AnimationState, deltaTime: number): AnimationState {
  // Advance interpolation factor toward 1.0
  if (state.interpFactor < 1) {
    state.interpFactor = Math.min(1, state.interpFactor + deltaTime / TRANSITION_DURATION);
  }

  // Cycle NPC animation frames
  state.npcFrameTimer += deltaTime;
  if (state.npcFrameTimer >= NPC_FRAME_DURATION) {
    state.npcFrameTimer -= NPC_FRAME_DURATION;
    state.npcFrame = (state.npcFrame + 1) % NPC_FRAME_COUNT;
  }

  // Advance light glow phase (continuous oscillation)
  state.lightGlowPhase = (state.lightGlowPhase + (deltaTime / 1000) * Math.PI * 2) % (Math.PI * 2);

  // Update particles: decrease life, remove dead
  state.particles = state.particles
    .map((p: Particle) => ({
      ...p,
      x: p.x + p.vx * (deltaTime / 1000),
      y: p.y + p.vy * (deltaTime / 1000),
      life: p.life - deltaTime / 1000,
    }))
    .filter((p: Particle) => p.life > 0);

  return state;
}
