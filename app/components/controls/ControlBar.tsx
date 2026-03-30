'use client';

import React from 'react';
import { PixelButton } from './PixelButton';
import { SpeedSlider } from './SpeedSlider';
import { AddVehiclePanel } from './AddVehiclePanel';
import { useSimulationContext } from '../SimulationProvider';

/** Map the raw speed interval (ms) to a 1–10 slider value. */
function intervalToSlider(intervalMs: number): number {
  // state.speed is an interval in ms: 1000ms (slow) → 1, 100ms (fast) → 10
  const clamped = Math.max(100, Math.min(1000, intervalMs));
  return Math.round(11 - clamped / 100);
}

/** Map a 1–10 slider value back to a millisecond interval. */
function sliderToInterval(sliderValue: number): number {
  return (11 - sliderValue) * 100;
}

export function ControlBar() {
  const { state, dispatch } = useSimulationContext();

  const sliderValue = intervalToSlider(state.speed);

  return (
    <div className="w-full border-t-2 border-[#374151] bg-[#1D2B53]">
      <div className="max-w-[960px] mx-auto px-4 py-3">
        <div className="flex flex-wrap items-end gap-3 md:flex-nowrap md:items-center md:gap-4">
          {/* Left: action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <PixelButton
              label="Step"
              variant="primary"
              disabled={state.isPlaying}
              onClick={() => dispatch({ type: 'STEP' })}
            />
            <PixelButton
              label={state.isPlaying ? '\u23F8 Pause' : '\u25B6 Play'}
              variant="secondary"
              onClick={() => dispatch({ type: 'TOGGLE_AUTO_PLAY' })}
            />
            <PixelButton
              label="Reset"
              variant="danger"
              onClick={() => dispatch({ type: 'RESET' })}
            />
          </div>

          {/* Center: speed slider — 1 (slow/1000ms) to 10 (fast/100ms) */}
          <div className="w-full min-w-0 md:min-w-[120px] md:max-w-[200px] md:flex-1">
            <SpeedSlider
              value={sliderValue}
              onChange={(value) =>
                dispatch({ type: 'SET_SPEED', payload: sliderToInterval(value) })
              }
              min={1}
              max={10}
              label="Speed"
            />
          </div>

          {/* Right: add vehicle panel */}
          <div className="w-full md:ml-auto md:w-auto">
            <AddVehiclePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlBar;
