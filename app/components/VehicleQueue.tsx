'use client';

import { VehicleMarker } from './VehicleMarker';
import type { Road } from '../lib/simulation-adapter';

// Maximum number of vehicles to render per road (to avoid SVG clutter)
const MAX_VISIBLE = 5;

// Spacing between vehicles along the road arm
const VEHICLE_SPACING = 20;

/**
 * Compute positions for each vehicle in the queue along the road arm.
 * Vehicles are stacked approaching the intersection center.
 */
function getVehiclePositions(
  road: Road,
  count: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const visible = Math.min(count, MAX_VISIBLE);

  for (let i = 0; i < visible; i++) {
    // i=0 is the front of the queue (closest to intersection)
    const offset = 30 + i * VEHICLE_SPACING;
    switch (road) {
      case 'north':
        positions.push({ x: 290, y: 260 - offset });
        break;
      case 'south':
        positions.push({ x: 310, y: 340 + offset });
        break;
      case 'east':
        positions.push({ x: 340 + offset, y: 310 });
        break;
      case 'west':
        positions.push({ x: 260 - offset, y: 290 });
        break;
    }
  }

  return positions;
}

interface VehicleQueueProps {
  road: Road;
  vehicleIds: string[];
  emergencyVehicleIds?: Set<string>;
}

export function VehicleQueue({ road, vehicleIds, emergencyVehicleIds = new Set() }: VehicleQueueProps) {
  const positions = getVehiclePositions(road, vehicleIds.length);
  const overflow = vehicleIds.length - MAX_VISIBLE;

  // Badge position for overflow count
  const badgePos = (() => {
    switch (road) {
      case 'north': return { x: 310, y: 260 - 30 - (MAX_VISIBLE - 1) * VEHICLE_SPACING };
      case 'south': return { x: 330, y: 340 + 30 + (MAX_VISIBLE - 1) * VEHICLE_SPACING };
      case 'east':  return { x: 340 + 30 + (MAX_VISIBLE - 1) * VEHICLE_SPACING, y: 290 };
      case 'west':  return { x: 260 - 30 - (MAX_VISIBLE - 1) * VEHICLE_SPACING, y: 270 };
    }
  })();

  return (
    <g aria-label={`${road} queue: ${vehicleIds.length} vehicle${vehicleIds.length !== 1 ? 's' : ''}`}>
      {positions.map((pos, i) => {
        const vehicleId = vehicleIds[i] ?? `${road}-${i}`;
        return (
          <VehicleMarker
            key={vehicleId}
            x={pos.x}
            y={pos.y}
            vehicleId={vehicleId}
            isEmergency={emergencyVehicleIds.has(vehicleId)}
          />
        );
      })}
      {overflow > 0 && (
        <g aria-label={`+${overflow} more vehicles`}>
          <circle cx={badgePos.x} cy={badgePos.y} r={10} fill="#374151" stroke="#6B7280" strokeWidth={1} />
          <text
            x={badgePos.x}
            y={badgePos.y + 4}
            textAnchor="middle"
            fill="#F9FAFB"
            fontSize={9}
            fontFamily="monospace"
          >
            +{overflow}
          </text>
        </g>
      )}
    </g>
  );
}
