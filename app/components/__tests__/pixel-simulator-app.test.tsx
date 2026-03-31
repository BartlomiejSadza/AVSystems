// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelSimulatorApp } from '../PixelSimulatorApp';
import { SimulationProvider } from '../SimulationProvider';
import { resetNpcMessageCounter } from '../../lib/npc-messages';

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
  beforeEach(() => {
    resetNpcMessageCounter();
  });

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

  it('renders welcome NPC dialog message on startup', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(
      screen.getByText("Welcome! I'm Officer Pixel. I'll help you learn about traffic lights!")
    ).toBeTruthy();
  });

  it('shows emergency queue panel and keeps it visible when empty', () => {
    renderInProvider(<PixelSimulatorApp />);
    expect(screen.getByLabelText('Emergency queues')).toBeTruthy();
    expect(screen.getByText('No emergency vehicles waiting.')).toBeTruthy();
  });

  it('updates emergency queue order after adding SOS vehicles', () => {
    renderInProvider(<PixelSimulatorApp />);
    const sosButton = screen.getByText('SOS');
    fireEvent.click(sosButton);
    fireEvent.click(sosButton);
    expect(screen.queryByText('No emergency vehicles waiting.')).toBeNull();
    expect(screen.getByText(/V\d{3}, V\d{3}/)).toBeTruthy();
  });

  it('shows emergency NPC comment after adding SOS vehicle', () => {
    renderInProvider(<PixelSimulatorApp />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    expect(
      screen.getByText(
        /Emergency vehicle incoming!|Lights and sirens ahead!|An ambulance or fire truck is approaching\./
      )
    ).toBeTruthy();
  });

  it('uses responsive layout classes for app shell and bottom panels', () => {
    const { container } = renderInProvider(<PixelSimulatorApp />);
    const appShell = container.firstElementChild as HTMLElement | null;
    const bottomGrid = container.querySelector('.grid');
    expect(appShell?.className).toContain('w-full');
    expect(appShell?.className).toContain('min-w-0');
    expect(bottomGrid?.className).toContain('md:grid-cols-[minmax(0,1fr)_220px]');
  });
});
