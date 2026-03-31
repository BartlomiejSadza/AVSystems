/**
 * Degenerate signal profile (1-tick green, zero yellow / all-red) for tests and
 * E2E pipelines that approximate legacy per-step phase changes.
 */

import type { SignalTimingConfig } from './types.js';

export const DEGENERATE_SIGNAL_TIMINGS: Partial<SignalTimingConfig> = {
  minGreenTicks: 1,
  maxGreenTicks: 1,
  yellowTicks: 0,
  allRedTicks: 0,
  skipEmptyPhases: false,
  lazyGreenSelection: true,
};
