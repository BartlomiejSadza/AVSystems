import type { SpriteDefinition } from './types';

// ---------------------------------------------------------------------------
// Palette index constants
// ---------------------------------------------------------------------------
const T = 21; // tire (tar black)
const W = 2; // windshield (dark blue)
const R = 9; // taillight (red)
const C = 26; // cross / emergency white
const FB = 13; // flasher blue
const FO = 22; // flasher off (lamp off)

// Body colour aliases (used in factory functions)
// Blue=13, Pink=15, Green=25, Cream/Peach=16
// Ambulance body = 9 (red)
const AMB = 9; // ambulance body (red)

// ---------------------------------------------------------------------------
// Normal car factory functions
// ---------------------------------------------------------------------------

/**
 * North-facing car sprite (8 × 12).
 *
 * Layout (B = body, T = tire, W = windshield, R = taillight, . = 0):
 *   Row  0:  ..BBBB..
 *   Row  1:  .BBBBBB.
 *   Row  2:  TBBBBBBT
 *   Row  3:  BWWWWWWB
 *   Row  4:  BWWWWWWB
 *   Row  5:  BBBBBBBB
 *   Row  6:  BBBBBBBB
 *   Row  7:  BBBBBBBB
 *   Row  8:  TBBBBBBT
 *   Row  9:  .BBBBBB.
 *   Row 10:  .BBBBBB.
 *   Row 11:  ..BRRB..
 */
function createCarNorth(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, B, B, B, B, 0, 0,
    // row 1
    0, B, B, B, B, B, B, 0,
    // row 2
    T, B, B, B, B, B, B, T,
    // row 3
    B, W, W, W, W, W, W, B,
    // row 4
    B, W, W, W, W, W, W, B,
    // row 5
    B, B, B, B, B, B, B, B,
    // row 6
    B, B, B, B, B, B, B, B,
    // row 7
    B, B, B, B, B, B, B, B,
    // row 8
    T, B, B, B, B, B, B, T,
    // row 9
    0, B, B, B, B, B, B, 0,
    // row 10
    0, B, B, B, B, B, B, 0,
    // row 11
    0, 0, B, R, R, B, 0, 0,
  ];
  return { name: `car_north_${B}`, width: 8, height: 12, frames: [frame], frameDuration: 0 };
}

/**
 * South-facing car sprite (8 × 12) — vertical mirror of north.
 *
 * Layout:
 *   Row  0:  ..BRRB..
 *   Row  1:  .BBBBBB.
 *   Row  2:  .BBBBBB.
 *   Row  3:  TBBBBBBT
 *   Row  4:  BBBBBBBB
 *   Row  5:  BBBBBBBB
 *   Row  6:  BBBBBBBB
 *   Row  7:  BWWWWWWB
 *   Row  8:  BWWWWWWB
 *   Row  9:  TBBBBBBT
 *   Row 10:  .BBBBBB.
 *   Row 11:  ..BBBB..
 */
function createCarSouth(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, B, R, R, B, 0, 0,
    // row 1
    0, B, B, B, B, B, B, 0,
    // row 2
    0, B, B, B, B, B, B, 0,
    // row 3
    T, B, B, B, B, B, B, T,
    // row 4
    B, B, B, B, B, B, B, B,
    // row 5
    B, B, B, B, B, B, B, B,
    // row 6
    B, B, B, B, B, B, B, B,
    // row 7
    B, W, W, W, W, W, W, B,
    // row 8
    B, W, W, W, W, W, W, B,
    // row 9
    T, B, B, B, B, B, B, T,
    // row 10
    0, B, B, B, B, B, B, 0,
    // row 11
    0, 0, B, B, B, B, 0, 0,
  ];
  return { name: `car_south_${B}`, width: 8, height: 12, frames: [frame], frameDuration: 0 };
}

/**
 * East-facing car sprite (12 × 8).
 *
 * Layout (front = right side, taillights = left side):
 *   Row 0:  ......TBBT..
 *   Row 1:  RR.BBBBBBBB.
 *   Row 2:  RBBBBBBBBBBT
 *   Row 3:  .BBBBBBBWWB.
 *   Row 4:  .BBBBBBBWWB.
 *   Row 5:  RBBBBBBBBBBT
 *   Row 6:  RR.BBBBBBBB.
 *   Row 7:  ......TBBT..
 */
