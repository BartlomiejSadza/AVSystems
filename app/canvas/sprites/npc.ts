import type { SpriteDefinition } from './types';

// Palette indices used
// 0  = transparent
// 2  = dark blue  (hat)
// 11 = yellow     (badge)
// 13 = blue       (uniform / body)
// 16 = peach      (skin)

// ─────────────────────────────────────────────────────────────────────────────
// OFFICER_IDLE — 16 × 24, 4 frames, 500 ms / frame
// Officer faces RIGHT (toward intersection).
//
// Legend used only in comments below:
//   H = 2   hat
//   S = 16  skin
//   B = 13  uniform blue
//   Y = 11  badge (yellow)
//   . = 0   transparent
// ─────────────────────────────────────────────────────────────────────────────

// Frame 0 — base / standing pose
// Each sub-array is one row (16 pixels).
const IDLE_F0: number[] = [
  // row 0  — all transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 1  — all transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 2  — hat top       .....HHHHHH.....
  0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0,
  // row 3  — hat brim      ....HHHHHHHH....
  0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0,
  // row 4  — face top      ......SSSS......
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 5  — face bottom   ......SSSS......
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 6  — collar        ......BBBB......
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 7  — shoulders     .....BBBBBB.....
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 8  — chest+badge   .....BBYBB......  (Y at col 7)
  0, 0, 0, 0, 0, 13, 13, 11, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 9  — chest         .....BBBBBB.....
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 10 — torso         .....BBBBBB.....
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 11 — torso         .....BBBBBB.....
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 12 — waist         ......BBBB......
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 13 — waist         ......BBBB......
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 14 — legs          .....BB..BB.....
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 15 — legs          .....BB..BB.....
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 16 — legs          .....BB..BB.....
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 17 — feet          .....BB..BB.....
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 18 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 19 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 20 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 21 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 22 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 23 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// Frame 1 — inhale: entire body shifted 1 px UP
// Top row becomes transparent; bottom content row (row 17 feet) is dropped,
// replaced by a transparent row at the bottom.
const IDLE_F1: number[] = [
  // row 0  (was row 1 of F0 — transparent)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 1  (was row 2 — hat top)
  0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0,
  // row 2  (was row 3 — hat brim)
  0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0,
  // row 3  (was row 4 — face top)
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 4  (was row 5 — face bottom)
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 5  (was row 6 — collar)
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 6  (was row 7 — shoulders)
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 7  (was row 8 — chest+badge)
  0, 0, 0, 0, 0, 13, 13, 11, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 8  (was row 9 — chest)
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 9  (was row 10 — torso)
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 10 (was row 11 — torso)
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 11 (was row 12 — waist)
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 12 (was row 13 — waist)
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 13 (was row 14 — legs)
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 14 (was row 15 — legs)
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 15 (was row 16 — legs)
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 16 (was row 17 — feet)
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 17 — transparent (feet row dropped)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 18 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 19 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 20 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 21 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 22 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 23 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// Frame 2 — gesture: same as F1 but right arm (col 11) extended on shoulder/chest rows
// Officer faces right, so "right arm" is toward col 11+ (the right side of the sprite).
const IDLE_F2: number[] = [
  // row 0
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 1  hat top
  0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0,
  // row 2  hat brim
  0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0,
  // row 3  face top
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 4  face bottom
  0, 0, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0, 0, 0,
  // row 5  collar
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 6  shoulders — right arm extends 1 px to col 11
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0,
  // row 7  chest+badge — arm pixel at col 11
  0, 0, 0, 0, 0, 13, 13, 11, 13, 13, 0, 13, 0, 0, 0, 0,
  // row 8  chest
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 9  torso
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 10 torso
  0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0, 0,
  // row 11 waist
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 12 waist
  0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 0, 0, 0, 0, 0, 0,
  // row 13 legs
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 14 legs
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 15 legs
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 16 feet
  0, 0, 0, 0, 0, 13, 13, 0, 0, 13, 13, 0, 0, 0, 0, 0,
  // row 17 transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 18
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 19
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 20
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 21
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 22
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 23
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// Frame 3 — exhale: same as frame 0 (back to base pose)
const IDLE_F3: number[] = [...IDLE_F0];

export const OFFICER_IDLE: SpriteDefinition = {
  name: 'OFFICER_IDLE',
  width: 16,
  height: 24,
  frames: [IDLE_F0, IDLE_F1, IDLE_F2, IDLE_F3],
  frameDuration: 500,
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFICER_PORTRAIT — 24 × 24, 1 frame, static
// Close-up face portrait. Same 4 palette indices.
// H=2 hat, S=16 skin, B=13 uniform, Y=11 badge, E=2 eyes (reuse dark-blue),
// .=0 transparent
// ─────────────────────────────────────────────────────────────────────────────

const PORTRAIT_F0: number[] = [
  // row 0  — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 1  — hat top band      ....HHHHHHHHHHHH....
  0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0,
  // row 2  — hat crown         ...HHHHHHHHHHHHHHHH..
  0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0,
  // row 3  — hat crown         ...HHHHHHHHHHHHHHHH..
  0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0,
  // row 4  — hat brim          ..HHHHHHHHHHHHHHHHHH.
  0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
  // row 5  — hat/face border   ....SSSSSSSSSSSSSS...
  0, 0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0, 0,
  // row 6  — upper face        ...SSSSSSSSSSSSSSSS..
  0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0,
  // row 7  — eyes row          ...SS.SSSS..SSSS.SS..   eyes at col 5 and col 16 (dark blue)
  0, 0, 0, 16, 16, 2, 2, 16, 16, 16, 16, 16, 16, 16, 16, 2, 2, 16, 16, 16, 16, 0, 0, 0,
  // row 8  — eyes row (depth)  ...SS.SSSS..SSSS.SS..
  0, 0, 0, 16, 16, 2, 2, 16, 16, 16, 16, 16, 16, 16, 16, 2, 2, 16, 16, 16, 16, 0, 0, 0,
  // row 9  — mid face          ...SSSSSSSSSSSSSSSS..
  0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0,
  // row 10 — nose area         ...SSSSSSSSSSSSSSSS..
  0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0,
  // row 11 — mouth area        ...SSSSSSSSSSSSSSSS..
  0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0,
  // row 12 — lower face        ....SSSSSSSSSSSSSS...
  0, 0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0, 0,
  // row 13 — chin              .....SSSSSSSSSSSS....
  0, 0, 0, 0, 0, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 0, 0, 0, 0, 0,
  // row 14 — collar            ....BBBBBBBBBBBBBB...
  0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0,
  // row 15 — shoulders         ...BBBBBBBBBBBBBBBB..
  0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0,
  // row 16 — chest with badge  ...BBBBBBY.BBBBBBBB..   badge at col 10
  0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 11, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0,
  // row 17 — chest badge row   ...BBBBBBY.BBBBBBBB..
  0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 11, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0,
  // row 18 — lower chest       ...BBBBBBBBBBBBBBB...
  0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0,
  // row 19 — waist             ....BBBBBBBBBBBBB....
  0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0, 0, 0, 0,
  // row 20 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 21 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 22 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // row 23 — transparent
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const OFFICER_PORTRAIT: SpriteDefinition = {
  name: 'OFFICER_PORTRAIT',
  width: 24,
  height: 24,
  frames: [PORTRAIT_F0],
  frameDuration: 0,
};
