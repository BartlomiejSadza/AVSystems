'use client';

import { useSimulationContext } from './SimulationProvider';

export function ControlPanel() {
  const { state, dispatch } = useSimulationContext();

  const handleStep = () => dispatch({ type: 'STEP' });
  const handleTogglePlay = () => dispatch({ type: 'TOGGLE_AUTO_PLAY' });
  const handleReset = () => {
    if (window.confirm('Reset simulation? All data will be lost.')) {
      dispatch({ type: 'RESET' });
    }
  };
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SPEED', payload: Number(e.target.value) });
  };

  return (
    <div
      className="bg-sim-surface rounded-lg p-4 space-y-3"
      role="toolbar"
      aria-label="Simulation controls"
    >
      <h2 className="text-base font-semibold text-sim-text">Controls</h2>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleStep}
          disabled={state.isPlaying}
          className="px-4 py-2 bg-traffic-green text-sim-base font-medium rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          aria-label="Execute one simulation step"
        >
          Step
        </button>
        <button
          onClick={handleTogglePlay}
          className={
            state.isPlaying
              ? 'px-4 py-2 bg-traffic-yellow text-sim-base font-medium rounded hover:opacity-90 transition-opacity'
              : 'px-4 py-2 bg-sim-surface-alt text-sim-text font-medium rounded hover:bg-sim-border transition-colors'
          }
          aria-label={state.isPlaying ? 'Pause auto-play' : 'Start auto-play'}
          aria-pressed={state.isPlaying}
        >
          {state.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-traffic-red/20 text-traffic-red font-medium rounded hover:bg-traffic-red/30 transition-colors"
          aria-label="Reset simulation"
        >
          Reset
        </button>
      </div>
      <div className="space-y-1">
        <label htmlFor="speed-slider" className="text-sm text-sim-text-muted block">
          Speed: {state.speed}ms
        </label>
        <input
          id="speed-slider"
          type="range"
          min={100}
          max={2000}
          step={100}
          value={state.speed}
          onChange={handleSpeedChange}
          className="w-full accent-traffic-green"
          role="slider"
          aria-valuemin={100}
          aria-valuemax={2000}
          aria-valuenow={state.speed}
          aria-label="Auto-play speed in milliseconds"
        />
        <div className="flex justify-between text-xs text-sim-text-dim" aria-hidden="true">
          <span>100ms</span>
          <span>2000ms</span>
        </div>
      </div>
    </div>
  );
}
