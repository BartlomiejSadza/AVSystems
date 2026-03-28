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
const RED_LAMP_OFFSET = { dx: 1, dy: 2 } as const;
const AMBER_LAMP_OFFSET = { dx: 1, dy: 8 } as const;
const GREEN_LAMP_OFFSET = { dx: 1, dy: 14 } as const;

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
    x: 140,
    y: 80,
    facing: 'south',
    horizontal: false,
    pole: { x: 143, y: 100, length: 8, axis: 'y', dir: 1 },
    greenSprite: GREEN_LAMP_SOUTH,
  },
  {
    x: 174,
    y: 130,
    facing: 'north',
    horizontal: false,
    pole: { x: 177, y: 128, length: 8, axis: 'y', dir: -1 },
    greenSprite: GREEN_LAMP_NORTH,
  },
  {
    x: 124,
    y: 130,
    facing: 'east',
    horizontal: true,
    pole: { x: 122, y: 133, length: 8, axis: 'x', dir: -1 },
    greenSprite: GREEN_LAMP_EAST,
  },
  {
    x: 174,
    y: 96,
    facing: 'west',
    horizontal: true,
    pole: { x: 194, y: 99, length: 8, axis: 'x', dir: 1 },
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
 * Draw a horizontal housing (20×7) using fillRect.
 * PALETTE[23] is used for the housing frame, PALETTE[22] for the interior.
 */
function drawHorizontalHousing(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const frameColor = PALETTE[23]!;
  const offColor = PALETTE[22]!;
  const w = 20;
  const h = 7;

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
 * Draw a single horizontal lamp (5×5) inside the horizontal housing.
 * Lamp areas are spaced within the 20-wide housing:
 *   - Red:   cols 1-5   (dx=1)
 *   - Amber: cols 7-11  (dx=7)
 *   - Green: cols 13-17 (dx=13)
 * All lamps are vertically centred at dy=1 inside the 7-tall housing.
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
  drawSprite(ctx, redSprite, 0, x + 1, y + 1);

  // Amber lamp (always inactive)
  ctx.globalAlpha = 1.0;
  drawSprite(ctx, amberSprite, 0, x + 7, y + 1);

  // Green lamp
  ctx.globalAlpha = greenSprite === LAMP_INACTIVE ? 1.0 : glowIntensity;
  drawSprite(ctx, greenSprite, 0, x + 13, y + 1);

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
