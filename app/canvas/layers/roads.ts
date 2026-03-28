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
  ctx.fillRect(148, 16, 24, 88); // North arm
  ctx.fillRect(148, 128, 24, 96); // South arm
  ctx.fillRect(0, 104, 148, 24); // West arm
  ctx.fillRect(172, 104, 148, 24); // East arm

  // 2. Intersection box — light asphalt PALETTE[18] #3A3A44
  ctx.fillStyle = PALETTE[18]!;
  ctx.fillRect(148, 104, 24, 24);

  // 3. Center lane dividers — yellow PALETTE[11] #FFEC27, 1px wide, 3px dash every 6px
  ctx.fillStyle = PALETTE[11]!;

  // North road: vertical dashes at x=160, y=16 to y=104
  for (let y = 16; y < 104; y += 6) {
    ctx.fillRect(160, y, 1, 3);
  }

  // South road: vertical dashes at x=160, y=128 to y=224
  for (let y = 128; y < 224; y += 6) {
    ctx.fillRect(160, y, 1, 3);
  }

  // West road: horizontal dashes at y=116, x=0 to x=148
  for (let x = 0; x < 148; x += 6) {
    ctx.fillRect(x, 116, 3, 1);
  }

  // East road: horizontal dashes at y=116, x=172 to x=320
  for (let x = 172; x < 320; x += 6) {
    ctx.fillRect(x, 116, 3, 1);
  }

  // 4. Stop lines — white PALETTE[8] #FFF1E8, 1px thick
  ctx.fillStyle = PALETTE[8]!;
  ctx.fillRect(148, 103, 24, 1); // North approach (just above intersection)
  ctx.fillRect(148, 128, 24, 1); // South approach (just below intersection)
  ctx.fillRect(147, 104, 1, 24); // West approach
  ctx.fillRect(172, 104, 1, 24); // East approach

  // 5. Crosswalk stripes — white PALETTE[8], 2x6px stripes, 4 stripes per crosswalk, 2px gap
  ctx.fillStyle = PALETTE[8]!;

  // North crosswalk: 4 horizontal stripes above intersection, starting at y=99 going up
  // stripes at y=99, y=97, y=95, y=93 (2px stripe, 2px gap)
  for (let i = 0; i < 4; i++) {
    const y = 99 - i * 4;
    ctx.fillRect(148, y, 24, 2);
  }

  // South crosswalk: 4 horizontal stripes below intersection, starting at y=129 going down
  // stripes at y=129, y=133, y=137, y=141
  for (let i = 0; i < 4; i++) {
    const y = 129 + i * 4;
    ctx.fillRect(148, y, 24, 2);
  }

  // West crosswalk: 4 vertical stripes across road, starting at x=143 going left
  // stripes at x=143, x=139, x=135, x=131
  for (let i = 0; i < 4; i++) {
    const x = 143 - i * 4;
    ctx.fillRect(x, 104, 2, 24);
  }

  // East crosswalk: 4 vertical stripes across road, starting at x=173 going right
  // stripes at x=173, x=177, x=181, x=185
  for (let i = 0; i < 4; i++) {
    const x = 173 + i * 4;
    ctx.fillRect(x, 104, 2, 24);
  }

  // 6. Road edge lines — light grey PALETTE[7] #C2C3C7, 1px
  ctx.fillStyle = PALETTE[7]!;

  // North arm edges (vertical lines along left and right side of road)
  ctx.fillRect(148, 16, 1, 88); // North arm left edge
  ctx.fillRect(171, 16, 1, 88); // North arm right edge

  // South arm edges
  ctx.fillRect(148, 128, 1, 96); // South arm left edge
  ctx.fillRect(171, 128, 1, 96); // South arm right edge

  // West arm edges (horizontal lines along top and bottom of road)
  ctx.fillRect(0, 104, 148, 1); // West arm top edge
  ctx.fillRect(0, 127, 148, 1); // West arm bottom edge

  // East arm edges
  ctx.fillRect(172, 104, 148, 1); // East arm top edge
  ctx.fillRect(172, 127, 148, 1); // East arm bottom edge
}
