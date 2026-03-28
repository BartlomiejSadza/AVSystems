# GUI Redesign -- Implementation Task List

**Project:** Pixel-Art Retro Educational Traffic Simulator
**Date:** 2026-03-27
**Total tasks:** 28
**Estimated total effort:** ~40-55 focused hours

## Specification Summary

**Original Requirements (from BRIEF.md):**

- Transform current minimal dark-mode GUI into pixel-art retro game-style educational traffic lights simulator for children aged 11-13
- Canvas (320x240 at PIXEL_SCALE=3 -> 960x720 CSS) for intersection scene + React DOM overlays for HUD, controls, tooltips, NPC dialog
- All sprites defined inline in code (no external asset files)
- Simulation logic in `src/simulator/` must NOT be modified
- Must pass existing 366 tests plus new component/visual tests
- No external runtime rendering dependencies (pure Canvas API)
- 32-color NES/PICO-8 inspired palette, colorblind-safe traffic lights

**Technical Stack:** Next.js 15, TypeScript 5.6 (strict), Tailwind CSS 4, Vitest, Canvas 2D API
**Files kept as-is:** `SimulationProvider.tsx`, `useSimulation.ts`, `useAutoPlay.ts`, `simulation-adapter.ts`, `derive-phase.ts`
**Files to create:** ~34 new files across canvas modules, sprites, layers, components, hooks, and lib
**Files to remove (Phase 6):** 12 old components after migration switch

## Parallelization Key

Tasks within the same phase that share no file dependencies can be worked on simultaneously. Parallelizable groups are marked with `[PARALLEL GROUP X]` annotations.

---

## Phase 1: Foundation (no visible changes)

All canvas infrastructure modules. The existing app continues working unchanged throughout this phase.

### T-01: Canvas constants and core types

- **Description**: Create `app/canvas/constants.ts` with GAME_WIDTH (320), GAME_HEIGHT (240), PIXEL_SCALE (3), CANVAS_CSS_WIDTH (960), CANVAS_CSS_HEIGHT (720), TARGET_FPS (30), FRAME_BUDGET_MS. Create `app/canvas/types.ts` with RenderContext interface, LayerDrawFn type, SimulationSnapshot interface, and AnimationState interface. These are the foundational types referenced by every other canvas module.
- **Acceptance criteria**:
  - `constants.ts` exports all constants listed in Architecture spec Section 2.1
  - `types.ts` exports RenderContext, LayerDrawFn, SimulationSnapshot (with phase, queues, stepCount, totalDeparted, isPlaying fields)
  - AnimationState interface includes interpFactor, vehiclePositions (Map), npcFrame, npcFrameTimer, lightGlowPhase, particles array
  - All types compile with strict TypeScript, no errors
- **Dependencies**: None
- **Complexity**: S
- **Files**: `app/canvas/constants.ts`, `app/canvas/types.ts`

### T-02: Sprite system -- types, palette, and draw function

- **Description**: Create `app/canvas/sprites/types.ts` with SpriteDefinition interface (name, width, height, frames as number[][], frameDuration) and the canonical 32-color PALETTE array (indices 0-31 exactly as specified in Architecture spec Section 2.4 and Game Design Section 1.1). Create `app/canvas/sprites/draw-sprite.ts` with the basic `drawSprite()` function (pixel-by-pixel fillRect) and `createCachedSprite()` that pre-renders sprite frames to offscreen HTMLCanvasElement instances via ImageData for fast drawImage blitting.
- **Acceptance criteria**:
  - PALETTE has exactly 32 entries, index 0 is `'transparent'`, indices 1-16 match PICO-8 core, indices 17-31 match project extensions
  - `drawSprite(ctx, sprite, frameIndex, x, y)` correctly renders non-transparent pixels using palette lookup
  - `createCachedSprite(sprite)` returns offscreen canvases, one per frame, that produce identical output to drawSprite
  - Index 0 pixels are skipped (transparent)
  - Unit tests verify palette length, transparency behavior, and cached vs uncached output equivalence
- **Dependencies**: T-01
- **Complexity**: M
- **Files**: `app/canvas/sprites/types.ts`, `app/canvas/sprites/draw-sprite.ts`

### T-03: Viewport coordinate transforms

- **Description**: Create `app/canvas/viewport.ts` with `cssToGame(cssX, cssY, canvasRect)` and `gameToCSS(gx, gy, canvasRect)` functions as specified in Architecture Section 2.5. These convert between CSS mouse coordinates and game-pixel coordinates, accounting for CSS scaling when the canvas is displayed smaller than its natural 960x720 size.
- **Acceptance criteria**:
  - `cssToGame` correctly maps a click at the canvas center to game coordinates (160, 120)
  - `gameToCSS` is the inverse of `cssToGame` for the same canvasRect
  - Both functions handle canvasRect with non-zero left/top offsets
  - Both functions handle CSS scaling (canvas displayed at less than 960x720)
  - Unit tests cover center point, corners, scaled viewport, and offset viewport
