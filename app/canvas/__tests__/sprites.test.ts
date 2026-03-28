import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PALETTE } from '../sprites/types';
import { drawSprite, createCachedSprite } from '../sprites/draw-sprite';
import type { SpriteDefinition } from '../sprites/types';

// Minimal 2x2 single-frame sprite: index 0 = transparent, 1 = black, 9 = red, 0 = transparent
const testSprite: SpriteDefinition = {
  name: 'test',
  width: 2,
  height: 2,
  frames: [
    [0, 1, 9, 0], // top-left transparent, top-right black, bottom-left red, bottom-right transparent
  ],
  frameDuration: 0,
};

describe('PALETTE', () => {
  it('has exactly 32 entries', () => {
    expect(PALETTE.length).toBe(32);
  });

  it('PALETTE[0] is transparent', () => {
    expect(PALETTE[0]).toBe('transparent');
  });

  it('all non-transparent entries are valid hex colors (#RRGGBB)', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (let i = 1; i < PALETTE.length; i++) {
      expect(PALETTE[i]).toMatch(hexPattern);
    }
  });
});

describe('drawSprite', () => {
  let ctx: CanvasRenderingContext2D;
  let fillRectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fillRectMock = vi.fn();
    ctx = {
      fillStyle: '',
      fillRect: fillRectMock,
    } as unknown as CanvasRenderingContext2D;
  });

  it('skips transparent pixels (colorIndex 0)', () => {
    drawSprite(ctx, testSprite, 0, 0, 0);
    // Frame is [0, 1, 9, 0]: 2 transparent, 2 non-transparent
    expect(fillRectMock).toHaveBeenCalledTimes(2);
  });

  it('calls fillRect for non-transparent pixels', () => {
    drawSprite(ctx, testSprite, 0, 5, 10);
    // pixel (1,0) = index 1 (black) -> fillRect(5+1, 10+0, 1, 1)
    // pixel (0,1) = index 9 (red)   -> fillRect(5+0, 10+1, 1, 1)
    expect(fillRectMock).toHaveBeenCalledWith(6, 10, 1, 1);
    expect(fillRectMock).toHaveBeenCalledWith(5, 11, 1, 1);
  });

  it('sets fillStyle to correct palette color before drawing', () => {
    const colorsSeen: string[] = [];
    ctx = {
      fillStyle: '',
      fillRect: vi.fn(function (this: { fillStyle: string }) {
        colorsSeen.push(this.fillStyle);
      }),
    } as unknown as CanvasRenderingContext2D;

    drawSprite(ctx, testSprite, 0, 0, 0);
    // Should have used PALETTE[1] and PALETTE[9]
    expect(colorsSeen).toContain(PALETTE[1]);
    expect(colorsSeen).toContain(PALETTE[9]);
  });

  it('wraps frameIndex using modulo when out of bounds', () => {
    const multiFrameSprite: SpriteDefinition = {
      name: 'multi',
      width: 1,
      height: 1,
      frames: [[1], [9]],
      frameDuration: 100,
    };
    const fillRect1 = vi.fn();
    const ctx1 = { fillStyle: '', fillRect: fillRect1 } as unknown as CanvasRenderingContext2D;
    drawSprite(ctx1, multiFrameSprite, 0, 0, 0);

    const fillRect2 = vi.fn();
    const ctx2 = { fillStyle: '', fillRect: fillRect2 } as unknown as CanvasRenderingContext2D;
    drawSprite(ctx2, multiFrameSprite, 2, 0, 0); // 2 % 2 = 0, same as frame 0

    expect(fillRect1).toHaveBeenCalledTimes(1);
    expect(fillRect2).toHaveBeenCalledTimes(1);
  });
});

describe('createCachedSprite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns an array with length equal to sprite.frames.length', () => {
    // Mock document.createElement for the offscreen canvas
    const mockPutImageData = vi.fn();
    const mockCreateImageData = vi.fn(() => ({
      data: new Uint8ClampedArray(testSprite.width * testSprite.height * 4),
    }));
    const mockOffCtx = {
      createImageData: mockCreateImageData,
      putImageData: mockPutImageData,
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockOffCtx),
    };

    const docMock = {
      createElement: vi.fn(() => mockCanvas),
    };
    vi.stubGlobal('document', docMock);

    const result = createCachedSprite(testSprite);
    expect(result).toHaveLength(testSprite.frames.length);
  });

  it('returns one canvas element per frame for a multi-frame sprite', () => {
    const multiFrameSprite: SpriteDefinition = {
      name: 'multi',
      width: 1,
      height: 1,
      frames: [[1], [9], [12]],
      frameDuration: 100,
    };

    const mockPutImageData = vi.fn();
    const mockCreateImageData = vi.fn(() => ({
      data: new Uint8ClampedArray(4),
    }));
    const mockOffCtx = {
      createImageData: mockCreateImageData,
      putImageData: mockPutImageData,
    };
    const mockCanvas = () => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockOffCtx),
    });

    const docMock = {
      createElement: vi.fn(() => mockCanvas()),
    };
    vi.stubGlobal('document', docMock);

    const result = createCachedSprite(multiFrameSprite);
    expect(result).toHaveLength(3);
  });
});
