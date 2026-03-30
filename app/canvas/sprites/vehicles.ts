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
 * North-facing car sprite (12 × 18).
 *
 * Layout (B = body, T = tire, W = windshield, R = taillight, . = 0):
 *   Row  0:  ...BBBBBB...    (hood, rounded)
 *   Row  1:  ..BBBBBBBB..
 *   Row  2:  .BBBBBBBBBB.
 *   Row  3:  TBBBBBBBBBT     (front tires)
 *   Row  4:  TBBBBBBBBBBT
 *   Row  5:  BWWWWWWWWWWB    (windshield, 3 rows)
 *   Row  6:  BWWWWWWWWWWB
 *   Row  7:  BWWWWWWWWWWB
 *   Row  8:  BBBBBBBBBBBB    (body, 4 rows)
 *   Row  9:  BBBBBBBBBBBB
 *   Row 10:  BBBBBBBBBBBB
 *   Row 11:  BBBBBBBBBBBB
 *   Row 12:  TBBBBBBBBBT     (rear tires)
 *   Row 13:  TBBBBBBBBBBT
 *   Row 14:  .BBBBBBBBBB.
 *   Row 15:  .BBBBBBBBBB.
 *   Row 16:  ..BBBBBBBB..
 *   Row 17:  ...BRRRRB...    (taillights)
 */
function createCarNorth(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0  ...BBBBBB...
    0, 0, 0, B, B, B, B, B, B, 0, 0, 0,
    // row 1  ..BBBBBBBB..
    0, 0, B, B, B, B, B, B, B, B, 0, 0,
    // row 2  .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 3  TBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, T, 0,
    // row 4  TBBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, B, T,
    // row 5  BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 6  BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 7  BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 8  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 9  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 10 BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 11 BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 12 TBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, T, 0,
    // row 13 TBBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, B, T,
    // row 14 .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 15 .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 16 ..BBBBBBBB..
    0, 0, B, B, B, B, B, B, B, B, 0, 0,
    // row 17 ...BRRRRB...
    0, 0, 0, B, R, R, R, R, B, 0, 0, 0,
  ];
  return { name: `car_north_${B}`, width: 12, height: 18, frames: [frame], frameDuration: 0 };
}

/**
 * South-facing car sprite (12 × 18) — vertical mirror of north.
 *
 * Layout:
 *   Row  0:  ...BRRRRB...    (taillights)
 *   Row  1:  ..BBBBBBBB..
 *   Row  2:  .BBBBBBBBBB.
 *   Row  3:  TBBBBBBBBBT
 *   Row  4:  TBBBBBBBBBBT
 *   Row  5:  BBBBBBBBBBBB
 *   Row  6:  BBBBBBBBBBBB
 *   Row  7:  BBBBBBBBBBBB
 *   Row  8:  BBBBBBBBBBBB
 *   Row  9:  BWWWWWWWWWWB
 *   Row 10:  BWWWWWWWWWWB
 *   Row 11:  BWWWWWWWWWWB
 *   Row 12:  TBBBBBBBBBT
 *   Row 13:  TBBBBBBBBBBT
 *   Row 14:  .BBBBBBBBBB.
 *   Row 15:  .BBBBBBBBBB.
 *   Row 16:  ..BBBBBBBB..
 *   Row 17:  ...BBBBBB...
 */
function createCarSouth(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0  ...BRRRRB...
    0, 0, 0, B, R, R, R, R, B, 0, 0, 0,
    // row 1  ..BBBBBBBB..
    0, 0, B, B, B, B, B, B, B, B, 0, 0,
    // row 2  .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 3  TBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, T, 0,
    // row 4  TBBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, B, T,
    // row 5  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 6  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 7  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 8  BBBBBBBBBBBB
    B, B, B, B, B, B, B, B, B, B, B, B,
    // row 9  BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 10 BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 11 BWWWWWWWWWWB
    B, W, W, W, W, W, W, W, W, W, W, B,
    // row 12 TBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, T, 0,
    // row 13 TBBBBBBBBBBT
    T, B, B, B, B, B, B, B, B, B, B, T,
    // row 14 .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 15 .BBBBBBBBBB.
    0, B, B, B, B, B, B, B, B, B, B, 0,
    // row 16 ..BBBBBBBB..
    0, 0, B, B, B, B, B, B, B, B, 0, 0,
    // row 17 ...BBBBBB...
    0, 0, 0, B, B, B, B, B, B, 0, 0, 0,
  ];
  return { name: `car_south_${B}`, width: 12, height: 18, frames: [frame], frameDuration: 0 };
}

