'use client';

import { useRef, useState } from 'react';
import { useSimulationContext } from './SimulationProvider';
import type { Road, VehiclePriority } from '../lib/simulation-adapter';

const ROADS: Road[] = ['north', 'south', 'east', 'west'];

interface FormState {
  vehicleId: string;
  startRoad: Road;
  endRoad: Road;
  priority: VehiclePriority;
}

interface FormErrors {
  vehicleId?: string;
  roads?: string;
}

const DEFAULT_FORM: FormState = {
  vehicleId: '',
  startRoad: 'north',
  endRoad: 'south',
  priority: 'normal',
};

export function AddVehicleForm() {
  const { dispatch } = useSimulationContext();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const vehicleIdRef = useRef<HTMLInputElement>(null);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.vehicleId.trim()) {
      errs.vehicleId = 'Vehicle ID is required.';
    }
    if (form.startRoad === form.endRoad) {
      errs.roads = 'Start and end roads must be different.';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        vehicleId: form.vehicleId.trim(),
        startRoad: form.startRoad,
        endRoad: form.endRoad,
        priority: form.priority,
      },
    });
    setForm(DEFAULT_FORM);
    vehicleIdRef.current?.focus();
  };

  const handleChange =
    <K extends keyof FormState>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value as FormState[K] }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="bg-sim-surface rounded-lg p-4">
      <h2 className="text-base font-semibold text-sim-text mb-3">Add Vehicle</h2>
      <form onSubmit={handleSubmit} noValidate aria-label="Add vehicle form">
        <div className="space-y-3">
          {/* Vehicle ID */}
          <div>
            <label
              htmlFor="vehicle-id"
              className="block text-sm text-sim-text-muted mb-1"
            >
              Vehicle ID
            </label>
            <input
              ref={vehicleIdRef}
              id="vehicle-id"
              type="text"
              value={form.vehicleId}
              onChange={handleChange('vehicleId')}
              placeholder="e.g. V1, BUS-42"
              className="w-full bg-sim-surface-alt border border-sim-border rounded px-3 py-1.5 text-sm text-sim-text placeholder-sim-text-dim focus:outline-none focus:ring-2 focus:ring-traffic-green"
              aria-required="true"
              aria-invalid={!!errors.vehicleId}
              aria-describedby={errors.vehicleId ? 'vehicle-id-error' : undefined}
              autoComplete="off"
            />
            {errors.vehicleId && (
              <p
                id="vehicle-id-error"
                className="mt-1 text-xs text-traffic-red"
                role="alert"
              >
                {errors.vehicleId}
              </p>
            )}
          </div>

          {/* Start Road */}
          <div>
            <label
              htmlFor="start-road"
              className="block text-sm text-sim-text-muted mb-1"
            >
              Start Road
            </label>
            <select
              id="start-road"
              value={form.startRoad}
              onChange={handleChange('startRoad')}
              className="w-full bg-sim-surface-alt border border-sim-border rounded px-3 py-1.5 text-sm text-sim-text focus:outline-none focus:ring-2 focus:ring-traffic-green"
              aria-invalid={!!errors.roads}
            >
              {ROADS.map((road) => (
                <option key={road} value={road}>
                  {road.charAt(0).toUpperCase() + road.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* End Road */}
          <div>
            <label
              htmlFor="end-road"
              className="block text-sm text-sim-text-muted mb-1"
            >
              End Road
            </label>
            <select
              id="end-road"
              value={form.endRoad}
              onChange={handleChange('endRoad')}
              className="w-full bg-sim-surface-alt border border-sim-border rounded px-3 py-1.5 text-sm text-sim-text focus:outline-none focus:ring-2 focus:ring-traffic-green"
              aria-invalid={!!errors.roads}
              aria-describedby={errors.roads ? 'roads-error' : undefined}
            >
              {ROADS.map((road) => (
                <option key={road} value={road}>
                  {road.charAt(0).toUpperCase() + road.slice(1)}
                </option>
              ))}
            </select>
            {errors.roads && (
              <p
                id="roads-error"
                className="mt-1 text-xs text-traffic-red"
                role="alert"
              >
                {errors.roads}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm text-sim-text-muted mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              value={form.priority}
              onChange={handleChange('priority')}
              className="w-full bg-sim-surface-alt border border-sim-border rounded px-3 py-1.5 text-sm text-sim-text focus:outline-none focus:ring-2 focus:ring-traffic-green"
              aria-label="Vehicle priority"
            >
              <option value="normal">Normal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-traffic-green text-sim-base font-medium rounded hover:opacity-90 transition-opacity"
            aria-label="Add vehicle to simulation"
          >
            Add Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
