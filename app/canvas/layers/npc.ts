import type { RenderContext } from '../types';
import { drawSprite } from '../sprites/draw-sprite';
import { OFFICER_IDLE } from '../sprites/npc';

const NPC_X = 4;
const NPC_Y = 196;

export function drawNpc(rc: RenderContext): void {
  const frameIndex = rc.animationState.npcFrame % OFFICER_IDLE.frames.length;
  drawSprite(rc.ctx, OFFICER_IDLE, frameIndex, NPC_X, NPC_Y);
}
