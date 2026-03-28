import type { SpriteDefinition } from './types';
import { PALETTE } from './types';

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteDefinition,
  frameIndex: number,
  x: number,
  y: number
): void {
  const data = sprite.frames[frameIndex % sprite.frames.length]!;
  for (let py = 0; py < sprite.height; py++) {
    for (let px = 0; px < sprite.width; px++) {
      const colorIndex = data[py * sprite.width + px]!;
      if (colorIndex === 0) continue;
      ctx.fillStyle = PALETTE[colorIndex]!;
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
}

/** Pre-render sprite frames to offscreen canvases for fast blitting. */
export function createCachedSprite(sprite: SpriteDefinition): HTMLCanvasElement[] {
  return sprite.frames.map((data) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = sprite.width;
    offscreen.height = sprite.height;
    const offCtx = offscreen.getContext('2d')!;
    const imageData = offCtx.createImageData(sprite.width, sprite.height);
    const pixels = imageData.data;

    for (let i = 0; i < data.length; i++) {
      const colorIndex = data[i]!;
      if (colorIndex === 0) continue;
      const hex = PALETTE[colorIndex]!;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const offset = i * 4;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = 255;
    }

    offCtx.putImageData(imageData, 0, 0);
    return offscreen;
  });
}