- **Dependencies**: T-01
- **Complexity**: S
- **Files**: `app/canvas/viewport.ts`

### T-04: Game loop core

- **Description**: Create `app/canvas/game-loop.ts` with `createGameLoop(canvas, getSnapshot, getAnimationState, layers)` that returns `{ start, stop }`. The loop uses requestAnimationFrame, throttles to TARGET_FPS (30), clears canvas each frame, sets imageSmoothingEnabled=false, applies PIXEL_SCALE via ctx.scale, and iterates through layer draw functions in order. Implementation follows Architecture spec Section 2.3 exactly.
- **Acceptance criteria**:
  - `start()` begins the animation loop, `stop()` cancels it via cancelAnimationFrame
  - Each frame: clears canvas, saves context, disables image smoothing, scales by PIXEL_SCALE, calls each layer function with a valid RenderContext, restores context
  - FPS throttling skips frames when deltaTime is below threshold
  - RenderContext passed to layers contains current time, deltaTime, simulationSnapshot, and animationState
  - Unit tests verify start/stop lifecycle and that layers are called in order
- **Dependencies**: T-01
- **Complexity**: M
- **Files**: `app/canvas/game-loop.ts`

### T-05: Hit detection module

- **Description**: Create `app/canvas/hit-detection.ts` with HitZone interface (id, rect {x,y,w,h}, layer type, getTooltip function) and `findHitZone(zones, gx, gy)` that iterates zones in reverse order (top layers first) and returns the first zone whose rect contains the game-pixel coordinate, or null. Per Architecture Section 2.7.
- **Acceptance criteria**:
  - `findHitZone` returns the highest-layer zone when coordinates fall inside its rect
  - Returns null when no zone matches
  - When zones overlap, the last zone in the array (highest z-order) wins
  - Unit tests cover: hit in single zone, miss, overlapping zones, edge-of-rect behavior
- **Dependencies**: T-01
- **Complexity**: S
- **Files**: `app/canvas/hit-detection.ts`

### T-06: Animation state and interpolation utilities

- **Description**: Create `app/canvas/animation.ts` with functions for initializing AnimationState, updating interpolation factor per frame (interpFactor += deltaTime / TRANSITION_DURATION, clamped to 1.0), lerping vehicle positions between previous and target positions using easeOutQuad easing, updating NPC frame timer, advancing lightGlowPhase, and managing particle lifecycle (decrement life, remove dead particles). Also define the Particle interface and TRANSITION_DURATION constant (~300ms per spec).
- **Acceptance criteria**:
  - `createInitialAnimationState()` returns a valid AnimationState with interpFactor=1 (at rest)
  - `updateAnimationState(state, deltaTime)` correctly advances interpFactor toward 1.0
  - `lerpPosition(from, to, t)` with easeOutQuad produces correct intermediate positions
  - NPC frame cycling wraps around correctly (4 frames for idle, per Game Design Section 2.4)
  - Particle life decreases and particles with life <= 0 are removed
  - Unit tests cover interpolation math, clamping, easing curve, and particle removal
- **Dependencies**: T-01
- **Complexity**: M
- **Files**: `app/canvas/animation.ts`

### T-07: Foundation unit tests

- **Description**: Write comprehensive unit tests for all Phase 1 modules. This task covers any gaps not addressed by inline tests in T-01 through T-06. Ensure test coverage for edge cases: empty layer arrays in game loop, zero-size sprites, PALETTE boundary indices, negative coordinates in viewport transforms, and animation state with zero deltaTime.
- **Acceptance criteria**:
  - All Phase 1 modules have tests in `app/canvas/__tests__/`
  - Tests run green with `pnpm test`
  - Existing 366 simulator tests still pass
  - Edge cases listed above are covered
- **Dependencies**: T-01, T-02, T-03, T-04, T-05, T-06
- **Complexity**: M
- **Files**: `app/canvas/__tests__/constants.test.ts`, `app/canvas/__tests__/sprites.test.ts`, `app/canvas/__tests__/viewport.test.ts`, `app/canvas/__tests__/game-loop.test.ts`, `app/canvas/__tests__/hit-detection.test.ts`, `app/canvas/__tests__/animation.test.ts`

> **Parallelization**: T-02, T-03, T-04, T-05, T-06 can all be developed in parallel after T-01 is complete. [PARALLEL GROUP A]

---

## Phase 2: Sprites

Pixel-art sprite definitions as TypeScript arrays of palette indices. No visible changes yet.

### T-08: Environment sprites (grass, sidewalk, trees, benches)

