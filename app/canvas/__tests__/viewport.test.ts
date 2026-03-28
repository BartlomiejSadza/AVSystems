import { describe, it, expect } from 'vitest';
import { cssToGame, gameToCSS } from '../viewport';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE } from '../constants';

// Standard full-size canvas at origin
const standardRect = { left: 0, top: 0, width: 960, height: 720 } as DOMRect;

describe('cssToGame', () => {
  it('maps canvas center CSS coordinates to game center (160, 120)', () => {
    const cssCenterX = 960 / 2; // 480
    const cssCenterY = 720 / 2; // 360
    const { gx, gy } = cssToGame(cssCenterX, cssCenterY, standardRect);
    expect(gx).toBe(GAME_WIDTH / 2); // 160
    expect(gy).toBe(GAME_HEIGHT / 2); // 120
  });

  it('maps top-left corner (0, 0) to game (0, 0)', () => {
    const { gx, gy } = cssToGame(0, 0, standardRect);
    expect(gx).toBe(0);
    expect(gy).toBe(0);
  });

  it('handles non-zero left/top offsets in canvasRect', () => {
    const offsetRect = { left: 100, top: 50, width: 960, height: 720 } as DOMRect;
    // Click at CSS (100, 50) = canvas origin = game (0, 0)
    const { gx, gy } = cssToGame(100, 50, offsetRect);
    expect(gx).toBe(0);
    expect(gy).toBe(0);
  });

  it('handles non-zero offsets: center still maps to game center', () => {
    const offsetRect = { left: 100, top: 50, width: 960, height: 720 } as DOMRect;
    const cssCenterX = 100 + 960 / 2;
    const cssCenterY = 50 + 720 / 2;
    const { gx, gy } = cssToGame(cssCenterX, cssCenterY, offsetRect);
    expect(gx).toBe(GAME_WIDTH / 2);
    expect(gy).toBe(GAME_HEIGHT / 2);
  });

  it('handles CSS scaling: canvas displayed smaller than 960x720', () => {
    // Canvas displayed at half size (480x360), still represents full game
    const scaledRect = { left: 0, top: 0, width: 480, height: 360 } as DOMRect;
    // Center of scaled display should map to game center
    const { gx, gy } = cssToGame(240, 180, scaledRect);
    expect(gx).toBe(GAME_WIDTH / 2);
    expect(gy).toBe(GAME_HEIGHT / 2);
  });

  it('maps bottom-right boundary to near game bottom-right', () => {
    // cssX = 960, cssY = 720 maps to gx = 320, gy = 240 (outside game bounds)
    const { gx, gy } = cssToGame(960, 720, standardRect);
    expect(gx).toBe(GAME_WIDTH);
    expect(gy).toBe(GAME_HEIGHT);
  });
});

describe('gameToCSS', () => {
  it('is the inverse of cssToGame for the same canvasRect', () => {
    const gamePx = { gx: 100, gy: 80 };
    const { cssX, cssY } = gameToCSS(gamePx.gx, gamePx.gy, standardRect);
    const { gx, gy } = cssToGame(cssX, cssY, standardRect);
    expect(gx).toBe(gamePx.gx);
    expect(gy).toBe(gamePx.gy);
  });

  it('maps game (0, 0) to CSS top-left of canvas rect', () => {
    const { cssX, cssY } = gameToCSS(0, 0, standardRect);
    expect(cssX).toBe(0);
    expect(cssY).toBe(0);
  });

  it('maps game center to CSS canvas center', () => {
    const { cssX, cssY } = gameToCSS(GAME_WIDTH / 2, GAME_HEIGHT / 2, standardRect);
    expect(cssX).toBe(960 / 2);
    expect(cssY).toBe(720 / 2);
  });

  it('respects non-zero left/top offsets', () => {
    const offsetRect = { left: 100, top: 50, width: 960, height: 720 } as DOMRect;
    const { cssX, cssY } = gameToCSS(0, 0, offsetRect);
    expect(cssX).toBe(100);
    expect(cssY).toBe(50);
  });

  it('handles CSS scaling: maps game center to scaled CSS center', () => {
    const scaledRect = { left: 0, top: 0, width: 480, height: 360 } as DOMRect;
    const { cssX, cssY } = gameToCSS(GAME_WIDTH / 2, GAME_HEIGHT / 2, scaledRect);
    expect(cssX).toBe(240);
    expect(cssY).toBe(180);
  });
});
