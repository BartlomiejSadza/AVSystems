// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { HudStat } from '../HudStat';
import { HudBar } from '../HudBar';

describe('HudStat', () => {
  it('renders the label', () => {
    render(<HudStat label="Steps" value={42} />);
    expect(screen.getByText('Steps')).toBeInTheDocument();
  });

  it('renders the value', () => {
    render(<HudStat label="Steps" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<HudStat label="Phase" value="NS" />);
    expect(screen.getByText('NS')).toBeInTheDocument();
  });
});

describe('HudBar', () => {
  it('renders all 4 stats with correct values', () => {
    render(<HudBar steps={10} queued={3} departed={7} phase="NS_STRAIGHT" />);
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Queued')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Departed')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Phase')).toBeInTheDocument();
  });

  it('formats null phase as "NONE"', () => {
    render(<HudBar steps={0} queued={0} departed={0} phase={null} />);
    expect(screen.getByText('NONE')).toBeInTheDocument();
  });

  it('formats NS_STRAIGHT phase as "NS"', () => {
    render(<HudBar steps={0} queued={0} departed={0} phase="NS_STRAIGHT" />);
    expect(screen.getByText('NS')).toBeInTheDocument();
  });

  it('formats EW_STRAIGHT phase as "EW"', () => {
    render(<HudBar steps={0} queued={0} departed={0} phase="EW_STRAIGHT" />);
    expect(screen.getByText('EW')).toBeInTheDocument();
  });
});
