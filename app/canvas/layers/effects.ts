import type { RenderContext } from '../types';
import { PALETTE } from '../sprites/types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

const PHASE_FLASH_MAX_OPACITY = 0.3;

export function drawOverlayEffects(rc: RenderContext): void {
  const { ctx } = rc;

  // Phase transition flash overlay
  if (rc.animationState.phaseFlashAlpha > 0) {
    const savedAlpha = ctx.globalAlpha;
    ctx.globalAlpha = rc.animationState.phaseFlashAlpha * PHASE_FLASH_MAX_OPACITY;
    ctx.fillStyle = PALETTE[8]!; // white flash
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.globalAlpha = savedAlpha;
  }

  const { particles } = rc.animationState;
  if (particles.length === 0) return;

  const savedAlpha = ctx.globalAlpha;

  for (const p of particles) {
    if (p.life <= 0) continue;
    const color = PALETTE[p.color];
    if (!color || color === 'transparent') continue;
    ctx.globalAlpha = Math.min(1, p.life);
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }

  ctx.globalAlpha = savedAlpha;
}
