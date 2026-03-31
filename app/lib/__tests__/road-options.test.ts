import { describe, it, expect } from 'vitest';
import { ROAD_OPTIONS, DEFAULT_START_ROAD, DEFAULT_END_ROAD } from '../road-options';

describe('ROAD_OPTIONS', () => {
  it('should have exactly 4 elements', () => {
    expect(ROAD_OPTIONS).toHaveLength(4);
  });

  it('should map N label to north value', () => {
    const option = ROAD_OPTIONS.find((o) => o.label === 'N');
    expect(option).toBeDefined();
    expect(option?.value).toBe('north');
    expect(option?.fullLabel).toBe('North');
  });

  it('should map S label to south value', () => {
    const option = ROAD_OPTIONS.find((o) => o.label === 'S');
    expect(option).toBeDefined();
    expect(option?.value).toBe('south');
    expect(option?.fullLabel).toBe('South');
  });

  it('should map E label to east value', () => {
    const option = ROAD_OPTIONS.find((o) => o.label === 'E');
    expect(option).toBeDefined();
    expect(option?.value).toBe('east');
    expect(option?.fullLabel).toBe('East');
  });

  it('should map W label to west value', () => {
    const option = ROAD_OPTIONS.find((o) => o.label === 'W');
    expect(option).toBeDefined();
    expect(option?.value).toBe('west');
    expect(option?.fullLabel).toBe('West');
  });

  it('should contain all four cardinal directions as values', () => {
    const values = ROAD_OPTIONS.map((o) => o.value);
    expect(values).toContain('north');
    expect(values).toContain('south');
    expect(values).toContain('east');
    expect(values).toContain('west');
  });
});

describe('DEFAULT_START_ROAD and DEFAULT_END_ROAD', () => {
  it('should not be equal to each other', () => {
    expect(DEFAULT_START_ROAD).not.toBe(DEFAULT_END_ROAD);
  });

  it('DEFAULT_START_ROAD should be a valid road value', () => {
    const values = ROAD_OPTIONS.map((o) => o.value);
    expect(values).toContain(DEFAULT_START_ROAD);
  });

  it('DEFAULT_END_ROAD should be a valid road value', () => {
    const values = ROAD_OPTIONS.map((o) => o.value);
    expect(values).toContain(DEFAULT_END_ROAD);
  });
});
