import type { Road } from '@/simulator/types';
import type { PhaseId } from '@/simulator/phase';

/** Frozen simulation state for a single frame — read by canvas layers. */
export interface SimulationSnapshot {
  phase: PhaseId | null;
  queues: Record<Road, string[]>;
  stepCount: number;
  totalDeparted: number;
  isPlaying: boolean;
}

/** Per-frame animation state managed outside React. */
export interface AnimationState {
  /** 0.0 to 1.0 interpolation factor between prev and curr snapshot */
  interpFactor: number;
  /** Vehicle positions lerped between queue positions */
  vehiclePositions: Map<string, { x: number; y: number }>;
  /** Current NPC animation frame index */
  npcFrame: number;
  npcFrameTimer: number;
  /** Traffic light glow pulse phase (0 to 2*PI) */
  lightGlowPhase: number;
  /** Active particle effects */
  particles: Particle[];
  /** Flash overlay opacity for phase transitions (0 = no flash, 1 = full flash) */
  phaseFlashAlpha: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // remaining lifetime in seconds, decreasing
  color: number; // palette index
}

/** Context passed to each canvas layer draw function. */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number; // timestamp from requestAnimationFrame
  deltaTime: number; // ms since last frame
  simulationSnapshot: SimulationSnapshot;
  animationState: AnimationState;
}

/** A layer draw function — pure function called each frame. */
export type LayerDrawFn = (rc: RenderContext) => void;
