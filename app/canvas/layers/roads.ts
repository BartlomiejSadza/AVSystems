import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import type { RenderContext } from '../types';
import { PALETTE } from '../sprites/types';

let cache: HTMLCanvasElement | null = null;

export function drawRoads(rc: RenderContext): void {
  if (!cache) {
    cache = document.createElement('canvas');
    cache.width = GAME_WIDTH;
    cache.height = GAME_HEIGHT;
    const offCtx = cache.getContext('2d');
    if (!offCtx) throw new Error('Failed to get 2D context for roads cache');
    renderRoads(offCtx);
  }
  rc.ctx.drawImage(cache, 0, 0);
}

function renderRoads(ctx: CanvasRenderingContext2D): void {
  // 1. Road arms — dark asphalt PALETTE[17] #2C2C34
  ctx.fillStyle = PALETTE[17]!;
  ctx.fillRect(140, 0, 40, 100); // North arm
  ctx.fillRect(140, 140, 40, 100); // South arm
  ctx.fillRect(0, 100, 140, 40); // West arm
  ctx.fillRect(180, 100, 140, 40); // East arm

  // 2. Intersection box — light asphalt PALETTE[18] #3A3A44
  ctx.fillStyle = PALETTE[18]!;
  ctx.fillRect(140, 100, 40, 40);

  // 3. Center lane dividers — yellow PALETTE[11] #FFEC27, 1px wide, 3px dash every 6px
  ctx.fillStyle = PALETTE[11]!;

  // North road: vertical dashes at x=160, y=0 to y=100
  for (let y = 0; y < 100; y += 6) {
    ctx.fillRect(160, y, 1, 3);
  }

  // South road: vertical dashes at x=160, y=140 to y=240
  for (let y = 140; y < 240; y += 6) {
    ctx.fillRect(160, y, 1, 3);
  }

  // West road: horizontal dashes at y=120, x=0 to x=140
  for (let x = 0; x < 140; x += 6) {
    ctx.fillRect(x, 120, 3, 1);
  }

  // East road: horizontal dashes at y=120, x=180 to x=320
  for (let x = 180; x < 320; x += 6) {
    ctx.fillRect(x, 120, 3, 1);
  }

  // 4. Stop lines — white PALETTE[8] #FFF1E8, 1px thick
  ctx.fillStyle = PALETTE[8]!;
  ctx.fillRect(140, 99, 40, 1); // North approach
  ctx.fillRect(140, 140, 40, 1); // South approach
  ctx.fillRect(139, 100, 1, 40); // West approach
  ctx.fillRect(180, 100, 1, 40); // East approach

  // 5. Crosswalk stripes — white PALETTE[8], 2px stripes, 4 stripes per crosswalk, 4px apart
  ctx.fillStyle = PALETTE[8]!;

  // North crosswalk: horizontal stripes at y=95, 91, 87, 83
  ctx.fillRect(140, 95, 40, 2);
  ctx.fillRect(140, 91, 40, 2);
  ctx.fillRect(140, 87, 40, 2);
  ctx.fillRect(140, 83, 40, 2);

  // South crosswalk: horizontal stripes at y=141, 145, 149, 153
  ctx.fillRect(140, 141, 40, 2);
  ctx.fillRect(140, 145, 40, 2);
  ctx.fillRect(140, 149, 40, 2);
  ctx.fillRect(140, 153, 40, 2);

  // West crosswalk: vertical stripes at x=135, 131, 127, 123
  ctx.fillRect(135, 100, 2, 40);
  ctx.fillRect(131, 100, 2, 40);
  ctx.fillRect(127, 100, 2, 40);
  ctx.fillRect(123, 100, 2, 40);

  // East crosswalk: vertical stripes at x=181, 185, 189, 193
  ctx.fillRect(181, 100, 2, 40);
  ctx.fillRect(185, 100, 2, 40);
  ctx.fillRect(189, 100, 2, 40);
  ctx.fillRect(193, 100, 2, 40);

  // 6. Road edge lines — light grey PALETTE[7] #C2C3C7, 1px
  ctx.fillStyle = PALETTE[7]!;

  // North arm edges (vertical lines along left and right side of road)
  ctx.fillRect(140, 0, 1, 100); // North arm left edge
  ctx.fillRect(179, 0, 1, 100); // North arm right edge

  // South arm edges
  ctx.fillRect(140, 140, 1, 100); // South arm left edge
  ctx.fillRect(179, 140, 1, 100); // South arm right edge

  // West arm edges (horizontal lines along top and bottom of road)
  ctx.fillRect(0, 100, 140, 1); // West arm top edge
  ctx.fillRect(0, 139, 140, 1); // West arm bottom edge

  // East arm edges
  ctx.fillRect(180, 100, 140, 1); // East arm top edge
  ctx.fillRect(180, 139, 140, 1); // East arm bottom edge
}
