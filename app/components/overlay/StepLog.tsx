'use client';

import React, { useRef, useEffect } from 'react';

export interface StepLogEntry {
  stepIndex: number;
  phase: string | null;
  departed: string[];
}

interface StepLogProps {
  entries: StepLogEntry[];
}

export function StepLog({ entries }: StepLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever entries change.
  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  return (
    <div className="max-h-[200px] overflow-y-auto border-2 border-[#7E2553] bg-[#1D2B53] px-2 py-1.5">
      {entries.length === 0 ? (
        <p className="m-0 font-[family-name:var(--font-pixel)] text-[10px] leading-tight text-[#C2C3C7]">
          No steps yet. Click Step to begin!
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {entries.map((entry) => (
            <li key={entry.stepIndex} className="border-b border-[#7E2553]/40 pb-1">
              {/* Step number + phase */}
              <div className="font-[family-name:var(--font-pixel)] text-[10px] leading-tight text-[#29ADFF]">
                Step {entry.stepIndex} —{' '}
                <span className="text-[#FFF1E8]">{entry.phase ?? 'NONE'}</span>
              </div>

              {/* Departed vehicles */}
              <div className="mt-0.5 font-[family-name:var(--font-pixel)] text-[9px] leading-tight text-[#C2C3C7]">
                {entry.departed.length > 0
                  ? `Departed: ${entry.departed.join(', ')}`
                  : 'No vehicles departed'}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

export default StepLog;
