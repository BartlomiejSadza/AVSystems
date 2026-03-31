import type { SpriteDefinition } from './types';

// Palette index aliases used in this file
const T = 0; // transparent
const D = 23; // pole dark / housing
const OFF = 22; // lamp off
const R = 9; // red
const Y = 10; // amber / orange
const G = 12; // green

// ---------------------------------------------------------------------------
// LIGHT_HOUSING — 10 × 28, all lamps in OFF state
// ---------------------------------------------------------------------------
// Layout (column indices 0-9):
//   col 0, 9 : D or T (frame / corners)
//   cols 1-8 : OFF (interior)
//
// Row  0        : T,D,D,D,D,D,D,D,D,T  (top, corners transparent)
// Row  1        : D,OFF×8,D             (gap before red)
// Rows  2- 8    : D,OFF×8,D             (red lamp area, 7 rows)
// Row  9        : D,OFF×8,D             (gap between red and amber)
// Rows 10-16    : D,OFF×8,D             (amber lamp area, 7 rows)
// Row 17        : D,OFF×8,D             (gap between amber and green)
// Rows 18-24    : D,OFF×8,D             (green lamp area, 7 rows)
// Row 25        : D,OFF×8,D             (gap after green)
// Row 26        : D,OFF×8,D             (bottom interior)
// Row 27        : T,D,D,D,D,D,D,D,D,T  (bottom, corners transparent)

// prettier-ignore
const HOUSING_FRAME: number[] = [
  // Row 0
  T, D, D, D, D, D, D, D, D, T,
  // Row 1 (gap before red)
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 2-8: red lamp area (7 rows)
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Row 9: gap
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 10-16: amber lamp area (7 rows)
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Row 17: gap
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 18-24: green lamp area (7 rows)
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Row 25: gap after green
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Row 26: bottom interior
  D, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, D,
  // Row 27
  T, D, D, D, D, D, D, D, D, T,
];

export const LIGHT_HOUSING: SpriteDefinition = {
  name: 'LIGHT_HOUSING',
  width: 10,
  height: 28,
  frames: [HOUSING_FRAME],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// RED_LAMP_ACTIVE — 7 × 7, solid red square
// ---------------------------------------------------------------------------
// prettier-ignore
export const RED_LAMP_ACTIVE: SpriteDefinition = {
  name: 'RED_LAMP_ACTIVE',
  width: 7,
  height: 7,
  frames: [[
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
    R, R, R, R, R, R, R,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_SOLID — 7 × 7, solid green circle (shared by all green lamps)
// ---------------------------------------------------------------------------
// prettier-ignore
const GREEN_SOLID: number[] = [
  T, T, G, G, G, T, T,
  T, G, G, G, G, G, T,
  G, G, G, G, G, G, G,
  G, G, G, G, G, G, G,
  G, G, G, G, G, G, G,
  T, G, G, G, G, G, T,
  T, T, G, G, G, T, T,
];

// ---------------------------------------------------------------------------
// GREEN_LAMP_NORTH — 7 × 7, solid green circle
// ---------------------------------------------------------------------------
export const GREEN_LAMP_NORTH: SpriteDefinition = {
  name: 'GREEN_LAMP_NORTH',
  width: 7,
  height: 7,
  frames: [GREEN_SOLID],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_SOUTH — 7 × 7, solid green circle
// ---------------------------------------------------------------------------
export const GREEN_LAMP_SOUTH: SpriteDefinition = {
  name: 'GREEN_LAMP_SOUTH',
  width: 7,
  height: 7,
  frames: [GREEN_SOLID],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_EAST — 7 × 7, solid green circle
// ---------------------------------------------------------------------------
export const GREEN_LAMP_EAST: SpriteDefinition = {
  name: 'GREEN_LAMP_EAST',
  width: 7,
  height: 7,
  frames: [GREEN_SOLID],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_WEST — 7 × 7, solid green circle
// ---------------------------------------------------------------------------
export const GREEN_LAMP_WEST: SpriteDefinition = {
  name: 'GREEN_LAMP_WEST',
  width: 7,
  height: 7,
  frames: [GREEN_SOLID],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// AMBER_LAMP_ACTIVE — 7 × 7, diamond shape
// ---------------------------------------------------------------------------
// prettier-ignore
export const AMBER_LAMP_ACTIVE: SpriteDefinition = {
  name: 'AMBER_LAMP_ACTIVE',
  width: 7,
  height: 7,
  frames: [[
    T, T, T, Y, T, T, T,
    T, T, Y, Y, Y, T, T,
    T, Y, Y, Y, Y, Y, T,
    Y, Y, Y, Y, Y, Y, Y,
    T, Y, Y, Y, Y, Y, T,
    T, T, Y, Y, Y, T, T,
    T, T, T, Y, T, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// LAMP_INACTIVE — 7 × 7, all lamp-off (22)
// ---------------------------------------------------------------------------
// prettier-ignore
export const LAMP_INACTIVE: SpriteDefinition = {
  name: 'LAMP_INACTIVE',
  width: 7,
  height: 7,
  frames: [[
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF, OFF, OFF,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// LIGHT_POLE — 1 × 1, single pole-dark pixel
// ---------------------------------------------------------------------------
export const LIGHT_POLE: SpriteDefinition = {
  name: 'LIGHT_POLE',
  width: 1,
  height: 1,
  frames: [[D]],
  frameDuration: 0,
};