/**
 * East-facing car sprite (18 × 12).
 *
 * Layout (front = right side, taillights = left side):
 *   Row  0:  ..........TTBBBB....
 *   Row  1:  ..RRBBBBBBBBBBBBB...
 *   Row  2:  .RBBBBBBBBBBBBBBBT..
 *   Row  3:  .RBBBBBBBBBBBBBBBBT.
 *   Row  4:  ..BBBBBBBBBBBWWWBB..
 *   Row  5:  ..BBBBBBBBBBBWWWBB..
 *   Row  6:  ..BBBBBBBBBBBWWWBB..
 *   Row  7:  .RBBBBBBBBBBBBBBBBT.
 *   Row  8:  .RBBBBBBBBBBBBBBBT..
 *   Row  9:  ..RRBBBBBBBBBBBBB...
 *   Row 10:  ..........TTBBBB....
 *   Row 11:  ..................
 */
function createCarEast(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, T, T, B, B, B, B, 0, 0,
    // row 1
    0, 0, R, R, B, B, B, B, B, B, B, B, B, B, B, B, B, 0,
    // row 2
    0, R, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, T,
    // row 3
    0, R, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, T,
    // row 4
    0, 0, B, B, B, B, B, B, B, B, B, B, B, W, W, W, B, 0,
    // row 5
    0, 0, B, B, B, B, B, B, B, B, B, B, B, W, W, W, B, 0,
    // row 6
    0, 0, B, B, B, B, B, B, B, B, B, B, B, W, W, W, B, 0,
    // row 7
    0, R, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, T,
    // row 8
    0, R, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, T,
    // row 9
    0, 0, R, R, B, B, B, B, B, B, B, B, B, B, B, B, B, 0,
    // row 10
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, T, T, B, B, B, B, 0, 0,
    // row 11
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  return { name: `car_east_${B}`, width: 18, height: 12, frames: [frame], frameDuration: 0 };
}

/**
 * West-facing car sprite (18 × 12) — horizontal mirror of east.
 *
 * Layout (front = left side, taillights = right side):
 *   Row  0:  ....BBBBTT..........
 *   Row  1:  ...BBBBBBBBBBBBBBRR.
 *   Row  2:  ..TBBBBBBBBBBBBBBBBR
 *   Row  3:  .TBBBBBBBBBBBBBBBBR.
 *   Row  4:  ..BBWWWBBBBBBBBBBB..
 *   Row  5:  ..BBWWWBBBBBBBBBBB..
 *   Row  6:  ..BBWWWBBBBBBBBBBB..
 *   Row  7:  .TBBBBBBBBBBBBBBBBR.
 *   Row  8:  ..TBBBBBBBBBBBBBBBBR
 *   Row  9:  ...BBBBBBBBBBBBBBRR.
 *   Row 10:  ....BBBBTT..........
 *   Row 11:  ..................
 */
