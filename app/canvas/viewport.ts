import { GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE } from './constants';

/** Convert CSS mouse coordinates to game-pixel coordinates. */
export function cssToGame(
  cssX: number,
  cssY: number,
  canvasRect: DOMRect
): { gx: number; gy: number } {
  const scaleX = (GAME_WIDTH * PIXEL_SCALE) / canvasRect.width;
  const scaleY = (GAME_HEIGHT * PIXEL_SCALE) / canvasRect.height;
  const gx = Math.floor(((cssX - canvasRect.left) * scaleX) / PIXEL_SCALE);
  const gy = Math.floor(((cssY - canvasRect.top) * scaleY) / PIXEL_SCALE);
  return { gx, gy };
}

/** Convert game-pixel coordinates to CSS coordinates. */
export function gameToCSS(
  gx: number,
  gy: number,
  canvasRect: DOMRect
): { cssX: number; cssY: number } {
  const scaleX = canvasRect.width / (GAME_WIDTH * PIXEL_SCALE);
  const scaleY = canvasRect.height / (GAME_HEIGHT * PIXEL_SCALE);
  const cssX = gx * PIXEL_SCALE * scaleX + canvasRect.left;
  const cssY = gy * PIXEL_SCALE * scaleY + canvasRect.top;
  return { cssX, cssY };
}
