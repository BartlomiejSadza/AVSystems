/** A sprite is a 2D grid of color indices into a palette. 0 = transparent. */
export interface SpriteDefinition {
  name: string;
  width: number;
  height: number;
  frames: number[][]; // frames[frameIndex] = flat array of palette indices, length = width * height
  frameDuration: number; // ms per frame (0 = static)
}

/** 32-color PICO-8-inspired palette. Index 0 is always transparent. */
export const PALETTE: readonly string[] = [
  'transparent', // 0  transparent
  '#000000', // 1  black
  '#1D2B53', // 2  dark blue
  '#7E2553', // 3  dark purple
  '#008751', // 4  dark green
  '#AB5236', // 5  brown
  '#5F574F', // 6  dark grey
  '#C2C3C7', // 7  light grey
  '#FFF1E8', // 8  white
  '#FF004D', // 9  red
  '#FFA300', // 10 orange
  '#FFEC27', // 11 yellow
  '#00E436', // 12 green
  '#29ADFF', // 13 blue
  '#83769C', // 14 lavender
  '#FF77A8', // 15 pink
  '#FFCCAA', // 16 peach
  '#2C2C34', // 17 dark asphalt
  '#3A3A44', // 18 light asphalt
  '#4D4D57', // 19 sidewalk gray
  '#065E38', // 20 dark grass
  '#1A1A22', // 21 tar black
  '#2C2C2C', // 22 lamp off
  '#1A1A1A', // 23 pole dark
  '#FF6C24', // 24 warm orange
  '#00E436', // 25 car green
  '#FFF1E8', // 26 emergency white
  '#FFEC27', // 27 HUD yellow
  '#29ADFF', // 28 HUD blue
  '#FFF1E8', // 29 marking white
  '#C2C3C7', // 30 faded white
  '#5F574F', // 31 warm gray
] as const;
