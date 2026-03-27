'use client';

import type { PhaseId } from '../lib/simulation-adapter';
import type { Road } from '../lib/simulation-adapter';

// SVG traffic light positions per road (center of light circle)
export const LIGHT_POSITIONS: Record<Road, { cx: number; cy: number }> = {
  north: { cx: 300, cy: 220 },
  south: { cx: 300, cy: 380 },
  east: { cx: 380, cy: 300 },
  west: { cx: 220, cy: 300 },
};

// Which roads are green for each phase
const GREEN_ROADS: Record<PhaseId, readonly Road[]> = {
  NS_STRAIGHT: ['north', 'south'],
  EW_STRAIGHT: ['east', 'west'],
};

type LightState = 'green' | 'red' | 'off';

// Use explicit hex fills instead of dynamic class names for Tailwind v4 compatibility
const LIGHT_FILL: Record<LightState, string> = {
  green: '#22C55E',
  red: '#EF4444',
  off: '#374151',
};

const LIGHT_GLOW: Record<LightState, string> = {
  green: 'rgba(34,197,94,0.4)',
  red: 'rgba(239,68,68,0.4)',
  off: 'transparent',
};

interface TrafficLightProps {
  road: Road;
  activePhase: PhaseId | null;
}

export function TrafficLight({ road, activePhase }: TrafficLightProps) {
  const lightState: LightState =
    activePhase === null
      ? 'off'
      : GREEN_ROADS[activePhase].includes(road)
      ? 'green'
      : 'red';

  const pos = LIGHT_POSITIONS[road];
  const fill = LIGHT_FILL[lightState];
  const glow = LIGHT_GLOW[lightState];
  const label = `${road} traffic light: ${lightState}`;

  return (
    <g role="img" aria-label={label}>
      {/* Glow ring for active lights */}
      {lightState !== 'off' && (
        <circle
          cx={pos.cx}
          cy={pos.cy}
          r={16}
          fill={glow}
        />
      )}
      {/* Housing */}
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={10}
        fill="#1F2937"
        stroke="#4B5563"
        strokeWidth={1.5}
      />
      {/* Light bulb */}
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={7}
        fill={fill}
        aria-hidden="true"
      />
    </g>
  );
}
