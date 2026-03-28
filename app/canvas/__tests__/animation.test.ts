import { describe, it, expect } from 'vitest';
import {
  createInitialAnimationState,
  updateAnimationState,
  easeOutQuad,
  lerpPosition,
  TRANSITION_DURATION,
} from '../animation';
import type { AnimationState, Particle } from '../types';

function freshState(): AnimationState {
  return createInitialAnimationState();
}

describe('createInitialAnimationState', () => {
  it('returns interpFactor of 1 (at rest)', () => {
    expect(freshState().interpFactor).toBe(1);
  });

  it('returns empty vehiclePositions map', () => {
    expect(freshState().vehiclePositions.size).toBe(0);
  });

  it('returns npcFrame 0', () => {
    expect(freshState().npcFrame).toBe(0);
  });

  it('returns npcFrameTimer 0', () => {
    expect(freshState().npcFrameTimer).toBe(0);
  });

  it('returns lightGlowPhase 0', () => {
    expect(freshState().lightGlowPhase).toBe(0);
  });

  it('returns empty particles array', () => {
    expect(freshState().particles).toHaveLength(0);
  });
});

describe('updateAnimationState', () => {
  it('advances interpFactor toward 1.0 when below 1', () => {
    const state: AnimationState = { ...freshState(), interpFactor: 0 };
    const updated = updateAnimationState(state, 100);
    expect(updated.interpFactor).toBeGreaterThan(0);
    expect(updated.interpFactor).toBeLessThanOrEqual(1);
  });

  it('clamps interpFactor at 1.0', () => {
    const state: AnimationState = { ...freshState(), interpFactor: 0 };
    // Advance by more than TRANSITION_DURATION to saturate
    const updated = updateAnimationState(state, TRANSITION_DURATION * 2);
    expect(updated.interpFactor).toBe(1);
  });

  it('interpFactor does not exceed 1.0', () => {
    const state: AnimationState = { ...freshState(), interpFactor: 0.99 };
    const updated = updateAnimationState(state, 1000);
    expect(updated.interpFactor).toBe(1);
  });

  it('interpFactor stays at 1.0 when already at 1', () => {
    const state = freshState(); // interpFactor = 1
    const updated = updateAnimationState(state, 100);
    expect(updated.interpFactor).toBe(1);
  });

  it('zero deltaTime does not change interpFactor', () => {
    const state: AnimationState = { ...freshState(), interpFactor: 0.5 };
    const updated = updateAnimationState(state, 0);
    expect(updated.interpFactor).toBe(0.5);
  });

  it('advances npcFrameTimer', () => {
    const state = freshState();
    const updated = updateAnimationState(state, 50);
    expect(updated.npcFrameTimer).toBeGreaterThan(0);
  });

  it('cycles NPC frame after NPC_FRAME_DURATION (300ms)', () => {
    const state: AnimationState = { ...freshState(), npcFrame: 0, npcFrameTimer: 0 };
    const updated = updateAnimationState(state, 300);
    expect(updated.npcFrame).toBe(1);
  });

  it('NPC frame cycling wraps around at 4 frames', () => {
    let state: AnimationState = { ...freshState(), npcFrame: 3, npcFrameTimer: 0 };
    state = updateAnimationState(state, 300);
    expect(state.npcFrame).toBe(0);
  });

  it('NPC frame does not advance before 300ms', () => {
    const state: AnimationState = { ...freshState(), npcFrame: 0, npcFrameTimer: 0 };
    const updated = updateAnimationState(state, 299);
    expect(updated.npcFrame).toBe(0);
  });

  it('advances lightGlowPhase', () => {
    const state = freshState();
    // Use 500ms so phase = (500/1000)*2*PI = PI, which does not wrap back to 0
    const updated = updateAnimationState(state, 500);
    expect(updated.lightGlowPhase).toBeGreaterThan(0);
  });

  it('lightGlowPhase wraps within [0, 2*PI)', () => {
    const state: AnimationState = { ...freshState(), lightGlowPhase: 0 };
    // Large deltaTime should still keep phase in [0, 2*PI)
    const updated = updateAnimationState(state, 100_000);
    expect(updated.lightGlowPhase).toBeGreaterThanOrEqual(0);
    expect(updated.lightGlowPhase).toBeLessThan(Math.PI * 2);
  });

  it('particles with life <= 0 are removed', () => {
    const deadParticle: Particle = { x: 0, y: 0, vx: 0, vy: 0, life: 0.001, color: 1 };
    const liveParticle: Particle = { x: 0, y: 0, vx: 0, vy: 0, life: 5, color: 1 };
    const state: AnimationState = {
      ...freshState(),
      particles: [deadParticle, liveParticle],
    };
    // After 1000ms, dead particle's life becomes ~0.001 - 1 = -0.999 (removed)
    // live particle's life becomes ~5 - 1 = 4 (kept)
    const updated = updateAnimationState(state, 1000);
    expect(updated.particles).toHaveLength(1);
    expect(updated.particles[0]!.life).toBeCloseTo(4, 1);
  });

  it('particle positions update based on velocity', () => {
    const particle: Particle = { x: 0, y: 0, vx: 100, vy: 200, life: 10, color: 1 };
    const state: AnimationState = { ...freshState(), particles: [particle] };
    const updated = updateAnimationState(state, 1000); // 1 second
    expect(updated.particles[0]!.x).toBeCloseTo(100);
    expect(updated.particles[0]!.y).toBeCloseTo(200);
  });

  it('returns the mutated state object (same reference)', () => {
    const state = freshState();
    const result = updateAnimationState(state, 100);
    expect(result).toBe(state);
  });
});

