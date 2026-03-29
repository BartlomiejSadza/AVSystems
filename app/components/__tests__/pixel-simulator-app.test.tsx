// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelSimulatorApp } from '../PixelSimulatorApp';
import { SimulationProvider } from '../SimulationProvider';

// Mock simulation-adapter
vi.mock('../../lib/simulation-adapter', () => ({
  runSimulation: vi.fn(() => ({ ok: true, stepStatuses: [], telemetry: null })),
  ROADS: ['north', 'south', 'east', 'west'],
  PHASES: [
    { id: 'NS_STRAIGHT', roads: ['north', 'south'] },
    { id: 'EW_STRAIGHT', roads: ['east', 'west'] },
  ],
}));

// Mock game-loop
vi.mock('../../canvas/game-loop', () => ({
  createGameLoop: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
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
  updateAnimationState: vi.fn((s: unknown) => s),
}));

function renderInProvider(ui: React.ReactElement) {
  return render(<SimulationProvider>{ui}</SimulationProvider>);
}

describe('PixelSimulatorApp', () => {
  it('renders HUD bar with initial stats', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(screen.getByText('Steps')).toBeTruthy();
    expect(screen.getByText('Queued')).toBeTruthy();
    expect(screen.getByText('Departed')).toBeTruthy();
    expect(screen.getByText('Phase')).toBeTruthy();
  });

  it('renders canvas element', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(document.querySelector('canvas')).not.toBeNull();
  });

  it('renders control bar with Step button', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(screen.getByText('Step')).toBeTruthy();
  });

  it('renders step log section', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(screen.getByText('No steps yet. Click Step to begin!')).toBeTruthy();
  });
});
