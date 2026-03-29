'use client';

import React, { useState, useCallback } from 'react';
import { useSimulationContext } from './SimulationProvider';
import { CanvasViewport } from './canvas/CanvasViewport';
import { HudBar } from './hud/HudBar';
import { ControlBar } from './controls/ControlBar';
import { Tooltip } from './overlay/Tooltip';
import { NpcDialog } from './overlay/NpcDialog';
import { StepLog, type StepLogEntry } from './overlay/StepLog';
import { useNpcDialog } from '../hooks/useNpcDialog';
import { derivePhasePerStep, deriveQueuesAtStep } from '../lib/derive-phase';
import type { TooltipState } from '../hooks/useHitDetection';

export function PixelSimulatorApp() {
  const { state } = useSimulationContext();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Derive display data
  const phases = derivePhasePerStep(state.commands, state.stepStatuses);
  const activePhase = state.currentStepIndex >= 0 ? (phases[state.currentStepIndex] ?? null) : null;
  const queues =
    state.currentStepIndex >= 0
      ? deriveQueuesAtStep(state.commands, state.stepStatuses, state.currentStepIndex)
      : {
          north: [] as string[],
          south: [] as string[],
          east: [] as string[],
          west: [] as string[],
        };

  const totalQueued = Object.values(queues).reduce((s, q) => s + q.length, 0);
  const totalDeparted = state.stepStatuses.reduce((s, st) => s + st.leftVehicles.length, 0);

  // NPC dialog
  const npcDialog = useNpcDialog(state.isPlaying);

  // Step log entries
  const stepLogEntries: StepLogEntry[] = state.stepStatuses.map((st, i) => ({
    stepIndex: i,
    phase: phases[i] ?? null,
    departed: st.leftVehicles,
  }));

  const handleTooltipChange = useCallback((t: TooltipState | null) => {
    setTooltip(t);
  }, []);

  return (
    <div className="relative mx-auto flex max-w-[960px] flex-col bg-[#1D2B53]">
      {/* HUD — top */}
      <HudBar
        steps={state.stepStatuses.length}
        queued={totalQueued}
        departed={totalDeparted}
        phase={activePhase}
      />

      {/* Canvas — center */}
      <div className="relative">
        <CanvasViewport onTooltipChange={handleTooltipChange} />
        {tooltip && <Tooltip content={tooltip.content} x={tooltip.cssX} y={tooltip.cssY} />}
      </div>

      {/* Controls — bottom */}
      <ControlBar />

      {/* Step log — below controls */}
      <div className="px-4 pb-4">
        <StepLog entries={stepLogEntries} />
      </div>

      {/* NPC Dialog — floating overlay */}
      <NpcDialog
        message={npcDialog.current?.text ?? null}
        visible={npcDialog.visible}
        onDismiss={npcDialog.dismiss}
      />
    </div>
  );
}
