'use client';

import { useEffect, useRef } from 'react';
import { useSimulationContext } from './SimulationProvider';
import type { Command } from '../lib/simulation-adapter';

function formatCommand(cmd: Command, stepIndex: number, stepStatuses: { leftVehicles: string[] }[]): string {
  if (cmd.type === 'addVehicle') {
    const priority = cmd.priority === 'emergency' ? ' [EMERGENCY]' : '';
    return `addVehicle: ${cmd.vehicleId}${priority} ${cmd.startRoad} → ${cmd.endRoad}`;
  }
  // step command — find the corresponding stepStatus
  const status = stepStatuses[stepIndex];
  if (!status) {
    return 'step';
  }
  if (status.leftVehicles.length === 0) {
    return 'step → (no vehicles)';
  }
  return `step → left: ${status.leftVehicles.join(', ')}`;
}

export function CommandLog() {
  const { state } = useSimulationContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [state.commands.length]);

  // Build list entries, tracking which step index each step command is
  const entries: { cmd: Command; label: string; key: number }[] = [];
  let stepIndex = 0;
  state.commands.forEach((cmd, i) => {
    const label = formatCommand(cmd, stepIndex, state.stepStatuses);
    if (cmd.type === 'step') stepIndex++;
    entries.push({ cmd, label, key: i });
  });

  return (
    <div className="bg-sim-surface rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-sim-text">Command Log</h2>
        <span className="text-xs text-sim-text-dim" aria-live="polite" aria-atomic="true">
          {state.commands.length} command{state.commands.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto max-h-64 space-y-0.5 font-mono text-xs"
        role="log"
        aria-label="Command history"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <p className="text-sim-text-dim py-2 text-center">No commands yet.</p>
        ) : (
          entries.map(({ cmd, label, key }) => (
            <div
              key={key}
              className={
                cmd.type === 'step'
                  ? 'px-2 py-1 rounded text-traffic-green bg-traffic-green/5'
                  : 'px-2 py-1 rounded text-sim-text-muted'
              }
              role="listitem"
            >
              <span className="text-sim-text-dim select-none mr-2">
                {String(key + 1).padStart(3, '0')}
              </span>
              {label}
            </div>
          ))
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
