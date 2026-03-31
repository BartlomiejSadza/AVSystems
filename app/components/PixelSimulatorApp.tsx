'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSimulationContext } from './SimulationProvider';
import { CanvasViewport } from './canvas/CanvasViewport';
import { HudBar } from './hud/HudBar';
import { ControlBar } from './controls/ControlBar';
import { Tooltip } from './overlay/Tooltip';
import { NpcDialog } from './overlay/NpcDialog';
import { EmergencyQueuePanel } from './overlay/EmergencyQueuePanel';
import { StepLog, type StepLogEntry } from './overlay/StepLog';
import { useNpcDialog } from '../hooks/useNpcDialog';
import { selectSimulationUiState } from '../lib/derive-phase';
import type { TooltipState } from '../hooks/useHitDetection';
import {
  generateEmergencyMessage,
  generateErrorMessage,
  generateStepMessage,
  generateVehicleMessage,
  generateWelcomeMessage,
} from '../lib/npc-messages';

export function PixelSimulatorApp() {
  const { state } = useSimulationContext();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hasWelcomedRef = useRef(false);
  const prevStepCountRef = useRef(0);
  const prevCommandCountRef = useRef(0);
  const prevErrorRef = useRef<string | null>(null);

  const uiState = selectSimulationUiState(state);

  // NPC dialog
  const npcDialog = useNpcDialog(state.isPlaying);

  // Step log entries
  const stepLogEntries: StepLogEntry[] = state.stepStatuses.map((st, i) => ({
    stepIndex: i,
    phase: uiState.phases[i] ?? null,
    departed: st.leftVehicles,
  }));

  const handleTooltipChange = useCallback((t: TooltipState | null) => {
    setTooltip(t);
  }, []);

  useEffect(() => {
    if (hasWelcomedRef.current) return;
    hasWelcomedRef.current = true;
    npcDialog.enqueue(generateWelcomeMessage());
  }, [npcDialog]);

  useEffect(() => {
    if (state.commands.length <= prevCommandCountRef.current) return;
    const latestCommand = state.commands[state.commands.length - 1];
    prevCommandCountRef.current = state.commands.length;
    if (!latestCommand || latestCommand.type !== 'addVehicle') return;

    if ((latestCommand.priority ?? 'normal') === 'emergency') {
      npcDialog.enqueue(generateEmergencyMessage());
      return;
    }
    npcDialog.enqueue(generateVehicleMessage(latestCommand.startRoad));
  }, [state.commands, npcDialog]);

  useEffect(() => {
    if (uiState.stepCount <= prevStepCountRef.current) return;
    for (let step = prevStepCountRef.current; step < uiState.stepCount; step += 1) {
      npcDialog.enqueue(generateStepMessage(step));
    }
    prevStepCountRef.current = uiState.stepCount;
  }, [uiState.stepCount, npcDialog]);

  useEffect(() => {
    if (state.error === prevErrorRef.current) return;
    prevErrorRef.current = state.error;
    if (state.error) {
      npcDialog.enqueue(generateErrorMessage(state.error));
    }
  }, [state.error, npcDialog]);

  return (
    <div className="relative mx-auto flex w-full min-w-0 max-w-[960px] flex-col bg-[#1D2B53]">
      {/* HUD — top */}
      <HudBar
        steps={uiState.stepCount}
        queued={uiState.totalQueued}
        departed={uiState.totalDeparted}
        phase={uiState.activePhase}
      />

      {/* Canvas — center */}
      <div className="relative">
        <CanvasViewport onTooltipChange={handleTooltipChange} />
        {tooltip && <Tooltip content={tooltip.content} x={tooltip.cssX} y={tooltip.cssY} />}
      </div>

      {/* Controls — bottom */}
      <ControlBar />

      {/* Step log — below controls */}
      <div className="grid gap-2 px-2 pb-4 sm:px-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <StepLog entries={stepLogEntries} />
        </div>
        <div className="min-w-0">
          <EmergencyQueuePanel emergencyQueues={uiState.emergencyQueues} />
        </div>
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
