import type { SpriteDefinition } from './types';

// ---------------------------------------------------------------------------
// GRASS_TILE  8x8  static
// Index 4 = dark green (#008751), Index 20 = dark grass shadow (#065E38)
// Natural-looking variation: diagonal shadow strips drift across rows.
// ---------------------------------------------------------------------------
export const GRASS_TILE: SpriteDefinition = {
  name: 'grass-tile',
  width: 8,
  height: 8,
  frameDuration: 0,
  frames: [
    [
      // row 0
      4, 4, 4, 20, 4, 4, 4, 4,
      // row 1
      4, 20, 4, 4, 4, 4, 20, 4,
      // row 2
      4, 4, 4, 4, 20, 4, 4, 4,
      // row 3
      20, 4, 4, 4, 4, 4, 4, 20,
      // row 4
      4, 4, 20, 4, 4, 4, 20, 4,
      // row 5
      4, 4, 4, 4, 4, 20, 4, 4,
      // row 6
      4, 20, 4, 4, 20, 4, 4, 4,
      // row 7
      4, 4, 4, 20, 4, 4, 4, 4,
    ],
  ],
};

// ---------------------------------------------------------------------------
// SIDEWALK_TILE  8x8  static
// Index 19 = sidewalk gray (#4D4D57), Index 7 = light grey (#C2C3C7)
// Subtle grout-line texture: every 4th pixel in a staggered brick pattern.
// ---------------------------------------------------------------------------
export const SIDEWALK_TILE: SpriteDefinition = {
  name: 'sidewalk-tile',
  width: 8,
  height: 8,
  frameDuration: 0,
  frames: [
    [
      // row 0 – top grout line
      7, 7, 7, 7, 7, 7, 7, 7,
      // row 1
      7, 19, 19, 19, 7, 19, 19, 19,
      // row 2
      7, 19, 19, 19, 7, 19, 19, 19,
      // row 3 – mid grout line (offset half-brick)
      7, 7, 7, 7, 7, 7, 7, 7,
      // row 4
      19, 19, 7, 19, 19, 19, 7, 19,
      // row 5
      19, 19, 7, 19, 19, 19, 7, 19,
      // row 6
      19, 19, 7, 19, 19, 19, 7, 19,
      // row 7 – bottom grout line
      7, 7, 7, 7, 7, 7, 7, 7,
    ],
  ],
};

// ---------------------------------------------------------------------------
// TREE_ROUND  10x14  2 frames  frameDuration: 1000
// Index 5 = brown trunk, 4 = dark green canopy, 12 = green highlights
// Trunk is 2px wide, centered (cols 4–5), bottom 4 rows.
// Frame 0: canopy centred; Frame 1: canopy shifted 1px right (gentle sway).
// ---------------------------------------------------------------------------

// Helper: 0 = transparent
// Canopy radius ~4 px, centred at (5, 6) in 10-wide sprite.
// prettier-ignore
const TREE_ROUND_F0: number[] = [
  // row 0  (top of canopy)
  0,  0,  0,  4,  4,  4,  0,  0,  0,  0,
  // row 1
  0,  0,  4,  4, 12,  4,  4,  0,  0,  0,
  // row 2
  0,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 3
  0,  4,  4, 12,  4,  4,  4,  4,  0,  0,
  // row 4
  0,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 5
  0,  0,  4,  4,  4,  4, 12,  4,  0,  0,
  // row 6
  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,
  // row 7
  0,  0,  0,  0,  4,  4,  0,  0,  0,  0,
  // row 8  (trunk starts)
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 9
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 10
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 11
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 12
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
];

// Frame 1: canopy shifted 1px right
// prettier-ignore
const TREE_ROUND_F1: number[] = [
  // row 0
  0,  0,  0,  0,  4,  4,  4,  0,  0,  0,
  // row 1
  0,  0,  0,  4,  4, 12,  4,  4,  0,  0,
  // row 2
  0,  0,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 3
  0,  0,  4,  4, 12,  4,  4,  4,  4,  0,
  // row 4
  0,  0,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 5
  0,  0,  0,  4,  4,  4,  4, 12,  4,  0,
  // row 6
  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,
  // row 7
  0,  0,  0,  0,  0,  4,  4,  0,  0,  0,
  // row 8  (trunk unchanged)
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 9
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 10
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 11
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 12
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
];