function createCarWest(B: number): SpriteDefinition {
  // prettier-ignore
  const frame: number[] = [
    // row 0
    0, 0, B, B, B, B, T, T, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // row 1
    0, B, B, B, B, B, B, B, B, B, B, B, B, B, R, R, 0, 0,
    // row 2
    T, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, R, 0,
    // row 3
    T, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, R, 0,
    // row 4
    0, B, W, W, W, B, B, B, B, B, B, B, B, B, B, B, 0, 0,
    // row 5
    0, B, W, W, W, B, B, B, B, B, B, B, B, B, B, B, 0, 0,
    // row 6
    0, B, W, W, W, B, B, B, B, B, B, B, B, B, B, B, 0, 0,
    // row 7
    T, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, R, 0,
    // row 8
    T, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, R, 0,
    // row 9
    0, B, B, B, B, B, B, B, B, B, B, B, B, B, R, R, 0, 0,
    // row 10
    0, 0, B, B, B, B, T, T, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // row 11
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  return { name: `car_west_${B}`, width: 18, height: 12, frames: [frame], frameDuration: 0 };
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
 * Ambulance north (12 × 21).
 *
 * Layout (B=AMB=9, F=flasher, W=windshield, T=tire, R=taillight=9, C=cross):
 *   Row  0:  ...FL.BB.FR...   (flashers at corners)
 *   Row  1:  ..BBBBBBBBBB..
 *   Row  2:  .BBBBBBBBBBBB.
 *   Row  3:  TBBBBBBBBBBT     (front tires)
 *   Row  4:  TBBBBBBBBBBBT
 *   Row  5:  BWWWWWWWWWWB     (windshield, 2 rows)
 *   Row  6:  BWWWWWWWWWWB
 *   Row  7:  BBBBBBBBBBBB     (body)
 *   Row  8:  BBBBBBBBBBBB
 *   Row  9:  BBB.CCCC.BBB     (cross section)
 *   Row 10:  BBBBCCCCBBBB
 *   Row 11:  BBBBCCCCBBBB
 *   Row 12:  BBB.CCCC.BBB
 *   Row 13:  BBBBBBBBBBBB     (body)
 *   Row 14:  BBBBBBBBBBBB
 *   Row 15:  TBBBBBBBBBBT     (rear tires)
 *   Row 16:  TBBBBBBBBBBBT
 *   Row 17:  .BBBBBBBBBB.
 *   Row 18:  .BBBBBBBBBB.
 *   Row 19:  ..BRRRRRRB..     (taillights)
 *   Row 20:  ..BRRRRRRB..
 *
 * Frame 0: left flasher = 13 (blue), right flasher = 22 (off)
 * Frame 1: left flasher = 22 (off),  right flasher = 13 (blue)
 */
export const AMBULANCE_NORTH: SpriteDefinition = (() => {
  function makeFrame(fLeft: number, fRight: number): number[] {
    const B = AMB;
    // prettier-ignore
    return [
      // row 0  ...FL.BB.FR...
      0, 0, 0, fLeft, 0, B, B, 0, fRight, 0, 0, 0,
      // row 1  ..BBBBBBBBBB..
      0, 0, B, B, B, B, B, B, B, B, 0, 0,
      // row 2  .BBBBBBBBBBBB.  (wait, width is 12, so 12 cols)
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 3  TBBBBBBBBBBT   (T at col 0 and col 10, col 11 = 0)
      T, B, B, B, B, B, B, B, B, B, T, 0,
      // row 4  TBBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, B, T,
      // row 5  BWWWWWWWWWWB
      B, W, W, W, W, W, W, W, W, W, W, B,
      // row 6  BWWWWWWWWWWB
      B, W, W, W, W, W, W, W, W, W, W, B,
      // row 7  BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 8  BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 9  BBB.CCCC.BBB
      B, B, B, 0, C, C, C, C, 0, B, B, B,
      // row 10 BBBBCCCCBBBB
      B, B, B, B, C, C, C, C, B, B, B, B,
      // row 11 BBBBCCCCBBBB
      B, B, B, B, C, C, C, C, B, B, B, B,
      // row 12 BBB.CCCC.BBB
      B, B, B, 0, C, C, C, C, 0, B, B, B,
      // row 13 BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 14 BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 15 TBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, T, 0,
      // row 16 TBBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, B, T,
      // row 17 .BBBBBBBBBB.
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 18 .BBBBBBBBBB.
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 19 ..BRRRRRRB..
      0, 0, B, R, R, R, R, R, B, 0, 0, 0,
      // row 20 ..BRRRRRRB..
      0, 0, B, R, R, R, R, R, B, 0, 0, 0,
    ];
  }
  return {
    name: 'ambulance_north',
    width: 12,
    height: 21,
    frames: [makeFrame(FB, FO), makeFrame(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance south (12 × 21) — vertical mirror of north.
 *
 * Layout:
 *   Row  0:  ..BRRRRRRB..     (taillights)
 *   Row  1:  ..BRRRRRRB..
 *   Row  2:  .BBBBBBBBBB.
 *   Row  3:  .BBBBBBBBBB.
 *   Row  4:  TBBBBBBBBBBT
 *   Row  5:  TBBBBBBBBBBBT
 *   Row  6:  BBBBBBBBBBBB
 *   Row  7:  BBBBBBBBBBBB
 *   Row  8:  BBB.CCCC.BBB
 *   Row  9:  BBBBCCCCBBBB
 *   Row 10:  BBBBCCCCBBBB
 *   Row 11:  BBB.CCCC.BBB
 *   Row 12:  BBBBBBBBBBBB
 *   Row 13:  BBBBBBBBBBBB
 *   Row 14:  BWWWWWWWWWWB
 *   Row 15:  BWWWWWWWWWWB
 *   Row 16:  TBBBBBBBBBBT
 *   Row 17:  TBBBBBBBBBBBT
 *   Row 18:  .BBBBBBBBBB.
 *   Row 19:  ..BBBBBBBBBB..
 *   Row 20:  ...FL.BB.FR...
 *
 * Frame 0: left flasher = 13, right = 22
 * Frame 1: left flasher = 22, right = 13
 */
export const AMBULANCE_SOUTH: SpriteDefinition = (() => {
  function makeFrame(fLeft: number, fRight: number): number[] {
    const B = AMB;
    // prettier-ignore
    return [
      // row 0  ..BRRRRRRB..
      0, 0, B, R, R, R, R, R, B, 0, 0, 0,
      // row 1  ..BRRRRRRB..
      0, 0, B, R, R, R, R, R, B, 0, 0, 0,
      // row 2  .BBBBBBBBBB.
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 3  .BBBBBBBBBB.
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 4  TBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, T, 0,
      // row 5  TBBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, B, T,
      // row 6  BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 7  BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 8  BBB.CCCC.BBB
      B, B, B, 0, C, C, C, C, 0, B, B, B,
      // row 9  BBBBCCCCBBBB
      B, B, B, B, C, C, C, C, B, B, B, B,
      // row 10 BBBBCCCCBBBB
      B, B, B, B, C, C, C, C, B, B, B, B,
      // row 11 BBB.CCCC.BBB
      B, B, B, 0, C, C, C, C, 0, B, B, B,
      // row 12 BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 13 BBBBBBBBBBBB
      B, B, B, B, B, B, B, B, B, B, B, B,
      // row 14 BWWWWWWWWWWB
      B, W, W, W, W, W, W, W, W, W, W, B,
      // row 15 BWWWWWWWWWWB
      B, W, W, W, W, W, W, W, W, W, W, B,
      // row 16 TBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, T, 0,
      // row 17 TBBBBBBBBBBBT
      T, B, B, B, B, B, B, B, B, B, B, T,
      // row 18 .BBBBBBBBBB.
      0, B, B, B, B, B, B, B, B, B, B, 0,
      // row 19 ..BBBBBBBB..
      0, 0, B, B, B, B, B, B, B, B, 0, 0,
      // row 20 ...FL.BB.FR...
      0, 0, 0, fLeft, 0, B, B, 0, fRight, 0, 0, 0,
    ];
  }
  return {
    name: 'ambulance_south',
    width: 12,
    height: 21,
    frames: [makeFrame(FB, FO), makeFrame(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance east (21 × 12) — derived by rotating north 90° clockwise.
 *
 * Front (windshield) faces right; taillights on the left; flashers top-right/bottom-right.
 *
 * Frame 0: top flasher = 13 (blue), bottom flasher = 22 (off)
 * Frame 1: top flasher = 22 (off),  bottom flasher = 13 (blue)
 */
export const AMBULANCE_EAST: SpriteDefinition = (() => {
  // North frame grid (12 cols × 21 rows)
  // 90° CW rotation: new_east(r, c) = north(20 - c, r)
  // new width = 21, new height = 12

  function makeFrameRotated(fLeft: number, fRight: number): number[] {
    const B = AMB;
    const north: number[][] = [
      [0, 0, 0, fLeft, 0, B, B, 0, fRight, 0, 0, 0], // row 0
      [0, 0, B, B, B, B, B, B, B, B, 0, 0], // row 1
      [0, B, B, B, B, B, B, B, B, B, B, 0], // row 2
      [T, B, B, B, B, B, B, B, B, B, T, 0], // row 3
      [T, B, B, B, B, B, B, B, B, B, B, T], // row 4
      [B, W, W, W, W, W, W, W, W, W, W, B], // row 5
      [B, W, W, W, W, W, W, W, W, W, W, B], // row 6
      [B, B, B, B, B, B, B, B, B, B, B, B], // row 7
      [B, B, B, B, B, B, B, B, B, B, B, B], // row 8
      [B, B, B, 0, C, C, C, C, 0, B, B, B], // row 9
      [B, B, B, B, C, C, C, C, B, B, B, B], // row 10
      [B, B, B, B, C, C, C, C, B, B, B, B], // row 11
      [B, B, B, 0, C, C, C, C, 0, B, B, B], // row 12
      [B, B, B, B, B, B, B, B, B, B, B, B], // row 13
      [B, B, B, B, B, B, B, B, B, B, B, B], // row 14
      [T, B, B, B, B, B, B, B, B, B, T, 0], // row 15
      [T, B, B, B, B, B, B, B, B, B, B, T], // row 16
      [0, B, B, B, B, B, B, B, B, B, B, 0], // row 17
      [0, B, B, B, B, B, B, B, B, B, B, 0], // row 18
      [0, 0, B, R, R, R, R, R, B, 0, 0, 0], // row 19
      [0, 0, B, R, R, R, R, R, B, 0, 0, 0], // row 20
    ];

    // 90° CW rotation: new(r, c) = north(20 - c, r)
    // new width = 21, new height = 12
    const result: number[] = [];
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 21; c++) {
        const northRow = north[20 - c];
        const val = northRow![r];
        result.push(val ?? 0);
      }
    }
    return result;
  }

  return {
    name: 'ambulance_east',
    width: 21,
    height: 12,
    frames: [makeFrameRotated(FB, FO), makeFrameRotated(FO, FB)],
    frameDuration: 250,
  };
})();

/**
 * Ambulance west (21 × 12) — horizontal mirror of east.
 *
 * Front (windshield) faces left; taillights on the right; flashers top-left/bottom-left.
 */
export const AMBULANCE_WEST: SpriteDefinition = (() => {
  // Mirror east frames horizontally: new(r, c) = east(r, 20 - c)
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
