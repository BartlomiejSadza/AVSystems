import type { SpriteDefinition } from './types';

// Palette index aliases used in this file
const T = 0; // transparent
const D = 23; // pole dark / housing
const OFF = 22; // lamp off
const R = 9; // red
const Y = 10; // amber / orange
const G = 12; // green

// ---------------------------------------------------------------------------
// LIGHT_HOUSING — 7 × 20, all lamps in OFF state
// ---------------------------------------------------------------------------
// Layout (using column indices 0-6):
//   col 0: D or T    col 1: D    cols 2-4: D or lamp area    col 5: D    col 6: D or T
//
// Row 0  / 19 : .DDDDD.  (corners transparent)
// Row 1         DOOOOOOD  (O = 22, inner filled lamp-off)
// Rows 2-6      D.LLL.D  (red lamp area — OFF = 22)
// Row 7         DOOOOOOD  (O = 22, gap row filled lamp-off)
// Rows 8-12     D.LLL.D  (amber lamp area — OFF = 22)
// Row 13        DOOOOOOD  (O = 22, gap row filled lamp-off)
// Rows 14-18    D.LLL.D  (green lamp area — OFF = 22)
// Row 19        .DDDDD.

// prettier-ignore
const HOUSING_FRAME: number[] = [
  // Row 0
  T, D, D, D, D, D, T,
  // Row 1
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 2-6: red lamp area
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Row 7: gap
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 8-12: amber lamp area
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Row 13: gap
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Rows 14-18: green lamp area
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  D, OFF, OFF, OFF, OFF, OFF, D,
  // Row 19
  T, D, D, D, D, D, T,
];

export const LIGHT_HOUSING: SpriteDefinition = {
  name: 'LIGHT_HOUSING',
  width: 7,
  height: 20,
  frames: [HOUSING_FRAME],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// RED_LAMP_ACTIVE — 5 × 5, solid red square
// ---------------------------------------------------------------------------
// prettier-ignore
export const RED_LAMP_ACTIVE: SpriteDefinition = {
  name: 'RED_LAMP_ACTIVE',
  width: 5,
  height: 5,
  frames: [[
    R, R, R, R, R,
    R, R, R, R, R,
    R, R, R, R, R,
    R, R, R, R, R,
    R, R, R, R, R,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_NORTH — 5 × 5, arrow pointing UP
// ---------------------------------------------------------------------------
// prettier-ignore
export const GREEN_LAMP_NORTH: SpriteDefinition = {
  name: 'GREEN_LAMP_NORTH',
  width: 5,
  height: 5,
  frames: [[
    T, T, G, T, T,
    T, G, G, G, T,
    G, G, G, G, G,
    T, T, G, T, T,
    T, T, G, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_SOUTH — 5 × 5, arrow pointing DOWN
// ---------------------------------------------------------------------------
// prettier-ignore
export const GREEN_LAMP_SOUTH: SpriteDefinition = {
  name: 'GREEN_LAMP_SOUTH',
  width: 5,
  height: 5,
  frames: [[
    T, T, G, T, T,
    T, T, G, T, T,
    G, G, G, G, G,
    T, G, G, G, T,
    T, T, G, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_EAST — 5 × 5, arrow pointing RIGHT
// ---------------------------------------------------------------------------
// prettier-ignore
export const GREEN_LAMP_EAST: SpriteDefinition = {
  name: 'GREEN_LAMP_EAST',
  width: 5,
  height: 5,
  frames: [[
    T, T, G, T, T,
    T, T, G, G, T,
    G, G, G, G, G,
    T, T, G, G, T,
    T, T, G, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// GREEN_LAMP_WEST — 5 × 5, arrow pointing LEFT
// ---------------------------------------------------------------------------
// prettier-ignore
export const GREEN_LAMP_WEST: SpriteDefinition = {
  name: 'GREEN_LAMP_WEST',
  width: 5,
  height: 5,
  frames: [[
    T, T, G, T, T,
    T, G, G, T, T,
    G, G, G, G, G,
    T, G, G, T, T,
    T, T, G, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// AMBER_LAMP_ACTIVE — 5 × 5, diamond shape
// ---------------------------------------------------------------------------
// prettier-ignore
export const AMBER_LAMP_ACTIVE: SpriteDefinition = {
  name: 'AMBER_LAMP_ACTIVE',
  width: 5,
  height: 5,
  frames: [[
    T, T, Y, T, T,
    T, Y, Y, Y, T,
    Y, Y, Y, Y, Y,
    T, Y, Y, Y, T,
    T, T, Y, T, T,
  ]],
  frameDuration: 0,
};

// ---------------------------------------------------------------------------
// LAMP_INACTIVE — 5 × 5, all lamp-off (22)
// ---------------------------------------------------------------------------
// prettier-ignore
export const LAMP_INACTIVE: SpriteDefinition = {
  name: 'LAMP_INACTIVE',
  width: 5,
  height: 5,
  frames: [[
    OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, OFF,
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
