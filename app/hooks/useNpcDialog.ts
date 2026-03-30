'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NpcMessage, NpcTrigger } from '../lib/npc-messages';

const AUTO_DISMISS_MS = 3_000;
const DISMISS_COOLDOWN_MS = 60_000;
const CATEGORY_COOLDOWN_STEPS = 3;
const FLOOD_LIMIT = 3;
const FLOOD_WINDOW_MS = 60_000;

interface NpcDialogReturn {
  current: NpcMessage | null;
  visible: boolean;
  enqueue: (msg: NpcMessage) => void;
  dismiss: () => void;
}

export function useNpcDialog(isAutoPlaying: boolean): NpcDialogReturn {
  const [current, setCurrent] = useState<NpcMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const queueRef = useRef<NpcMessage[]>([]);
  const dismissedAtRef = useRef(0);
  const categoryHistoryRef = useRef<Map<NpcTrigger, number>>(new Map());
  const showTimestampsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepCounterRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showNext = useCallback(() => {
    clearTimer();
    const queue = queueRef.current;
    if (queue.length === 0) {
      setCurrent(null);
      setVisible(false);
      return;
    }

    // Sort by priority (lower number = higher priority)
    queue.sort((a, b) => a.priority - b.priority);
    const next = queue.shift()!;
    setCurrent(next);
    setVisible(true);

    const now = Date.now();
    showTimestampsRef.current.push(now);
    categoryHistoryRef.current.set(next.trigger, stepCounterRef.current);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setCurrent(null);
      showNext();
    }, AUTO_DISMISS_MS);
  }, [clearTimer]);

  const shouldSuppress = useCallback(
    (msg: NpcMessage): boolean => {
      const now = Date.now();

      // High-priority messages (1-2) are never suppressed
      if (msg.priority <= 2) return false;

      // Suppress during auto-play for low-priority
      if (isAutoPlaying && msg.priority >= 3) return true;

      // Suppress if dismissed within cooldown
      if (now - dismissedAtRef.current < DISMISS_COOLDOWN_MS) return true;

      // Suppress if same category triggered within last N steps
      const lastStep = categoryHistoryRef.current.get(msg.trigger);
      if (lastStep !== undefined && stepCounterRef.current - lastStep < CATEGORY_COOLDOWN_STEPS) {
        return true;
      }

      // Suppress if flood limit reached
      const recentShows = showTimestampsRef.current.filter((t) => now - t < FLOOD_WINDOW_MS);
      showTimestampsRef.current = recentShows;
      if (recentShows.length >= FLOOD_LIMIT) return true;

      return false;
    },
    [isAutoPlaying]
  );

  const enqueue = useCallback(
    (msg: NpcMessage) => {
      if (shouldSuppress(msg)) return;

      // If higher priority than current, preempt
      if (current && msg.priority < current.priority) {
        clearTimer();
        queueRef.current.unshift(current);
        setCurrent(msg);
        setVisible(true);

        const now = Date.now();
        showTimestampsRef.current.push(now);
        categoryHistoryRef.current.set(msg.trigger, stepCounterRef.current);

        timerRef.current = setTimeout(() => {
          setVisible(false);
          setCurrent(null);
          showNext();
        }, AUTO_DISMISS_MS);
        return;
      }

      queueRef.current.push(msg);
      // Sort by priority
      queueRef.current.sort((a, b) => a.priority - b.priority);

      if (!current) {
        showNext();
      }
    },
    [current, shouldSuppress, clearTimer, showNext]
  );

  const dismiss = useCallback(() => {
    clearTimer();
    dismissedAtRef.current = Date.now();
    setVisible(false);
    setCurrent(null);
    // Show next in queue after dismissal
    setTimeout(() => showNext(), 0);
  }, [clearTimer, showNext]);

  // Increment step counter whenever step messages come through
  const enqueueWrapped = useCallback(
    (msg: NpcMessage) => {
      if (msg.trigger === 'step') {
        stepCounterRef.current += 1;
      }
      enqueue(msg);
    },
    [enqueue]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { current, visible, enqueue: enqueueWrapped, dismiss };
}
