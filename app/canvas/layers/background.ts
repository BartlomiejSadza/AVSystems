import type { RenderContext } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { PALETTE } from '../sprites/types';
import { drawSprite } from '../sprites/draw-sprite';
import { TREE_ROUND, TREE_POINTY } from '../sprites/environment';

let cache: HTMLCanvasElement | null = null;

export function drawBackground(rc: RenderContext): void {
  if (!cache) {
    cache = document.createElement('canvas');
    cache.width = GAME_WIDTH;
    cache.height = GAME_HEIGHT;
    const offCtx = cache.getContext('2d');
    if (!offCtx) throw new Error('Failed to get 2D context for background cache');
    renderBackground(offCtx);
  }
  rc.ctx.drawImage(cache, 0, 0);
}

function renderBackground(ctx: CanvasRenderingContext2D): void {
  // 1. Scene background fill — PALETTE[2] dark blue
  ctx.fillStyle = PALETTE[2]!;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 2. Grass quadrants
  const grassQuadrants: [number, number, number, number][] = [
    [0, 0, 132, 92], // NW
    [186, 0, 134, 92], // NE
    [0, 148, 132, 92], // SW
    [186, 148, 134, 92], // SE
  ];

  for (const [qx, qy, qw, qh] of grassQuadrants) {
    // Main fill with PALETTE[4] dark green
    ctx.fillStyle = PALETTE[4]!;
    ctx.fillRect(qx, qy, qw, qh);

    // Scattered PALETTE[20] variation: every 4th pixel on alternating rows
    ctx.fillStyle = PALETTE[20]!;
    for (let row = 0; row < qh; row++) {
      // Alternate the starting offset per row for a natural scattered look
      const offset = row % 2 === 0 ? 0 : 2;
      for (let col = offset; col < qw; col += 4) {
        ctx.fillRect(qx + col, qy + row, 1, 1);
      }
    }
  }

  // 3. Sidewalks — fill with PALETTE[19] sidewalk gray
  const sidewalkSegments: [number, number, number, number][] = [
    [132, 0, 8, 100], // North road, west side
    [180, 0, 8, 100], // North road, east side
    [132, 140, 8, 100], // South road, west side
    [180, 140, 8, 100], // South road, east side
    [0, 92, 140, 8], // West road, north side
    [0, 140, 140, 8], // West road, south side
    [180, 92, 140, 8], // East road, north side
    [180, 140, 140, 8], // East road, south side
  ];

  ctx.fillStyle = PALETTE[19]!;
  for (const [sx, sy, sw, sh] of sidewalkSegments) {
    ctx.fillRect(sx, sy, sw, sh);
  }

  // 4. Trees — drawn at frame 0 (static for the cached background)
  drawSprite(ctx, TREE_ROUND, 0, 90, 30); // Tree A
  drawSprite(ctx, TREE_POINTY, 0, 110, 50); // Tree B
  drawSprite(ctx, TREE_ROUND, 0, 250, 30); // Tree C
  drawSprite(ctx, TREE_POINTY, 0, 20, 170); // Tree D
  drawSprite(ctx, TREE_ROUND, 0, 220, 170); // Tree E
}
