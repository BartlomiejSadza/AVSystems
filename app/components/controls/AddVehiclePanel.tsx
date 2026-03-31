'use client';

import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { PixelSelect } from './PixelSelect';
import { useSimulationContext } from '../SimulationProvider';
import { generateVehicleId } from '../../lib/vehicle-id';
import type { Road } from '../../lib/simulation-adapter';

const ROAD_SELECT_OPTIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
];

interface QuickSpec {
  label: string;
  startRoad: Road;
  endRoad: Road;
  variant: 'primary' | 'secondary' | 'danger';
}

const QUICK_SPECS: QuickSpec[] = [
  { label: 'N', startRoad: 'north', endRoad: 'south', variant: 'secondary' },
  { label: 'S', startRoad: 'south', endRoad: 'north', variant: 'secondary' },
  { label: 'E', startRoad: 'east', endRoad: 'west', variant: 'secondary' },
  { label: 'W', startRoad: 'west', endRoad: 'east', variant: 'secondary' },
];

export function AddVehiclePanel() {
  const { dispatch } = useSimulationContext();

  const [startRoad, setStartRoad] = useState<Road>('north');
  const [endRoad, setEndRoad] = useState<Road>('south');

  const isValid = startRoad !== endRoad;

  function handleAdd() {
    if (!isValid) return;
    const vehicleId = generateVehicleId();
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        vehicleId,
        startRoad,
        endRoad,
        priority: 'normal',
      },
    });
  }

  function handleQuickAdd(spec: QuickSpec) {
    const vehicleId = generateVehicleId();
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        vehicleId,
        startRoad: spec.startRoad,
        endRoad: spec.endRoad,
      },
    });
  }

  function handleSos() {
    const vehicleId = generateVehicleId();
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        vehicleId,
        startRoad,
        endRoad: endRoad !== startRoad ? endRoad : startRoad === 'north' ? 'south' : 'north',
        priority: 'emergency',
      },
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <span className="font-[family-name:var(--font-pixel)] text-[8px] uppercase tracking-widest text-[#9ca3af]">
        Add Vehicle
      </span>

      {/* FROM / TO selectors + SOS + ADD */}
      <div className="flex flex-wrap items-end gap-2 md:flex-nowrap">
        <div className="min-w-[96px]">
          <PixelSelect
            options={ROAD_SELECT_OPTIONS}
            value={startRoad}
            onChange={(v) => setStartRoad(v as Road)}
            label="From"
            size="sm"
          />
        </div>
        <div className="min-w-[96px]">
          <PixelSelect
            options={ROAD_SELECT_OPTIONS}
            value={endRoad}
            onChange={(v) => setEndRoad(v as Road)}
            label="To"
            size="sm"
          />
        </div>
        <PixelButton
          label="SOS"
          variant="danger"
          onClick={handleSos}
          className="px-2 py-1 text-[10px]"
        />
        <PixelButton
          label="ADD"
          variant="primary"
          onClick={handleAdd}
          disabled={!isValid}
          className="px-2 py-1 text-[10px]"
        />
      </div>

      {/* Quick-add directional buttons */}
      <div className="flex flex-wrap items-center gap-1 md:flex-nowrap">
        {QUICK_SPECS.map((spec) => (
          <PixelButton
            key={spec.label}
            label={spec.label}
            variant={spec.variant}
            onClick={() => handleQuickAdd(spec)}
            className="px-2 py-1 text-[10px]"
          />
        ))}
      </div>
    </div>
  );
}

export default AddVehiclePanel;