function createCarEast(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, 0, 0, 0, 0, T, B, B, T, 0, 0,
    // row 1
    R, R, 0, B, B, B, B, B, B, B, B, 0,
    // row 2
    R, B, B, B, B, B, B, B, B, B, B, T,
    // row 3
    0, B, B, B, B, B, B, B, W, W, B, 0,
    // row 4
    0, B, B, B, B, B, B, B, W, W, B, 0,
    // row 5
    R, B, B, B, B, B, B, B, B, B, B, T,
    // row 6
    R, R, 0, B, B, B, B, B, B, B, B, 0,
    // row 7
    0, 0, 0, 0, 0, 0, T, B, B, T, 0, 0,
  ];
  return { name: `car_east_${B}`, width: 12, height: 8, frames: [frame], frameDuration: 0 };
}

/**
 * West-facing car sprite (12 × 8) — horizontal mirror of east.
 *
 * Layout (front = left side, taillights = right side):
 *   Row 0:  ..TBBT......
 *   Row 1:  .BBBBBBBB.RR
 *   Row 2:  TBBBBBBBBBR.
 *   Row 3:  .BWWBBBBBBB.
 *   Row 4:  .BWWBBBBBBB.
 *   Row 5:  TBBBBBBBBBBR
 *   Row 6:  .BBBBBBBB.RR
 *   Row 7:  ..TBBT......
 */
function createCarWest(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, T, B, B, T, 0, 0, 0, 0, 0, 0,
    // row 1
    0, B, B, B, B, B, B, B, B, 0, R, R,
    // row 2
    T, B, B, B, B, B, B, B, B, B, R, 0,
    // row 3
    0, B, W, W, B, B, B, B, B, B, B, 0,
    // row 4
    0, B, W, W, B, B, B, B, B, B, B, 0,
    // row 5
    T, B, B, B, B, B, B, B, B, B, B, R,
    // row 6
    0, B, B, B, B, B, B, B, B, 0, R, R,
    // row 7
    0, 0, T, B, B, T, 0, 0, 0, 0, 0, 0,
  ];
  return { name: `car_west_${B}`, width: 12, height: 8, frames: [frame], frameDuration: 0 };
}

// ---------------------------------------------------------------------------
// Normal car exports — 4 colour variants × 4 directions
// ---------------------------------------------------------------------------

export const CAR_NORTH_BLUE = createCarNorth(13);
export const CAR_NORTH_PINK = createCarNorth(15);
export const CAR_NORTH_GREEN = createCarNorth(25);
export const CAR_NORTH_CREAM = createCarNorth(16);

export const CAR_SOUTH_BLUE = createCarSouth(13);
export const CAR_SOUTH_PINK = createCarSouth(15);
export const CAR_SOUTH_GREEN = createCarSouth(25);
export const CAR_SOUTH_CREAM = createCarSouth(16);

export const CAR_EAST_BLUE = createCarEast(13);
export const CAR_EAST_PINK = createCarEast(15);
export const CAR_EAST_GREEN = createCarEast(25);
export const CAR_EAST_CREAM = createCarEast(16);

export const CAR_WEST_BLUE = createCarWest(13);
export const CAR_WEST_PINK = createCarWest(15);
export const CAR_WEST_GREEN = createCarWest(25);
export const CAR_WEST_CREAM = createCarWest(16);

// ---------------------------------------------------------------------------
// Ambulance sprites (animated, 2 frames, frameDuration=250)
// Body = 9 (red), flasher alternates blue(13) / off(22) per frame
// ---------------------------------------------------------------------------

/**
 * Ambulance north (8 × 14).
 *
 * Layout (B=9, F=flasher, W=windshield, T=tire, R=taillight=9, C=cross):
 *   Row  0:  ..FBBF..
 *   Row  1:  .BBBBBB.
 *   Row  2:  TBBBBBBT
 *   Row  3:  BWWWWWWB
 *   Row  4:  BBBBBBBB
 *   Row  5:  BB.CC.BB
 *   Row  6:  BBCCCCBB
 *   Row  7:  BB.CC.BB
 *   Row  8:  BBBBBBBB
 *   Row  9:  TBBBBBBT
 *   Row 10:  .BBBBBB.
 *   Row 11:  .BBBBBB.
 *   Row 12:  ..BRRB..
 *   Row 13:  ..BRRB..
 *
 * Frame 0: left flasher = 13 (blue), right flasher = 22 (off)
 * Frame 1: left flasher = 22 (off),  right flasher = 13 (blue)
 */
