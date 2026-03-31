import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawTrafficLights } from '../traffic-lights';
import type { RenderContext } from '../../types';
import type { Road } from '../../../../src/simulator/types';
import { drawSprite } from '../../sprites/draw-sprite';

vi.mock('../../sprites/draw-sprite', () => ({
  drawSprite: vi.fn(),
}));

function createRenderContext(phase: RenderContext['simulationSnapshot']['phase']): RenderContext {
  const ctx = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  return {
    ctx,
    time: 0,
    deltaTime: 16,
    simulationSnapshot: {
      phase,
      queues: {
        north: [] as string[],
        south: [] as string[],
        east: [] as string[],
        west: [] as string[],
      } as Record<Road, string[]>,
      stepCount: 0,
      totalDeparted: 0,
      isPlaying: false,
    },
    animationState: {
      interpFactor: 1,
      vehiclePositions: new Map(),
      npcFrame: 0,
      npcFrameTimer: 0,
      lightGlowPhase: 0,
      particles: [],
      phaseFlashAlpha: 0,
    },
  };
}

function spriteNamesFromCalls(): string[] {
  const mockedDrawSprite = vi.mocked(drawSprite);
  return mockedDrawSprite.mock.calls.map((call) => call[1].name);
}

describe('drawTrafficLights signal-state rendering', () => {
  beforeEach(() => {
    vi.mocked(drawSprite).mockClear();
  });

  it('renders amber lights for yellow transition and keeps opposite axis red', () => {
    drawTrafficLights(createRenderContext('NS_THROUGH_YELLOW'));

    const names = spriteNamesFromCalls();
    expect(names.filter((name) => name === 'AMBER_LAMP_ACTIVE')).toHaveLength(2);
    expect(names.filter((name) => name === 'RED_LAMP_ACTIVE')).toHaveLength(2);
    expect(names.some((name) => name.startsWith('GREEN_LAMP_'))).toBe(false);
  });

  it('renders all approaches as red during ALL_RED', () => {
    drawTrafficLights(createRenderContext('ALL_RED'));

    const names = spriteNamesFromCalls();
    expect(names.filter((name) => name === 'RED_LAMP_ACTIVE')).toHaveLength(4);
    expect(names.filter((name) => name === 'AMBER_LAMP_ACTIVE')).toHaveLength(0);
    expect(names.some((name) => name.startsWith('GREEN_LAMP_'))).toBe(false);
  });
});
