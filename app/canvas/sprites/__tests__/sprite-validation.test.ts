import { describe, it, expect } from 'vitest';
import type { SpriteDefinition } from '../types';
import {
  GRASS_TILE,
  SIDEWALK_TILE,
  TREE_ROUND,
  TREE_POINTY,
  CROSSWALK_STRIPE,
  CENTER_LANE_DASH,
  STOP_LINE,
  ROAD_EDGE_LINE,
} from '../environment';
import {
  CAR_NORTH_BLUE,
  CAR_NORTH_PINK,
  CAR_NORTH_GREEN,
  CAR_NORTH_CREAM,
  CAR_SOUTH_BLUE,
  CAR_SOUTH_PINK,
  CAR_SOUTH_GREEN,
  CAR_SOUTH_CREAM,
  CAR_EAST_BLUE,
  CAR_EAST_PINK,
  CAR_EAST_GREEN,
  CAR_EAST_CREAM,
  CAR_WEST_BLUE,
  CAR_WEST_PINK,
  CAR_WEST_GREEN,
  CAR_WEST_CREAM,
  AMBULANCE_NORTH,
  AMBULANCE_SOUTH,
  AMBULANCE_EAST,
  AMBULANCE_WEST,
} from '../vehicles';
import {
  LIGHT_HOUSING,
  RED_LAMP_ACTIVE,
  GREEN_LAMP_NORTH,
  GREEN_LAMP_SOUTH,
  GREEN_LAMP_EAST,
  GREEN_LAMP_WEST,
  AMBER_LAMP_ACTIVE,
  LAMP_INACTIVE,
  LIGHT_POLE,
} from '../traffic-lights';
import { OFFICER_IDLE, OFFICER_PORTRAIT } from '../npc';
import {
  BUBBLE_CORNER_TL,
  BUBBLE_CORNER_TR,
  BUBBLE_CORNER_BL,
  BUBBLE_CORNER_BR,
  BUBBLE_EDGE_H,
  BUBBLE_EDGE_V,
  BUBBLE_FILL,
  BUBBLE_ARROW_DOWN,
  BUBBLE_ARROW_UP,
  ARROW_NORTH,
  ARROW_SOUTH,
  ARROW_EAST,
  ARROW_WEST,
} from '../ui';

// ---------------------------------------------------------------------------
// All sprites grouped for universal tests
// ---------------------------------------------------------------------------

const ALL_SPRITES: SpriteDefinition[] = [
  // Environment
  GRASS_TILE,
  SIDEWALK_TILE,
  TREE_ROUND,
  TREE_POINTY,
  CROSSWALK_STRIPE,
  CENTER_LANE_DASH,
  STOP_LINE,
  ROAD_EDGE_LINE,
  // Vehicles — normal cars
  CAR_NORTH_BLUE,
  CAR_NORTH_PINK,
  CAR_NORTH_GREEN,
  CAR_NORTH_CREAM,
  CAR_SOUTH_BLUE,
  CAR_SOUTH_PINK,
  CAR_SOUTH_GREEN,
  CAR_SOUTH_CREAM,
  CAR_EAST_BLUE,
  CAR_EAST_PINK,
  CAR_EAST_GREEN,
  CAR_EAST_CREAM,
  CAR_WEST_BLUE,
  CAR_WEST_PINK,
  CAR_WEST_GREEN,
  CAR_WEST_CREAM,
  // Vehicles — ambulances
  AMBULANCE_NORTH,
  AMBULANCE_SOUTH,
  AMBULANCE_EAST,
  AMBULANCE_WEST,
  // Traffic lights
  LIGHT_HOUSING,
  RED_LAMP_ACTIVE,
  GREEN_LAMP_NORTH,
  GREEN_LAMP_SOUTH,
  GREEN_LAMP_EAST,
  GREEN_LAMP_WEST,
  AMBER_LAMP_ACTIVE,
  LAMP_INACTIVE,
  LIGHT_POLE,
  // NPC
  OFFICER_IDLE,
  OFFICER_PORTRAIT,
  // UI
  BUBBLE_CORNER_TL,
  BUBBLE_CORNER_TR,
  BUBBLE_CORNER_BL,
  BUBBLE_CORNER_BR,
  BUBBLE_EDGE_H,
  BUBBLE_EDGE_V,
  BUBBLE_FILL,
  BUBBLE_ARROW_DOWN,
  BUBBLE_ARROW_UP,
  ARROW_NORTH,
  ARROW_SOUTH,
  ARROW_EAST,
  ARROW_WEST,
];