export const AMBULANCE_NORTH: SpriteDefinition = (() => {
  function makeFrame(fLeft: number, fRight: number): number[] {
    // prettier-ignore
    return [
      // row 0  ..FBBF..
      0, 0, fLeft, AMB, AMB, fRight, 0, 0,
      // row 1  .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 2  TBBBBBBT
      T, AMB, AMB, AMB, AMB, AMB, AMB, T,
      // row 3  BWWWWWWB
      AMB, W, W, W, W, W, W, AMB,
      // row 4  BBBBBBBB
      AMB, AMB, AMB, AMB, AMB, AMB, AMB, AMB,
      // row 5  BB.CC.BB
      AMB, AMB, 0, C, C, 0, AMB, AMB,
      // row 6  BBCCCCBB
      AMB, AMB, C, C, C, C, AMB, AMB,
      // row 7  BB.CC.BB
      AMB, AMB, 0, C, C, 0, AMB, AMB,
      // row 8  BBBBBBBB
      AMB, AMB, AMB, AMB, AMB, AMB, AMB, AMB,
      // row 9  TBBBBBBT
      T, AMB, AMB, AMB, AMB, AMB, AMB, T,
      // row 10 .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 11 .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 12 ..BRRB..
      0, 0, AMB, R, R, AMB, 0, 0,
      // row 13 ..BRRB..
      0, 0, AMB, R, R, AMB, 0, 0,
    ];
  }
  return {
    name: 'ambulance_north',
    width: 8,
    height: 14,
    frames: [makeFrame(FB, FO), makeFrame(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance south (8 × 14) — vertical mirror of north.
 *
 * Layout:
 *   Row  0:  ..BRRB..
 *   Row  1:  ..BRRB..
 *   Row  2:  .BBBBBB.
 *   Row  3:  .BBBBBB.
 *   Row  4:  TBBBBBBT
 *   Row  5:  BBBBBBBB
 *   Row  6:  BB.CC.BB
 *   Row  7:  BBCCCCBB
 *   Row  8:  BB.CC.BB
 *   Row  9:  BBBBBBBB
 *   Row 10:  BWWWWWWB
 *   Row 11:  TBBBBBBT
 *   Row 12:  .BBBBBB.
 *   Row 13:  ..FBBF..
 *
 * Frame 0: left flasher = 13, right = 22
 * Frame 1: left flasher = 22, right = 13
 */
export const AMBULANCE_SOUTH: SpriteDefinition = (() => {
  function makeFrame(fLeft: number, fRight: number): number[] {
    // prettier-ignore
    return [
      // row 0  ..BRRB..
      0, 0, AMB, R, R, AMB, 0, 0,
      // row 1  ..BRRB..
      0, 0, AMB, R, R, AMB, 0, 0,
      // row 2  .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 3  .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 4  TBBBBBBT
      T, AMB, AMB, AMB, AMB, AMB, AMB, T,
      // row 5  BBBBBBBB
      AMB, AMB, AMB, AMB, AMB, AMB, AMB, AMB,
      // row 6  BB.CC.BB
      AMB, AMB, 0, C, C, 0, AMB, AMB,
      // row 7  BBCCCCBB
      AMB, AMB, C, C, C, C, AMB, AMB,
      // row 8  BB.CC.BB
      AMB, AMB, 0, C, C, 0, AMB, AMB,
      // row 9  BBBBBBBB
      AMB, AMB, AMB, AMB, AMB, AMB, AMB, AMB,
      // row 10 BWWWWWWB
      AMB, W, W, W, W, W, W, AMB,
      // row 11 TBBBBBBT
      T, AMB, AMB, AMB, AMB, AMB, AMB, T,
      // row 12 .BBBBBB.
      0, AMB, AMB, AMB, AMB, AMB, AMB, 0,
      // row 13 ..FBBF..
      0, 0, fLeft, AMB, AMB, fRight, 0, 0,
    ];
  }
  return {
    name: 'ambulance_south',
    width: 8,
    height: 14,
    frames: [makeFrame(FB, FO), makeFrame(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance east (14 × 8) — derived by rotating north 90° clockwise.
 *
 * Front (windshield) faces right; taillights on the left; flashers top-right/bottom-right.
 *
 * Frame 0: top flasher = 13 (blue), bottom flasher = 22 (off)
 * Frame 1: top flasher = 22 (off),  bottom flasher = 13 (blue)
 */
export const AMBULANCE_EAST: SpriteDefinition = (() => {
  // North frame grid (8 cols × 14 rows), using indices:
  // new_east(r, c) = north(13 - c, r)   for r in [0..7], c in [0..13]
  // We build the flat array row by row.

  function makeFrameRotated(fLeft: number, fRight: number): number[] {
    // Build north grid as 2D array [row][col]
    const B = AMB;
    const north: number[][] = [
      [0, 0, fLeft, B, B, fRight, 0, 0], // row 0
      [0, B, B, B, B, B, B, 0], // row 1
      [T, B, B, B, B, B, B, T], // row 2
      [B, W, W, W, W, W, W, B], // row 3
      [B, B, B, B, B, B, B, B], // row 4
      [B, B, 0, C, C, 0, B, B], // row 5
      [B, B, C, C, C, C, B, B], // row 6
      [B, B, 0, C, C, 0, B, B], // row 7
      [B, B, B, B, B, B, B, B], // row 8
      [T, B, B, B, B, B, B, T], // row 9
      [0, B, B, B, B, B, B, 0], // row 10
      [0, B, B, B, B, B, B, 0], // row 11
      [0, 0, B, R, R, B, 0, 0], // row 12
      [0, 0, B, R, R, B, 0, 0], // row 13
    ];

    // 90° CW rotation: new(r, c) = north(13 - c, r)
    // new width = 14, new height = 8
    const result: number[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 14; c++) {
        const northRow = north[13 - c];
        // northRow is guaranteed defined since 13-c ranges 13..0 (c: 0..13)
        const val = northRow![r];
        result.push(val ?? 0);
      }
    }
    return result;
  }

  return {
    name: 'ambulance_east',
    width: 14,
    height: 8,
    frames: [makeFrameRotated(FB, FO), makeFrameRotated(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance west (14 × 8) — horizontal mirror of east.
 *
 * Front (windshield) faces left; taillights on the right; flashers top-left/bottom-left.
 */
export const AMBULANCE_WEST: SpriteDefinition = (() => {
  // Mirror east frames horizontally: new(r, c) = east(r, 13 - c)
  function mirrorHorizontal(frame: number[], width: number, height: number): number[] {
    const result: number[] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        result.push(frame[r * width + (width - 1 - c)] ?? 0);
      }
    }
    return result;
  }

  const eastFrames = AMBULANCE_EAST.frames;
  const w = AMBULANCE_EAST.width;
  const h = AMBULANCE_EAST.height;

  return {
    name: 'ambulance_west',
    width: w,
    height: h,
    frames: [mirrorHorizontal(eastFrames[0]!, w, h), mirrorHorizontal(eastFrames[1]!, w, h)],
    frameDuration: 250,
  };
})();

// ---------------------------------------------------------------------------
// Convenience collections
// ---------------------------------------------------------------------------

export const CARS_BY_DIRECTION: Record<string, SpriteDefinition[]> = {
  north: [CAR_NORTH_BLUE, CAR_NORTH_PINK, CAR_NORTH_GREEN, CAR_NORTH_CREAM],
  south: [CAR_SOUTH_BLUE, CAR_SOUTH_PINK, CAR_SOUTH_GREEN, CAR_SOUTH_CREAM],
  east: [CAR_EAST_BLUE, CAR_EAST_PINK, CAR_EAST_GREEN, CAR_EAST_CREAM],
  west: [CAR_WEST_BLUE, CAR_WEST_PINK, CAR_WEST_GREEN, CAR_WEST_CREAM],
};
