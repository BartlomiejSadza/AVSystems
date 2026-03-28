import type { RenderContext } from '../types';
import { drawSprite } from '../sprites/draw-sprite';
import {
  CARS_BY_DIRECTION,
  AMBULANCE_NORTH,
  AMBULANCE_SOUTH,
  AMBULANCE_EAST,
  AMBULANCE_WEST,
} from '../sprites/vehicles';
import type { SpriteDefinition } from '../sprites/types';

// Vehicle direction mapping: vehicles in the north queue are approaching from
// the north, so they face south (toward the intersection).
const DIRECTION_MAP = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
} as const;

// Ambulance sprites keyed by the direction the vehicle faces.
const AMBULANCE_SPRITES: Record<string, SpriteDefinition> = {
  north: AMBULANCE_NORTH,
  south: AMBULANCE_SOUTH,
  east: AMBULANCE_EAST,
  west: AMBULANCE_WEST,
};

// Per-road queue configuration.
interface RoadConfig {
  maxVisible: number;
  slotX: (n: number) => number;
  slotY: (n: number) => number;
  axis: 'vertical' | 'horizontal';
}

const ROAD_CONFIG: Record<string, RoadConfig> = {
  north: {
    maxVisible: 8,
    slotX: (_n) => 154,
    slotY: (n) => 90 - n * 10,
    axis: 'vertical',
  },
  south: {
    maxVisible: 8,
    slotX: (_n) => 166,
    slotY: (n) => 130 + n * 10,
    axis: 'vertical',
  },
  west: {
    maxVisible: 6,
    slotX: (n) => 132 - n * 14,
    slotY: (_n) => 110,
    axis: 'horizontal',
  },
  east: {
    maxVisible: 6,
    slotX: (n) => 174 + n * 14,
    slotY: (_n) => 122,
    axis: 'horizontal',
  },
};

/** Deterministic hash of a vehicle ID string. Returns a non-negative integer. */
function hashVehicleId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Returns true when the vehicle ID indicates an emergency / ambulance vehicle. */
function isEmergency(vehicleId: string): boolean {
  const lower = vehicleId.toLowerCase();
  return lower.includes('emergency') || lower.includes('ambulance');
}

/** Compute the top-left anchor for a sprite centred on (cx, cy). */
function anchorFor(cx: number, cy: number, sprite: SpriteDefinition): { x: number; y: number } {
  return {
    x: Math.round(cx - sprite.width / 2),
    y: Math.round(cy - sprite.height / 2),
  };
}

export function drawVehicles(rc: RenderContext): void {
  const roads = ['north', 'south', 'east', 'west'] as const;

  for (const road of roads) {
    const queue = rc.simulationSnapshot.queues[road];
    const config = ROAD_CONFIG[road];

    // Both lookups are guaranteed since ROAD_CONFIG covers all four roads,
    // but we guard anyway to satisfy noUncheckedIndexedAccess.
    if (!config) continue;

    const facing = DIRECTION_MAP[road];
    const carVariants = CARS_BY_DIRECTION[facing];
    const ambulanceSprite = AMBULANCE_SPRITES[facing];

    if (!carVariants || !ambulanceSprite) continue;

    const visible = Math.min(queue.length, config.maxVisible);
    const overflow = queue.length - config.maxVisible;

    for (let slotIndex = 0; slotIndex < visible; slotIndex++) {
      const vehicleId = queue[slotIndex];
      if (vehicleId === undefined) continue;

      // Slot 0 is closest to the intersection; higher indices are further back.
      let cx: number;
      let cy: number;

      // Prefer an interpolated position from the animation state when available.
      const interpolated = rc.animationState.vehiclePositions.get(vehicleId);
      if (interpolated !== undefined) {
        cx = interpolated.x;
        cy = interpolated.y;
      } else {
        cx = config.slotX(slotIndex);
        cy = config.slotY(slotIndex);
      }

      if (isEmergency(vehicleId)) {
        // Animated ambulance: 2-frame blink driven by wall-clock time.
        const frameIndex = Math.floor(rc.time / 250) % 2;
        const anchor = anchorFor(cx, cy, ambulanceSprite);
        drawSprite(rc.ctx, ambulanceSprite, frameIndex, anchor.x, anchor.y);
      } else {
        // Normal car: deterministic colour, single frame.
        const colorIndex = hashVehicleId(vehicleId) % 4;
        const sprite = carVariants[colorIndex];
        if (!sprite) continue;
        const anchor = anchorFor(cx, cy, sprite);
        drawSprite(rc.ctx, sprite, 0, anchor.x, anchor.y);
      }
    }

    // Draw overflow indicator when more vehicles are waiting than the
    // max-visible limit.  We use a plain canvas text call here; a pixel-font
    // renderer can replace this later.
    if (overflow > 0) {
      const lastSlot = visible - 1;
      const baseX = config.slotX(lastSlot);
      const baseY = config.slotY(lastSlot);

      // Place the overflow text "beyond" the last visible slot in the queue
      // direction so it never overlaps or appears on the wrong side.
      //   north: vehicles go up (decreasing y) → text further up
      //   south: vehicles go down (increasing y) → text further down
      //   west:  vehicles go left (decreasing x) → text further left
      //   east:  vehicles go right (increasing x) → text further right
      let textX = baseX;
      let textY = baseY;
      if (road === 'north') {
        textY = baseY - 10;
      } else if (road === 'south') {
        textY = baseY + 10;
      } else if (road === 'west') {
        textX = baseX - 14;
      } else {
        // east
        textX = baseX + 14;
      }

      rc.ctx.save();
      rc.ctx.fillStyle = '#ffffff';
      rc.ctx.font = '5px monospace';
      rc.ctx.textAlign = 'center';
      rc.ctx.textBaseline = 'middle';
      rc.ctx.fillText(`+${overflow}`, textX, textY);
      rc.ctx.restore();
    }
  }
}
