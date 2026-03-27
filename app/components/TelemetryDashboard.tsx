'use client';

import { useSimulationContext } from './SimulationProvider';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div
      className="bg-sim-surface-alt rounded-lg p-3 flex flex-col gap-1"
      role="group"
      aria-label={label}
    >
      <span className="text-xs text-sim-text-muted uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-sim-text font-mono">{value}</span>
      {description && <span className="text-xs text-sim-text-dim">{description}</span>}
    </div>
  );
}

export function TelemetryDashboard() {
  const { state } = useSimulationContext();

  if (!state.options.enableTelemetry) {
    return null;
  }

  const telemetry = state.telemetry;

  if (!telemetry) {
    return (
      <div className="bg-sim-surface rounded-lg p-4">
        <h2 className="text-base font-semibold text-sim-text mb-3">Telemetry</h2>
        <p className="text-sm text-sim-text-muted">Run a simulation step to see telemetry data.</p>
      </div>
    );
  }

  const nsSteps = telemetry.phaseDistribution.NS_STRAIGHT ?? 0;
  const ewSteps = telemetry.phaseDistribution.EW_STRAIGHT ?? 0;
  const totalPhaseSteps = nsSteps + ewSteps;
  const nsPercent = totalPhaseSteps > 0 ? Math.round((nsSteps / totalPhaseSteps) * 100) : 0;
  const ewPercent = totalPhaseSteps > 0 ? 100 - nsPercent : 0;

  const avgQueue = telemetry.averageQueueLength.toFixed(2);

  return (
    <div className="bg-sim-surface rounded-lg p-4" role="region" aria-label="Telemetry dashboard">
      <h2 className="text-base font-semibold text-sim-text mb-3">Telemetry</h2>

      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Total Steps"
          value={telemetry.totalSteps}
          description="step commands executed"
        />
        <StatCard
          label="Vehicles Processed"
          value={telemetry.totalVehiclesProcessed}
          description="left the intersection"
        />
        <StatCard
          label="Avg Queue Length"
          value={avgQueue}
          description="vehicles per road per step"
        />
        <div
          className="bg-sim-surface-alt rounded-lg p-3 flex flex-col gap-1"
          role="group"
          aria-label="Phase distribution"
        >
          <span className="text-xs text-sim-text-muted uppercase tracking-wide">
            Phase Distribution
          </span>
          <div className="flex gap-2 items-end">
            <span className="text-lg font-semibold text-traffic-green font-mono">
              NS {nsPercent}%
            </span>
            <span className="text-sim-text-dim text-sm">/</span>
            <span className="text-lg font-semibold text-traffic-yellow font-mono">
              EW {ewPercent}%
            </span>
          </div>
          <div
            className="w-full h-1.5 bg-sim-border rounded overflow-hidden mt-1"
            role="progressbar"
            aria-label={`NS phase ${nsPercent}%, EW phase ${ewPercent}%`}
            aria-valuenow={nsPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-traffic-green transition-all duration-300"
              style={{ width: `${nsPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-sim-text-dim mt-0.5">
            <span>NS ({nsSteps} steps)</span>
            <span>EW ({ewSteps} steps)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