/**
 * Ambulances intentionally use more than 4 colors (body, tires, windshield,
 * cross, two flasher states) — they are exempt from the max-4-color rule.
 */
const AMBULANCE_SPRITES = new Set<SpriteDefinition>([
  AMBULANCE_NORTH,
  AMBULANCE_SOUTH,
  AMBULANCE_EAST,
  AMBULANCE_WEST,
]);

// ---------------------------------------------------------------------------
// Universal validation tests
// ---------------------------------------------------------------------------

describe.each(ALL_SPRITES.map((s) => [s.name, s] as const))('%s', (_name, sprite) => {
  it('width > 0', () => {
    expect(sprite.width).toBeGreaterThan(0);
  });

  it('height > 0', () => {
    expect(sprite.height).toBeGreaterThan(0);
  });

  it('has at least one frame', () => {
    expect(sprite.frames.length).toBeGreaterThan(0);
  });

  it('name is a non-empty string', () => {
    expect(typeof sprite.name).toBe('string');
    expect(sprite.name.length).toBeGreaterThan(0);
  });

  it('every frame length equals width * height', () => {
    for (const frame of sprite.frames) {
      expect(frame).toHaveLength(sprite.width * sprite.height);
    }
  });

  it('every palette index in every frame is 0–31 (inclusive)', () => {
    for (const frame of sprite.frames) {
      for (const idx of frame) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(31);
      }
    }
  });

  it('animated sprites (frames > 1) have frameDuration > 0', () => {
    if (sprite.frames.length > 1) {
      expect(sprite.frameDuration).toBeGreaterThan(0);
    }
  });

  it('static sprites (frames === 1) have frameDuration === 0', () => {
    if (sprite.frames.length === 1) {
      expect(sprite.frameDuration).toBe(0);
    }
  });

  it('no frame uses more than 4 non-transparent colors (ambulances exempt)', () => {
    if (AMBULANCE_SPRITES.has(sprite)) return;
    for (const frame of sprite.frames) {
      const nonTransparent = new Set(frame.filter((idx) => idx !== 0));
      expect(nonTransparent.size).toBeLessThanOrEqual(4);
    }
  });
});

// ---------------------------------------------------------------------------
// Environment-specific tests
// ---------------------------------------------------------------------------

