import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PIXEL_SCALE,
  CANVAS_CSS_WIDTH,
  CANVAS_CSS_HEIGHT,
  TARGET_FPS,
  FRAME_BUDGET_MS,
} from '../constants';

describe('canvas constants', () => {
  it('GAME_WIDTH is 320', () => {
    expect(GAME_WIDTH).toBe(320);
  });

  it('GAME_HEIGHT is 240', () => {
    expect(GAME_HEIGHT).toBe(240);
  });

  it('PIXEL_SCALE is 3', () => {
    expect(PIXEL_SCALE).toBe(3);
  });

  it('CANVAS_CSS_WIDTH is 960', () => {
    expect(CANVAS_CSS_WIDTH).toBe(960);
  });

  it('CANVAS_CSS_HEIGHT is 720', () => {
    expect(CANVAS_CSS_HEIGHT).toBe(720);
  });

  it('TARGET_FPS is 30', () => {
    expect(TARGET_FPS).toBe(30);
  });

  it('FRAME_BUDGET_MS is approximately 33.33', () => {
    expect(FRAME_BUDGET_MS).toBeCloseTo(33.33, 1);
  });

  it('CANVAS_CSS_WIDTH equals GAME_WIDTH * PIXEL_SCALE', () => {
    expect(CANVAS_CSS_WIDTH).toBe(GAME_WIDTH * PIXEL_SCALE);
  });

  it('CANVAS_CSS_HEIGHT equals GAME_HEIGHT * PIXEL_SCALE', () => {
    expect(CANVAS_CSS_HEIGHT).toBe(GAME_HEIGHT * PIXEL_SCALE);
  });

  it('FRAME_BUDGET_MS equals 1000 / TARGET_FPS', () => {
    expect(FRAME_BUDGET_MS).toBe(1000 / TARGET_FPS);
  });
});
