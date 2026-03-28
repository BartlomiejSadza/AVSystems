import type { SpriteDefinition } from './types';
import { PALETTE } from './types';

const PALETTE_RGB = PALETTE.map((hex) => {
  if (hex === 'transparent') return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
});

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
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
      throw new Error(`Failed to get 2D context for sprite '${sprite.name}'`);
    }
    const imageData = offCtx.createImageData(sprite.width, sprite.height);
    const pixels = imageData.data;

    for (let i = 0; i < data.length; i++) {
      const colorIndex = data[i]!;
      const rgb = PALETTE_RGB[colorIndex];
      if (!rgb) continue;
      const offset = i * 4;
      pixels[offset] = rgb.r;
      pixels[offset + 1] = rgb.g;
      pixels[offset + 2] = rgb.b;
      pixels[offset + 3] = 255;
    }

    offCtx.putImageData(imageData, 0, 0);
    return offscreen;
  });
}