export const TREE_ROUND: SpriteDefinition = {
  name: 'tree-round',
  width: 10,
  height: 14,
  frameDuration: 1000,
  frames: [TREE_ROUND_F0, TREE_ROUND_F1],
};

// ---------------------------------------------------------------------------
// TREE_POINTY  10x14  2 frames  frameDuration: 1000
// Same trunk.  Triangular/fir canopy widens row by row toward a base.
// Frame 0: canopy centred; Frame 1: canopy shifted 1px right (gentle sway).
// ---------------------------------------------------------------------------

// prettier-ignore
const TREE_POINTY_F0: number[] = [
  // row 0  (tip)
  0,  0,  0,  0,  0, 12,  0,  0,  0,  0,
  // row 1
  0,  0,  0,  0,  4,  4,  4,  0,  0,  0,
  // row 2
  0,  0,  0,  4,  4, 12,  4,  4,  0,  0,
  // row 3
  0,  0,  0,  4,  4,  4,  4,  4,  0,  0,
  // row 4
  0,  0,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 5
  0,  0,  4,  4, 12,  4,  4,  4,  4,  0,
  // row 6
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 7
  0,  4,  4,  4,  4, 12,  4,  4,  4,  4,
  // row 8  (trunk starts)
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 9
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 10
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 11
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 12
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
];

// Frame 1: canopy shifted 1px right
// prettier-ignore
const TREE_POINTY_F1: number[] = [
  // row 0  (tip)
  0,  0,  0,  0,  0,  0, 12,  0,  0,  0,
  // row 1
  0,  0,  0,  0,  0,  4,  4,  4,  0,  0,
  // row 2
  0,  0,  0,  0,  4,  4, 12,  4,  4,  0,
  // row 3
  0,  0,  0,  0,  4,  4,  4,  4,  4,  0,
  // row 4
  0,  0,  0,  4,  4,  4,  4,  4,  4,  4,
  // row 5
  0,  0,  0,  4,  4, 12,  4,  4,  4,  4,
  // row 6
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 7
  0,  0,  4,  4,  4,  4, 12,  4,  4,  4,
  // row 8  (trunk unchanged)
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 9
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 10
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 11
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 12
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  5,  5,  0,  0,  0,  0,
];

export const TREE_POINTY: SpriteDefinition = {
  name: 'tree-pointy',
  width: 10,
  height: 14,
  frameDuration: 1000,
  frames: [TREE_POINTY_F0, TREE_POINTY_F1],
};

// ---------------------------------------------------------------------------
// CROSSWALK_STRIPE  2x6  static
// Index 8 = white (#FFF1E8) — a single zebra-crossing stripe.
// ---------------------------------------------------------------------------
export const CROSSWALK_STRIPE: SpriteDefinition = {
  name: 'crosswalk-stripe',
  width: 2,
  height: 6,
  frameDuration: 0,
  frames: [[8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]],
};

// ---------------------------------------------------------------------------
// CENTER_LANE_DASH  1x3  static
// Index 11 = yellow (#FFEC27) — dashed centre-line segment.
// ---------------------------------------------------------------------------
export const CENTER_LANE_DASH: SpriteDefinition = {
  name: 'center-lane-dash',
  width: 1,
  height: 3,
  frameDuration: 0,
  frames: [[11, 11, 11]],
};

// ---------------------------------------------------------------------------
// STOP_LINE  24x1  static
// Index 8 = white — full-width stop line at intersection entry.
// ---------------------------------------------------------------------------
export const STOP_LINE: SpriteDefinition = {
  name: 'stop-line',
  width: 24,
  height: 1,
  frameDuration: 0,
  frames: [[8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]],
};

// ---------------------------------------------------------------------------
// ROAD_EDGE_LINE  1x1  static
// Index 7 = light grey — single-pixel road-edge marker / kerb highlight.
// ---------------------------------------------------------------------------
export const ROAD_EDGE_LINE: SpriteDefinition = {
  name: 'road-edge-line',
  width: 1,
  height: 1,
  frameDuration: 0,
  frames: [[7]],
};