- **Description**: Create `app/canvas/sprites/environment.ts` with SpriteDefinition objects for: grass tile (repeating pattern using index 4 dark green + index 20 dark grass shadow strips), sidewalk tile (index 19 sidewalk gray), tree sprites (2 variants: round and pointy canopy, 10x14px, 2 animation frames for gentle sway at 1000ms per frame, using indices 5/4/12 per Game Design Section 2.6), and crosswalk stripe tile (2x6px, index 8 white, per Section 2.8). Include road marking definitions: center lane dash (1x3px, index 11 yellow), stop line, road edge line.
- **Acceptance criteria**:
  - Each sprite conforms to SpriteDefinition interface
  - Maximum 4 colors per sprite (excluding transparency), per palette rules
  - Tree sprites have exactly 2 frames with 1000ms frameDuration
  - All palette indices used are valid (0-31) and match their documented purpose
  - Unit tests validate dimensions, frame count, and palette index bounds
- **Dependencies**: T-02
- **Complexity**: M
- **Files**: `app/canvas/sprites/environment.ts`

### T-09: Vehicle sprites (normal cars + ambulance, 4 directions each)

- **Description**: Create `app/canvas/sprites/vehicles.ts` with sprite definitions for: normal car in 4 directions (N/S: 8x12px, E/W: 12x8px) with 4 body color variants (blue index 13, pink index 15, green index 25, cream index 16), and ambulance in 4 directions (N/S: 8x14px, E/W: 14x8px) with 2 animation frames for flasher alternation at 250ms. Pixel layouts must match Game Design Section 2.2 exactly (taillights at rear, windshield at correct position, east-facing car corrected per W-05 fix).
- **Acceptance criteria**:
  - Normal car: 4 directional variants, each with 4 color sub-variants, single frame (static)
  - Ambulance: 4 directional variants, 2 frames each, 250ms frameDuration
  - N/S cars are 8x12, E/W cars are 12x8 (per spec)
  - N/S ambulances are 8x14, E/W ambulances are 14x8
  - East-facing car has taillights on left, hood on right (corrected per REVIEW-FIXES W-05)
  - All sprites use maximum 4 colors (excluding transparency)
  - Unit tests validate dimensions, frame counts, and directional consistency
- **Dependencies**: T-02
- **Complexity**: L
- **Files**: `app/canvas/sprites/vehicles.ts`

### T-10: Traffic light sprites

- **Description**: Create `app/canvas/sprites/traffic-lights.ts` with sprite definitions for: traffic light housing (7x20px vertical for N/S, 20x7px horizontal for E/W), individual lamp states for each of 3 lamps (red active as 5x5 square shape, green active as 5x5 directional arrow per facing direction, amber active as 5x5 diamond shape, inactive as index 22 lamp-off). Include the 1px glow dither patterns (red glow, green+blue colorblind halo, amber glow). Follow Game Design Section 2.3 pixel layouts exactly including colorblind shape encoding.
- **Acceptance criteria**:
  - Housing sprite is 7x20px (N/S) with correct pole dark color (index 23)
  - Red active lamp uses square fill pattern (all 5x5 filled)
  - Green active lamp uses directional arrow pattern (4 variants for N/S/E/W)
  - Amber active lamp uses diamond pattern
  - Green lamp includes blue halo (index 13) at 50% dither pattern
  - Inactive lamp uses index 22
  - Unit tests validate shape patterns match spec exactly
- **Dependencies**: T-02
- **Complexity**: M
- **Files**: `app/canvas/sprites/traffic-lights.ts`

### T-11: NPC sprites (police officer idle + talk animations)

- **Description**: Create `app/canvas/sprites/npc.ts` with sprite definitions for: police officer idle animation (16x24px, 4 frames at 500ms per frame -- base pose, 1px up inhale, arm gesture, exhale back down), officer reaction animations (hand raise for vehicle added, pointing for phase change, salute for emergency), and officer portrait (24x24px, single frame, face close-up for dialog box). Use 4 colors: uniform index 13 blue, skin index 16 peach, hat index 2 dark blue, badge index 11 yellow. Per Game Design Section 2.4.
- **Acceptance criteria**:
  - Idle animation: 16x24px, 4 frames, 500ms frameDuration
  - Portrait: 24x24px, 1 frame
  - Sprite uses exactly 4 colors (indices 13, 16, 2, 11) plus transparency
  - Officer faces right (toward intersection)
  - Frame transitions are visually coherent (1px shifts between frames)
  - Unit tests validate frame counts, dimensions, and color palette constraints
- **Dependencies**: T-02
- **Complexity**: M
- **Files**: `app/canvas/sprites/npc.ts`

### T-12: UI sprites (speech bubble parts)

