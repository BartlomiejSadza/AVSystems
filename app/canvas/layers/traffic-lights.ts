import type { RenderContext } from '../types';
import { PALETTE } from '../sprites/types';
import { drawSprite } from '../sprites/draw-sprite';
import {
  LIGHT_HOUSING,
  RED_LAMP_ACTIVE,
  GREEN_LAMP_NORTH,
  GREEN_LAMP_SOUTH,
  GREEN_LAMP_EAST,
  GREEN_LAMP_WEST,
  LAMP_INACTIVE,
  LIGHT_POLE,
} from '../sprites/traffic-lights';
import type { SpriteDefinition } from '../sprites/types';

// Lamp offsets relative to housing anchor (x offset, y offset)
const RED_LAMP_OFFSET = { dx: 2, dy: 2 } as const;
const AMBER_LAMP_OFFSET = { dx: 2, dy: 10 } as const;
const GREEN_LAMP_OFFSET = { dx: 2, dy: 18 } as const;

interface TrafficLightConfig {
  /** Housing anchor position */
  x: number;
  y: number;
  /** Facing direction of the light head (which direction traffic faces when stopped) */
  facing: 'north' | 'south' | 'east' | 'west';
  /** Whether this is a horizontal (E/W) light — affects housing drawing */
  horizontal: boolean;
  /** Pole direction: pixels to draw for the pole */
  pole: { x: number; y: number; length: number; axis: 'x' | 'y'; dir: 1 | -1 } | null;
  /** Green lamp sprite when active */
  greenSprite: SpriteDefinition;
}

const LIGHTS: TrafficLightConfig[] = [
  {
    x: 126, // NW corner — controls south-bound traffic
    y: 68,
    facing: 'south',
    horizontal: false,
    pole: { x: 131, y: 96, length: 10, axis: 'y', dir: 1 },
    greenSprite: GREEN_LAMP_SOUTH,
  },
  {
    x: 184, // SE corner — controls north-bound traffic
    y: 144,
    facing: 'north',
    horizontal: false,
    pole: { x: 189, y: 142, length: 10, axis: 'y', dir: -1 },
    greenSprite: GREEN_LAMP_NORTH,
  },
  {
    x: 108, // SW corner — controls east-bound traffic
    y: 144,
    facing: 'east',
    horizontal: true,
    pole: { x: 106, y: 149, length: 10, axis: 'x', dir: -1 },
    greenSprite: GREEN_LAMP_EAST,
  },
  {
    x: 184, // NE corner — controls west-bound traffic
    y: 86,
    facing: 'west',
    horizontal: true,
    pole: { x: 212, y: 91, length: 10, axis: 'x', dir: 1 },
    greenSprite: GREEN_LAMP_WEST,
  },
];

/** Determine if a given light facing direction should show green for the current phase. */
function isGreen(
  facing: TrafficLightConfig['facing'],
  phase: RenderContext['simulationSnapshot']['phase']
): boolean {
  if (phase === null) return false;
  if (phase === 'NS_STRAIGHT') return facing === 'south' || facing === 'north';
  if (phase === 'EW_STRAIGHT') return facing === 'east' || facing === 'west';
  return false;
}

/**
 * Draw a horizontal housing (28×10) using fillRect.
 * PALETTE[23] is used for the housing frame, PALETTE[22] for the interior.
 */
function drawHorizontalHousing(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const frameColor = PALETTE[23]!;
  const offColor = PALETTE[22]!;
  const w = 28;
  const h = 10;

  // Top and bottom border row
  ctx.fillStyle = frameColor;
  ctx.fillRect(x + 1, y, w - 2, 1); // top edge (skip corners)
  ctx.fillRect(x + 1, y + h - 1, w - 2, 1); // bottom edge

  // Left and right border columns
  ctx.fillRect(x, y + 1, 1, h - 2);
  ctx.fillRect(x + w - 1, y + 1, 1, h - 2);

  // Interior fill
  ctx.fillStyle = offColor;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}

