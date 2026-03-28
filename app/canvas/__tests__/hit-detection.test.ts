import { describe, it, expect } from 'vitest';
import { findHitZone } from '../hit-detection';
import type { HitZone } from '../hit-detection';

function makeZone(id: string, x: number, y: number, w: number, h: number, layer = 'base'): HitZone {
  return {
    id,
    rect: { x, y, w, h },
    layer,
    getTooltip: () => id,
  };
}

describe('findHitZone', () => {
  it('returns the zone when point is inside', () => {
    const zone = makeZone('a', 10, 20, 30, 40);
    const result = findHitZone([zone], 15, 25);
    expect(result).toBe(zone);
  });

  it('returns null when no zone matches', () => {
    const zone = makeZone('a', 10, 20, 30, 40);
    const result = findHitZone([zone], 5, 5);
    expect(result).toBeNull();
  });

  it('returns null for empty zones array', () => {
    expect(findHitZone([], 0, 0)).toBeNull();
  });

  it('when zones overlap, last zone (highest z-order) wins', () => {
    const zoneA = makeZone('a', 0, 0, 50, 50, 'layer1');
    const zoneB = makeZone('b', 10, 10, 30, 30, 'layer2');
    // Both zones contain point (20, 20). zoneB is last so it wins.
    const result = findHitZone([zoneA, zoneB], 20, 20);
    expect(result).toBe(zoneB);
  });

  it('when zones overlap but only first contains point, returns first', () => {
    const zoneA = makeZone('a', 0, 0, 50, 50, 'layer1');
    const zoneB = makeZone('b', 60, 60, 30, 30, 'layer2');
    // Only zoneA contains point (5, 5)
    const result = findHitZone([zoneA, zoneB], 5, 5);
    expect(result).toBe(zoneA);
  });

  it('edge of rect: point at (x, y) is inside', () => {
    const zone = makeZone('a', 10, 20, 30, 40);
    // Top-left corner — gx >= x && gy >= y
    const result = findHitZone([zone], 10, 20);
    expect(result).toBe(zone);
  });

  it('edge of rect: point at (x+w, y+h) is outside', () => {
    const zone = makeZone('a', 10, 20, 30, 40);
    // gx < x+w (10+30=40) is strict, so 40 is outside
    const result = findHitZone([zone], 40, 60);
    expect(result).toBeNull();
  });

  it('point at (x+w-1, y+h-1) is inside', () => {
    const zone = makeZone('a', 10, 20, 30, 40);
    // Last valid pixel
    const result = findHitZone([zone], 39, 59);
    expect(result).toBe(zone);
  });

  it('point just outside right edge is outside', () => {
    const zone = makeZone('a', 0, 0, 10, 10);
    expect(findHitZone([zone], 10, 5)).toBeNull();
  });

  it('point just outside bottom edge is outside', () => {
    const zone = makeZone('a', 0, 0, 10, 10);
    expect(findHitZone([zone], 5, 10)).toBeNull();
  });

  it('iterates in reverse order for z-order (last array element checked first)', () => {
    const zones: HitZone[] = [
      makeZone('bottom', 0, 0, 100, 100),
      makeZone('middle', 0, 0, 100, 100),
      makeZone('top', 0, 0, 100, 100),
    ];
    const result = findHitZone(zones, 50, 50);
    expect(result?.id).toBe('top');
  });
});