- **Description**: Create `app/canvas/sprites/ui.ts` with sprite definitions for speech bubble components (corner pieces, edge pieces, arrow pointer) used by the canvas-rendered portions of tooltips. These are 9-slice style sprite parts that can be assembled to create variable-size speech bubbles. Also include any directional arrow indicator sprites needed for road labels or UI hints.
- **Acceptance criteria**:
  - Speech bubble components can be assembled into bubbles of variable sizes
  - Arrow pointer sprite exists for bubble tails
  - All sprites use palette colors (index 3 dark purple for borders per spec)
  - Unit tests validate sprite dimensions and palette bounds
- **Dependencies**: T-02
- **Complexity**: S
- **Files**: `app/canvas/sprites/ui.ts`

### T-13: Sprite validation tests

- **Description**: Write comprehensive tests validating all sprite definitions across T-08 through T-12. Tests should verify: every sprite frame array has length === width \* height, all palette indices are in 0-31 range, no sprite uses more than 4 non-transparent colors, frame counts match documented animation specs, animated sprites have non-zero frameDuration, static sprites have frameDuration of 0.
- **Acceptance criteria**:
  - Every SpriteDefinition in the codebase is covered by validation tests
  - Tests catch any sprite with wrong dimensions, invalid palette indices, or too many colors
  - Tests pass with `pnpm test`
  - Existing 366 tests still pass
- **Dependencies**: T-08, T-09, T-10, T-11, T-12
- **Complexity**: M
- **Files**: `app/canvas/sprites/__tests__/sprite-validation.test.ts`

> **Parallelization**: T-08, T-09, T-10, T-11, T-12 can all be developed in parallel. [PARALLEL GROUP B]

---

## Phase 3: Canvas Layers

Drawing functions that compose the scene. Each layer is a pure function `(RenderContext) => void`.

### T-14: Background layer (grass + sidewalks + decorations)