describe('easeOutQuad', () => {
  it('easeOutQuad(0) = 0', () => {
    expect(easeOutQuad(0)).toBe(0);
  });

  it('easeOutQuad(1) = 1', () => {
    expect(easeOutQuad(1)).toBe(1);
  });

  it('easeOutQuad(0.5) = 0.75', () => {
    expect(easeOutQuad(0.5)).toBe(0.75);
  });

  it('easeOutQuad is monotonically increasing on [0, 1]', () => {
    const values = [0, 0.1, 0.2, 0.5, 0.8, 0.9, 1];
    for (let i = 1; i < values.length; i++) {
      expect(easeOutQuad(values[i]!)).toBeGreaterThan(easeOutQuad(values[i - 1]!));
    }
  });
});

describe('lerpPosition', () => {
  it('interpolates correctly at t=0 (returns from)', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 100, y: 200 };
    const result = lerpPosition(from, to, 0);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('interpolates correctly at t=1 (returns to)', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 100, y: 200 };
    const result = lerpPosition(from, to, 1);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it('interpolates at t=0.5 using easeOutQuad (eased=0.75)', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 100, y: 100 };
    const result = lerpPosition(from, to, 0.5);
    // easeOutQuad(0.5) = 0.75, so x = 75, y = 75
    expect(result.x).toBeCloseTo(75);
    expect(result.y).toBeCloseTo(75);
  });

  it('clamps t below 0 to t=0', () => {
    const from = { x: 10, y: 20 };
    const to = { x: 100, y: 200 };
    const result = lerpPosition(from, to, -1);
    // easeOutQuad(0) = 0, result = from
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
  });

  it('clamps t above 1 to t=1', () => {
    const from = { x: 10, y: 20 };
    const to = { x: 100, y: 200 };
    const result = lerpPosition(from, to, 2);
    // easeOutQuad(1) = 1, result = to
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it('works with non-zero from coordinates', () => {
    const from = { x: 50, y: 100 };
    const to = { x: 150, y: 300 };
    const result = lerpPosition(from, to, 1);
    expect(result.x).toBe(150);
    expect(result.y).toBe(300);
  });
});
