// @vitest-environment jsdom
/**
 * Unit tests for PixelSelect component — including size prop variants.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelSelect } from '../PixelSelect';

const OPTIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
];

describe('PixelSelect — options rendering', () => {
  it('renders all provided options', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} />);
    expect(screen.getByText('North')).toBeTruthy();
    expect(screen.getByText('South')).toBeTruthy();
    expect(screen.getByText('East')).toBeTruthy();
    expect(screen.getByText('West')).toBeTruthy();
  });

  it('renders the correct number of option elements', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} />);
    const selectEl = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectEl.options.length).toBe(OPTIONS.length);
  });

  it('reflects the controlled value', () => {
    render(<PixelSelect options={OPTIONS} value="east" onChange={() => {}} />);
    const selectEl = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectEl.value).toBe('east');
  });
});

describe('PixelSelect — label', () => {
  it('renders label text when label prop is provided', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} label="Direction" />);
    expect(screen.getByText('Direction')).toBeTruthy();
  });

  it('does not render a label element when label prop is omitted', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} />);
    expect(screen.queryByText('Direction')).toBeNull();
  });

  it('associates label with select via htmlFor / id', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} label="My Label" />);
    const labelEl = screen.getByText('My Label');
    const selectEl = screen.getByRole('combobox');
    expect(labelEl.getAttribute('for')).toBe(selectEl.getAttribute('id'));
  });
});

describe('PixelSelect — onChange', () => {
  it('calls onChange with the new value when selection changes', () => {
    const handler = vi.fn();
    render(<PixelSelect options={OPTIONS} value="north" onChange={handler} />);
    const selectEl = screen.getByRole('combobox');
    fireEvent.change(selectEl, { target: { value: 'south' } });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('south');
  });

  it('passes a string (not an event object) to onChange', () => {
    const handler = vi.fn();
    render(<PixelSelect options={OPTIONS} value="north" onChange={handler} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'west' } });
    expect(typeof handler.mock.calls[0]![0]).toBe('string');
  });
});

describe('PixelSelect — size prop', () => {
  it('renders without errors when size="sm"', () => {
    expect(() =>
      render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="sm" />)
    ).not.toThrow();
  });

  it('renders without errors when size="md"', () => {
    expect(() =>
      render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="md" />)
    ).not.toThrow();
  });

  it('renders without errors when size prop is omitted (defaults to md)', () => {
    expect(() =>
      render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} />)
    ).not.toThrow();
  });

  it('size="sm" — select element has compact min-height class', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="sm" />);
    const selectEl = screen.getByRole('combobox');
    expect(selectEl.className).toContain('min-h-[32px]');
  });

  it('size="md" — select element has standard min-height class', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="md" />);
    const selectEl = screen.getByRole('combobox');
    expect(selectEl.className).toContain('min-h-[48px]');
  });

  it('size="sm" still fires onChange correctly', () => {
    const handler = vi.fn();
    render(<PixelSelect options={OPTIONS} value="north" onChange={handler} size="sm" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'east' } });
    expect(handler).toHaveBeenCalledWith('east');
  });

  it('size="sm" renders all options', () => {
    render(<PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="sm" />);
    expect(screen.getByText('North')).toBeTruthy();
    expect(screen.getByText('South')).toBeTruthy();
  });

  it('size="sm" with label renders label correctly', () => {
    render(
      <PixelSelect options={OPTIONS} value="north" onChange={() => {}} size="sm" label="Lane" />
    );
    expect(screen.getByText('Lane')).toBeTruthy();
  });
});
