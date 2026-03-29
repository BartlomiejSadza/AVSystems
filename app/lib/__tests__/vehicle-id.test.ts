import { describe, it, expect, beforeEach } from 'vitest';
import { generateVehicleId, resetVehicleIdCounter } from '../vehicle-id';

describe('vehicle-id', () => {
  beforeEach(() => {
    resetVehicleIdCounter();
  });

  it('returns V001 on the first call', () => {
    expect(generateVehicleId()).toBe('V001');
  });

  it('returns V002 on the second call', () => {
    generateVehicleId(); // V001
    expect(generateVehicleId()).toBe('V002');
  });

  it('increments sequentially on every call', () => {
    expect(generateVehicleId()).toBe('V001');
    expect(generateVehicleId()).toBe('V002');
    expect(generateVehicleId()).toBe('V003');
  });

  it('resets to V001 after resetVehicleIdCounter', () => {
    generateVehicleId(); // V001
    generateVehicleId(); // V002
    resetVehicleIdCounter();
    expect(generateVehicleId()).toBe('V001');
  });

  it('always formats as V followed by exactly 3 zero-padded digits', () => {
    for (let i = 0; i < 9; i++) {
      const id = generateVehicleId();
      expect(id).toMatch(/^V\d{3}$/);
    }
  });

  it('zero-pads single-digit numbers (V001 not V1)', () => {
    const id = generateVehicleId();
    expect(id).toBe('V001');
    expect(id).not.toBe('V1');
  });

  it('handles numbers above 9 with correct zero-padding', () => {
    for (let i = 0; i < 9; i++) generateVehicleId(); // V001–V009
    expect(generateVehicleId()).toBe('V010');
  });

  it('handles numbers above 99 with no extra padding needed', () => {
    for (let i = 0; i < 99; i++) generateVehicleId(); // V001–V099
    expect(generateVehicleId()).toBe('V100');
  });
});
