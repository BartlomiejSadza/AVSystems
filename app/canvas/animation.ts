import type { AnimationState } from './types';

export const TRANSITION_DURATION = 300; // ms
export const PHASE_FLASH_FADE_MS = 300;

/** Create initial animation state (at rest, no active animations). */
export function createInitialAnimationState(): AnimationState {
  return {
    interpFactor: 1, // at rest (fully arrived)
    vehiclePositions: new Map(),
    npcFrame: 0,
    npcFrameTimer: 0,
    lightGlowPhase: 0,
    particles: [],
    phaseFlashAlpha: 0,
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
  while (state.npcFrameTimer >= NPC_FRAME_DURATION) {
    state.npcFrameTimer -= NPC_FRAME_DURATION;
    state.npcFrame = (state.npcFrame + 1) % NPC_FRAME_COUNT;
  }

  // Advance light glow phase (continuous oscillation)
  state.lightGlowPhase = (state.lightGlowPhase + (deltaTime / 1000) * Math.PI * 2) % (Math.PI * 2);

  // Update particles in-place: advance position, decrease life, remove dead
  const particles = state.particles;
  let aliveIndex = 0;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!;
    p.life -= deltaTime / 1000;
    if (p.life > 0) {
      p.x += p.vx * (deltaTime / 1000);
      p.y += p.vy * (deltaTime / 1000);
      if (i !== aliveIndex) {
        particles[aliveIndex] = p;
      }
      aliveIndex++;
    }
  }
  particles.length = aliveIndex;

  // Fade out phase transition flash
  if (state.phaseFlashAlpha > 0) {
    state.phaseFlashAlpha = Math.max(0, state.phaseFlashAlpha - deltaTime / PHASE_FLASH_FADE_MS);
  }

  return state;
}
