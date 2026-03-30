import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  layers,
  drawBackground,
  drawRoads,
  drawTrafficLights,
  drawVehicles,
  drawNpc,
  drawOverlayEffects,
} from '../index';
import type { RenderContext, SimulationSnapshot, AnimationState } from '../../types';

// background.ts and roads.ts call document.createElement('canvas') the first
// time they are invoked (module-level cache). We must stub document before any
// layer function runs; beforeAll fires before individual test bodies.
beforeAll(() => {
  const mockOffscreenCtx = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
  };

  const mockOffscreenCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockOffscreenCtx),
  };

  vi.stubGlobal('document', {
    createElement: vi.fn(() => mockOffscreenCanvas),
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeMockCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

function makeSnapshot(overrides?: Partial<SimulationSnapshot>): SimulationSnapshot {
  return {
    phase: 'NS_THROUGH',
    queues: { north: ['v1', 'v2'], south: [], east: ['v3'], west: [] },
    stepCount: 5,
    totalDeparted: 3,
    isPlaying: true,
    ...overrides,
  };
}

function makeAnimationState(overrides?: Partial<AnimationState>): AnimationState {
  return {
    interpFactor: 1,
    vehiclePositions: new Map(),
    npcFrame: 0,
    npcFrameTimer: 0,
    lightGlowPhase: 0,
    particles: [],
    phaseFlashAlpha: 0,
    ...overrides,
  };
}

function createMockRenderContext(
  snapshotOverrides?: Partial<SimulationSnapshot>,
  animationOverrides?: Partial<AnimationState>
): RenderContext {
  return {
    ctx: makeMockCtx(),
    time: 1000,
    deltaTime: 33,
    simulationSnapshot: makeSnapshot(snapshotOverrides),
    animationState: makeAnimationState(animationOverrides),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('layers array', () => {
  it('has exactly 6 elements', () => {
    expect(layers).toHaveLength(6);
  });

  it('all elements are functions', () => {
    for (const layer of layers) {
      expect(typeof layer).toBe('function');
    }
  });

  it('layers[0] is drawBackground', () => {
    expect(layers[0]).toBe(drawBackground);
  });

  it('layers[1] is drawRoads', () => {
    expect(layers[1]).toBe(drawRoads);
  });

  it('layers[2] is drawTrafficLights', () => {
    expect(layers[2]).toBe(drawTrafficLights);
  });

  it('layers[3] is drawVehicles', () => {
    expect(layers[3]).toBe(drawVehicles);
  });

  it('layers[4] is drawNpc', () => {
    expect(layers[4]).toBe(drawNpc);
  });

  it('layers[5] is drawOverlayEffects', () => {
    expect(layers[5]).toBe(drawOverlayEffects);
  });
});

describe('all layers callable', () => {
  it('each layer can be called with a mock RenderContext without throwing', () => {
    const rc = createMockRenderContext();
    for (const layer of layers) {
      expect(() => layer(rc)).not.toThrow();
    }
  });
});

describe('drawVehicles', () => {
  it('does not throw with populated queues', () => {
    const rc = createMockRenderContext({
      queues: {
        north: ['v1', 'v2', 'v3'],
        south: ['v4'],
        east: ['v5', 'v6'],
        west: ['v7'],
      },
    });
    expect(() => drawVehicles(rc)).not.toThrow();
  });
});

describe('drawOverlayEffects', () => {
  it('does not throw with active particles', () => {
    const rc = createMockRenderContext(undefined, {
      particles: [
        { x: 10, y: 20, vx: 1, vy: -1, life: 0.5, color: 9 },
        { x: 50, y: 80, vx: -1, vy: 0.5, life: 0.8, color: 12 },
      ],
    });
    expect(() => drawOverlayEffects(rc)).not.toThrow();
  });

  it('does not throw with phaseFlashAlpha > 0', () => {
    const rc = createMockRenderContext(undefined, { phaseFlashAlpha: 0.8 });
    expect(() => drawOverlayEffects(rc)).not.toThrow();
  });
});

describe('drawTrafficLights', () => {
  it('does not throw with phase: null', () => {
    const rc = createMockRenderContext({ phase: null });
    expect(() => drawTrafficLights(rc)).not.toThrow();
  });

  it('does not throw with phase: EW_THROUGH', () => {
    const rc = createMockRenderContext({ phase: 'EW_THROUGH' });
    expect(() => drawTrafficLights(rc)).not.toThrow();
  });
});
