// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameLoop } from '../useGameLoop';
import type { SimulationSnapshot, AnimationState, LayerDrawFn } from '../../canvas/types';

const mockStart = vi.fn();
const mockStop = vi.fn();
vi.mock('../../canvas/game-loop', () => ({
  createGameLoop: vi.fn(() => ({ start: mockStart, stop: mockStop })),
}));

vi.mock('../../canvas/animation', () => ({
  createInitialAnimationState: vi.fn(() => ({
    interpFactor: 1,
    vehiclePositions: new Map(),
    npcFrame: 0,
    npcFrameTimer: 0,
    lightGlowPhase: 0,
    particles: [],
    phaseFlashAlpha: 0,
  })),
  updateAnimationState: vi.fn((state: AnimationState) => state),
}));

function makeSnapshot(): SimulationSnapshot {
  return {
    phase: null,
    queues: { north: [], south: [], east: [], west: [] },
    stepCount: 0,
    totalDeparted: 0,
    isPlaying: false,
  };
}

const mockLayers: LayerDrawFn[] = [];

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls start on mount and stop on unmount', () => {
    const canvas = document.createElement('canvas');
    const snapshotRef = { current: makeSnapshot() };
    const { unmount } = renderHook(() => useGameLoop(canvas, snapshotRef, mockLayers));
    expect(mockStart).toHaveBeenCalledOnce();
    unmount();
    expect(mockStop).toHaveBeenCalledOnce();
  });

  it('returns animationStateRef', () => {
    const canvas = document.createElement('canvas');
    const snapshotRef = { current: makeSnapshot() };
    const { result } = renderHook(() => useGameLoop(canvas, snapshotRef, mockLayers));
    expect(result.current.animationStateRef.current).toBeDefined();
    expect(result.current.animationStateRef.current.interpFactor).toBe(1);
  });

  it('does not start when canvas is null', () => {
    const snapshotRef = { current: makeSnapshot() };
    renderHook(() => useGameLoop(null, snapshotRef, mockLayers));
    expect(mockStart).not.toHaveBeenCalled();
  });
});
