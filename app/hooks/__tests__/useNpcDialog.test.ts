// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNpcDialog } from '../useNpcDialog';
import type { NpcMessage } from '../../lib/npc-messages';

function makeMessage(overrides: Partial<NpcMessage> = {}): NpcMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 6)}`,
    text: 'Hello from Officer Pixel!',
    trigger: 'step',
    priority: 3,
    ...overrides,
  };
}

describe('useNpcDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no current message', () => {
    const { result } = renderHook(() => useNpcDialog(false));
    expect(result.current.current).toBeNull();
    expect(result.current.visible).toBe(false);
  });

  it('enqueues and shows a message', () => {
    const { result } = renderHook(() => useNpcDialog(false));
    const msg = makeMessage();

    act(() => {
      result.current.enqueue(msg);
    });

    expect(result.current.current).toBe(msg);
    expect(result.current.visible).toBe(true);
  });

  it('auto-dismisses after 3 seconds', () => {
    const { result } = renderHook(() => useNpcDialog(false));
    const msg = makeMessage();

    act(() => {
      result.current.enqueue(msg);
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(result.current.visible).toBe(false);
  });

  it('dismiss callback clears current message', () => {
    const { result } = renderHook(() => useNpcDialog(false));
    const msg = makeMessage();

    act(() => {
      result.current.enqueue(msg);
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.visible).toBe(false);
  });

  it('higher priority message preempts lower priority', () => {
    const { result } = renderHook(() => useNpcDialog(false));
    const low = makeMessage({ priority: 5, text: 'low' });
    const high = makeMessage({ priority: 1, text: 'high' });

    act(() => {
      result.current.enqueue(low);
    });
    act(() => {
      result.current.enqueue(high);
    });

    expect(result.current.current!.text).toBe('high');
  });

  it('suppresses messages when auto-play is active', () => {
    const { result } = renderHook(() => useNpcDialog(true));
    const msg = makeMessage({ priority: 4 });

    act(() => {
      result.current.enqueue(msg);
    });

    // Low-priority messages suppressed during auto-play
    expect(result.current.current).toBeNull();
  });

  it('allows high-priority messages during auto-play', () => {
    const { result } = renderHook(() => useNpcDialog(true));
    const msg = makeMessage({ priority: 1, trigger: 'emergency' });

    act(() => {
      result.current.enqueue(msg);
    });

    expect(result.current.current).toBe(msg);
  });
});
