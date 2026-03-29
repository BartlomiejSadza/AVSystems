// @vitest-environment jsdom
/**
 * Tests for pixel-art control components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelButton } from '../PixelButton';
import { PixelSelect } from '../PixelSelect';
import { SpeedSlider } from '../SpeedSlider';

// ---------------------------------------------------------------------------
// PixelButton
// ---------------------------------------------------------------------------
describe('PixelButton', () => {
  it('renders the label text', () => {
    render(<PixelButton label="Start" onClick={() => {}} />);
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('fires onClick when clicked', () => {
    const handler = vi.fn();
    render(<PixelButton label="Go" onClick={handler} />);
    fireEvent.click(screen.getByText('Go'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const handler = vi.fn();
    render(<PixelButton label="Go" onClick={handler} disabled />);
    fireEvent.click(screen.getByText('Go'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('button element is disabled when disabled prop is true', () => {
    render(<PixelButton label="Go" onClick={() => {}} disabled />);
    const btn = screen.getByText('Go').closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('renders primary variant without throwing', () => {
    render(<PixelButton label="Primary" onClick={() => {}} variant="primary" />);
    expect(screen.getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant without throwing', () => {
    render(<PixelButton label="Secondary" onClick={() => {}} variant="secondary" />);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('renders danger variant without throwing', () => {
    render(<PixelButton label="Danger" onClick={() => {}} variant="danger" />);
    expect(screen.getByText('Danger')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// PixelSelect
// ---------------------------------------------------------------------------
describe('PixelSelect', () => {
  const options = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
  ];

  it('renders all options', () => {
    render(<PixelSelect options={options} value="red" onChange={() => {}} />);
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Green')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
  });

  it('renders the label when provided', () => {
    render(<PixelSelect options={options} value="red" onChange={() => {}} label="Color" />);
    expect(screen.getByText('Color')).toBeTruthy();
  });

  it('fires onChange with the selected value', () => {
    const handler = vi.fn();
    render(<PixelSelect options={options} value="red" onChange={handler} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'green' } });
    expect(handler).toHaveBeenCalledWith('green');
  });

  it('reflects the controlled value', () => {
    render(<PixelSelect options={options} value="blue" onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('blue');
  });
});

// ---------------------------------------------------------------------------
// SpeedSlider
// ---------------------------------------------------------------------------
describe('SpeedSlider', () => {
  it('renders the slider input', () => {
    render(<SpeedSlider value={5} onChange={() => {}} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeTruthy();
  });

  it('reflects the controlled value', () => {
    render(<SpeedSlider value={7} onChange={() => {}} min={1} max={10} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(Number(slider.value)).toBe(7);
  });

  it('renders the label when provided', () => {
    render(<SpeedSlider value={3} onChange={() => {}} label="Speed" />);
    expect(screen.getByText('Speed')).toBeTruthy();
  });

  it('fires onChange with a number value', () => {
    const handler = vi.fn();
    render(<SpeedSlider value={3} onChange={handler} min={1} max={10} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '6' } });
    expect(handler).toHaveBeenCalledWith(6);
    expect(typeof handler.mock.calls[0]![0]).toBe('number');
  });

  it('respects custom min and max bounds', () => {
    render(<SpeedSlider value={2} onChange={() => {}} min={1} max={5} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(Number(slider.min)).toBe(1);
    expect(Number(slider.max)).toBe(5);
  });
});
