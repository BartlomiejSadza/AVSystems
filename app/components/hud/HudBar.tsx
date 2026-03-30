'use client';

import { HudStat } from './HudStat';
import {
  formatPhaseForDisplay,
  type DisplayPhase,
  type LegacyDisplayPhase,
} from '../../lib/phase-display';

interface HudBarProps {
  steps: number;
  queued: number;
  departed: number;
  phase: DisplayPhase | LegacyDisplayPhase | null;
}

export function HudBar({ steps, queued, departed, phase }: HudBarProps) {
  return (
    <div className="w-full bg-[#1D2B53] font-[family-name:var(--font-pixel)]">
      <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:justify-evenly">
        <HudStat label="Steps" value={steps} />
        <HudStat label="Queued" value={queued} />
        <HudStat label="Departed" value={departed} />
        <HudStat label="Phase" value={formatPhaseForDisplay(phase)} />
      </div>
    </div>
  );
}