/**
 * Draw a single horizontal lamp (7×7) inside the horizontal housing.
 * Lamp areas are spaced within the 28-wide housing:
 *   - Red:   (dx=2)
 *   - Amber: (dx=11)
 *   - Green: (dx=19)
 * All lamps are vertically positioned at dy=2 inside the 10-tall housing.
 */
function drawHorizontalLamps(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  redSprite: SpriteDefinition,
  amberSprite: SpriteDefinition,
  greenSprite: SpriteDefinition,
  glowIntensity: number
): void {
  // Red lamp
  ctx.globalAlpha = redSprite === LAMP_INACTIVE ? 1.0 : glowIntensity;
  drawSprite(ctx, redSprite, 0, x + 2, y + 2);

  // Amber lamp (always inactive)
  ctx.globalAlpha = 1.0;
  drawSprite(ctx, amberSprite, 0, x + 11, y + 2);

  // Green lamp
  ctx.globalAlpha = greenSprite === LAMP_INACTIVE ? 1.0 : glowIntensity;
  drawSprite(ctx, greenSprite, 0, x + 19, y + 2);

  ctx.globalAlpha = 1.0;
}

export function drawTrafficLights(rc: RenderContext): void {
  const { ctx, simulationSnapshot, animationState } = rc;
  const phase = simulationSnapshot.phase;
  const glowIntensity = 0.7 + 0.3 * Math.sin(animationState.lightGlowPhase);

  for (const light of LIGHTS) {
    ctx.save();

    const active = isGreen(light.facing, phase);
    // phase === null => all inactive; otherwise inactive facing gets RED
    const showRed = phase !== null && !active;
    const showGreen = active;

    const redSprite = showRed ? RED_LAMP_ACTIVE : LAMP_INACTIVE;
    const greenSprite = showGreen ? light.greenSprite : LAMP_INACTIVE;
    // Amber is always inactive (transitions not yet implemented)
    const amberSprite = LAMP_INACTIVE;

    // ── Draw pole ──────────────────────────────────────────────────────────
    if (light.pole !== null) {
      const { x: px, y: py, length, axis, dir } = light.pole;
      for (let i = 0; i < length; i++) {
        const poleX = axis === 'x' ? px + dir * i : px;
        const poleY = axis === 'y' ? py + dir * i : py;
        drawSprite(ctx, LIGHT_POLE, 0, poleX, poleY);
      }
    }

    if (light.horizontal) {
      // ── Horizontal housing (E/W lights) ───────────────────────────────
      drawHorizontalHousing(ctx, light.x, light.y);
      drawHorizontalLamps(
        ctx,
        light.x,
        light.y,
        redSprite,
        amberSprite,
        greenSprite,
        glowIntensity
      );
    } else {
      // ── Vertical housing (N/S lights) ─────────────────────────────────
      drawSprite(ctx, LIGHT_HOUSING, 0, light.x, light.y);

      // Red lamp
      ctx.globalAlpha = redSprite === LAMP_INACTIVE ? 1.0 : glowIntensity;
      drawSprite(ctx, redSprite, 0, light.x + RED_LAMP_OFFSET.dx, light.y + RED_LAMP_OFFSET.dy);

      // Amber lamp (always inactive, no glow)
      ctx.globalAlpha = 1.0;
      drawSprite(
        ctx,
        amberSprite,
        0,
        light.x + AMBER_LAMP_OFFSET.dx,
        light.y + AMBER_LAMP_OFFSET.dy
      );

      // Green lamp
      ctx.globalAlpha = greenSprite === LAMP_INACTIVE ? 1.0 : glowIntensity;
      drawSprite(
        ctx,
        greenSprite,
        0,
        light.x + GREEN_LAMP_OFFSET.dx,
        light.y + GREEN_LAMP_OFFSET.dy
      );

      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }
}
