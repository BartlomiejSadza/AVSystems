'use client';

import { TrafficLight } from './TrafficLight';
import { VehicleQueue } from './VehicleQueue';
import type { PhaseId, Road } from '../lib/simulation-adapter';
import { ROADS } from '../lib/simulation-adapter';

// Road arm geometry constants (matches ADR-GUI-003)
const ROAD_WIDTH = 80;
const CENTER_X = 260;
const CENTER_Y = 260;
const CENTER_SIZE = 80;
const VIEW_SIZE = 600;

interface IntersectionViewProps {
  activePhase: PhaseId | null;
  queues: Record<Road, string[]>;
  emergencyVehicleIds?: Set<string>;
}

export function IntersectionView({
  activePhase,
  queues,
  emergencyVehicleIds = new Set(),
}: IntersectionViewProps) {
  const phaseLabel =
    activePhase === 'NS_STRAIGHT'
      ? 'North-South green'
      : activePhase === 'EW_STRAIGHT'
      ? 'East-West green'
      : 'No active phase';

  const totalQueued = ROADS.reduce((sum, r) => sum + queues[r].length, 0);

  return (
    <figure
      className="flex flex-col items-center gap-2"
      aria-label="Traffic intersection visualization"
    >
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        height="100%"
        className="max-w-lg w-full"
        role="img"
        aria-label={`4-way intersection. Active phase: ${phaseLabel}. Total queued vehicles: ${totalQueued}`}
      >
        {/* Background */}
        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="#111827" />

        {/* Road arms — asphalt */}
        {/* North arm */}
        <rect
          x={CENTER_X}
          y={0}
          width={ROAD_WIDTH}
          height={CENTER_Y}
          fill="#1F2937"
          aria-hidden="true"
        />
        {/* South arm */}
        <rect
          x={CENTER_X}
          y={CENTER_Y + CENTER_SIZE}
          width={ROAD_WIDTH}
          height={VIEW_SIZE - CENTER_Y - CENTER_SIZE}
          fill="#1F2937"
          aria-hidden="true"
        />
        {/* East arm */}
        <rect
          x={CENTER_X + CENTER_SIZE}
          y={CENTER_Y}
          width={VIEW_SIZE - CENTER_X - CENTER_SIZE}
          height={ROAD_WIDTH}
          fill="#1F2937"
          aria-hidden="true"
        />
        {/* West arm */}
        <rect
          x={0}
          y={CENTER_Y}
          width={CENTER_X}
          height={ROAD_WIDTH}
          fill="#1F2937"
          aria-hidden="true"
        />

        {/* Center intersection box */}
        <rect
          x={CENTER_X}
          y={CENTER_Y}
          width={CENTER_SIZE}
          height={CENTER_SIZE}
          fill="#374151"
          aria-hidden="true"
        />

        {/* Road center lines (dashed) */}
        {/* North-South center line */}
        <line
          x1={CENTER_X + ROAD_WIDTH / 2}
          y1={0}
          x2={CENTER_X + ROAD_WIDTH / 2}
          y2={CENTER_Y}
          stroke="#4B5563"
          strokeWidth={2}
          strokeDasharray="12 8"
          aria-hidden="true"
        />
        <line
          x1={CENTER_X + ROAD_WIDTH / 2}
          y1={CENTER_Y + CENTER_SIZE}
          x2={CENTER_X + ROAD_WIDTH / 2}
          y2={VIEW_SIZE}
          stroke="#4B5563"
          strokeWidth={2}
          strokeDasharray="12 8"
          aria-hidden="true"
        />
        {/* East-West center line */}
        <line
          x1={0}
          y1={CENTER_Y + ROAD_WIDTH / 2}
          x2={CENTER_X}
          y2={CENTER_Y + ROAD_WIDTH / 2}
          stroke="#4B5563"
          strokeWidth={2}
          strokeDasharray="12 8"
          aria-hidden="true"
        />
        <line
          x1={CENTER_X + CENTER_SIZE}
          y1={CENTER_Y + ROAD_WIDTH / 2}
          x2={VIEW_SIZE}
          y2={CENTER_Y + ROAD_WIDTH / 2}
          stroke="#4B5563"
          strokeWidth={2}
          strokeDasharray="12 8"
          aria-hidden="true"
        />

        {/* Road border lines */}
        {/* North arm borders */}
        <line x1={CENTER_X} y1={0} x2={CENTER_X} y2={CENTER_Y} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        <line x1={CENTER_X + ROAD_WIDTH} y1={0} x2={CENTER_X + ROAD_WIDTH} y2={CENTER_Y} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        {/* South arm borders */}
        <line x1={CENTER_X} y1={CENTER_Y + CENTER_SIZE} x2={CENTER_X} y2={VIEW_SIZE} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        <line x1={CENTER_X + ROAD_WIDTH} y1={CENTER_Y + CENTER_SIZE} x2={CENTER_X + ROAD_WIDTH} y2={VIEW_SIZE} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        {/* East arm borders */}
        <line x1={CENTER_X + CENTER_SIZE} y1={CENTER_Y} x2={VIEW_SIZE} y2={CENTER_Y} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        <line x1={CENTER_X + CENTER_SIZE} y1={CENTER_Y + ROAD_WIDTH} x2={VIEW_SIZE} y2={CENTER_Y + ROAD_WIDTH} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        {/* West arm borders */}
        <line x1={0} y1={CENTER_Y} x2={CENTER_X} y2={CENTER_Y} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />
        <line x1={0} y1={CENTER_Y + ROAD_WIDTH} x2={CENTER_X} y2={CENTER_Y + ROAD_WIDTH} stroke="#4B5563" strokeWidth={1.5} aria-hidden="true" />

        {/* Road direction labels */}
        <text x={300} y={28} textAnchor="middle" fill="#9CA3AF" fontSize={14} fontFamily="sans-serif" aria-hidden="true">N</text>
        <text x={300} y={582} textAnchor="middle" fill="#9CA3AF" fontSize={14} fontFamily="sans-serif" aria-hidden="true">S</text>
        <text x={578} y={304} textAnchor="middle" fill="#9CA3AF" fontSize={14} fontFamily="sans-serif" aria-hidden="true">E</text>
        <text x={22} y={304} textAnchor="middle" fill="#9CA3AF" fontSize={14} fontFamily="sans-serif" aria-hidden="true">W</text>

        {/* Vehicle queues per road */}
        {ROADS.map(road => (
          <VehicleQueue
            key={road}
            road={road}
            vehicleIds={queues[road]}
            emergencyVehicleIds={emergencyVehicleIds}
          />
        ))}

        {/* Traffic lights */}
        {ROADS.map(road => (
          <TrafficLight
            key={road}
            road={road}
            activePhase={activePhase}
          />
        ))}

        {/* Center phase label */}
        <text
          x={CENTER_X + CENTER_SIZE / 2}
          y={CENTER_Y + CENTER_SIZE / 2 + 5}
          textAnchor="middle"
          fill="#6B7280"
          fontSize={10}
          fontFamily="monospace"
          aria-hidden="true"
        >
          {activePhase ?? '—'}
        </text>
      </svg>

      <figcaption className="text-sim-text-muted text-sm">
        Phase: <span className="font-mono text-sim-text">{phaseLabel}</span>
      </figcaption>
    </figure>
  );
}
