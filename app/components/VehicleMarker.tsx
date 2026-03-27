'use client';

interface VehicleMarkerProps {
  x: number;
  y: number;
  vehicleId: string;
  isEmergency?: boolean;
}

export function VehicleMarker({ x, y, vehicleId, isEmergency = false }: VehicleMarkerProps) {
  const fill = isEmergency ? '#EAB308' : '#60A5FA';
  const stroke = isEmergency ? '#FDE047' : '#93C5FD';

  return (
    <g role="img" aria-label={`Vehicle ${vehicleId}${isEmergency ? ' (emergency)' : ''}`}>
      <rect
        x={x - 8}
        y={y - 4}
        width={16}
        height={8}
        rx={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
      />
    </g>
  );
}
