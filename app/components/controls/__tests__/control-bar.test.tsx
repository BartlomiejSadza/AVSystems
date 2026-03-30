// @vitest-environment jsdom
/**
 * Tests for ControlBar and AddVehiclePanel components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimulationProvider } from '../../SimulationProvider';
import { ControlBar } from '../ControlBar';
import { AddVehiclePanel } from '../AddVehiclePanel';

// ---------------------------------------------------------------------------
// Mock simulation-adapter so useSimulation does not invoke the real engine
// ---------------------------------------------------------------------------
vi.mock('../../../lib/simulation-adapter', () => ({
  runSimulation: vi.fn(() => ({ ok: true, stepStatuses: [], telemetry: null })),
  simulateWithTelemetry: vi.fn(() => ({ stepStatuses: [], telemetry: null })),
  ROADS: ['north', 'south', 'east', 'west'],
  PHASES: ['NS_STRAIGHT', 'EW_STRAIGHT'],
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderInProvider(ui: React.ReactElement) {
  return render(<SimulationProvider>{ui}</SimulationProvider>);
}

// ---------------------------------------------------------------------------
// ControlBar
// ---------------------------------------------------------------------------
describe('ControlBar', () => {
  it('renders the Step button', () => {
    renderInProvider(<ControlBar />);
    expect(screen.getByText('Step')).toBeTruthy();
  });

  it('renders the Play button (Play label when not playing)', () => {
    renderInProvider(<ControlBar />);
    // Initial state: isPlaying = false → label contains "Play"
    const playButton = screen.getByText(/Play/i);
    expect(playButton).toBeTruthy();
  });

  it('renders the Reset button', () => {
    renderInProvider(<ControlBar />);
    expect(screen.getByText('Reset')).toBeTruthy();
  });

  it('Step button is not disabled initially (isPlaying is false)', () => {
    renderInProvider(<ControlBar />);
    const stepBtn = screen.getByText('Step').closest('button') as HTMLButtonElement;
    expect(stepBtn.disabled).toBe(false);
  });

  it('renders the SpeedSlider', () => {
    renderInProvider(<ControlBar />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeTruthy();
  });

  it('renders the AddVehiclePanel N, S, E, W, SOS buttons', () => {
    renderInProvider(<ControlBar />);
    expect(screen.getByText('N')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('W')).toBeTruthy();
    expect(screen.getByText('SOS')).toBeTruthy();
  });

  it('uses responsive wrapping classes to avoid horizontal overflow on narrow widths', () => {
    const { container } = renderInProvider(<ControlBar />);
    const row = container.querySelector('.md\\:flex-nowrap');
    expect(row?.className).toContain('flex-wrap');
    expect(row?.className).toContain('md:flex-nowrap');
  });
});

// ---------------------------------------------------------------------------
// AddVehiclePanel (standalone)
// ---------------------------------------------------------------------------
describe('AddVehiclePanel', () => {
  it('renders N, S, E, W, and SOS buttons', () => {
    renderInProvider(<AddVehiclePanel />);
    expect(screen.getByText('N')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('W')).toBeTruthy();
    expect(screen.getByText('SOS')).toBeTruthy();
  });

  it('renders the "Add Vehicle" label', () => {
    renderInProvider(<AddVehiclePanel />);
    expect(screen.getByText(/add vehicle/i)).toBeTruthy();
  });

  it('uses responsive alignment and wrapping for touch-friendly small screens', () => {
    renderInProvider(<AddVehiclePanel />);
    const label = screen.getByText(/add vehicle/i);
    const panel = label.parentElement;
    const buttonsRow = label.nextElementSibling as HTMLElement | null;
    expect(panel?.className).toContain('items-start');
    expect(panel?.className).toContain('md:items-end');
    expect(buttonsRow?.className).toContain('flex-wrap');
    expect(buttonsRow?.className).toContain('md:flex-nowrap');
  });

  it('SOS button has danger variant styling', () => {
    renderInProvider(<AddVehiclePanel />);
    const sosBtn = screen.getByText('SOS').closest('button') as HTMLButtonElement;
    // danger variant applies bg-[#FF004D] — check the class string
    expect(sosBtn.className).toContain('bg-[#FF004D]');
  });

  it('N button has secondary variant styling', () => {
    renderInProvider(<AddVehiclePanel />);
    const nBtn = screen.getByText('N').closest('button') as HTMLButtonElement;
    expect(nBtn.className).toContain('bg-[#29ADFF]');
  });

  it('N button is not disabled', () => {
    renderInProvider(<AddVehiclePanel />);
    const nBtn = screen.getByText('N').closest('button') as HTMLButtonElement;
    expect(nBtn.disabled).toBe(false);
  });
});
