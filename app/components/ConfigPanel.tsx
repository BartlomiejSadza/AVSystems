'use client';

import { useState } from 'react';
import { useSimulationContext } from './SimulationProvider';
import type { Road } from '../lib/simulation-adapter';

const ROADS: Road[] = ['north', 'south', 'east', 'west'];

export function ConfigPanel() {
  const { state, dispatch } = useSimulationContext();
  const [isOpen, setIsOpen] = useState(false);

  const handlePriorityChange = (road: Road, value: string) => {
    const num = Math.min(10, Math.max(0, Number(value)));
    if (!isNaN(num)) {
      dispatch({
        type: 'SET_ROAD_PRIORITIES',
        payload: { [road]: num },
      });
    }
  };

  const handleInvariantToggle = () => {
    dispatch({
      type: 'SET_OPTIONS',
      payload: {
        enableInvariantChecks: !state.options.enableInvariantChecks,
      },
    });
  };

  const handleTelemetryToggle = () => {
    dispatch({
      type: 'SET_OPTIONS',
      payload: {
        enableTelemetry: !state.options.enableTelemetry,
      },
    });
  };

  return (
    <div className="bg-sim-surface rounded-lg overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sim-surface-alt transition-colors"
        aria-expanded={isOpen}
        aria-controls="config-panel-body"
        aria-label="Toggle configuration panel"
      >
        <span className="text-base font-semibold text-sim-text">Configuration</span>
        <span
          className="text-sim-text-muted text-sm transition-transform duration-200"
          aria-hidden="true"
          style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {/* Body */}
      {isOpen && (
        <div
          id="config-panel-body"
          className="px-4 pb-4 space-y-4 border-t border-sim-border"
          role="region"
          aria-label="Configuration options"
        >
          {/* Road Priorities */}
          <fieldset className="space-y-2 mt-3">
            <legend className="text-sm font-medium text-sim-text-muted">
              Road Priorities (0–10)
            </legend>
            {ROADS.map((road) => {
              const currentValue = state.options.roadPriorities?.[road] ?? 1;
              const inputId = `priority-${road}`;
              return (
                <div key={road} className="flex items-center gap-3">
                  <label
                    htmlFor={inputId}
                    className="w-14 text-sm text-sim-text capitalize"
                  >
                    {road}
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={currentValue}
                    onChange={(e) => handlePriorityChange(road, e.target.value)}
                    className="w-20 bg-sim-surface-alt border border-sim-border rounded px-2 py-1 text-sm text-sim-text focus:outline-none focus:ring-2 focus:ring-traffic-green"
                    aria-label={`Priority weight for ${road} road`}
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={currentValue}
                  />
                  <span className="text-xs text-sim-text-dim flex-1">
                    {currentValue === 1 ? 'default' : currentValue > 1 ? 'boosted' : 'suppressed'}
                  </span>
                </div>
              );
            })}
          </fieldset>

          {/* Toggle Options */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-sim-text-muted">Options</legend>

            {/* Invariant Checks */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="toggle-invariants"
                className="text-sm text-sim-text cursor-pointer"
              >
                Enable Invariant Checks
              </label>
              <button
                id="toggle-invariants"
                role="switch"
                aria-checked={state.options.enableInvariantChecks ?? false}
                onClick={handleInvariantToggle}
                className={
                  state.options.enableInvariantChecks
                    ? 'relative inline-flex h-6 w-11 items-center rounded-full bg-traffic-green transition-colors focus:outline-none focus:ring-2 focus:ring-traffic-green focus:ring-offset-2 focus:ring-offset-sim-surface'
                    : 'relative inline-flex h-6 w-11 items-center rounded-full bg-sim-border transition-colors focus:outline-none focus:ring-2 focus:ring-traffic-green focus:ring-offset-2 focus:ring-offset-sim-surface'
                }
                aria-label="Toggle invariant checks"
              >
                <span
                  className={
                    state.options.enableInvariantChecks
                      ? 'inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform'
                      : 'inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform'
                  }
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Telemetry */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="toggle-telemetry"
                className="text-sm text-sim-text cursor-pointer"
              >
                Enable Telemetry
              </label>
              <button
                id="toggle-telemetry"
                role="switch"
                aria-checked={state.options.enableTelemetry ?? false}
                onClick={handleTelemetryToggle}
                className={
                  state.options.enableTelemetry
                    ? 'relative inline-flex h-6 w-11 items-center rounded-full bg-traffic-green transition-colors focus:outline-none focus:ring-2 focus:ring-traffic-green focus:ring-offset-2 focus:ring-offset-sim-surface'
                    : 'relative inline-flex h-6 w-11 items-center rounded-full bg-sim-border transition-colors focus:outline-none focus:ring-2 focus:ring-traffic-green focus:ring-offset-2 focus:ring-offset-sim-surface'
                }
                aria-label="Toggle telemetry collection"
              >
                <span
                  className={
                    state.options.enableTelemetry
                      ? 'inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform'
                      : 'inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform'
                  }
                  aria-hidden="true"
                />
              </button>
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
