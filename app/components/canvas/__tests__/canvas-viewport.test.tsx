// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CanvasViewport } from '../CanvasViewport';
import { SimulationProvider } from '../../SimulationProvider';

// Mock simulation-adapter
vi.mock('../../../lib/simulation-adapter', () => ({
  runSimulation: vi.fn(() => ({ ok: true, stepStatuses: [], telemetry: null })),
  ROADS: ['north', 'south', 'east', 'west'],
  PHASES: [
    { id: 'NS_STRAIGHT', roads: ['north', 'south'] },
    { id: 'EW_STRAIGHT', roads: ['east', 'west'] },
  ],
}));

// Mock game-loop (canvas.getContext returns null in jsdom)
vi.mock('../../../canvas/game-loop', () => ({
  createGameLoop: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
}));

vi.mock('../../../canvas/animation', () => ({
  createInitialAnimationState: vi.fn(() => ({
    interpFactor: 1,
    vehiclePositions: new Map(),
    npcFrame: 0,
    npcFrameTimer: 0,
    lightGlowPhase: 0,
    particles: [],
    phaseFlashAlpha: 0,
  })),
  updateAnimationState: vi.fn((s: unknown) => s),
}));

function renderInProvider(ui: React.ReactElement) {
  return render(<SimulationProvider>{ui}</SimulationProvider>);
}

describe('CanvasViewport', () => {
  it('renders a canvas element', () => {
    renderInProvider(<CanvasViewport />);
    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('canvas has correct dimensions', () => {
    renderInProvider(<CanvasViewport />);
    const canvas = document.querySelector('canvas');
    expect(canvas?.width).toBe(960);
    expect(canvas?.height).toBe(720);
  });

  it('canvas has pixelated rendering style', () => {
    renderInProvider(<CanvasViewport />);
    const canvas = document.querySelector('canvas');
    expect(canvas?.style.imageRendering).toBe('pixelated');
  });
});
