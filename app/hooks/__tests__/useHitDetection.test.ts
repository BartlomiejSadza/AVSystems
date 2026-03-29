// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHitDetection } from '../useHitDetection';
import type { HitZone } from '../../canvas/hit-detection';

vi.mock('../../canvas/viewport', () => ({
  cssToGame: vi.fn((_x: number, _y: number, _rect: DOMRect) => ({ gx: 100, gy: 50 })),
  gameToCSS: vi.fn((_gx: number, _gy: number, _rect: DOMRect) => ({ cssX: 300, cssY: 150 })),
}));

const mockZone: HitZone = {
  id: 'test-zone',
  rect: { x: 90, y: 40, w: 20, h: 20 },
  layer: 'test',
  getTooltip: () => 'Test tooltip',
};

vi.mock('../../canvas/hit-detection', () => ({
  findHitZone: vi.fn((_zones: HitZone[], _gx: number, _gy: number) => mockZone),
}));

describe('useHitDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('returns null tooltip initially', () => {
    const canvas = document.createElement('canvas');
    const zonesRef = { current: [mockZone] };
    const { result } = renderHook(() => useHitDetection(canvas, zonesRef));
    expect(result.current.tooltip).toBeNull();
  });

  it('updates tooltip on mousemove over a hit zone', () => {
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 720 }) as DOMRect;
    const zonesRef = { current: [mockZone] };
    const { result } = renderHook(() => useHitDetection(canvas, zonesRef));

    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 300, clientY: 150 });
      canvas.dispatchEvent(event);
      vi.advanceTimersByTime(70);
    });

    expect(result.current.tooltip).not.toBeNull();
    expect(result.current.tooltip!.content).toBe('Test tooltip');
  });

  it('clears tooltip on mouseleave', () => {
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 720 }) as DOMRect;
    const zonesRef = { current: [mockZone] };
    const { result } = renderHook(() => useHitDetection(canvas, zonesRef));

    act(() => {
      canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 150 }));
      vi.advanceTimersByTime(70);
    });

    act(() => {
      canvas.dispatchEvent(new MouseEvent('mouseleave'));
    });

    expect(result.current.tooltip).toBeNull();
  });
});
