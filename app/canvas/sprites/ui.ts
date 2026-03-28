import type { SpriteDefinition } from './types';

// Palette indices used in this file:
// 0 = transparent
// 3 = dark purple (border)
// 8 = white (fill)

// ---------------------------------------------------------------------------
// Speech bubble 9-slice components
// ---------------------------------------------------------------------------

/** Top-left corner of a speech bubble (2x2). */
export const BUBBLE_CORNER_TL: SpriteDefinition = {
  name: 'BUBBLE_CORNER_TL',
  width: 2,
  height: 2,
  frames: [
    [
      0,
      3, // .3
      3,
      8, // 38
    ],
  ],
  frameDuration: 0,
};

/** Top-right corner of a speech bubble (2x2). */
export const BUBBLE_CORNER_TR: SpriteDefinition = {
  name: 'BUBBLE_CORNER_TR',
  width: 2,
  height: 2,
  frames: [
    [
      3,
      0, // 3.
      8,
      3, // 83
    ],
  ],
  frameDuration: 0,
};

/** Bottom-left corner of a speech bubble (2x2). */
export const BUBBLE_CORNER_BL: SpriteDefinition = {
  name: 'BUBBLE_CORNER_BL',
  width: 2,
  height: 2,
  frames: [
    [
      3,
      8, // 38
      0,
      3, // .3
    ],
  ],
  frameDuration: 0,
};

/** Bottom-right corner of a speech bubble (2x2). */
export const BUBBLE_CORNER_BR: SpriteDefinition = {
  name: 'BUBBLE_CORNER_BR',
  width: 2,
  height: 2,
  frames: [
    [
      8,
      3, // 83
      3,
      0, // 3.
    ],
  ],
  frameDuration: 0,
};

/** Horizontal border pixel for speech bubble top/bottom edges (1x1). Tile horizontally. */
export const BUBBLE_EDGE_H: SpriteDefinition = {
  name: 'BUBBLE_EDGE_H',
  width: 1,
  height: 1,
  frames: [[3]],
  frameDuration: 0,
};

/** Vertical border pixel for speech bubble left/right edges (1x1). Tile vertically. */
export const BUBBLE_EDGE_V: SpriteDefinition = {
  name: 'BUBBLE_EDGE_V',
  width: 1,
  height: 1,
  frames: [[3]],
  frameDuration: 0,
};

/** Interior fill pixel for speech bubble body (1x1). */
export const BUBBLE_FILL: SpriteDefinition = {
  name: 'BUBBLE_FILL',
  width: 1,
  height: 1,
  frames: [[8]],
  frameDuration: 0,
};

/**
 * Speech bubble tail pointing down (5x3).
 *
 * ```
 * 33333
 * .333.
 * ..3..
 * ```
 */
export const BUBBLE_ARROW_DOWN: SpriteDefinition = {
  name: 'BUBBLE_ARROW_DOWN',
  width: 5,
  height: 3,
  frames: [
    [
      3,
      3,
      3,
      3,
      3, // 33333
      0,
      3,
      3,
      3,
      0, // .333.
      0,
      0,
      3,
      0,
      0, // ..3..
    ],
  ],
  frameDuration: 0,
};

/**
 * Speech bubble tail pointing up (5x3).
 *
 * ```
 * ..3..
 * .333.
 * 33333
 * ```
 */
export const BUBBLE_ARROW_UP: SpriteDefinition = {
  name: 'BUBBLE_ARROW_UP',
  width: 5,
  height: 3,
  frames: [
    [
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      3,
      3,
      3,
      0, // .333.
      3,
      3,
      3,
      3,
      3, // 33333
    ],
  ],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// Direction indicators
// ---------------------------------------------------------------------------

/**
 * North (up) arrow (5x5).
 *
 * ```
 * ..3..
 * .333.
 * 33333
 * ..3..
 * ..3..
 * ```
 */
export const ARROW_NORTH: SpriteDefinition = {
  name: 'ARROW_NORTH',
  width: 5,
  height: 5,
  frames: [
    [
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      3,
      3,
      3,
      0, // .333.
      3,
      3,
      3,
      3,
      3, // 33333
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      0,
      3,
      0,
      0, // ..3..
    ],
  ],
  frameDuration: 0,
};

/**
 * South (down) arrow (5x5).
 *
 * ```
 * ..3..
 * ..3..
 * 33333
 * .333.
 * ..3..
 * ```
 */
export const ARROW_SOUTH: SpriteDefinition = {
  name: 'ARROW_SOUTH',
  width: 5,
  height: 5,
  frames: [
    [
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      0,
      3,
      0,
      0, // ..3..
      3,
      3,
      3,
      3,
      3, // 33333
      0,
      3,
      3,
      3,
      0, // .333.
      0,
      0,
      3,
      0,
      0, // ..3..
    ],
  ],
  frameDuration: 0,
};

/**
 * East (right) arrow (5x5).
 *
 * ```
 * ..3..
 * ..33.
 * 33333
 * ..33.
 * ..3..
 * ```
 */
export const ARROW_EAST: SpriteDefinition = {
  name: 'ARROW_EAST',
  width: 5,
  height: 5,
  frames: [
    [
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      0,
      3,
      3,
      0, // ..33.
      3,
      3,
      3,
      3,
      3, // 33333
      0,
      0,
      3,
      3,
      0, // ..33.
      0,
      0,
      3,
      0,
      0, // ..3..
    ],
  ],
  frameDuration: 0,
};

/**
 * West (left) arrow (5x5).
 *
 * ```
 * ..3..
 * .33..
 * 33333
 * .33..
 * ..3..
 * ```
 */
export const ARROW_WEST: SpriteDefinition = {
  name: 'ARROW_WEST',
  width: 5,
  height: 5,
  frames: [
    [
      0,
      0,
      3,
      0,
      0, // ..3..
      0,
      3,
      3,
      0,
      0, // .33..
      3,
      3,
      3,
      3,
      3, // 33333
      0,
      3,
      3,
      0,
      0, // .33..
      0,
      0,
      3,
      0,
      0, // ..3..
    ],
  ],
  frameDuration: 0,
};
