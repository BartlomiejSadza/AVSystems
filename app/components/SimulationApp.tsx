'use client';

import { useState, useCallback } from 'react';
import { useSimulationContext } from './SimulationProvider';
import { IntersectionView } from './IntersectionView';
import { derivePhasePerStep, deriveQueuesAtStep } from '../lib/derive-phase';
import { ROADS, type Road } from '../lib/simulation-adapter';

const ROAD_OPTIONS: Road[] = ['north', 'south', 'east', 'west'];

let vehicleCounter = 1;
function nextVehicleId(): string {
  return `V${String(vehicleCounter++).padStart(3, '0')}`;
}

export function SimulationApp() {
  const { state, dispatch } = useSimulationContext();

  // Add vehicle form state
  const [startRoad, setStartRoad] = useState<Road>('north');
  const [endRoad, setEndRoad] = useState<Road>('south');
  const [priority, setPriority] = useState<'normal' | 'emergency'>('normal');
  const [customId, setCustomId] = useState('');

  // Derive per-step phases from current simulation output
  const phases = derivePhasePerStep(state.commands, state.stepStatuses);
  const activePhase = state.currentStepIndex >= 0 ? (phases[state.currentStepIndex] ?? null) : null;

  // Derive current queue state at the current step
  const queues =
    state.currentStepIndex >= 0
      ? deriveQueuesAtStep(state.commands, state.stepStatuses, state.currentStepIndex)
      : ({ north: [], south: [], east: [], west: [] } satisfies Record<Road, string[]>);

  const handleAddVehicle = useCallback(() => {
    const vehicleId = customId.trim() !== '' ? customId.trim() : nextVehicleId();
    dispatch({
      type: 'ADD_VEHICLE',
      payload: { vehicleId, startRoad, endRoad, priority },
    });
    setCustomId('');
  }, [customId, startRoad, endRoad, priority, dispatch]);

  const handleStep = useCallback(() => {
    dispatch({ type: 'STEP' });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    vehicleCounter = 1;
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const handleTogglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_PLAY' });
  }, [dispatch]);

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_SPEED', payload: Number(e.target.value) });
    },
    [dispatch]
  );

  const stepCount = state.stepStatuses.length;
  const totalDeparted = state.stepStatuses.reduce((sum, s) => sum + s.leftVehicles.length, 0);
  const totalQueued = ROADS.reduce((sum, r) => sum + queues[r].length, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Left: Intersection visualization */}
      <div className="flex-1 min-w-0">
        <div className="bg-sim-surface rounded-xl p-4 border border-sim-border">
          <IntersectionView activePhase={activePhase} queues={queues} />
        </div>
      </div>

      {/* Right: Control panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Status bar */}
        <div
          className="bg-sim-surface rounded-xl p-4 border border-sim-border"
          aria-label="Simulation statistics"
        >
          <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
            Statistics
          </h2>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs text-sim-text-dim">Steps</dt>
              <dd className="text-xl font-mono text-sim-text">{stepCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-sim-text-dim">Queued</dt>
              <dd className="text-xl font-mono text-sim-text">{totalQueued}</dd>
            </div>
            <div>
              <dt className="text-xs text-sim-text-dim">Departed</dt>
              <dd className="text-xl font-mono text-sim-text">{totalDeparted}</dd>
            </div>
          </dl>
        </div>

        {/* Error banner */}
        {state.error && (
          <div
            className="bg-status-error-bg border border-status-error rounded-xl p-3 flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <span className="text-status-error text-sm flex-1">{state.error}</span>
            <button
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
              className="text-status-error hover:text-sim-text text-xs shrink-0"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Playback controls */}
        <div className="bg-sim-surface rounded-xl p-4 border border-sim-border">
          <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
            Controls
          </h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleStep}
              disabled={state.isPlaying}
              className="flex-1 bg-sim-surface-alt hover:bg-sim-border disabled:opacity-40 text-sim-text text-sm font-medium py-2 px-3 rounded-lg border border-sim-border transition-colors"
              aria-label="Advance simulation by one step"
            >
              Step
            </button>
            <button
              onClick={handleTogglePlay}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg border transition-colors ${
                state.isPlaying
                  ? 'bg-traffic-red border-traffic-red text-white hover:bg-red-600'
                  : 'bg-traffic-green border-traffic-green text-white hover:bg-green-600'
              }`}
              aria-label={state.isPlaying ? 'Pause auto-play' : 'Start auto-play'}
              aria-pressed={state.isPlaying}
            >
              {state.isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-sim-surface-alt hover:bg-sim-border text-sim-text text-sm font-medium py-2 px-3 rounded-lg border border-sim-border transition-colors"
              aria-label="Reset simulation"
            >
              Reset
            </button>
          </div>

          {/* Speed slider */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-sim-text-dim flex justify-between">
              <span>Speed</span>
              <span className="font-mono">{state.speed}ms / step</span>
            </span>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={state.speed}
              onChange={handleSpeedChange}
              className="w-full accent-traffic-green"
              aria-label={`Auto-play speed: ${state.speed} milliseconds per step`}
            />
          </label>
        </div>

        {/* Add vehicle form */}
        <div className="bg-sim-surface rounded-xl p-4 border border-sim-border">
          <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
            Add Vehicle
          </h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-sim-text-dim">From</span>
                <select
                  value={startRoad}
                  onChange={(e) => setStartRoad(e.target.value as Road)}
                  className="bg-sim-surface-alt border border-sim-border text-sim-text text-sm rounded-lg px-2 py-1.5"
                  aria-label="Vehicle start road"
                >
                  {ROAD_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-sim-text-dim">To</span>
                <select
                  value={endRoad}
                  onChange={(e) => setEndRoad(e.target.value as Road)}
                  className="bg-sim-surface-alt border border-sim-border text-sim-text text-sm rounded-lg px-2 py-1.5"
                  aria-label="Vehicle destination road"
                >
                  {ROAD_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sim-text-dim">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'emergency')}
                className="bg-sim-surface-alt border border-sim-border text-sim-text text-sm rounded-lg px-2 py-1.5"
                aria-label="Vehicle priority"
              >
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sim-text-dim">ID (optional)</span>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Auto-generated"
                className="bg-sim-surface-alt border border-sim-border text-sim-text text-sm rounded-lg px-2 py-1.5 placeholder:text-sim-text-dim"
                aria-label="Custom vehicle ID (optional)"
              />
            </label>
            <button
              onClick={handleAddVehicle}
              className="w-full bg-sim-surface-alt hover:bg-sim-border text-sim-text text-sm font-medium py-2 px-3 rounded-lg border border-sim-border transition-colors"
              aria-label={`Add ${priority} vehicle from ${startRoad} to ${endRoad}`}
            >
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Queue summary */}
        <div
          className="bg-sim-surface rounded-xl p-4 border border-sim-border"
          aria-label="Current queue lengths per road"
        >
          <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
            Queues
          </h2>
          <dl className="space-y-1.5">
            {ROADS.map((road) => (
              <div key={road} className="flex items-center justify-between">
                <dt className="text-xs text-sim-text-dim capitalize">{road}</dt>
                <dd className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-sim-surface-alt overflow-hidden w-24"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-traffic-green transition-all duration-300"
                      style={{ width: `${Math.min(100, (queues[road].length / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-sim-text w-4 text-right">
                    {queues[road].length}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Telemetry panel (shown when available) */}
        {state.telemetry && (
          <div
            className="bg-sim-surface rounded-xl p-4 border border-sim-border"
            aria-label="Telemetry data"
          >
            <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
              Telemetry
            </h2>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-sim-text-dim">Avg queue length</dt>
                <dd className="font-mono text-sim-text">
                  {state.telemetry.averageQueueLength.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sim-text-dim">NS phase count</dt>
                <dd className="font-mono text-sim-text">
                  {state.telemetry.phaseDistribution['NS_STRAIGHT']}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sim-text-dim">EW phase count</dt>
                <dd className="font-mono text-sim-text">
                  {state.telemetry.phaseDistribution['EW_STRAIGHT']}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Recent step log */}
        {state.stepStatuses.length > 0 && (
          <div
            className="bg-sim-surface rounded-xl p-4 border border-sim-border"
            aria-label="Recent step log"
          >
            <h2 className="text-sm font-semibold text-sim-text-muted uppercase tracking-wide mb-3">
              Step Log
            </h2>
            <ol className="space-y-1 max-h-40 overflow-y-auto" aria-live="polite">
              {[...state.stepStatuses]
                .reverse()
                .slice(0, 20)
                .map((status, revIdx) => {
                  const stepIdx = state.stepStatuses.length - 1 - revIdx;
                  const phase = phases[stepIdx] ?? '—';
                  const departed = status.leftVehicles.join(', ') || 'none';
                  return (
                    <li key={stepIdx} className="text-xs text-sim-text-dim font-mono flex gap-2">
                      <span className="text-sim-text-muted w-8 shrink-0">#{stepIdx + 1}</span>
                      <span className="text-sim-text-dim w-24 shrink-0">{phase}</span>
                      <span className="truncate">{departed}</span>
                    </li>
                  );
                })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
