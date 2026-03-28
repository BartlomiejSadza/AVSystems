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
    [0, 16, 142, 82], // NW
    [178, 16, 142, 82], // NE
    [0, 134, 142, 90], // SW
    [178, 134, 142, 90], // SE
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
    [142, 16, 6, 88], // North road, west side
    [172, 16, 6, 88], // North road, east side
    [142, 128, 6, 88], // South road, west side
    [172, 128, 6, 88], // South road, east side
    [0, 98, 148, 6], // West road, north side
    [0, 128, 148, 6], // West road, south side
    [172, 98, 148, 6], // East road, north side
    [172, 128, 148, 6], // East road, south side
  ];

  ctx.fillStyle = PALETTE[19]!;
  for (const [sx, sy, sw, sh] of sidewalkSegments) {
    ctx.fillRect(sx, sy, sw, sh);
  }

  // 4. Trees — drawn at frame 0 (static for the cached background)
  drawSprite(ctx, TREE_ROUND, 0, 100, 40); // Tree A
  drawSprite(ctx, TREE_POINTY, 0, 120, 50); // Tree B
  drawSprite(ctx, TREE_ROUND, 0, 260, 40); // Tree C
  drawSprite(ctx, TREE_POINTY, 0, 20, 160); // Tree D
  drawSprite(ctx, TREE_ROUND, 0, 220, 160); // Tree E
}