- **Description**: Create `app/canvas/layers/background.ts` with `drawBackground(rc: RenderContext)`. Fills the four grass quadrants (corners of the map) with grass tiles using index 4, adds dark grass shadow strips (index 20) for variation. Draws sidewalk strips (index 19) along all road arms at positions specified in Game Design Section 3.4. Places trees (from environment sprites) in grass areas. Places decorative pedestrian NPCs on sidewalks if time allows (these are static/ambient). This layer is static -- consider caching the entire output to an offscreen canvas on first draw.
- **Acceptance criteria**:
  - Four grass quadrants rendered in correct positions (NW, NE, SW, SE corners)
  - Sidewalks rendered at correct coordinates per Game Design Section 3.4
  - Trees placed in grass areas (at least 2-4 trees)
  - Layer uses offscreen canvas caching (draws once, blits on subsequent frames)
  - Scene background color is index 2 dark blue (#1D2B53) for any uncovered areas
  - Visual output matches Game Design Section 3 layout
- **Dependencies**: T-01, T-02, T-06, T-08
- **Complexity**: M
- **Files**: `app/canvas/layers/background.ts`

### T-15: Road layer (asphalt + markings + crosswalks)

- **Description**: Create `app/canvas/layers/roads.ts` with `drawRoads(rc: RenderContext)`. Draws the four road arms and intersection box with dark asphalt (index 17) and light asphalt (index 18) respectively. Adds center lane divider dashes (index 11, 1x3px every 6px), stop lines (index 8), crosswalk stripes (index 8, 4 stripes per crosswalk with 2px gaps), and road edge lines (index 7). All positions per Game Design Sections 3.2-3.3. This layer is static -- use offscreen canvas caching.
- **Acceptance criteria**:
  - North/South road arms: x=148 to x=172, correct y ranges
  - East/West road arms: y=104 to y=128, correct x ranges
  - Intersection box at (148, 104) sized 24x24, filled with light asphalt
  - Center dividers, stop lines, crosswalks all present at spec coordinates
  - Road markings use correct palette indices
  - Layer uses offscreen canvas caching
- **Dependencies**: T-01, T-02, T-08
- **Complexity**: M
- **Files**: `app/canvas/layers/roads.ts`

### T-16: Traffic light layer

- **Description**: Create `app/canvas/layers/traffic-lights.ts` with `drawTrafficLights(rc: RenderContext)`. Reads the current phase from `rc.simulationSnapshot.phase` and renders 4 traffic lights (one per road approach). Active phase roads get green lamps with directional arrows and blue colorblind halo; inactive roads get red lamps with square shape. Amber lamps activate during transitions (if applicable). Glow effect uses lightGlowPhase from AnimationState for a subtle pulsing brightness on active lamps. Positions traffic lights at curb edges adjacent to each road arm.
- **Acceptance criteria**:
  - 4 traffic lights rendered, one at each road approach
  - Phase NS_GREEN: north and south lights show green arrows, east and west show red squares
  - Phase EW_GREEN: east and west lights show green arrows, north and south show red squares
  - Green lamps have blue colorblind halo (dithered index 13)
  - Active lamp glow pulses using lightGlowPhase from AnimationState
  - Inactive lamps show lamp-off color (index 22)
  - Traffic light positions are adjacent to road arms at intersection edge
- **Dependencies**: T-01, T-02, T-06, T-10
- **Complexity**: M
- **Files**: `app/canvas/layers/traffic-lights.ts`

### T-17: Vehicle layer (with position interpolation)

- **Description**: Create `app/canvas/layers/vehicles.ts` with `drawVehicles(rc: RenderContext)`. Reads queues from the simulation snapshot and vehiclePositions from AnimationState. For each vehicle in each queue, draws the appropriate car sprite at the interpolated position. Vehicle direction matches the road (north queue = south-facing cars approaching from north, etc.). Vehicle color variant is determined by hashing the vehicleId. Emergency vehicles use the ambulance sprite. Queue slot positions follow Game Design vehicle queue positioning: N/S roads show up to 8 vehicles with 10px spacing, E/W roads show up to 6 with 14px spacing.
- **Acceptance criteria**:
  - Vehicles render in correct queue lanes for each road direction
  - Vehicle sprite direction matches traffic flow (south-facing for north queue, etc.)
  - Color variant is deterministic per vehicleId (same ID always gets same color)
  - Emergency vehicles render as ambulance sprites with flasher animation
  - Positions use interpolated values from AnimationState.vehiclePositions when available
  - N/S roads show max 8 visible vehicles, E/W show max 6 (per REVIEW-FIXES W-03)
  - Vehicles in queue are spaced correctly (N/S: 10px, E/W: 14px)
- **Dependencies**: T-01, T-02, T-06, T-09
- **Complexity**: L
- **Files**: `app/canvas/layers/vehicles.ts`

### T-18: NPC layer

- **Description**: Create `app/canvas/layers/npc.ts` with `drawNpc(rc: RenderContext)`. Draws the police officer NPC sprite at a fixed position in the bottom-left of the scene area. Uses npcFrame from AnimationState to select the current animation frame (idle breathing cycle). When a NPC message is visible (checked via snapshot or a flag), switches to the "talk" animation frames.
- **Acceptance criteria**:
  - NPC renders at fixed bottom-left position in scene
  - Idle animation cycles through 4 frames at 500ms each
  - NPC faces right (toward intersection)
  - Animation frame selection uses AnimationState.npcFrame
  - NPC is drawn on top of background/roads but below overlay effects
- **Dependencies**: T-01, T-02, T-06, T-11
- **Complexity**: S
- **Files**: `app/canvas/layers/npc.ts`

### T-19: Effects layer (particles + phase transitions)

- **Description**: Create `app/canvas/layers/effects.ts` with `drawOverlayEffects(rc: RenderContext)`. Renders departure particles (small colored pixels that scatter when a vehicle leaves the intersection) and phase transition flash effects (brief screen flash when traffic lights change phase). Reads particles array from AnimationState. Each particle is a single game pixel with a palette color, position, velocity, and decreasing life value.
- **Acceptance criteria**:
  - Departure particles render as single game pixels at their current positions
  - Particle color uses the palette index from the Particle definition
  - Particles with life <= 0 are not drawn
  - Phase transition flash is a brief semi-transparent overlay that fades out
  - Layer draws nothing when there are no active effects
- **Dependencies**: T-01, T-06
- **Complexity**: S
- **Files**: `app/canvas/layers/effects.ts`

### T-20: Layer index and canvas layer integration test

- **Description**: Create `app/canvas/layers/index.ts` that exports the ordered array of all layer draw functions: [drawBackground, drawRoads, drawTrafficLights, drawVehicles, drawNpc, drawOverlayEffects]. Write integration tests that verify all layers can be called with a mock RenderContext without throwing errors, and that the layer order matches the spec (back to front: background, roads, traffic lights, vehicles, NPC, effects).
- **Acceptance criteria**:
  - `index.ts` exports a `layers` array of 6 LayerDrawFn functions in correct order
  - Each layer function can be called with a mock RenderContext without throwing
  - Layer order matches Architecture spec Section 2.2 pipeline
  - All tests pass with `pnpm test`
- **Dependencies**: T-14, T-15, T-16, T-17, T-18, T-19
- **Complexity**: S
- **Files**: `app/canvas/layers/index.ts`, `app/canvas/__tests__/layers-integration.test.ts`

> **Parallelization**: T-14, T-15 can run in parallel [PARALLEL GROUP C1]. T-16, T-17, T-18, T-19 can run in parallel [PARALLEL GROUP C2] (after their sprite dependencies from Phase 2 are done).

---

## Phase 4: React Components (new)

New pixel-art styled React components. Old components remain untouched and the app continues working with the old UI.

### T-21: Base UI components (PixelButton, PixelSelect, SpeedSlider)

- **Description**: Create `app/components/controls/PixelButton.tsx` -- a reusable button with pixel-art styling (CSS border, retro background color, transform-based press animation, "Press Start 2P" or similar pixel font). Props: label, onClick, disabled, variant (primary/secondary/danger). Create `app/components/controls/PixelSelect.tsx` -- pixel-art styled dropdown (retained for future use but not used by AddVehiclePanel). Create `app/components/controls/SpeedSlider.tsx` -- pixel-art styled range slider with value, onChange, min, max props. All use Tailwind CSS for styling with custom pixel-art aesthetic.
- **Acceptance criteria**:
  - PixelButton renders with pixel-art CSS styling (no anti-aliased borders, retro colors from palette)
  - PixelButton shows press animation on click (CSS transform: scale or translate)
  - PixelButton respects disabled state (visually dimmed, onClick not fired)
  - SpeedSlider renders as a styled range input with pixel-art track and thumb
  - All components accept and forward standard accessibility attributes
  - Minimum button target size is 48x48 CSS pixels (per responsive spec for touch targets)
  - Component tests verify rendering and click behavior
- **Dependencies**: None (can start during Phase 2/3)
- **Complexity**: M
- **Files**: `app/components/controls/PixelButton.tsx`, `app/components/controls/PixelSelect.tsx`, `app/components/controls/SpeedSlider.tsx`

### T-22: HudBar and HudStat components

- **Description**: Create `app/components/hud/HudBar.tsx` (top bar showing simulation stats) and `app/components/hud/HudStat.tsx` (single stat display with label and value). HudBar receives steps, queued count, departed count, and current phase as props. Styled with pixel font (CSS "Press Start 2P" or custom font-face), dark background (index 1 black), white text (index 8). Width matches canvas (960px CSS max). Per Architecture Section 1.2 and Game Design Section 4.1 (as revised in REVIEW-FIXES C-03).
- **Acceptance criteria**:
  - HudBar renders at 960px max width with dark background
  - Displays Steps, Queued, and Departed stats via HudStat children
  - Current phase is displayed (e.g., "NS GREEN" or "EW GREEN")
  - Uses CSS pixel font for all text
  - HudStat is a pure presentational component (label + value)
  - Component tests verify correct rendering of stats values
- **Dependencies**: None
- **Complexity**: S
- **Files**: `app/components/hud/HudBar.tsx`, `app/components/hud/HudStat.tsx`

### T-23: ControlBar and AddVehiclePanel

- **Description**: Create `app/components/controls/ControlBar.tsx` -- bottom bar with gamepad-style layout containing Step, Play/Pause, Reset buttons (using PixelButton), a SpeedSlider, and the AddVehiclePanel. Reads simulation context for dispatch. Create `app/components/controls/AddVehiclePanel.tsx` -- per-direction pixel-art buttons (N, S, E, W for normal cars, SOS for emergency). Each direction button dispatches ADD_VEHICLE with auto-generated vehicleId (from vehicle-id.ts) and auto-assigned endRoad (opposite direction). Per Architecture Section 1.2.
- **Acceptance criteria**:
  - ControlBar renders Step, Play/Pause, Reset buttons and SpeedSlider
  - Step button dispatches STEP action
  - Play/Pause toggles auto-play via TOGGLE_AUTO_PLAY
  - Reset dispatches RESET action
  - SpeedSlider dispatches SET_SPEED with new value
  - AddVehiclePanel shows 5 buttons: N, S, E, W, SOS
  - Clicking N dispatches ADD_VEHICLE with startRoad='north', endRoad='south' (opposite)
  - SOS button dispatches ADD_VEHICLE with priority='emergency'
  - Vehicle IDs are auto-generated (V001, V002, etc.)
  - Component tests verify each button dispatches the correct action
- **Dependencies**: T-21, T-24 (vehicle-id.ts)
- **Complexity**: M
- **Files**: `app/components/controls/ControlBar.tsx`, `app/components/controls/AddVehiclePanel.tsx`

### T-24: Vehicle ID generator and NPC messages library

- **Description**: Create `app/lib/vehicle-id.ts` with `generateVehicleId()` that returns incrementing IDs: "V001", "V002", etc. Uses a module-scoped counter with prefix. Create `app/lib/npc-messages.ts` with message generation functions: `generateStepMessage()`, `generateVehicleMessage()`, `generatePhaseMessage()`, `generateErrorMessage()`, `generateMilestoneMessage()`, `generateIdleMessage()`. Each returns an NpcMessage object with id, text, trigger, and priority. Messages should be kid-friendly, use Officer Pixel's personality (per UX Research Section 5), and cover all trigger conditions from Architecture Section 3.6.
- **Description notes**: NPC messages include first-launch welcome, first vehicle commentary, queue threshold warnings, phase change explanations, emergency vehicle reactions, idle prompts, and milestone celebrations.
- **Acceptance criteria**:
  - `generateVehicleId()` returns "V001" on first call, "V002" on second, etc.
  - Counter resets are possible (for testing)
  - Each message generator returns a valid NpcMessage with appropriate trigger type
  - Messages are in English, kid-friendly, not condescending (per UX Research guidance)
  - Unit tests verify ID generation sequence and message structure
- **Dependencies**: None
- **Complexity**: M
- **Files**: `app/lib/vehicle-id.ts`, `app/lib/npc-messages.ts`

### T-25: Overlay components (Tooltip, NpcDialog, StepLog)

- **Description**: Create `app/components/overlay/Tooltip.tsx` -- absolutely positioned pixel speech bubble that appears on canvas hover. Props: target, position (cssX, cssY), content string. Styled with pixel border (index 3 dark purple), white text, speech bubble tail pointing at target. Create `app/components/overlay/NpcDialog.tsx` -- NPC commentator speech bubble. Props: message, visible, onDismiss. Includes the NPC portrait (rendered as small inline canvas or img) next to the text. Create `app/components/overlay/StepLog.tsx` -- scrollable log panel showing step results with pixel font. Props: stepStatuses array, phases array. Replaces the old CommandLog component.
- **Acceptance criteria**:
  - Tooltip renders at the provided CSS coordinates, positioned absolutely over the canvas
  - Tooltip hides when content is null
  - NpcDialog shows speech bubble with NPC portrait and message text
  - NpcDialog auto-dismisses after 3 seconds (timer managed externally via hook)
  - NpcDialog has a close/dismiss button
  - StepLog shows a scrollable list of step entries with departed vehicle info
  - All overlay components use pixel font styling
  - Component tests verify show/hide behavior
- **Dependencies**: T-21
- **Complexity**: M
- **Files**: `app/components/overlay/Tooltip.tsx`, `app/components/overlay/NpcDialog.tsx`, `app/components/overlay/StepLog.tsx`

> **Parallelization**: T-21, T-22, T-24 can all run in parallel [PARALLEL GROUP D]. T-23 depends on T-21 and T-24. T-25 depends on T-21.

---

## Phase 5: Integration (the switch)

Wire everything together. This is where the new canvas-based UI replaces the old one.

### T-26: CanvasViewport component + useGameLoop + useHitDetection hooks

- **Description**: Create `app/components/canvas/CanvasViewport.tsx` -- the core component that owns the `<canvas>` element. It reads simulation state from context, computes the SimulationSnapshot and stores it in a ref (per Architecture Section 3.3), manages AnimationState in a ref, wires up the game loop via useGameLoop hook, and handles mouse events for hit detection via useHitDetection hook. Create `app/hooks/useGameLoop.ts` -- wraps createGameLoop with React lifecycle (start on mount, stop on unmount). Create `app/hooks/useHitDetection.ts` -- tracks mouse position, converts to game coordinates, runs findHitZone, manages tooltip state, throttled to 60ms. Canvas element is configured with width/height at PIXEL_SCALE multiplied values, CSS image-rendering:pixelated, and aspect-ratio 320/240 per Architecture Section 2.5.
- **Acceptance criteria**:
  - CanvasViewport renders a canvas element at 960x720 physical pixels
  - Canvas has `image-rendering: pixelated` CSS
  - Game loop starts on component mount, stops on unmount
  - SimulationSnapshot ref updates when simulation state changes (via useEffect)
  - AnimationState updates each frame in the game loop
  - Mouse hover over canvas triggers hit detection and sets tooltip state
  - Tooltip component renders when a hit zone is found
  - Hit zones are rebuilt when simulation snapshot changes
  - Canvas content renders all 6 layers in correct order
- **Dependencies**: T-04, T-05, T-06, T-20
- **Complexity**: L
- **Files**: `app/components/canvas/CanvasViewport.tsx`, `app/hooks/useGameLoop.ts`, `app/hooks/useHitDetection.ts`

### T-27: PixelSimulatorApp + useNpcDialog + page switch

- **Description**: Create `app/components/PixelSimulatorApp.tsx` -- top-level layout component that composes HudBar, CanvasViewport, Tooltip, NpcDialog, ControlBar, and StepLog into a CSS grid layout (HUD top, canvas center, controls bottom). Reads simulation context for derived values (phase, queues, stats). Create `app/hooks/useNpcDialog.ts` -- manages NPC message queue with priority ordering, auto-dismiss timer (3s), suppression conditions (auto-play silence, dismissal cooldown, same-category cooldown, rapid interaction silence per Architecture Section 3.6). Update `app/page.tsx` to render PixelSimulatorApp inside SimulationProvider instead of SimulationApp. Update `app/layout.tsx` to import the pixel font (Google Fonts "Press Start 2P" or similar). This is the single switch point -- after this task, the new UI is live.
- **Acceptance criteria**:
  - PixelSimulatorApp renders the complete new layout: HUD top, canvas center, controls bottom
  - CSS grid layout matches spec: centered, max 960px wide, dark gutters on larger screens (#1D2B53)
  - All child components receive correct props from simulation context
  - useNpcDialog queues messages, shows highest priority first, auto-dismisses after 3s
  - NPC messages trigger on simulation events (step, add vehicle, phase change, error, idle)
  - Suppression conditions prevent message spam
  - `app/page.tsx` now renders PixelSimulatorApp (not SimulationApp)
  - Pixel font loads and is used by all React DOM text
  - The app loads without errors in the browser
  - All simulation functionality works: add vehicles, step, play/pause, reset
  - Old SimulationApp.tsx is NOT deleted yet (rollback safety)
- **Dependencies**: T-22, T-23, T-25, T-26
- **Complexity**: L
- **Files**: `app/components/PixelSimulatorApp.tsx`, `app/hooks/useNpcDialog.ts`, `app/page.tsx`, `app/layout.tsx`

### T-28: Integration testing and cleanup

- **Description**: Run the full test suite (`pnpm test`) and verify all 366+ existing tests pass. Write integration tests for the complete new UI: verify CanvasViewport mounts and starts the game loop, verify HudBar shows correct stats after simulation steps, verify ControlBar buttons trigger correct dispatches, verify NPC dialog appears on simulation events. After all tests pass, remove the 12 old components: SimulationApp.tsx, IntersectionView.tsx, TrafficLight.tsx, VehicleQueue.tsx, VehicleMarker.tsx, ControlPanel.tsx, AddVehicleForm.tsx, CommandLog.tsx, ErrorBanner.tsx, TelemetryDashboard.tsx, ConfigPanel.tsx, JsonPanel.tsx. Run `pnpm test` again to confirm no regressions.
- **Acceptance criteria**:
  - All 366+ existing simulator tests pass
  - New component tests pass (from T-07, T-13, T-20, and this task)
  - Integration tests verify: app renders without errors, Step button produces a step result, Add Vehicle buttons add vehicles to queues, Play/Pause toggles auto-play, canvas element is present in DOM
  - All 12 old components deleted
  - No imports reference deleted files
  - `pnpm test` passes after cleanup with zero failures
  - App loads and functions correctly in the browser after cleanup
- **Dependencies**: T-27
- **Complexity**: L
- **Files**: Delete 12 old component files, `app/components/__tests__/integration.test.tsx`

---

## Quality Requirements Checklist

- [ ] All sprites use maximum 4 colors per sprite (excluding transparency)
- [ ] PALETTE has exactly 32 entries matching the canonical spec
- [ ] PIXEL_SCALE is 3 everywhere (no hardcoded alternatives)
- [ ] Canvas uses `imageSmoothingEnabled = false` (pixel-art crispness)
- [ ] All React DOM text uses CSS pixel font
- [ ] Traffic lights are colorblind-safe (square=red, arrow=green, diamond=amber + blue halo on green)
- [ ] No modifications to `src/simulator/` (domain logic untouched)
- [ ] No external runtime rendering dependencies
- [ ] Minimum button target size 48x48 CSS pixels
- [ ] Responsive: works at 1024x768 minimum viewport
- [ ] Dark gutters (#1D2B53) on viewports wider than 960px
- [ ] Vehicle IDs auto-generated as V001, V002, etc.
- [ ] NPC messages are kid-friendly and non-condescending
- [ ] Bus sprite is NOT implemented (Phase 2 future, per REVIEW-FIXES W-07)
- [ ] East-facing car sprite has taillights on left (per REVIEW-FIXES W-05)
- [ ] Amber signal color is #FFA300 (index 10) everywhere (per REVIEW-FIXES W-02)
- [ ] N/S roads show max 8 vehicles (10px spacing), E/W show max 6 (14px spacing) (per REVIEW-FIXES W-03)
- [ ] Images from approved sources only if needed (Unsplash, picsum.photos) -- NOT Pexels
- [ ] All 366+ existing tests pass throughout migration
- [ ] No background processes in any commands

## Technical Notes

**Development Stack:** Next.js 15, TypeScript 5.6 strict, Tailwind CSS 4, Vitest, pure Canvas 2D API
**Pixel Font:** "Press Start 2P" from Google Fonts (CSS) + canvas bitmap font for in-game text (road labels, overflow counters)
**Special constraint:** All sprites defined as TypeScript number arrays (no external .png/.svg files)
**Rollback strategy:** Until Phase 6 cleanup, reverting `app/page.tsx` to use SimulationApp instantly restores the old GUI
**Performance target:** 30 FPS with up to 20 vehicles on screen, sprite caching via offscreen HTMLCanvasElement
