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
// TREE_ROUND  14x20  2 frames  frameDuration: 1000
// Index 4 = dark green canopy, 20 = light green highlights, 21 = brown trunk
// Trunk is 2px wide, centered (cols 6–7), rows 12–19.
// Frame 0: canopy centred; Frame 1: highlight spots shifted 1px right (gentle sway).
// ---------------------------------------------------------------------------

// Helper: 0 = transparent
// prettier-ignore
const TREE_ROUND_F0: number[] = [
  // row 0  (top of canopy, 6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 1  (8px wide)
  0,  0,  0,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 2  (10px wide)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 3  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 4  (12px wide, highlight spots)
  0,  4,  4,  4, 20,  4,  4,  4, 20,  4,  4,  4,  0,  0,
  // row 5  (full 14px)
  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 6  (full 14px, highlight spots)
  4,  4, 20,  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,  4,
  // row 7  (full 14px)
  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 8  (12px wide, highlight spots)
  0,  4,  4,  4,  4, 20,  4,  4,  4, 20,  4,  4,  0,  0,
  // row 9  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 10 (10px wide)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 11 (6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 12 (trunk starts, 2px wide centered at cols 6-7)
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 14
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 15
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 16
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 17
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 18
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 19
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
];

// Frame 1: highlight spots shifted 1px right
// prettier-ignore
const TREE_ROUND_F1: number[] = [
  // row 0  (top of canopy, 6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 1  (8px wide)
  0,  0,  0,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 2  (10px wide)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 3  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 4  (12px wide, highlight spots shifted 1px right)
  0,  4,  4,  4,  4, 20,  4,  4,  4, 20,  4,  4,  0,  0,
  // row 5  (full 14px)
  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 6  (full 14px, highlight spots shifted 1px right)
  4,  4,  4, 20,  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,
  // row 7  (full 14px)
  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 8  (12px wide, highlight spots shifted 1px right)
  0,  4,  4,  4,  4,  4, 20,  4,  4,  4, 20,  4,  0,  0,
  // row 9  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,
  // row 10 (10px wide)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 11 (6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 12 (trunk, unchanged)
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 13
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 14
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 15
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 16
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 17
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 18
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 19
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
];

export const TREE_ROUND: SpriteDefinition = {
  name: 'tree-round',
  width: 14,
  height: 20,
  frameDuration: 1000,
  frames: [TREE_ROUND_F0, TREE_ROUND_F1],
};

// ---------------------------------------------------------------------------
// TREE_POINTY  14x20  2 frames  frameDuration: 1000
// Same trunk. Triangular/fir canopy widens row by row toward a base.
// Index 4 = dark green canopy, 20 = light green highlights, 21 = brown trunk
// Frame 0: canopy centred; Frame 1: highlight spots shifted 1px right (gentle sway).
// ---------------------------------------------------------------------------

// prettier-ignore
const TREE_POINTY_F0: number[] = [
  // row 0  (tip, 2px wide)
  0,  0,  0,  0,  0,  0,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 1  (4px wide)
  0,  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 2  (6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 3  (8px wide, highlight)
  0,  0,  0,  4,  4,  4,  4, 20,  4,  4,  4,  0,  0,  0,
  // row 4  (10px wide)
  0,  0,  4,  4,  4,  4,  4,  4,  4, 20,  4,  4,  0,  0,
  // row 5  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 6  (full 14px, highlights)
  4,  4, 20,  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,  4,
  // row 7  (new tier tip, 2px — trunk visible)
  0,  0,  0,  0,  0,  0,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 8  (4px)
  0,  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 9  (6px, highlight)
  0,  0,  0,  0,  4,  4, 20,  4,  4,  4,  0,  0,  0,  0,
  // row 10 (8px)
  0,  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,
  // row 11 (10px, highlight)
  0,  0,  4,  4,  4,  4,  4,  4,  4, 20,  4,  4,  0,  0,
  // row 12 (12px)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 13 (full 14px, highlight)
  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,  4,  4,  4,  4,
  // row 14 (trunk starts)
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 15
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 16
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 17
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 18
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 19
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
];

// Frame 1: highlight spots shifted 1px right
// prettier-ignore
const TREE_POINTY_F1: number[] = [
  // row 0  (tip, 2px wide)
  0,  0,  0,  0,  0,  0,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 1  (4px wide)
  0,  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 2  (6px wide)
  0,  0,  0,  0,  4,  4,  4,  4,  4,  4,  0,  0,  0,  0,
  // row 3  (8px wide, highlight shifted 1px right)
  0,  0,  0,  4,  4,  4,  4,  4, 20,  4,  4,  0,  0,  0,
  // row 4  (10px wide, highlight shifted 1px right)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4, 20,  4,  0,  0,
  // row 5  (12px wide)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 6  (full 14px, highlights shifted 1px right)
  4,  4,  4, 20,  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,
  // row 7  (new tier tip, 2px)
  0,  0,  0,  0,  0,  0,  4,  4,  0,  0,  0,  0,  0,  0,
  // row 8  (4px)
  0,  0,  0,  0,  0,  4,  4,  4,  4,  0,  0,  0,  0,  0,
  // row 9  (6px, highlight shifted 1px right)
  0,  0,  0,  0,  4,  4,  4, 20,  4,  4,  0,  0,  0,  0,
  // row 10 (8px)
  0,  0,  0,  4,  4,  4,  4,  4,  4,  4,  4,  0,  0,  0,
  // row 11 (10px, highlight shifted 1px right)
  0,  0,  4,  4,  4,  4,  4,  4,  4,  4, 20,  4,  0,  0,
  // row 12 (12px)
  0,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  0,
  // row 13 (full 14px, highlight shifted 1px right)
  4,  4,  4,  4,  4,  4, 20,  4,  4,  4,  4,  4,  4,  4,
  // row 14 (trunk, unchanged)
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 15
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 16
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 17
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 18
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
  // row 19
  0,  0,  0,  0,  0,  0, 21, 21,  0,  0,  0,  0,  0,  0,
];

export const TREE_POINTY: SpriteDefinition = {
  name: 'tree-pointy',
  width: 14,
  height: 20,
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
// STOP_LINE  40x1  static
// Index 8 = white — full-width stop line at intersection entry.
// ---------------------------------------------------------------------------
export const STOP_LINE: SpriteDefinition = {
  name: 'stop-line',
  width: 40,
  height: 1,
  frameDuration: 0,
  frames: [
    [
      8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
      8, 8, 8, 8, 8, 8, 8, 8, 8,
    ],
  ],
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
