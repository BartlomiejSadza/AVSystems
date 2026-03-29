'use client';

import { HudStat } from './HudStat';

type PhaseValue = 'NS_STRAIGHT' | 'EW_STRAIGHT' | null;

interface HudBarProps {
  steps: number;
  queued: number;
  departed: number;
  phase: PhaseValue | string | null;
}

function formatPhase(phase: string | null): string {
  if (phase === null) return 'NONE';
  if (phase === 'NS_STRAIGHT') return 'NS';
  if (phase === 'EW_STRAIGHT') return 'EW';
  return phase;
}

export function HudBar({ steps, queued, departed, phase }: HudBarProps) {
  return (
    <div className="w-full bg-[#1D2B53] font-[family-name:var(--font-pixel)]">
      <div className="mx-auto flex max-w-[960px] items-center justify-evenly px-4 py-3">
        <HudStat label="Steps" value={steps} />
        <HudStat label="Queued" value={queued} />
        <HudStat label="Departed" value={departed} />
        <HudStat label="Phase" value={formatPhase(phase)} />
      </div>
    </div>
  );
}