describe('Environment sprites', () => {
  it('GRASS_TILE is 8x8 and static', () => {
    expect(GRASS_TILE.width).toBe(8);
    expect(GRASS_TILE.height).toBe(8);
    expect(GRASS_TILE.frames).toHaveLength(1);
    expect(GRASS_TILE.frameDuration).toBe(0);
  });

  it('SIDEWALK_TILE is 8x8 and static', () => {
    expect(SIDEWALK_TILE.width).toBe(8);
    expect(SIDEWALK_TILE.height).toBe(8);
    expect(SIDEWALK_TILE.frames).toHaveLength(1);
    expect(SIDEWALK_TILE.frameDuration).toBe(0);
  });

  it('TREE_ROUND is 10x14, 2 frames, frameDuration 1000', () => {
    expect(TREE_ROUND.width).toBe(10);
    expect(TREE_ROUND.height).toBe(14);
    expect(TREE_ROUND.frames).toHaveLength(2);
    expect(TREE_ROUND.frameDuration).toBe(1000);
  });

  it('TREE_POINTY is 10x14, 2 frames, frameDuration 1000', () => {
    expect(TREE_POINTY.width).toBe(10);
    expect(TREE_POINTY.height).toBe(14);
    expect(TREE_POINTY.frames).toHaveLength(2);
    expect(TREE_POINTY.frameDuration).toBe(1000);
  });

  it('CROSSWALK_STRIPE is 2x6 and static', () => {
    expect(CROSSWALK_STRIPE.width).toBe(2);
    expect(CROSSWALK_STRIPE.height).toBe(6);
    expect(CROSSWALK_STRIPE.frames).toHaveLength(1);
    expect(CROSSWALK_STRIPE.frameDuration).toBe(0);
  });

  it('CENTER_LANE_DASH is 1x3 and static', () => {
    expect(CENTER_LANE_DASH.width).toBe(1);
    expect(CENTER_LANE_DASH.height).toBe(3);
    expect(CENTER_LANE_DASH.frames).toHaveLength(1);
    expect(CENTER_LANE_DASH.frameDuration).toBe(0);
  });

  it('STOP_LINE is 24x1 and static', () => {
    expect(STOP_LINE.width).toBe(24);
    expect(STOP_LINE.height).toBe(1);
    expect(STOP_LINE.frames).toHaveLength(1);
    expect(STOP_LINE.frameDuration).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Vehicle-specific tests
// ---------------------------------------------------------------------------

describe('Vehicle sprites', () => {
  const northSouthCars = [
    CAR_NORTH_BLUE,
    CAR_NORTH_PINK,
    CAR_NORTH_GREEN,
    CAR_NORTH_CREAM,
    CAR_SOUTH_BLUE,
    CAR_SOUTH_PINK,
    CAR_SOUTH_GREEN,
    CAR_SOUTH_CREAM,
  ];

  const eastWestCars = [
    CAR_EAST_BLUE,
    CAR_EAST_PINK,
    CAR_EAST_GREEN,
    CAR_EAST_CREAM,
    CAR_WEST_BLUE,
    CAR_WEST_PINK,
    CAR_WEST_GREEN,
    CAR_WEST_CREAM,
  ];

  it('all North/South cars are 8x12 with a single frame', () => {
    for (const car of northSouthCars) {
      expect(car.width).toBe(8);
      expect(car.height).toBe(12);
      expect(car.frames).toHaveLength(1);
    }
  });

  it('all East/West cars are 12x8 with a single frame', () => {
    for (const car of eastWestCars) {
      expect(car.width).toBe(12);
      expect(car.height).toBe(8);
      expect(car.frames).toHaveLength(1);
    }
  });

  it('all 16 car variants exist (4 directions × 4 colors)', () => {
    expect(CAR_NORTH_BLUE).toBeDefined();
    expect(CAR_NORTH_PINK).toBeDefined();
    expect(CAR_NORTH_GREEN).toBeDefined();
    expect(CAR_NORTH_CREAM).toBeDefined();

    expect(CAR_SOUTH_BLUE).toBeDefined();
    expect(CAR_SOUTH_PINK).toBeDefined();
    expect(CAR_SOUTH_GREEN).toBeDefined();
    expect(CAR_SOUTH_CREAM).toBeDefined();

    expect(CAR_EAST_BLUE).toBeDefined();
    expect(CAR_EAST_PINK).toBeDefined();
    expect(CAR_EAST_GREEN).toBeDefined();
    expect(CAR_EAST_CREAM).toBeDefined();

    expect(CAR_WEST_BLUE).toBeDefined();
    expect(CAR_WEST_PINK).toBeDefined();
    expect(CAR_WEST_GREEN).toBeDefined();
    expect(CAR_WEST_CREAM).toBeDefined();
  });

  it('AMBULANCE_NORTH is 8x14, 2 frames, frameDuration 250', () => {
    expect(AMBULANCE_NORTH.width).toBe(8);
    expect(AMBULANCE_NORTH.height).toBe(14);
    expect(AMBULANCE_NORTH.frames).toHaveLength(2);
    expect(AMBULANCE_NORTH.frameDuration).toBe(250);
  });

  it('AMBULANCE_SOUTH is 8x14, 2 frames, frameDuration 250', () => {
    expect(AMBULANCE_SOUTH.width).toBe(8);
    expect(AMBULANCE_SOUTH.height).toBe(14);
    expect(AMBULANCE_SOUTH.frames).toHaveLength(2);
    expect(AMBULANCE_SOUTH.frameDuration).toBe(250);
  });

  it('AMBULANCE_EAST is 14x8, 2 frames, frameDuration 250', () => {
    expect(AMBULANCE_EAST.width).toBe(14);
    expect(AMBULANCE_EAST.height).toBe(8);
    expect(AMBULANCE_EAST.frames).toHaveLength(2);
    expect(AMBULANCE_EAST.frameDuration).toBe(250);
  });

  it('AMBULANCE_WEST is 14x8, 2 frames, frameDuration 250', () => {
    expect(AMBULANCE_WEST.width).toBe(14);
    expect(AMBULANCE_WEST.height).toBe(8);
    expect(AMBULANCE_WEST.frames).toHaveLength(2);
    expect(AMBULANCE_WEST.frameDuration).toBe(250);
  });

  it('AMBULANCE_NORTH has alternating flasher colors between frames', () => {
    // Frame 0 and Frame 1 must not be identical (flashers alternate)
    const f0 = AMBULANCE_NORTH.frames[0];
    const f1 = AMBULANCE_NORTH.frames[1];
    expect(f0).not.toEqual(f1);
  });

  it('AMBULANCE_SOUTH has alternating flasher colors between frames', () => {
    const f0 = AMBULANCE_SOUTH.frames[0];
    const f1 = AMBULANCE_SOUTH.frames[1];
    expect(f0).not.toEqual(f1);
  });

  it('AMBULANCE_EAST has alternating flasher colors between frames', () => {
    const f0 = AMBULANCE_EAST.frames[0];
    const f1 = AMBULANCE_EAST.frames[1];
    expect(f0).not.toEqual(f1);
  });

  it('AMBULANCE_WEST has alternating flasher colors between frames', () => {
    const f0 = AMBULANCE_WEST.frames[0];
    const f1 = AMBULANCE_WEST.frames[1];
    expect(f0).not.toEqual(f1);
  });

  // W-05 regression: east-facing car taillights must be on the LEFT side (cols 0–1),
  // not mirrored to the right. Protects against accidentally swapping east and west data.
  it('W-05: east car taillights (index 9) appear in left columns (cols 0–1), not right', () => {
    const TAILLIGHT = 9;
    const WIDTH = 12;
    // Rows where taillights are expected on the left per the spec layout:
    //   Row 1: RR.BBBBBBBB.  → col 0 and col 1
    //   Row 2: RBBBBBBBBBBT  → col 0
    //   Row 5: RBBBBBBBBBBT  → col 0
    //   Row 6: RR.BBBBBBBB.  → col 0 and col 1
    const leftTaillightPositions = [
      1 * WIDTH + 0,
      1 * WIDTH + 1,
      2 * WIDTH + 0,
      5 * WIDTH + 0,
      6 * WIDTH + 0,
      6 * WIDTH + 1,
    ];
    // Right-side columns that must NOT contain taillights (cols 10–11 for each taillight row)
    const rightColumnPositions = [
      1 * WIDTH + 10,
      1 * WIDTH + 11,
      2 * WIDTH + 11,
      5 * WIDTH + 11,
      6 * WIDTH + 10,
      6 * WIDTH + 11,
    ];

    for (const car of [CAR_EAST_BLUE, CAR_EAST_PINK, CAR_EAST_GREEN, CAR_EAST_CREAM]) {
      const frame = car.frames[0]!;

      // All expected left-side taillight positions must be index 9
      for (const pos of leftTaillightPositions) {
        expect(frame[pos]).toBe(TAILLIGHT);
      }

      // None of the right-side mirror positions should be index 9
      for (const pos of rightColumnPositions) {
        expect(frame[pos]).not.toBe(TAILLIGHT);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Traffic-light-specific tests
// ---------------------------------------------------------------------------

describe('Traffic light sprites', () => {
  it('LIGHT_HOUSING is 7x20 and static', () => {
    expect(LIGHT_HOUSING.width).toBe(7);
    expect(LIGHT_HOUSING.height).toBe(20);
    expect(LIGHT_HOUSING.frames).toHaveLength(1);
    expect(LIGHT_HOUSING.frameDuration).toBe(0);
  });

  const lampSprites = [
    RED_LAMP_ACTIVE,
    GREEN_LAMP_NORTH,
    GREEN_LAMP_SOUTH,
    GREEN_LAMP_EAST,
    GREEN_LAMP_WEST,
    AMBER_LAMP_ACTIVE,
    LAMP_INACTIVE,
  ];

  it('all lamp sprites are 5x5 and static', () => {
    for (const lamp of lampSprites) {
      expect(lamp.width).toBe(5);
      expect(lamp.height).toBe(5);
      expect(lamp.frames).toHaveLength(1);
      expect(lamp.frameDuration).toBe(0);
    }
  });

  it('GREEN_LAMP_NORTH exists', () => {
    expect(GREEN_LAMP_NORTH).toBeDefined();
  });

  it('GREEN_LAMP_SOUTH exists', () => {
    expect(GREEN_LAMP_SOUTH).toBeDefined();
  });

  it('GREEN_LAMP_EAST exists', () => {
    expect(GREEN_LAMP_EAST).toBeDefined();
  });

  it('GREEN_LAMP_WEST exists', () => {
    expect(GREEN_LAMP_WEST).toBeDefined();
  });

  it('GREEN_LAMP_NORTH shows a green arrow pointing up (top-center pixel is green)', () => {
    // Row 0, col 2 (center top) should be 12 (green) for up-pointing arrow
    const frame = GREEN_LAMP_NORTH.frames[0]!;
    expect(frame[2]).toBe(12); // row 0, col 2
  });

  it('GREEN_LAMP_SOUTH shows a green arrow pointing down (bottom-center pixel is green)', () => {
    // Row 4 (bottom), col 2 (center) should be 12 (green)
    const frame = GREEN_LAMP_SOUTH.frames[0]!;
    expect(frame[4 * 5 + 2]).toBe(12); // row 4, col 2
  });

  it('GREEN_LAMP_EAST shows a green arrow pointing right (right-center pixel is green)', () => {
    // Row 2 (middle), col 4 (rightmost) should be 12 (green)
    const frame = GREEN_LAMP_EAST.frames[0]!;
    expect(frame[2 * 5 + 4]).toBe(12); // row 2, col 4
  });

  it('GREEN_LAMP_WEST shows a green arrow pointing left (left-center pixel is green)', () => {
    // Row 2 (middle), col 0 (leftmost) should be 12 (green)
    const frame = GREEN_LAMP_WEST.frames[0]!;
    expect(frame[2 * 5 + 0]).toBe(12); // row 2, col 0
  });

  it('RED_LAMP_ACTIVE is entirely red (palette index 9)', () => {
    const frame = RED_LAMP_ACTIVE.frames[0]!;
    for (const pixel of frame) {
      expect(pixel).toBe(9);
    }
  });

  it('LAMP_INACTIVE is entirely lamp-off (palette index 22)', () => {
    const frame = LAMP_INACTIVE.frames[0]!;
    for (const pixel of frame) {
      expect(pixel).toBe(22);
    }
  });
});

// ---------------------------------------------------------------------------
// NPC-specific tests
// ---------------------------------------------------------------------------

describe('NPC sprites', () => {
  it('OFFICER_IDLE is 16x24, 4 frames, frameDuration 500', () => {
    expect(OFFICER_IDLE.width).toBe(16);
    expect(OFFICER_IDLE.height).toBe(24);
    expect(OFFICER_IDLE.frames).toHaveLength(4);
    expect(OFFICER_IDLE.frameDuration).toBe(500);
  });

  it('OFFICER_PORTRAIT is 24x24, 1 frame, static', () => {
    expect(OFFICER_PORTRAIT.width).toBe(24);
    expect(OFFICER_PORTRAIT.height).toBe(24);
    expect(OFFICER_PORTRAIT.frames).toHaveLength(1);
    expect(OFFICER_PORTRAIT.frameDuration).toBe(0);
  });

  it('OFFICER_IDLE uses at most 4 non-transparent colors per frame', () => {
    for (const frame of OFFICER_IDLE.frames) {
      const nonTransparent = new Set(frame.filter((idx) => idx !== 0));
      expect(nonTransparent.size).toBeLessThanOrEqual(4);
    }
  });

  it('OFFICER_PORTRAIT uses at most 4 non-transparent colors', () => {
    const frame = OFFICER_PORTRAIT.frames[0]!;
    const nonTransparent = new Set(frame.filter((idx) => idx !== 0));
    expect(nonTransparent.size).toBeLessThanOrEqual(4);
  });

  it('OFFICER_IDLE frame 3 equals frame 0 (exhale returns to base pose)', () => {
    expect(OFFICER_IDLE.frames[3]).toEqual(OFFICER_IDLE.frames[0]);
  });
});

// ---------------------------------------------------------------------------
// UI-specific tests
// ---------------------------------------------------------------------------

describe('UI sprites', () => {
  const bubbleCorners = [BUBBLE_CORNER_TL, BUBBLE_CORNER_TR, BUBBLE_CORNER_BL, BUBBLE_CORNER_BR];

  it('all bubble corners are 2x2 and static', () => {
    for (const corner of bubbleCorners) {
      expect(corner.width).toBe(2);
      expect(corner.height).toBe(2);
      expect(corner.frames).toHaveLength(1);
      expect(corner.frameDuration).toBe(0);
    }
  });

  const arrows = [ARROW_NORTH, ARROW_SOUTH, ARROW_EAST, ARROW_WEST];

  it('all directional arrows are 5x5 and static', () => {
    for (const arrow of arrows) {
      expect(arrow.width).toBe(5);
      expect(arrow.height).toBe(5);
      expect(arrow.frames).toHaveLength(1);
      expect(arrow.frameDuration).toBe(0);
    }
  });

  const bubbleTails = [BUBBLE_ARROW_DOWN, BUBBLE_ARROW_UP];

  it('bubble tails are 5x3 and static', () => {
    for (const tail of bubbleTails) {
      expect(tail.width).toBe(5);
      expect(tail.height).toBe(3);
      expect(tail.frames).toHaveLength(1);
      expect(tail.frameDuration).toBe(0);
    }
  });

  it('BUBBLE_CORNER_TL has transparent at [0,0] and purple at [0,1]', () => {
    const frame = BUBBLE_CORNER_TL.frames[0]!;
    expect(frame[0]).toBe(0); // top-left transparent
    expect(frame[1]).toBe(3); // top-right dark purple
  });

  it('BUBBLE_CORNER_TR has purple at [0,0] and transparent at [0,1]', () => {
    const frame = BUBBLE_CORNER_TR.frames[0]!;
    expect(frame[0]).toBe(3); // top-left dark purple
    expect(frame[1]).toBe(0); // top-right transparent
  });

  it('BUBBLE_FILL is entirely white (palette index 8)', () => {
    const frame = BUBBLE_FILL.frames[0]!;
    expect(frame[0]).toBe(8);
  });
});
