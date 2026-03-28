# Game Design Specification: Pixel-Art Traffic Lights Simulator

**Version:** 1.0
**Date:** 2026-03-27
**Target audience:** Children aged 11-13 (educational context)
**Rendering:** HTML Canvas (pixel scene) + React overlay (HUD, tooltips, controls)
**Pixel scale:** 1 game pixel = 3 CSS pixels
**Canvas:** 320x240 game pixels, rendered at 960x720 CSS pixels

---

## Table of Contents

1. [Visual Style Guide](#1-visual-style-guide)
2. [Sprite Specifications](#2-sprite-specifications)
3. [Scene Layout](#3-scene-layout)
4. [HUD Design](#4-hud-design)
5. [Animation System](#5-animation-system)
6. [Decorative Elements](#6-decorative-elements)
7. [Pixel Font](#7-pixel-font)

---

## 1. Visual Style Guide

### 1.1 Color Palette (32 colors, NES/PICO-8 inspired)

The palette is organized into functional groups. Every color has one primary purpose. No colors exist without a mapped function. **Index 0 is reserved for transparency.** This palette is the single canonical palette shared by both the Game Design and Frontend Architecture specs. Sprite pixel maps use these indices directly.

#### Index 0 -- Transparency

| Index | Hex         | Name        | Purpose                                   |
| ----- | ----------- | ----------- | ----------------------------------------- |
| 00    | transparent | Transparent | Transparent pixel (skip during rendering) |

#### Base PICO-8 Core (indices 1-16)

| Index | Hex       | Name        | Purpose                                                  |
| ----- | --------- | ----------- | -------------------------------------------------------- |
| 01    | `#000000` | Black       | HUD background bar, button backgrounds                   |
| 02    | `#1D2B53` | Dark Blue   | Sky / scene background, windshield                       |
| 03    | `#7E2553` | Dark Purple | NPC dialog box border, accent elements                   |
| 04    | `#008751` | Dark Green  | Grass quadrants (corners of the map)                     |
| 05    | `#AB5236` | Brown       | Tree trunks, fence posts, building accents               |
| 06    | `#5F574F` | Dark Gray   | Building walls (base)                                    |
| 07    | `#C2C3C7` | Light Gray  | Worn road markings, secondary labels                     |
| 08    | `#FFF1E8` | White       | Crosswalk stripes, stop lines, primary HUD text          |
| 09    | `#FF004D` | Red         | Signal Red -- active STOP signal, emergency vehicle body |
| 10    | `#FFA300` | Orange      | Amber/yellow transitional signal, warnings               |
| 11    | `#FFEC27` | Yellow      | Center lane divider, highlighted numbers                 |
| 12    | `#00E436` | Green       | Signal Green -- active GO signal                         |
| 13    | `#29ADFF` | Blue        | Colorblind-safe GO halo, car variant A, HUD info         |
| 14    | `#83769C` | Lavender    | Building rooftops                                        |
| 15    | `#FF77A8` | Pink        | Normal vehicle variant B (compact)                       |
| 16    | `#FFCCAA` | Peach       | NPC face/hands, car variant D (wagon)                    |

#### Extended Colors (indices 17-31)

| Index | Hex       | Name            | Purpose                                      |
| ----- | --------- | --------------- | -------------------------------------------- |
| 17    | `#2C2C34` | Dark Asphalt    | Road surface (base)                          |
| 18    | `#3A3A44` | Light Asphalt   | Road surface (center intersection box)       |
| 19    | `#4D4D57` | Sidewalk Gray   | Sidewalk / curb surface                      |
| 20    | `#065E38` | Dark Grass      | Grass shadow / variation strips              |
| 21    | `#1A1A22` | Tar Black       | Road cracks, manhole covers, shadow accents  |
| 22    | `#2C2C2C` | Lamp Off        | Inactive lamp housing (unlit bulb)           |
| 23    | `#1A1A1A` | Pole Dark       | Traffic light pole / housing body            |
| 24    | `#FF6C24` | Warm Orange     | Window glow, NPC portrait accent, highlights |
| 25    | `#00E436` | Car Green       | Normal vehicle variant C (hatchback)         |
| 26    | `#FFF1E8` | Emergency White | Ambulance cross, emergency vehicle markings  |
| 27    | `#FFEC27` | HUD Yellow      | Reuses yellow for HUD highlight contexts     |
| 28    | `#29ADFF` | HUD Blue        | Reuses blue for HUD info contexts            |
| 29    | `#FFF1E8` | Marking White   | Reuses white for road marking contexts       |
| 30    | `#C2C3C7` | Faded White     | Faded markings, muted text                   |
| 31    | `#5F574F` | Warm Gray       | Building wall variants                       |

**Note on duplicate hex values:** Some indices share the same hex color but carry different semantic meaning. This allows sprite pixel maps to be self-documenting -- a sprite author can choose index 26 (Emergency White) vs index 08 (White) to communicate intent, even though the rendered color is the same.

#### Traffic Lights -- COLORBLIND SAFE

This is the most critical section for the educational mission. The traffic light design uses BOTH color AND shape to communicate state, ensuring accessibility for children with color vision deficiency.

Key palette indices for traffic lights:

- **Signal Green:** index 12 (`#00E436`)
- **Signal Red:** index 09 (`#FF004D`)
- **Signal Amber:** index 10 (`#FFA300`)
- **Signal Blue (colorblind halo):** index 13 (`#29ADFF`)
- **Lamp Off:** index 22 (`#2C2C2C`)
- **Pole/Housing Dark:** index 23 (`#1A1A1A`)

**Colorblind safety strategy:**

- Red signal rendered as a SQUARE shape (stop sign association)
- Green signal rendered as an ARROW/TRIANGLE shape pointing in the traffic flow direction (directional + state)
- Amber signal rendered as a DIAMOND shape
- Additionally, the green lamp gets a blue-tinted halo (`#29ADFF` at 50% dither) so deuteranopia/protanopia users see a distinct blue glow vs the red glow
- Signal text labels ("GO" / "STOP") rendered inside each lamp at 3x3 pixel font when zoom is sufficient
- Position encoding: green is always BOTTOM lamp, red is always TOP lamp (consistent with real-world convention)

### 1.2 Palette Rules

- Maximum 4 colors per sprite (excluding transparency)
- No anti-aliasing anywhere -- all edges are hard pixel boundaries
- Dithering uses checkerboard pattern (alternating pixels) for gradients and glows
- Transparency is index 0 -- sprite pixel data uses 0 for transparent pixels
- All shadows are 1px offset, using the next-darker color in the same functional group

---

## 2. Sprite Specifications

### 2.1 General Sprite Rules

- All sprites are drawn on a pixel grid with no sub-pixel positioning
- No rotation -- all directional variants are hand-specified pixel data
- No scaling at sprite level -- the 3x CSS scale is applied to the entire canvas
- Sprite anchor point is top-left corner unless otherwise noted
- Transparency: any pixel not explicitly colored is transparent

### 2.2 Vehicles

#### 2.2.1 Normal Car (4 variants by color)

| Property             | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Sprite size          | 8 x 12 px (width x height) for N/S orientation                   |
| Sprite size          | 12 x 8 px (width x height) for E/W orientation                   |
| Colors per sprite    | 3 (body, windshield `#1D2B53`, tire `#1A1A22`)                   |
| Body color variants  | Blue `#29ADFF`, Pink `#FF77A8`, Green `#00E436`, Cream `#FFCCAA` |
| Directional variants | 4 (N, S, E, W) -- each is a unique pixel layout                  |

**North-facing car (8w x 12h) pixel layout:**

```
Row 0:  ..BBBB..      (hood, rounded front)
Row 1:  .BBBBBB.      (hood, full width)
Row 2:  TBBBBBBT      (body + tires)
Row 3:  BWWWWWWB      (windshield row)
Row 4:  BWWWWWWB      (windshield row)
Row 5:  BBBBBBBB      (roof)
Row 6:  BBBBBBBB      (roof)
Row 7:  BBBBBBBB      (body)
Row 8:  TBBBBBBT      (body + tires)
Row 9:  .BBBBBB.      (rear)
Row 10: .BBBBBB.      (rear)
Row 11: ..BRRB..      (taillights: R = #FF004D)
```

Legend: B = body color, T = tire `#1A1A22`, W = windshield `#1D2B53`, R = taillight `#FF004D`, `.` = transparent

**South-facing car:** Mirror of north vertically. Taillights at row 0, hood at row 11. Windshield rows 7-8.

**East-facing car (12w x 8h):** 90-degree rotated layout (hood on the right side, taillights on the left -- rear of the car).

```
Row 0:  ......TBBT..
Row 1:  RR.BBBBBBBB.
Row 2:  RBBBBBBBBBBT
Row 3:  .BBBBBBBWWB.
Row 4:  .BBBBBBBWWB.
Row 5:  RBBBBBBBBBBT
Row 6:  RR.BBBBBBBB.
Row 7:  ......TBBT..
```

**West-facing car:** Mirror of east horizontally. Hood on the left side.

#### 2.2.2 Bus (Phase 2 -- future-ready, not implemented in initial release)

> **Status:** This sprite is defined for future use. In Phase 2, buses may be assigned randomly as a cosmetic variant to some normal-priority vehicles for visual variety, with no domain model changes required. The simulation engine's `Vehicle` type has no `vehicleType` field, so bus rendering is purely visual.

| Property             | Value                                                |
| -------------------- | ---------------------------------------------------- |
| Sprite size          | 8 x 20 px (N/S), 20 x 8 px (E/W)                     |
| Colors per sprite    | 3 (body `#FFEC27`, window `#1D2B53`, tire `#1A1A22`) |
| Directional variants | 4 (N, S, E, W)                                       |

The bus uses the same structural logic as the car but is 20px long instead of 12px. It has 3 window rows instead of 1. Body color is always yellow `#FFEC27`.

#### 2.2.3 Ambulance (Emergency Vehicle)

| Property             | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| Sprite size          | 8 x 14 px (N/S), 14 x 8 px (E/W)                                       |
| Colors per sprite    | 4 (body `#FF004D`, cross `#FFF1E8`, flasher `#29ADFF`, tire `#1A1A22`) |
| Directional variants | 4 (N, S, E, W)                                                         |
| Animation frames     | 2 (flasher alternation)                                                |
| Animation speed      | 250ms per frame (4 FPS flasher cycle)                                  |

**North-facing ambulance (8w x 14h):**

```
Row 0:  ..FBBF..      F = flasher (alternates #29ADFF / #FFF1E8)
Row 1:  .BBBBBB.
Row 2:  TBBBBBB T
Row 3:  BWWWWWWB
Row 4:  BBBBBBBB
Row 5:  BB.CC.BB      C = cross white #FFF1E8
Row 6:  BBCCCCBB
Row 7:  BB.CC.BB
Row 8:  BBBBBBBB
Row 9:  TBBBBBBT
Row 10: .BBBBBB.
Row 11: .BBBBBB.
Row 12: ..BRRB..
Row 13: ..BRRB..
```

Flasher animation: Frame 0 has left flasher ON (blue), right OFF (dark). Frame 1 swaps.

### 2.3 Traffic Lights

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| Housing size  | 7 x 20 px (vertical housing for N/S facing)    |
| Pole size     | 1 x variable px (extends from housing to curb) |
| Lamp diameter | 5 x 5 px                                       |
| Housing color | `#1A1A1A` (Pole Dark)                          |
| Lamp spacing  | 1px gap between lamps                          |

**Traffic light housing layout (7w x 20h):**

```
Row 0:  .DDDDD.       D = housing dark #1A1A1A
Row 1:  D.....D
Row 2:  D.RRR.D       R = red lamp area (5x5 starts here)
Row 3:  D.RRR.D
Row 4:  D.RRR.D       Red lamp: SQUARE shape when active (stop sign association)
Row 5:  D.RRR.D
Row 6:  D.RRR.D
Row 7:  D.....D       1px gap
Row 8:  D.YYY.D       Y = amber lamp area (DIAMOND shape when active during transitions)
Row 9:  D.YYY.D
Row 10: D.YYY.D
Row 11: D.YYY.D
Row 12: D.YYY.D
Row 13: D.....D       1px gap
Row 14: D.GGG.D       G = green lamp area
Row 15: D.GGG.D       Green lamp: ARROW/TRIANGLE shape when active (points in traffic flow direction)
Row 16: D.GGG.D
Row 17: D.GGG.D
Row 18: D.GGG.D
Row 19: .DDDDD.
```

**Lamp active states:**

- RED active: 5x5 square filled with `#FF004D` (index 09), 1px glow outline with `#FF004D` at 50% dither
- GREEN active: 5x5 arrow/triangle filled with `#00E436` (index 12), 1px glow outline with `#29ADFF` (index 13) at 50% dither (colorblind halo)
- AMBER active (during transitions only): 5x5 diamond filled with `#FFA300` (index 10), 1px glow outline with `#FFA300` at 50% dither. See Section 5.3 for amber transition timing (300ms pulse ON-OFF-ON).
- Inactive lamp: filled with `#2C2C2C` (index 22, Lamp Off)

**Colorblind shape encoding within the 5x5 lamp area:**

Red lamp active (square -- stop sign association):

```
RRRRR
RRRRR
RRRRR
RRRRR
RRRRR
```

Green lamp active (arrow/triangle -- points in traffic flow direction):

```
..G..
.GGG.
GGGGG
.GGG.
..G..
```

Note: For N/S traffic lights, the arrow points down (south) or up (north) to indicate flow direction. For E/W lights, the arrow points left or right. The 5x5 arrow shapes are:

North-facing (arrow up):

```
..G..
.GGG.
GGGGG
..G..
..G..
```

South-facing (arrow down):

```
..G..
..G..
GGGGG
.GGG.
..G..
```

East-facing (arrow right):

```
..G..
..GG.
GGGGG
..GG.
..G..
```

West-facing (arrow left):

```
..G..
.GG..
GGGGG
.GG..
..G..
```

Amber lamp active (diamond):

```
..Y..
.YYY.
YYYYY
.YYY.
..Y..
```

This shape distinction (square vs arrow vs diamond) is visible even when color perception is compromised. The directional arrow for green additionally communicates which direction has the green signal, providing an extra information channel.

### 2.4 NPC Commentator (Pixel Police Officer)

| Property          | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Sprite size       | 16 x 24 px                                                            |
| Colors per sprite | 4 (uniform `#29ADFF`, skin `#FFCCAA`, hat `#1D2B53`, badge `#FFEC27`) |
| Animation frames  | 4 (idle breathing cycle)                                              |
| Animation speed   | 500ms per frame (2 FPS idle cycle, 2s full loop)                      |
| Position          | Fixed, bottom-left of scene area (see Section 3)                      |
| Facing            | Always faces right (toward intersection)                              |

**Idle animation:**

- Frame 0: Base pose
- Frame 1: Body shifts 1px up (inhale)
- Frame 2: Body at 1px up, arm shifts 1px (slight gesture)
- Frame 3: Body shifts back down (exhale)

**Reaction animations (override idle):**

- Vehicle added: Officer raises hand (2 frames, 300ms each, then returns to idle)
- Phase change: Officer points at active lights (3 frames, 250ms each)
- Emergency vehicle: Officer salutes (2 frames, 400ms each, holds frame 1 for 1s)

**Portrait (for dialog box):**

| Property      | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Portrait size | 24 x 24 px                                             |
| Colors        | Same 4 as sprite                                       |
| Detail        | Face close-up, hat, badge visible, friendly expression |

### 2.5 Pedestrian NPCs (Decorative)

| Property          | Value                                        |
| ----------------- | -------------------------------------------- |
| Sprite size       | 8 x 12 px                                    |
| Variants          | 3 (different hair/shirt colors)              |
| Animation frames  | 2 (standing idle -- weight shift)            |
| Animation speed   | 800ms per frame                              |
| Colors per sprite | 3 (hair, shirt, pants -- drawn from palette) |

Pedestrians stand on sidewalks. They do not cross the road (out of scope for the simulation). They are purely decorative, adding life to the scene.

### 2.6 Trees

| Property         | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Sprite size      | 10 x 14 px                                             |
| Variants         | 2 (round canopy, pointy canopy)                        |
| Animation frames | 2 (gentle sway)                                        |
| Animation speed  | 1000ms per frame (very slow, ambient)                  |
| Colors           | Trunk `#AB5236`, canopy `#008751`, highlight `#00E436` |

### 2.7 Buildings

| Property         | Value                                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| Sprite size      | 24 x 28 px (small), 32 x 36 px (large)                                           |
| Variants         | 4 (shop, house, apartment, school)                                               |
| Animation frames | 1 (static) -- window glow handled by overlay                                     |
| Colors           | Wall `#5F574F`, roof `#83769C`, window `#1D2B53`, glow `#FF6C24`, door `#AB5236` |

### 2.8 Road Markings

| Element          | Size              | Color     | Notes                                       |
| ---------------- | ----------------- | --------- | ------------------------------------------- |
| Center lane dash | 1 x 3 px          | `#FFEC27` | Repeated every 6px along road center        |
| Stop line        | road_width x 1 px | `#FFF1E8` | Perpendicular to road, at intersection edge |
| Crosswalk stripe | 2 x 6 px          | `#FFF1E8` | 4 stripes per crosswalk, 2px gap            |
| Road edge line   | 1 x continuous    | `#C2C3C7` | Solid line at road/sidewalk boundary        |

---

## 3. Scene Layout

### 3.1 Canvas Dimensions

| Property          | Value                        |
| ----------------- | ---------------------------- |
| Game resolution   | 320 x 240 px                 |
| CSS render size   | 960 x 720 px (3x scale)      |
| CSS canvas style  | `image-rendering: pixelated` |
| Canvas background | `#1D2B53` (Midnight Blue)    |

The canvas renders ONLY the game scene (intersection, roads, vehicles, traffic lights, NPC sprite, decorations). The HUD and control bar are **React DOM components** positioned above and below the canvas respectively -- they are NOT rendered inside the canvas.

The full 320x240 canvas area is available for the game scene. The overall page layout (managed by `PixelSimulatorApp` CSS grid) is:

- **HUD Top Bar:** React DOM overlay above canvas
- **Game Scene Canvas:** 320 x 240 game pixels (960 x 720 CSS pixels)
- **Control Bar:** React DOM overlay below canvas

### 3.2 Intersection Grid (within Game Scene zone)

The intersection is centered in the game scene zone. All coordinates below are relative to the full 320x240 canvas.

| Constant          | Value  | Notes                                                          |
| ----------------- | ------ | -------------------------------------------------------------- |
| ROAD_WIDTH        | 24 px  | Width of each road arm (2 lanes)                               |
| LANE_WIDTH        | 12 px  | Width of a single lane                                         |
| SIDEWALK_WIDTH    | 6 px   | Sidewalk on each side of road                                  |
| INTERSECTION_X    | 148 px | Left edge of intersection box                                  |
| INTERSECTION_Y    | 104 px | Top edge of intersection box (scene-relative: y=104 on canvas) |
| INTERSECTION_SIZE | 24 px  | The intersection box is ROAD_WIDTH x ROAD_WIDTH                |
| CROSSWALK_WIDTH   | 4 px   | Width of crosswalk zone at each approach                       |

### 3.3 Road Layout (absolute canvas coordinates)

**North road arm:**

- Left edge: x = 148
- Right edge: x = 172 (148 + 24)
- Top: y = 16 (16px top margin for scene breathing room)
- Bottom: y = 104 (top of intersection)
- Center divider at: x = 160

**South road arm:**

- Left edge: x = 148
- Right edge: x = 172
- Top: y = 128 (bottom of intersection, 104 + 24)
- Bottom: y = 224 (16px bottom margin for scene breathing room)
- Center divider at: x = 160

**West road arm:**

- Top edge: y = 104
- Bottom edge: y = 128 (104 + 24)
- Left: x = 0
- Right: x = 148 (left of intersection)
- Center divider at: y = 116

**East road arm:**

- Top edge: y = 104
- Bottom edge: y = 128
- Left: x = 172 (right of intersection)
- Right: x = 319
- Center divider at: y = 116

**Intersection box:**

- x = 148, y = 104, width = 24, height = 24
- Filled with `#3A3A44` (Light Asphalt)

### 3.4 Sidewalks (absolute canvas coordinates)

Sidewalks run along both sides of every road arm, 6px wide, filled with `#4D4D57`.

| Sidewalk segment      | x   | y   | w   | h   |
| --------------------- | --- | --- | --- | --- |
| North road, west side | 142 | 16  | 6   | 88  |
| North road, east side | 172 | 16  | 6   | 88  |
| South road, west side | 142 | 128 | 6   | 88  |
| South road, east side | 172 | 128 | 6   | 88  |
| West road, north side | 0   | 98  | 148 | 6   |
| West road, south side | 0   | 128 | 148 | 6   |
| East road, north side | 172 | 98  | 148 | 6   |
| East road, south side | 172 | 128 | 148 | 6   |

### 3.5 Grass Quadrants

The four corner areas filled with `#008751`, with `#065E38` dither strips for variation:

| Quadrant  | x   | y   | w   | h   |
| --------- | --- | --- | --- | --- |
| NW corner | 0   | 16  | 142 | 82  |
| NE corner | 178 | 16  | 142 | 82  |
| SW corner | 0   | 134 | 142 | 90  |
| SE corner | 178 | 134 | 142 | 90  |

### 3.6 Element Placement (absolute canvas coordinates)

#### Traffic Lights

Each road has one traffic light positioned at the roadside, just before the intersection:

| Road  | Light anchor (x, y) | Pole direction   | Notes                          |
| ----- | ------------------- | ---------------- | ------------------------------ |
| North | (140, 80)           | Vertical down    | On west sidewalk, facing south |
| South | (174, 130)          | Vertical up      | On east sidewalk, facing north |
| West  | (124, 130)          | Horizontal right | On south sidewalk, facing east |
| East  | (174, 96)           | Horizontal left  | On north sidewalk, facing west |

Traffic lights for N/S roads use the vertical housing (7x20). Traffic lights for E/W roads use a horizontal variant (20x7), which is a 90-degree pixel rotation of the vertical housing.

#### Vehicle Queue Positions

Vehicles queue along their road, starting from the stop line and extending away from the intersection. Each vehicle occupies a slot.

**Slot spacing:** 14px center-to-center (12px vehicle body + 2px gap)

**Queue slot anchors (first vehicle = slot 0, closest to intersection):**

| Road  | Lane x-center | Slot 0 y | Direction | Max visible | Slot spacing                         |
| ----- | ------------- | -------- | --------- | ----------- | ------------------------------------ |
| North | 154           | 90       | upward    | 8 vehicles  | 10px (compressed from 14px to fit 8) |
| South | 166           | 130      | downward  | 8 vehicles  | 10px (compressed from 14px to fit 8) |
| West  | 132           | 110      | leftward  | 6 vehicles  | 14px (standard spacing)              |
| East  | 174           | 122      | rightward | 6 vehicles  | 14px (standard spacing)              |

For North queue: slot N anchor = (154, 90 - N*10). Vehicle sprite centered on lane. Uses 10px spacing for N/S roads.
For South queue: slot N anchor = (166, 130 + N*10). Uses 10px spacing for N/S roads.
For West queue: slot N anchor = (132 - N*14, 110). Uses E/W sprite orientation, 14px spacing.
For East queue: slot N anchor = (174 + N*14, 122). Uses E/W sprite orientation, 14px spacing.

If more vehicles exist than visible slots, a "+N" overflow counter is drawn at the end of the visible queue.

#### NPC Commentator Position

| Property      | Value                               |
| ------------- | ----------------------------------- |
| Anchor (x, y) | (8, 188)                            |
| Zone          | SW grass quadrant, near bottom-left |
| Facing        | Right (toward intersection)         |

#### Decorative Element Zones

Buildings and trees are placed in the four grass quadrants. Exact positions:

| Element          | Position (x, y) | Quadrant           |
| ---------------- | --------------- | ------------------ |
| Building: Shop   | (10, 20)        | NW                 |
| Building: House  | (50, 24)        | NW                 |
| Tree A (round)   | (100, 40)       | NW                 |
| Tree B (pointy)  | (120, 50)       | NW                 |
| Building: School | (200, 20)       | NE                 |
| Tree C (round)   | (260, 40)       | NE                 |
| Building: Apt    | (280, 24)       | NE                 |
| Tree D (pointy)  | (20, 160)       | SW                 |
| Pedestrian 1     | (142, 94)       | NW sidewalk corner |
| Pedestrian 2     | (178, 132)      | SE sidewalk corner |
| Pedestrian 3     | (142, 132)      | SW sidewalk corner |
| Tree E (round)   | (220, 160)      | SE                 |
| Building: Shop2  | (260, 150)      | SE                 |

### 3.7 Coordinate System

- Origin (0, 0) is top-left of the canvas
- X increases rightward, Y increases downward
- All positions are in game pixels (1 game px = 3 CSS px)
- Sprite anchors are at their top-left corner
- No sub-pixel rendering is allowed -- all coordinates must be integers

---

## 4. HUD Design

### 4.1 Top Bar (React DOM overlay)

> **Rendering:** This component is a **React DOM element** (`<HudBar>`), not canvas-rendered. It uses a CSS pixel font (e.g., "Press Start 2P" from Google Fonts or a custom `@font-face` bitmap font) to achieve the pixel-art aesthetic while rendering at CSS resolution for readability. All dimensions below are in CSS pixels.

| Property   | Value                                                                                 |
| ---------- | ------------------------------------------------------------------------------------- |
| Position   | Above the canvas, in the CSS grid layout                                              |
| Size       | 960 x 48 CSS px (matches canvas width at 3x)                                          |
| Background | `#000000`                                                                             |
| Border     | 3px bottom border in `#7E2553`                                                        |
| Font       | CSS pixel font ("Press Start 2P" or custom), 15px CSS (equivalent to 5 game px at 3x) |

**Layout (left to right, using flexbox or CSS grid):**

| Element               | Font size (CSS) | Color     | Content                       |
| --------------------- | --------------- | --------- | ----------------------------- |
| Phase indicator icon  | --              | --        | 15x15 CSS px colored square   |
| Phase label           | 15px            | `#FFF1E8` | "NS" or "EW" or "--"          |
| Step counter label    | 15px            | `#C2C3C7` | "STEP:"                       |
| Step counter value    | 15px            | `#FFEC27` | "0042" (zero-padded 4 digits) |
| Queue indicator label | 15px            | `#C2C3C7` | "QUEUE:"                      |
| Queue N count         | 15px            | `#29ADFF` | "N:3"                         |
| Queue S count         | 15px            | `#29ADFF` | "S:1"                         |
| Queue E count         | 15px            | `#29ADFF` | "E:0"                         |
| Queue W count         | 15px            | `#29ADFF` | "W:2"                         |
| Vehicles cleared      | 15px            | `#00E436` | "OK:12" (total cleared)       |

**Phase indicator icon:**

- NS active: 15x15 CSS px green square `#00E436` with vertical arrow pattern
- EW active: 15x15 CSS px green square `#00E436` with horizontal arrow pattern
- No phase: 15x15 CSS px dark square `#2C2C2C`

### 4.2 Bottom Control Bar (React DOM overlay)

> **Rendering:** This component is a **React DOM element** (`<ControlBar>`), not canvas-rendered. It uses the same CSS pixel font as the HUD and pixel-art CSS styling (box-shadow for depth, border-image or CSS borders for pixel borders). All dimensions below are in CSS pixels. The AddVehicle interaction uses **per-direction pixel-art buttons** (one button per cardinal direction) for a game-like feel, rather than a form with dropdowns.

| Property   | Value                                        |
| ---------- | -------------------------------------------- |
| Position   | Below the canvas, in the CSS grid layout     |
| Size       | 960 x 72 CSS px (matches canvas width at 3x) |
| Background | `#000000`                                    |
| Border     | 3px top border in `#7E2553`                  |
| Font       | CSS pixel font, 15px CSS                     |

**Button specifications (CSS pixels, laid out with flexbox):**

All buttons are React `<PixelButton>` components with pixel-art CSS styling (border, background, press animation via CSS transform).

| Button         | w (CSS) | h (CSS) | Icon                   | Label  |
| -------------- | ------- | ------- | ---------------------- | ------ |
| Step (advance) | 108     | 48      | Right-arrow icon       | "STEP" |
| Auto Play      | 108     | 48      | Play triangle icon     | "AUTO" |
| Speed control  | 108     | 48      | "1x"/"2x"/"4x" text    | --     |
| Add Car (N)    | 60      | 48      | Car icon + "N"         | --     |
| Add Car (S)    | 60      | 48      | Car icon + "S"         | --     |
| Add Car (E)    | 60      | 48      | Car icon + "E"         | --     |
| Add Car (W)    | 60      | 48      | Car icon + "W"         | --     |
| Add Emergency  | 120     | 48      | Ambulance icon + "SOS" | --     |
| Reset          | 48      | 48      | Circular arrow icon    | --     |

**Button states (CSS):**

- Default: border `#4D4D57`, background `#1A1A22`, text `#C2C3C7`
- Hover: border `#FFEC27`, background `#2C2C34`, text `#FFF1E8`
- Active/pressed: border `#FFEC27`, background `#7E2553`, text `#FFEC27`, `transform: translateY(3px)`
- Disabled: border `#2C2C34`, background `#1A1A1A`, text `#4D4D57`

Auto Play button when active: border `#00E436`, pulsing glow effect via CSS animation (box-shadow alternates at 500ms)

### 4.3 NPC Dialog Box (React DOM overlay)

> **Rendering:** This component is a **React DOM element** (`<NpcDialog>`), positioned absolutely above the canvas. It uses CSS pixel font for text rendering at CSS resolution. The NPC portrait is a small inline `<canvas>` element (or a pre-rendered `<img>`) embedded within the React component to maintain the pixel-art sprite look. All dimensions below are in CSS pixels.

The dialog box appears as a React overlay positioned above the canvas, triggered by simulation events.

| Property       | Value                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Position (CSS) | Bottom-left of canvas area, offset ~90px CSS up from NPC sprite screen position (calculated via `gameToCSS`) |
| Size (CSS)     | 360 x 120 CSS px                                                                                             |
| Background     | `#000000`                                                                                                    |
| Border         | 6px `#7E2553` (CSS border)                                                                                   |
| Border corners | Pixel-art notched corners via CSS `clip-path` or border-image                                                |
| Speech tail    | CSS triangle (18x12 CSS px) pointing down-left toward NPC                                                    |

**Internal layout (CSS flexbox):**

| Element      | Size (CSS)     | Notes                                                                                                                |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Portrait     | 72 x 72 CSS px | NPC portrait: inline `<canvas>` element rendering 24x24 sprite at 3x, or a `<img>` with `image-rendering: pixelated` |
| Divider line | 3 x 102 CSS px | `#7E2553` vertical divider (CSS border-right)                                                                        |
| Text area    | flex-grow      | Message text area, uses CSS pixel font                                                                               |

**Text area properties:**

- Font: CSS pixel font ("Press Start 2P" or custom `@font-face`), 15px CSS
- Line height: 21px CSS (15px font + 6px spacing)
- Max lines: 4
- Text color: `#FFF1E8`
- Keyword highlighting: `#FFEC27` (CSS `<span>` with color) for important terms ("green light", "red light", "emergency")

**Dialog triggers and messages:**

| Event                  | Message example                                                 |
| ---------------------- | --------------------------------------------------------------- |
| Simulation start       | "Welcome! I'm Officer Pixel. Let's learn about traffic lights!" |
| Vehicle added          | "A car joined the [ROAD] queue. [COUNT] cars waiting now."      |
| Step executed (normal) | "The [DIRECTION] road got a green light. [N] cars passed!"      |
| Emergency vehicle      | "Emergency! An ambulance needs to get through fast!"            |
| Empty step             | "No cars waiting. The intersection is quiet."                   |
| Phase switch           | "The light changed! Now [DIRECTION] has green."                 |

### 4.4 Tooltip Design (React DOM overlay)

> **Rendering:** Tooltips are **React DOM elements** (`<Tooltip>`), absolutely positioned above the canvas. They use CSS pixel font at CSS resolution. Position is calculated by converting the hovered game-pixel coordinate to CSS coordinates via `gameToCSS`.

| Property   | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| Size (CSS) | Variable width (auto), 36-60 CSS px height                     |
| Background | `#000000`                                                      |
| Border     | 3px `#C2C3C7` (CSS border)                                     |
| Padding    | 6px all sides (CSS)                                            |
| Font       | CSS pixel font, 15px CSS                                       |
| Text color | `#FFF1E8`                                                      |
| Arrow      | 9x9 CSS px triangle (CSS pseudo-element), points toward target |
| Delay      | 400ms hover before showing                                     |
| Position   | Prefer above target; if clipped, below                         |

**Tooltip targets:**

| Target                | Tooltip content                        |
| --------------------- | -------------------------------------- |
| Traffic light (green) | "GREEN: Cars on this road can go!"     |
| Traffic light (red)   | "RED: Cars must stop and wait."        |
| Vehicle in queue      | "Car [ID] waiting on [ROAD] road"      |
| Emergency vehicle     | "AMBULANCE [ID] - gets priority!"      |
| Step button           | "Advance simulation by one step"       |
| Auto button           | "Auto-play: steps run automatically"   |
| Phase indicator       | "Shows which road has the green light" |
| Queue count           | "[ROAD]: [N] cars waiting"             |

---

## 5. Animation System

### 5.1 Frame Rate and Timing

| Property          | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Target frame rate | 30 FPS (33.3ms per frame)                                                    |
| Render method     | requestAnimationFrame with delta accumulator                                 |
| Tick rate         | Animation ticks at 30 FPS; simulation steps are user-triggered or auto-timed |
| Auto-play speeds  | 1x = 1 step/sec, 2x = 2 steps/sec, 4x = 4 steps/sec                          |

### 5.2 Vehicle Movement Animation

When a step is executed and vehicles leave the intersection, they animate through the intersection and off-screen.

**Movement sequence (per departing vehicle):**

| Phase                 | Duration | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| 1. Queue advance      | 300ms    | Remaining vehicles slide forward to fill gaps    |
| 2. Enter intersection | 200ms    | Departing vehicle moves from stop line to center |
| 3. Cross intersection | 200ms    | Vehicle moves through intersection box           |
| 4. Exit and fade      | 300ms    | Vehicle moves off the intersection and fades out |

**Movement speed:** 1 px per frame (30 px/sec at 30 FPS) during normal transit.

**Queue advance animation:**

- Speed: 2 px per frame
- Easing: Linear (no acceleration -- pixel art style favors snappy movement)
- Each vehicle moves forward by 14px (one slot) when the vehicle ahead departs

**Vehicle appearing animation (when addVehicle is called):**

- New vehicle fades in at its queue slot over 200ms (opacity: 0 to 1, simulated via dithering)
- Frame 0: 25% dither (every 4th pixel drawn)
- Frame 1: 50% dither (checkerboard)
- Frame 2: 75% dither
- Frame 3: 100% solid

### 5.3 Traffic Light Transitions

When the active phase changes between steps:

| Phase                | Duration | Visual effect                                    |
| -------------------- | -------- | ------------------------------------------------ |
| 1. Current green off | 150ms    | Green lamp fades: solid -> 50% dither -> off     |
| 2. Yellow flash      | 300ms    | Yellow lamp pulses ON-OFF-ON (100ms each)        |
| 3. All red           | 200ms    | Both directions show red (safety interval)       |
| 4. New green on      | 150ms    | New green lamp fades: off -> 50% dither -> solid |

**Green lamp glow effect (steady state):**

- The 1px colorblind halo around the green lamp alternates between `#29ADFF` solid and `#29ADFF` 50% dither on a 500ms cycle, creating a subtle "breathing" glow.

**Red lamp glow effect (steady state):**

- 1px glow border around active red lamp, solid `#FF004D`, no animation (static = danger = stable warning).

### 5.4 Phase Change Visual Feedback

Beyond the traffic lights themselves, the phase change triggers scene-wide feedback:

- **Road highlight pulse:** The active road pair briefly flashes a 1px outline in `#00E436` around the road surface (150ms on, then off).
- **Intersection box:** Fills with `#3A3A44` normally, briefly fills with `#4D4D57` during transition (200ms).

### 5.5 NPC Reaction Timing

| Event             | Reaction delay | Animation duration | Return to idle |
| ----------------- | -------------- | ------------------ | -------------- |
| Vehicle added     | 100ms          | 600ms              | Immediate      |
| Phase change      | 200ms          | 750ms              | Immediate      |
| Emergency vehicle | 0ms            | 1800ms             | 500ms pause    |
| Step (no change)  | None           | None               | Stays idle     |

### 5.6 Ambulance Flasher Animation

The ambulance flasher runs independently of simulation state, whenever an emergency vehicle is visible on screen:

- **Cycle:** 250ms per frame, 2 frames total = 500ms full cycle
- **Frame 0:** Left flasher pixel = `#29ADFF`, right flasher pixel = `#FFF1E8`
- **Frame 1:** Left flasher pixel = `#FFF1E8`, right flasher pixel = `#29ADFF`
- **Glow:** 1px dithered glow around the ambulance sprite alternates between `#29ADFF` 25% dither and `#FF004D` 25% dither, synchronized with flasher frames

### 5.7 Overflow Counter Animation

When a queue has more vehicles than visible slots:

- The "+N" text pulses between `#FFF1E8` and `#FFEC27` on a 600ms cycle
- The number updates instantly when vehicles are added or depart

---

## 6. Decorative Elements

### 6.1 Design Philosophy

The decorations serve three purposes:

1. Fill the grass quadrants so the scene does not feel empty
2. Reinforce the retro pixel-art game aesthetic
3. Provide context -- this is a neighborhood, not an abstract diagram

All decorative elements are static (or near-static with ambient animation). They must never distract from the intersection, which is the educational focus.

### 6.2 Buildings

#### 6.2.1 Shop (24 x 28 px)

- Wall: `#5F574F`
- Roof: `#83769C`, 3px tall, extends 1px beyond wall on each side
- Door: `#AB5236`, 4x8 px, centered at bottom
- Window: `#1D2B53`, 4x4 px, two windows flanking door
- Awning: `#FF004D`, 2px tall strip above door, striped with `#FFF1E8` (alternating 2px columns)
- Sign: 2px tall, above awning, `#FFEC27` text on `#1A1A22` background

#### 6.2.2 House (24 x 28 px)

- Wall: `#FFCCAA`
- Roof: `#FF004D`, triangular (gabled), 8px tall peak
- Door: `#AB5236`, 4x8 px, offset left
- Window: `#1D2B53`, 6x5 px, single large window, 1px `#FFF1E8` frame
- Chimney: `#5F574F`, 3x4 px, on right side of roof

#### 6.2.3 Apartment (32 x 36 px)

- Wall: `#5F574F`
- Roof: `#83769C`, flat, 2px tall
- Windows: `#1D2B53`, 3x3 px, grid of 3 columns x 4 rows, 2px spacing
- Door: `#AB5236`, 4x6 px, centered at bottom
- Window glow: Every other window randomly assigned `#FF6C24` overlay (drawn once at scene init, not animated)

#### 6.2.4 School (32 x 36 px)

- Wall: `#FFCCAA`
- Roof: `#29ADFF`, flat, 2px tall
- Windows: `#1D2B53`, 4x4 px, grid of 3 columns x 2 rows
- Door: `#AB5236`, 6x8 px, double door (center split line)
- Flag: 1px pole extending 6px above roof, 4x3 px flag in `#FF004D`
- Clock: 5x5 px circle on wall above door, `#FFF1E8` face, `#1A1A22` hands

### 6.3 Trees

#### 6.3.1 Round Tree (10 x 14 px)

```
....GG....
...GGGG...
..GGGGGG..
.GGgGGGGG.
GGGgGGGGGG
GGGGGgGGGG
.GGGGGgGG.
..GGGGGG..
...GGGG...
.....G....
....TT....
....TT....
....TT....
....TT....
```

G = `#008751`, g = `#00E436` (highlight), T = `#AB5236`

Sway animation: the entire canopy shifts 1px left on frame 0, 1px right on frame 1.

#### 6.3.2 Pointy Tree (10 x 14 px)

```
....GG....
...GGGG...
..GGgGGG..
.GGGGGGGG.
....GG....
...GGGG...
..GGgGGG..
.GGGGGGGG.
GGGGGGGGGG
.GGGGGGGG.
....TT....
....TT....
....TT....
....TT....
```

Layered triangular shape (two stacked triangle sections).

### 6.4 Ground Details

Scattered across grass quadrants to break up flat color:

| Element    | Size   | Frequency         | Color                     |
| ---------- | ------ | ----------------- | ------------------------- |
| Grass tuft | 3x2 px | 8-12 per quadrant | `#00E436` (lighter green) |
| Flower     | 2x2 px | 2-3 per quadrant  | `#FF77A8` or `#FFEC27`    |
| Rock       | 3x2 px | 1-2 per quadrant  | `#4D4D57`                 |

These are placed randomly at scene initialization using a seeded RNG (seed based on a fixed value for determinism). They do not animate.

### 6.5 Manhole Cover (on road)

| Property | Value                                  |
| -------- | -------------------------------------- |
| Size     | 4 x 4 px                               |
| Position | 1 per road arm, centered in lane       |
| Color    | `#1A1A22` with `#2C2C34` cross pattern |

---

## 7. Pixel Font

### 7.1 Approach -- Dual Font Strategy

Text rendering is split between two systems to balance readability with pixel-art aesthetic:

1. **Canvas bitmap font** -- used ONLY for in-game atmospheric/decorative text rendered on the canvas (overflow counters, road labels, vehicle labels). Defined as pixel data in code.
2. **CSS pixel font** -- used for all critical informational text in React DOM overlays (HUD, control bar labels, NPC dialog, tooltips). Uses a web font such as "Press Start 2P" (Google Fonts) or a custom `@font-face` bitmap font file. This renders at CSS resolution for reliable readability.

This hybrid approach follows UX Research recommendations (Section 6.3): "Use the React overlay (rendered at CSS resolution) for all critical informational text. Reserve pixel font rendering in Canvas for atmospheric/decorative text only."

### 7.2 Canvas Bitmap Font Specification

The canvas bitmap font is a monospaced bitmap font, defined as pixel data in code. It is used only for text drawn directly on the canvas.

| Property       | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Character cell | 5 x 7 px (includes 1px spacing on right, 1px on bottom)                           |
| Glyph size     | 4 x 6 px (actual drawn area within cell)                                          |
| Character set  | A-Z uppercase, a-z lowercase, 0-9, common punctuation: `.,:;!?()-+=/'"` and space |
| Kerning        | None (monospaced)                                                                 |
| Baseline       | Row 5 of the 6px glyph height                                                     |

### 7.3 Font Usage Matrix

| Usage                    | Rendering | Font               | Size      |
| ------------------------ | --------- | ------------------ | --------- |
| HUD numbers/labels       | React DOM | CSS pixel font     | 15px CSS  |
| NPC dialog text          | React DOM | CSS pixel font     | 15px CSS  |
| Tooltip text             | React DOM | CSS pixel font     | 15px CSS  |
| Button labels            | React DOM | CSS pixel font     | 15px CSS  |
| Overflow counter "+N"    | Canvas    | Canvas bitmap font | 5 game px |
| Road/vehicle labels      | Canvas    | Canvas bitmap font | 5 game px |
| In-scene decorative text | Canvas    | Canvas bitmap font | 5 game px |
| Phase label in HUD       | React DOM | CSS pixel font     | 15px CSS  |

**Color emphasis rules** (applies to both font systems): Important values use `#FFEC27` (yellow), secondary info uses `#29ADFF` (blue), standard text uses `#FFF1E8` (white), and muted text uses `#C2C3C7` (faded). Emphasis is through COLOR, not size -- consistent with pixel-art game conventions.

### 7.4 Font Rendering Rules

**Canvas bitmap font (in-game text only):**

- All text is rendered to integer pixel coordinates (no sub-pixel)
- Text shadow: optional 1px offset in `#000000` for text rendered over non-black backgrounds (scene area text like overflow counters)
- No bold or italic variants -- emphasis is color-only
- Line spacing: 7px (cell height)

**CSS pixel font (React DOM overlays):**

- Font family: "Press Start 2P" (Google Fonts) or equivalent pixel-art webfont loaded via `@font-face`
- Fallback: `"Press Start 2P", "Courier New", monospace`
- All React overlay text uses this font for visual consistency with the pixel-art theme
- No bold or italic variants -- emphasis is color-only (matching canvas convention)
- Maximum characters per line in NPC dialog box: ~20 characters at 15px CSS font in the text area
- Text wrapping in dialog: CSS `word-wrap: break-word`; hyphenation not supported

### 7.5 Sample Glyph Data (4w x 6h)

For implementation reference, here are key glyphs as binary grids (1 = filled pixel, 0 = empty):

**Letter A:**

```
.XX.
X..X
X..X
XXXX
X..X
X..X
```

**Digit 0:**

```
.XX.
X..X
X.XX
XX.X
X..X
.XX.
```

**Colon (:)**

```
....
.XX.
.XX.
....
.XX.
.XX.
```

The full character set must be defined as constant arrays in the renderer code, following this 4x6 grid pattern.

---

## Appendix A: Colorblind Accessibility Summary

This section consolidates all colorblind-safety measures for review.

| Measure                                     | Section ref | Rationale                                           |
| ------------------------------------------- | ----------- | --------------------------------------------------- |
| Shape-coded signals (square/circle)         | 2.3         | Distinguishable without color perception            |
| Blue halo on green signal                   | 2.3         | Deutan/protan users see blue vs red distinction     |
| Positional encoding (top=red, bottom=green) | 2.3         | Matches real-world convention children already know |
| High contrast lamp vs housing               | 2.3         | Active lamps contrast >4.5:1 against housing        |
| Color+text dual encoding in HUD             | 4.1         | Phase shown as text "NS"/"EW" not just color        |
| Tooltip text describes state                | 4.4         | "GREEN: Cars can go" -- verbal, not color-only      |

---

## Appendix B: Z-Order (draw order, back to front)

| Layer | Content                                            |
| ----- | -------------------------------------------------- |
| 0     | Background fill (`#1D2B53`)                        |
| 1     | Grass quadrants                                    |
| 2     | Ground details (tufts, flowers, rocks)             |
| 3     | Road surfaces                                      |
| 4     | Road markings (lines, crosswalks, manholes)        |
| 5     | Sidewalks                                          |
| 6     | Buildings                                          |
| 7     | Trees                                              |
| 8     | Traffic light poles                                |
| 9     | Vehicles in queue (sorted by Y for N/S, X for E/W) |
| 10    | Traffic light housings and lamps                   |
| 11    | NPC commentator                                    |
| 12    | Pedestrian NPCs                                    |
| 13    | Glow effects and overlays                          |
| 14    | Overflow counters and in-scene text                |
| 15    | HUD top bar (opaque, drawn last)                   |
| 16    | HUD bottom control bar (opaque, drawn last)        |

React overlays (dialog box, tooltips) are rendered outside the canvas via CSS positioning and are always above all canvas layers.

---

## Appendix C: Implementation Constants Summary

For quick reference, all critical constants a developer needs:

```typescript
// Canvas
const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;
const CSS_SCALE = 3;
const TARGET_FPS = 30;

// Scene zones
const HUD_TOP_HEIGHT = 16;
const HUD_BOTTOM_HEIGHT = 24;
const SCENE_Y_START = 16;
const SCENE_Y_END = 215;

// Intersection geometry
const ROAD_WIDTH = 24;
const LANE_WIDTH = 12;
const SIDEWALK_WIDTH = 6;
const INTERSECTION_X = 148;
const INTERSECTION_Y = 104;
const INTERSECTION_SIZE = 24;
const CROSSWALK_WIDTH = 4;

// Vehicle queue
const VEHICLE_SLOT_SPACING = 14; // px center-to-center
const MAX_VISIBLE_VEHICLES_NS = 5;
const MAX_VISIBLE_VEHICLES_EW = 9;

// Sprites
const CAR_SIZE_NS = { w: 8, h: 12 };
const CAR_SIZE_EW = { w: 12, h: 8 };
const BUS_SIZE_NS = { w: 8, h: 20 };
const BUS_SIZE_EW = { w: 20, h: 8 };
const AMBULANCE_SIZE_NS = { w: 8, h: 14 };
const AMBULANCE_SIZE_EW = { w: 14, h: 8 };
const TRAFFIC_LIGHT_SIZE = { w: 7, h: 18 };
const NPC_SIZE = { w: 16, h: 24 };
const NPC_PORTRAIT_SIZE = { w: 24, h: 24 };
const TREE_SIZE = { w: 10, h: 14 };
const BUILDING_SMALL_SIZE = { w: 24, h: 28 };
const BUILDING_LARGE_SIZE = { w: 32, h: 36 };

// Font
const FONT_CELL = { w: 5, h: 7 };
const FONT_GLYPH = { w: 4, h: 6 };

// Animation timing (ms)
const VEHICLE_APPEAR_DURATION = 200;
const VEHICLE_QUEUE_ADVANCE_DURATION = 300;
const VEHICLE_CROSS_DURATION = 400;
const VEHICLE_EXIT_DURATION = 300;
const LIGHT_FADE_DURATION = 150;
const LIGHT_YELLOW_FLASH_DURATION = 300;
const LIGHT_ALL_RED_DURATION = 200;
const AMBULANCE_FLASHER_FRAME_MS = 250;
const NPC_IDLE_FRAME_MS = 500;
const TOOLTIP_DELAY_MS = 400;
const AUTOPLAY_SPEEDS = { '1x': 1000, '2x': 500, '4x': 250 };
```

---

## Appendix D: Changelog

| Version | Date       | Changes               |
| ------- | ---------- | --------------------- |
| 1.0     | 2026-03-27 | Initial specification |
