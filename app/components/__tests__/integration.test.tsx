// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimulationProvider } from '../SimulationProvider';
import { PixelSimulatorApp } from '../PixelSimulatorApp';

// Mock simulation-adapter
vi.mock('../../lib/simulation-adapter', () => ({
  runSimulation: vi.fn((commands: Array<{ type: string }>) => {
    const stepCount = commands.filter((c) => c.type === 'step').length;
    const stepStatuses = Array.from({ length: stepCount }, () => ({
      leftVehicles: [],
    }));
    return { ok: true, stepStatuses, telemetry: null };
  }),
  ROADS: ['north', 'south', 'east', 'west'],
  PHASES: [
    { id: 'NS_STRAIGHT', roads: ['north', 'south'] },
    { id: 'EW_STRAIGHT', roads: ['east', 'west'] },
  ],
}));

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

describe('Integration: PixelSimulatorApp', () => {
  it('renders without crashing', () => {
    render(
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    );
    expect(document.querySelector('canvas')).not.toBeNull();
  });

  it('Step button dispatches a step', () => {
    render(
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    );
    const stepBtn = screen.getByText('Step');
    fireEvent.click(stepBtn);
    // After clicking step, step log should update (step 0 entry appears)
    expect(screen.getByText(/Step 0/)).toBeTruthy();
  });

  it('canvas element is present in the DOM', () => {
    render(
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    );
    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBe(960);
  });

  it('Play/Pause button toggles', () => {
    render(
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    );
    const playBtn = screen.getByText(/Play/);
    expect(playBtn).toBeTruthy();
    fireEvent.click(playBtn);
    expect(screen.getByText(/Pause/)).toBeTruthy();
  });

  it('Add vehicle buttons are present', () => {
    render(
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    );
    expect(screen.getByText('N')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('W')).toBeTruthy();
    expect(screen.getByText('SOS')).toBeTruthy();
  });
});
