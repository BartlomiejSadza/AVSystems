// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Tooltip } from '../Tooltip';
import { NpcDialog } from '../NpcDialog';
import { StepLog, type StepLogEntry } from '../StepLog';
import { EmergencyQueuePanel } from '../EmergencyQueuePanel';

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
describe('Tooltip', () => {
  it('renders nothing when content is null', () => {
    const { container } = render(<Tooltip content={null} x={100} y={200} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders content text when provided', () => {
    render(<Tooltip content="Vehicle: car-1" x={100} y={200} />);
    expect(screen.getByText('Vehicle: car-1')).toBeInTheDocument();
  });

  it('positions tooltip at the given x/y coordinates', () => {
    render(<Tooltip content="Hello" x={150} y={250} />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({ left: '150px', top: '250px' });
  });
});

// ---------------------------------------------------------------------------
// NpcDialog
// ---------------------------------------------------------------------------
describe('NpcDialog', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(
      <NpcDialog message="Hello!" visible={false} onDismiss={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when message is null even if visible is true', () => {
    const { container } = render(<NpcDialog message={null} visible={true} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the message when visible is true', () => {
    render(
      <NpcDialog message="Great job! The light turned green." visible={true} onDismiss={() => {}} />
    );
    expect(screen.getByText('Great job! The light turned green.')).toBeInTheDocument();
  });

  it('calls onDismiss when the close button is clicked', () => {
    const handler = vi.fn();
    render(<NpcDialog message="Test message" visible={true} onDismiss={handler} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// StepLog
// ---------------------------------------------------------------------------
describe('StepLog', () => {
  it('renders "No steps yet" message when entries array is empty', () => {
    render(<StepLog entries={[]} />);
    expect(screen.getByText(/No steps yet/i)).toBeInTheDocument();
  });

  it('renders step entries with step number and phase', () => {
    const entries: StepLogEntry[] = [
      { stepIndex: 1, phase: 'NS_THROUGH', departed: [] },
      { stepIndex: 2, phase: 'EW_THROUGH', departed: [] },
    ];
    render(<StepLog entries={entries} />);
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
    expect(screen.getByText('NS thru')).toBeInTheDocument();
    expect(screen.getByText(/Step 2/)).toBeInTheDocument();
    expect(screen.getByText('EW thru')).toBeInTheDocument();
  });

  it('renders null phase as "NONE"', () => {
    const entries: StepLogEntry[] = [{ stepIndex: 1, phase: null, departed: [] }];
    render(<StepLog entries={entries} />);
    expect(screen.getByText('NONE')).toBeInTheDocument();
  });

  it('renders yellow and all-red phase labels explicitly', () => {
    const entries: StepLogEntry[] = [
      { stepIndex: 1, phase: 'EW_LEFT_YELLOW', departed: [] },
      { stepIndex: 2, phase: 'ALL_RED', departed: [] },
    ];
    render(<StepLog entries={entries} />);
    expect(screen.getByText('EW left yellow')).toBeInTheDocument();
    expect(screen.getByText('ALL RED')).toBeInTheDocument();
  });

  it('shows departed vehicle IDs in entries', () => {
    const entries: StepLogEntry[] = [
      { stepIndex: 3, phase: 'NS_THROUGH', departed: ['car-1', 'car-2'] },
    ];
    render(<StepLog entries={entries} />);
    expect(screen.getByText(/car-1/)).toBeInTheDocument();
    expect(screen.getByText(/car-2/)).toBeInTheDocument();
  });

  it('applies text wrapping classes for long departed ids', () => {
    const entries: StepLogEntry[] = [
      { stepIndex: 3, phase: 'NS_THROUGH', departed: ['VERY-LONG-ID-1'] },
    ];
    render(<StepLog entries={entries} />);
    const departedLine = screen.getByText(/Departed:/i);
    expect(departedLine.className).toContain('break-all');
  });

  it('shows "No vehicles departed" when departed array is empty', () => {
    const entries: StepLogEntry[] = [{ stepIndex: 4, phase: 'EW_THROUGH', departed: [] }];
    render(<StepLog entries={entries} />);
    expect(screen.getByText(/No vehicles departed/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// EmergencyQueuePanel
// ---------------------------------------------------------------------------
describe('EmergencyQueuePanel', () => {
  it('renders stable empty state when there are no emergency vehicles', () => {
    render(<EmergencyQueuePanel emergencyQueues={{ north: [], south: [], east: [], west: [] }} />);
    expect(screen.getByLabelText('Emergency queues')).toBeInTheDocument();
    expect(screen.getByText('No emergency vehicles waiting.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders emergency vehicle ids in per-road order', () => {
    render(
      <EmergencyQueuePanel
        emergencyQueues={{
          north: ['E-1', 'E-2'],
          south: [],
          east: ['E-3'],
          west: [],
        }}
      />
    );
    expect(screen.queryByText('No emergency vehicles waiting.')).not.toBeInTheDocument();
    expect(screen.getByText('E-1, E-2')).toBeInTheDocument();
    expect(screen.getByText('E-3')).toBeInTheDocument();
  });

  it('wraps long queue ids to prevent panel overflow', () => {
    render(
      <EmergencyQueuePanel
        emergencyQueues={{
          north: ['EMERGENCY-VERY-LONG-IDENTIFIER-1'],
          south: [],
          east: [],
          west: [],
        }}
      />
    );
    const queueText = screen.getByText('EMERGENCY-VERY-LONG-IDENTIFIER-1');
    expect(queueText.className).toContain('break-all');
  });
});
