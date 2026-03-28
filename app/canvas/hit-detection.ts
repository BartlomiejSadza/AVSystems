export interface HitZone {
  id: string;
  rect: { x: number; y: number; w: number; h: number };
  layer: string;
  getTooltip: () => string;
}

/** Find the topmost hit zone containing the given game-pixel coordinate.
 *  Iterates in reverse (last = highest z-order). Returns null on miss. */
export function findHitZone(zones: readonly HitZone[], gx: number, gy: number): HitZone | null {
  for (let i = zones.length - 1; i >= 0; i--) {
    const zone = zones[i]!;
    const { x, y, w, h } = zone.rect;
    if (gx >= x && gx < x + w && gy >= y && gy < y + h) {
      return zone;
    }
  }
  return null;
}
