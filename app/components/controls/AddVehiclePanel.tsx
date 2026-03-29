'use client';

import React from 'react';
import { PixelButton } from './PixelButton';
import { useSimulationContext } from '../SimulationProvider';
import { generateVehicleId } from '../../lib/vehicle-id';
import type { Road } from '../../lib/simulation-adapter';

interface VehicleSpec {
  label: string;
  startRoad: Road;
  endRoad: Road;
  priority?: 'normal' | 'emergency';
  variant: 'primary' | 'secondary' | 'danger';
}

const VEHICLE_SPECS: VehicleSpec[] = [
  { label: 'N', startRoad: 'north', endRoad: 'south', variant: 'secondary' },
  { label: 'S', startRoad: 'south', endRoad: 'north', variant: 'secondary' },
  { label: 'E', startRoad: 'east', endRoad: 'west', variant: 'secondary' },
  { label: 'W', startRoad: 'west', endRoad: 'east', variant: 'secondary' },
  {
    label: 'SOS',
    startRoad: 'north',
    endRoad: 'south',
    priority: 'emergency',
    variant: 'danger',
  },
];

export function AddVehiclePanel() {
  const { dispatch } = useSimulationContext();

  function handleAdd(spec: VehicleSpec) {
    const vehicleId = generateVehicleId();
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        vehicleId,
        startRoad: spec.startRoad,
        endRoad: spec.endRoad,
        ...(spec.priority !== undefined ? { priority: spec.priority } : {}),
      },
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-[family-name:var(--font-pixel)] text-[8px] uppercase tracking-widest text-[#9ca3af]">
        Add Vehicle
      </span>
      <div className="flex items-center gap-1">
        {VEHICLE_SPECS.map((spec) => (
          <PixelButton
            key={spec.label}
            label={spec.label}
            variant={spec.variant}
            onClick={() => handleAdd(spec)}
            className="px-2 py-1 text-[10px]"
          />
        ))}
      </div>
    </div>
  );
}

export default AddVehiclePanel;
