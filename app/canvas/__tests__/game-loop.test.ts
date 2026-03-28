import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGameLoop } from '../game-loop';
import type { SimulationSnapshot, AnimationState } from '../types';

const mockSnapshot: SimulationSnapshot = {
  phase: null,
  queues: { north: [], south: [], east: [], west: [] },
  stepCount: 0,
  totalDeparted: 0,
  isPlaying: false,
};

const mockAnimState: AnimationState = {
  interpFactor: 1,
  vehiclePositions: new Map(),
  npcFrame: 0,
  npcFrameTimer: 0,
  lightGlowPhase: 0,
  phaseFlashAlpha: 0,
  particles: [],
};

function makeMockCanvas() {
  const mockCtx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    imageSmoothingEnabled: true,
  };
  const mockCanvas = {
    getContext: vi.fn(() => mockCtx),
    width: 960,
    height: 720,
  } as unknown as HTMLCanvasElement;
  return { mockCanvas, mockCtx };
}

describe('createGameLoop', () => {
  let rafMock: ReturnType<typeof vi.fn>;
  let cafMock: ReturnType<typeof vi.fn>;
  let originalRaf: typeof globalThis.requestAnimationFrame;
  let originalCaf: typeof globalThis.cancelAnimationFrame;
  let originalPerf: typeof globalThis.performance;

  beforeEach(() => {
    rafMock = vi.fn(() => 42); // returns a fake RAF id
    cafMock = vi.fn();

    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    originalPerf = globalThis.performance;

    globalThis.requestAnimationFrame = rafMock as unknown as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = cafMock;
    globalThis.performance = { now: vi.fn(() => 0) } as unknown as Performance;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
    globalThis.performance = originalPerf;
  });

  it('returns an object with start and stop methods', () => {
    const { mockCanvas } = makeMockCanvas();
    const loop = createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    expect(loop).toHaveProperty('start');
    expect(loop).toHaveProperty('stop');
    expect(typeof loop.start).toBe('function');
    expect(typeof loop.stop).toBe('function');
  });

  it('start() calls requestAnimationFrame', () => {
    const { mockCanvas } = makeMockCanvas();
    const loop = createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    loop.start();
    expect(rafMock).toHaveBeenCalledTimes(1);
  });

  it('stop() calls cancelAnimationFrame with the raf id', () => {
    const { mockCanvas } = makeMockCanvas();
    const loop = createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    loop.start();
    loop.stop();
    expect(cafMock).toHaveBeenCalledWith(42);
  });

  it('stop() does nothing if start was never called', () => {
    const { mockCanvas } = makeMockCanvas();
    const loop = createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    // Should not throw
    expect(() => loop.stop()).not.toThrow();
    expect(cafMock).not.toHaveBeenCalled();
  });

  it('getContext is called on canvas construction', () => {
    const { mockCanvas, mockCtx: _ } = makeMockCanvas();
    const getContextSpy = mockCanvas.getContext as ReturnType<typeof vi.fn>;
    createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    expect(getContextSpy).toHaveBeenCalledWith('2d');
  });

  it('stop() sets rafId to null (calling stop twice does not cancelAnimationFrame twice)', () => {
    const { mockCanvas } = makeMockCanvas();
    const loop = createGameLoop(
      mockCanvas,
      () => mockSnapshot,
      () => mockAnimState,
      []
    );
    loop.start();
    loop.stop();
    loop.stop(); // second call — rafId is null now
    expect(cafMock).toHaveBeenCalledTimes(1);
  });
});
