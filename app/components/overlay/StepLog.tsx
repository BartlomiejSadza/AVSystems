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
  // Guard against jsdom/test environments where scrollIntoView is not implemented.
  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  return (
    <div
      style={{
        backgroundColor: '#1D2B53',
        border: '2px solid #7E2553',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '6px 8px',
      }}
    >
      {entries.length === 0 ? (
        <p
          className="font-[family-name:var(--font-pixel)] text-[10px] leading-tight"
          style={{ color: '#C2C3C7', margin: 0 }}
        >
          No steps yet. Click Step to begin!
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {entries.map((entry) => (
            <li
              key={entry.stepIndex}
              style={{
                borderBottom: '1px solid rgba(126, 37, 83, 0.4)',
                paddingBottom: '4px',
              }}
            >
              {/* Step number + phase */}
              <div
                className="font-[family-name:var(--font-pixel)] text-[10px] leading-tight"
                style={{ color: '#29ADFF' }}
              >
                Step {entry.stepIndex} —{' '}
                <span style={{ color: '#FFF1E8' }}>{entry.phase ?? 'NONE'}</span>
              </div>

              {/* Departed vehicles */}
              {entry.departed.length > 0 ? (
                <div
                  className="font-[family-name:var(--font-pixel)] text-[9px] leading-tight"
                  style={{ color: '#C2C3C7', marginTop: '2px' }}
                >
                  Departed: {entry.departed.join(', ')}
                </div>
              ) : (
                <div
                  className="font-[family-name:var(--font-pixel)] text-[9px] leading-tight"
                  style={{ color: '#C2C3C7', marginTop: '2px' }}
                >
                  No vehicles departed
                </div>
              )}
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
