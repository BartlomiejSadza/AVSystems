import type { Road } from './simulation-adapter';

export interface RoadOption {
  value: Road;
  label: string;
  fullLabel: string;
}

export const ROAD_OPTIONS: RoadOption[] = [
  { value: 'north', label: 'N', fullLabel: 'North' },
  { value: 'south', label: 'S', fullLabel: 'South' },
  { value: 'east', label: 'E', fullLabel: 'East' },
  { value: 'west', label: 'W', fullLabel: 'West' },
];

export const DEFAULT_START_ROAD: Road = 'north';
export const DEFAULT_END_ROAD: Road = 'south';
