# Frontend Architecture -- Pixel-Art Retro Educational Traffic Simulator

**Status:** Proposed
**Date:** 2026-03-27
**Scope:** Complete frontend architecture for the pixel-art GUI redesign targeting children aged 11-13.

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Canvas Rendering Architecture](#2-canvas-rendering-architecture)
3. [State Management](#3-state-management)
4. [Data Flow](#4-data-flow)
5. [File Structure](#5-file-structure)
6. [Performance Considerations](#6-performance-considerations)
7. [Testing Strategy](#7-testing-strategy)
8. [Migration Plan](#8-migration-plan)

---

## 1. Component Architecture

### 1.1 Component Tree Diagram

```
app/page.tsx
  └── <SimulationProvider>                    [React] -- keeps useReducer + context
        └── <PixelSimulatorApp>               [React] -- top-level layout shell
              ├── <HudBar>                    [React] -- top overlay: stats, step counter, phase
              │     ├── <HudStat label="Steps" value={n} />
              │     ├── <HudStat label="Queued" value={n} />
              │     └── <HudStat label="Departed" value={n} />
              │
              ├── <CanvasViewport>            [React] -- owns <canvas>, runs game loop
              │     ├── (canvas layer 0)      [Canvas] -- Background: grass, sidewalks, static tiles
              │     ├── (canvas layer 1)      [Canvas] -- Road surface, lane markings, crosswalks
              │     ├── (canvas layer 2)      [Canvas] -- Traffic lights (animated glow)
              │     ├── (canvas layer 3)      [Canvas] -- Vehicles (pixel-art cars, animated)
              │     ├── (canvas layer 4)      [Canvas] -- NPC character (police officer sprite)
              │     └── (canvas layer 5)      [Canvas] -- Overlay effects (phase transition flash)
              │
              ├── <Tooltip>                   [React] -- absolutely positioned speech-bubble overlay
              │
              ├── <NpcDialog>                 [React] -- pixel speech bubble with NPC messages
              │
              ├── <ControlBar>                [React] -- bottom bar: gamepad-style buttons
              │     ├── <PixelButton label="Step" />
              │     ├── <PixelButton label="Play/Pause" />
              │     ├── <PixelButton label="Reset" />
              │     ├── <SpeedSlider />
              │     └── <AddVehiclePanel>     [React] -- per-direction pixel-art buttons
              │           ├── <PixelButton label="N" icon="car" /> -- adds normal car from North
              │           ├── <PixelButton label="S" icon="car" /> -- adds normal car from South
              │           ├── <PixelButton label="E" icon="car" /> -- adds normal car from East
              │           ├── <PixelButton label="W" icon="car" /> -- adds normal car from West
              │           └── <PixelButton label="SOS" icon="ambulance" /> -- adds emergency vehicle
              │
              └── <StepLog>                   [React] -- scrollable pixel-font log panel
```

### 1.2 Component Responsibilities

#### React Components (DOM overlay)

| Component | File | Props | Responsibility |
|-----------|------|-------|----------------|
| `SimulationProvider` | `app/components/SimulationProvider.tsx` | `children` | **Survives as-is.** Provides `state` + `dispatch` via context. Also runs `useAutoPlay`. |
| `PixelSimulatorApp` | `app/components/PixelSimulatorApp.tsx` | none (reads context) | Top-level layout. CSS grid: HUD top, canvas center, controls bottom. Replaces `SimulationApp`. |
| `HudBar` | `app/components/hud/HudBar.tsx` | `steps, queued, departed, phase` | Renders pixel-font stats in a top bar. Pure presentational. |
| `HudStat` | `app/components/hud/HudStat.tsx` | `label, value` | Single stat display with pixel-art styling. |
| `CanvasViewport` | `app/components/canvas/CanvasViewport.tsx` | `simulationState, phase, queues` | Owns the `<canvas>` element, manages the game loop, delegates drawing to the render pipeline. Translates mouse events to game-pixel coordinates for hit detection. |
| `Tooltip` | `app/components/overlay/Tooltip.tsx` | `target, position, content` | Absolutely positioned pixel speech-bubble. Shown when `CanvasViewport` detects a hover target. |
| `NpcDialog` | `app/components/overlay/NpcDialog.tsx` | `message, visible, onDismiss` | NPC commentator bubble. Positioned relative to the NPC sprite's screen coordinates. |
| `ControlBar` | `app/components/controls/ControlBar.tsx` | none (reads context) | Bottom bar with gamepad-style pixel buttons. Dispatches simulation actions. |
| `PixelButton` | `app/components/controls/PixelButton.tsx` | `label, onClick, disabled, variant` | Reusable pixel-art styled button with press animation. |
| `PixelSelect` | `app/components/controls/PixelSelect.tsx` | `label, options, value, onChange` | Dropdown styled as pixel-art box. Retained for potential future use (e.g., speed selection), but not used by AddVehiclePanel. |
| `SpeedSlider` | `app/components/controls/SpeedSlider.tsx` | `value, onChange, min, max` | Pixel-art styled range slider. |
| `AddVehiclePanel` | `app/components/controls/AddVehiclePanel.tsx` | none (reads context) | Per-direction pixel-art buttons (N, S, E, W, SOS) for one-click vehicle addition. More game-like than a form. Destination road is auto-assigned (opposite direction). |
| `StepLog` | `app/components/overlay/StepLog.tsx` | `stepStatuses, phases` | Scrollable log rendered with pixel font. Replaces inline log in current `SimulationApp`. |

#### Canvas-Rendered Elements (not React components)

These are **draw functions**, not React components. They are called by the render pipeline inside `CanvasViewport`.

| Element | Module | What it draws |
|---------|--------|---------------|
| `drawBackground` | `app/canvas/layers/background.ts` | Grass tiles, sidewalk tiles, decorative elements (trees, benches) |
| `drawRoads` | `app/canvas/layers/roads.ts` | Asphalt surface, lane dividers, crosswalk stripes, direction arrows |
| `drawTrafficLights` | `app/canvas/layers/traffic-lights.ts` | Traffic light poles + bulbs per road, with animated glow |
| `drawVehicles` | `app/canvas/layers/vehicles.ts` | Pixel-art cars positioned in queue lanes, with smooth interpolation |
| `drawNpc` | `app/canvas/layers/npc.ts` | Police officer / robot NPC sprite, idle animation |
| `drawOverlayEffects` | `app/canvas/layers/effects.ts` | Phase transition flash, vehicle departure particles |

### 1.3 Migration Mapping (Current -> New)

| Current Component | Disposition | New Equivalent |
|-------------------|-------------|----------------|
| `SimulationApp.tsx` | **Replaced** | `PixelSimulatorApp.tsx` (layout) + `ControlBar.tsx` (controls) + `AddVehiclePanel.tsx` (form) |
| `SimulationProvider.tsx` | **Kept as-is** | Same file, no changes needed |
| `IntersectionView.tsx` | **Replaced** | `CanvasViewport.tsx` + canvas draw functions in `app/canvas/layers/` |
| `TrafficLight.tsx` | **Replaced** | `app/canvas/layers/traffic-lights.ts` (canvas draw) |
| `VehicleQueue.tsx` | **Replaced** | `app/canvas/layers/vehicles.ts` (canvas draw) |
| `VehicleMarker.tsx` | **Replaced** | `app/canvas/sprites/vehicles.ts` (sprite definitions) |
| `ControlPanel.tsx` | **Replaced** | `ControlBar.tsx` (pixel-art styled) |
| `AddVehicleForm.tsx` | **Replaced** | `AddVehiclePanel.tsx` (pixel-art styled) |
| `CommandLog.tsx` | **Replaced** | `StepLog.tsx` (pixel-art styled) |
| `ErrorBanner.tsx` | **Replaced** | Error display integrated into `HudBar` or `NpcDialog` (NPC says the error) |
| `TelemetryDashboard.tsx` | **Replaced** | Stats integrated into `HudBar` |
| `ConfigPanel.tsx` | **Replaced** | Options folded into `ControlBar` or removed for simplicity (children audience) |
| `JsonPanel.tsx` | **Removed** | Not appropriate for target audience. May survive as hidden dev tool. |
| `useSimulation.ts` | **Kept as-is** | Same file, no changes. Reducer and effect logic are canvas-agnostic. |
| `useAutoPlay.ts` | **Kept as-is** | Same file. Interval-based step dispatch works unchanged. |
| `simulation-adapter.ts` | **Kept as-is** | No changes. Canvas layer reads from the same `SimulationState`. |
| `derive-phase.ts` | **Kept as-is** | No changes. Used by `PixelSimulatorApp` to feed data to canvas. |

---

## 2. Canvas Rendering Architecture

### 2.1 Core Constants

```typescript
// app/canvas/constants.ts
export const GAME_WIDTH = 320;        // game pixels
export const GAME_HEIGHT = 240;       // game pixels
export const PIXEL_SCALE = 3;         // 1 game pixel = 3 CSS pixels
export const CANVAS_CSS_WIDTH = GAME_WIDTH * PIXEL_SCALE;   // 960
export const CANVAS_CSS_HEIGHT = GAME_HEIGHT * PIXEL_SCALE;  // 720
export const TARGET_FPS = 30;
export const FRAME_BUDGET_MS = 1000 / TARGET_FPS;  // ~33.3ms
```

### 2.2 Rendering Pipeline

The pipeline uses a single `<canvas>` element with a 2D context. Drawing happens in strict layer order, back to front. Each layer is a pure function: `(ctx, state, time) => void`.

```
Frame N:
  1. Clear canvas (or skip if using dirty-rect optimization)
  2. Set ctx.imageSmoothingEnabled = false  (pixel-art crispness)
  3. Scale context: ctx.scale(PIXEL_SCALE, PIXEL_SCALE)
  4. Draw layer 0: Background       -- static, drawn from cached offscreen canvas
  5. Draw layer 1: Roads             -- static, drawn from cached offscreen canvas
  6. Draw layer 2: Traffic lights    -- dynamic (color changes per phase)
  7. Draw layer 3: Vehicles          -- dynamic (position interpolation)
  8. Draw layer 4: NPC               -- dynamic (idle animation frames)
  9. Draw layer 5: Overlay effects   -- dynamic (particles, flash)
  10. Restore context transform
```

**Layer function signature:**

```typescript
// app/canvas/types.ts
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number;                    // timestamp from requestAnimationFrame
  deltaTime: number;               // ms since last frame
  simulationSnapshot: SimulationSnapshot;  // frozen state for this frame
  animationState: AnimationState;          // interpolation state
}

export type LayerDrawFn = (rc: RenderContext) => void;
```

### 2.3 Game Loop Design

```typescript
// app/canvas/game-loop.ts
export function createGameLoop(
  canvas: HTMLCanvasElement,
  getSnapshot: () => SimulationSnapshot,
  getAnimationState: () => AnimationState,
  layers: LayerDrawFn[]
): { start: () => void; stop: () => void } {
  let rafId: number | null = null;
  let lastTime = 0;
  const ctx = canvas.getContext('2d')!;

  function frame(time: number) {
    const deltaTime = time - lastTime;
    lastTime = time;

    // Throttle to target FPS
    if (deltaTime < FRAME_BUDGET_MS * 0.8) {
      rafId = requestAnimationFrame(frame);
      return;
    }

    const rc: RenderContext = {
      ctx,
      time,
      deltaTime,
      simulationSnapshot: getSnapshot(),
      animationState: getAnimationState(),
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(PIXEL_SCALE, PIXEL_SCALE);

    for (const draw of layers) {
      draw(rc);
    }

    ctx.restore();
    rafId = requestAnimationFrame(frame);
  }

  return {
    start: () => { lastTime = performance.now(); rafId = requestAnimationFrame(frame); },
    stop: () => { if (rafId !== null) cancelAnimationFrame(rafId); rafId = null; },
  };
}
```

The game loop runs independently of React renders. It reads from a snapshot ref, not from React state directly. This prevents the canvas from causing React re-renders and vice versa.

### 2.4 Sprite System

Sprites are defined as typed pixel arrays in code (no external asset files, per BRIEF.md constraint).

```typescript
// app/canvas/sprites/types.ts

/** A sprite is a 2D grid of color indices into a palette. 0 = transparent. */
export interface SpriteDefinition {
  name: string;
  width: number;       // in game pixels
  height: number;      // in game pixels
  frames: number[][];  // frames[frameIndex] = flat array of palette indices, length = width * height
  frameDuration: number; // ms per frame (0 = static)
}

/** 32-color PICO-8-inspired palette. Index 0 is always transparent.
 *  This is the single canonical palette shared with the Game Design spec.
 *  Indices 1-16 are the PICO-8 core. Indices 17-31 are project extensions.
 */
export const PALETTE: readonly string[] = [
  'transparent',  // 0  transparent
  '#000000',      // 1  black
  '#1D2B53',      // 2  dark blue (sky/background, windshield)
  '#7E2553',      // 3  dark purple (NPC dialog border, accents)
  '#008751',      // 4  dark green (grass quadrants)
  '#AB5236',      // 5  brown (tree trunks, building accents)
  '#5F574F',      // 6  dark grey (building walls)
  '#C2C3C7',      // 7  light grey (road markings, secondary labels)
  '#FFF1E8',      // 8  white (crosswalks, primary HUD text)
  '#FF004D',      // 9  red (signal red, emergency vehicle)
  '#FFA300',      // 10 orange (signal amber)
  '#FFEC27',      // 11 yellow (lane divider, highlighted numbers)
  '#00E436',      // 12 green (signal green)
  '#29ADFF',      // 13 blue (colorblind GO halo, car variant A, HUD info)
  '#83769C',      // 14 lavender (building rooftops)
  '#FF77A8',      // 15 pink (car variant B)
  '#FFCCAA',      // 16 peach (NPC skin, car variant D)
  // --- Extended colors (project-specific) ---
  '#2C2C34',      // 17 dark asphalt (road surface base)
  '#3A3A44',      // 18 light asphalt (intersection box)
  '#4D4D57',      // 19 sidewalk gray
  '#065E38',      // 20 dark grass (shadow/variation)
  '#1A1A22',      // 21 tar black (road cracks, shadows)
  '#2C2C2C',      // 22 lamp off (inactive lamp housing)
  '#1A1A1A',      // 23 pole dark (traffic light housing)
  '#FF6C24',      // 24 warm orange (window glow, NPC accent)
  '#00E436',      // 25 car green (variant C, same hex as 12)
  '#FFF1E8',      // 26 emergency white (ambulance cross, same hex as 8)
  '#FFEC27',      // 27 HUD yellow (same hex as 11, semantic alias)
  '#29ADFF',      // 28 HUD blue (same hex as 13, semantic alias)
  '#FFF1E8',      // 29 marking white (same hex as 8, semantic alias)
  '#C2C3C7',      // 30 faded white (same hex as 7, semantic alias)
  '#5F574F',      // 31 warm gray (building wall variant, same hex as 6)
];
```

**Sprite storage and organization:**

```
app/canvas/sprites/
  types.ts          -- SpriteDefinition interface, PALETTE
  vehicles.ts       -- car-north, car-south, car-east, car-west, emergency-car variants
  traffic-lights.ts -- light-pole, light-red, light-green, light-off
  npc.ts            -- officer-idle (4 frames), officer-talk (4 frames)
  environment.ts    -- grass-tile, sidewalk-tile, tree, bench, crosswalk-stripe
  ui.ts             -- speech-bubble-corner, speech-bubble-edge, arrow-indicators
```

**Drawing a sprite:**

```typescript
// app/canvas/sprites/draw-sprite.ts
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteDefinition,
  frameIndex: number,
  x: number,  // game pixels
  y: number   // game pixels
): void {
  const data = sprite.frames[frameIndex % sprite.frames.length];
  for (let py = 0; py < sprite.height; py++) {
    for (let px = 0; px < sprite.width; px++) {
      const colorIndex = data[py * sprite.width + px];
      if (colorIndex === 0) continue; // transparent
      ctx.fillStyle = PALETTE[colorIndex];
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
}
```

In production, sprites are pre-rendered to off-screen `HTMLCanvasElement` instances created via `document.createElement('canvas')` (see section 6). The per-pixel loop above is only the fallback / initial implementation. Note: `OffscreenCanvas` was considered but `document.createElement('canvas')` is more compatible with older school Chromebooks.

### 2.5 Camera / Viewport System

The game uses a fixed camera (no panning/zooming). The mapping is:

```
Game space:  320 x 240 pixels (integer coordinates)
Canvas buffer: 960 x 720 physical pixels (PIXEL_SCALE = 3)
CSS display: 960 x 720 CSS pixels, or scaled down via max-width to fit container
```

**Coordinate transforms:**

```typescript
// app/canvas/viewport.ts
export function cssToGame(cssX: number, cssY: number, canvasRect: DOMRect): { gx: number; gy: number } {
  // Account for CSS scaling if canvas is displayed smaller than its natural size
  const scaleX = GAME_WIDTH * PIXEL_SCALE / canvasRect.width;
  const scaleY = GAME_HEIGHT * PIXEL_SCALE / canvasRect.height;
  const physX = (cssX - canvasRect.left) * scaleX;
  const physY = (cssY - canvasRect.top) * scaleY;
  return {
    gx: Math.floor(physX / PIXEL_SCALE),
    gy: Math.floor(physY / PIXEL_SCALE),
  };
}

export function gameToCSS(gx: number, gy: number, canvasRect: DOMRect): { cssX: number; cssY: number } {
  const scaleX = canvasRect.width / (GAME_WIDTH * PIXEL_SCALE);
  const scaleY = canvasRect.height / (GAME_HEIGHT * PIXEL_SCALE);
  return {
    cssX: canvasRect.left + gx * PIXEL_SCALE * scaleX,
    cssY: canvasRect.top + gy * PIXEL_SCALE * scaleY,
  };
}
```

The `<canvas>` element is configured as:

```html
<canvas
  width={GAME_WIDTH * PIXEL_SCALE}
  height={GAME_HEIGHT * PIXEL_SCALE}
  style={{
    width: '100%',
    maxWidth: `${GAME_WIDTH * PIXEL_SCALE}px`,
    imageRendering: 'pixelated',
    aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
  }}
/>
```

CSS `image-rendering: pixelated` ensures the browser does not blur when scaling the canvas down for smaller viewports.

### 2.6 Responsive Behavior and Minimum Viewport

**Minimum supported viewport:** 1024 x 768 CSS pixels (covers 1366x768 school monitors with browser chrome).

**Layout behavior:**

| Viewport width | Behavior |
|----------------|----------|
| >= 960px | Canvas renders at full 960x720 CSS. HUD and ControlBar at 960px width. Centered horizontally with dark (`#1D2B53`) gutters on larger screens. |
| 768-959px | Canvas scales down proportionally via `max-width: 100%` and `aspect-ratio: 320/240`. HUD and ControlBar scale to match canvas width. Text remains readable because HUD/controls are React DOM (CSS font scales with viewport). |
| < 768px | Not officially supported. Canvas will scale down but game pixels may become too small for comfortable interaction. A "best viewed on desktop" note may appear. |

**Vertical fit on 768px-tall displays:**

Total app height = HUD bar (~48px CSS) + canvas (proportionally scaled) + control bar (~72px CSS) + padding. On a 768px display with ~100px browser chrome, available height is ~668px. At this height, the canvas scales to approximately 548px tall (maintaining 4:3 aspect ratio at ~730px wide), which keeps game pixels legible. The React DOM overlays (HUD, controls) use fixed CSS pixel heights and do not scale, ensuring button targets remain at least 48x48 CSS px.

**Large screens:** On viewports wider than 960px, the app container is centered with `margin: 0 auto` and dark background gutters (`#1D2B53`) fill the sides, creating a "game window in darkness" effect consistent with the retro aesthetic.

### 2.7 Hit Detection System

Hit detection determines what game object is under the mouse cursor, enabling hover tooltips.

**Approach: spatial zone map (not per-pixel).**

The game world is divided into named rectangular hit zones. Each zone is defined in game-pixel coordinates and associated with a tooltip content generator.

```typescript
// app/canvas/hit-detection.ts
export interface HitZone {
  id: string;
  rect: { x: number; y: number; w: number; h: number }; // game pixels
  layer: 'vehicle' | 'traffic-light' | 'npc' | 'road';
  getTooltip: () => string;
}

export function findHitZone(zones: HitZone[], gx: number, gy: number): HitZone | null {
  // Iterate in reverse (top layers first) for correct z-order
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    if (gx >= z.rect.x && gx < z.rect.x + z.rect.w &&
        gy >= z.rect.y && gy < z.rect.y + z.rect.h) {
      return z;
    }
  }
  return null;
}
```

**Hit zones are rebuilt every time the simulation snapshot changes** (not every frame). The rebuild is cheap because the intersection has at most ~40 hit zones (4 traffic lights + up to ~20 visible vehicles + 1 NPC + 4 road labels).

**Flow:**

1. `CanvasViewport` listens to `onMouseMove` on the `<canvas>` element.
2. Converts CSS coordinates to game-pixel coordinates using `cssToGame`.
3. Calls `findHitZone(currentZones, gx, gy)`.
4. If a zone is found, sets tooltip React state with zone content + CSS position (via `gameToCSS`).
5. If no zone is found, clears tooltip state.

Mouse event handling is **throttled to 60ms** (roughly matching the 30 FPS target) to avoid excessive state updates.

---

## 3. State Management

### 3.1 Existing useReducer Integration

The existing state management in `app/hooks/useSimulation.ts` remains unchanged. It provides:

- `SimulationState` with `commands`, `stepStatuses`, `currentStepIndex`, `isPlaying`, `speed`, `options`, `telemetry`, `error`
- `SimulationAction` discriminated union (ADD_VEHICLE, STEP, STEP_RESULT, etc.)
- A `useEffect` that re-runs the engine whenever `commands` or `options` change

The canvas reads from this state but does not write to it. All mutations go through `dispatch`.

### 3.2 State Ownership Diagram

```
                    React State (useReducer)
                    ========================
                    commands: Command[]
                    stepStatuses: StepStatus[]
                    currentStepIndex: number
                    isPlaying: boolean
                    speed: number
                    options: SimulateOptions
                    telemetry: TelemetryData | null
                    error: string | null
                           │
                           │  derived via derivePhasePerStep, deriveQueuesAtStep
                           ▼
                    Simulation Snapshot (ref, not state)
                    ====================================
                    phase: PhaseId | null
                    queues: Record<Road, string[]>
                    stepCount: number
                    totalDeparted: number
                           │
                           │  read by game loop (no React re-render)
                           ▼
         ┌─────────────────┼──────────────────┐
         │                 │                  │
    Canvas State      Animation State     Hit Zone Cache
    (not React)       (useRef)            (useRef)
    =============     ===============     ================
    (stateless --     prevSnapshot        zones: HitZone[]
     reads from       currSnapshot        (rebuilt on
     snapshot ref)    interpFactor: 0-1    snapshot change)
                      vehiclePositions
                      lightGlowPhase
                      npcFrame
                           │
                           │  mouse events
                           ▼
                    Overlay State (useState, in CanvasViewport)
                    ============================================
                    tooltip: { content: string; cssX: number; cssY: number } | null
                    npcMessage: { text: string; visible: boolean } | null
```

### 3.3 Simulation Snapshot

A "snapshot" is a derived, frozen object computed from React state. It is stored in a `useRef` to avoid coupling the canvas frame loop to React render cycles.

```typescript
// app/canvas/types.ts
export interface SimulationSnapshot {
  phase: PhaseId | null;
  queues: Record<Road, string[]>;
  stepCount: number;
  totalDeparted: number;
  isPlaying: boolean;
}
```

**Updated on every React state change** via a `useEffect` inside `CanvasViewport`:

```typescript
const snapshotRef = useRef<SimulationSnapshot>(/* initial */);

useEffect(() => {
  snapshotRef.current = {
    phase: activePhase,
    queues,
    stepCount: state.stepStatuses.length,
    totalDeparted: state.stepStatuses.reduce((s, st) => s + st.leftVehicles.length, 0),
    isPlaying: state.isPlaying,
  };
}, [activePhase, queues, state.stepStatuses, state.isPlaying]);
```

The game loop reads `snapshotRef.current` each frame. No React re-render occurs from the game loop.

### 3.4 Animation State

Animation state handles smooth transitions between discrete simulation steps. Stored in a `useRef`, mutated by the game loop each frame.

```typescript
// app/canvas/animation.ts
export interface AnimationState {
  /** 0.0 to 1.0 interpolation factor between prev and curr snapshot */
  interpFactor: number;

  /** Vehicle positions lerped between queue positions */
  vehiclePositions: Map<string, { x: number; y: number }>;

  /** Current NPC animation frame index */
  npcFrame: number;
  npcFrameTimer: number;

  /** Traffic light glow pulse phase (0 to 2*PI) */
  lightGlowPhase: number;

  /** Active particle effects */
  particles: Particle[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;    // 0.0 to 1.0, decreasing
  color: number;   // palette index
}
```

**Interpolation strategy for vehicles:**

When a new simulation step arrives, vehicles that departed in `leftVehicles` get a "drive away" animation (move toward intersection center over ~300ms). Vehicles remaining in queues smoothly slide forward to fill the gap. New vehicles appear at the back of their queue with a fade-in.

```
Step N arrives:
  1. Record previous vehicle positions as "from" positions
  2. Compute new target positions based on new queue state
  3. Reset interpFactor to 0
  4. Game loop increments interpFactor each frame: interpFactor += deltaTime / TRANSITION_DURATION
  5. Vehicle positions = lerp(from, to, easeOutQuad(interpFactor))
  6. When interpFactor >= 1.0, clamp to 1.0, stop interpolating
```

### 3.5 Tooltip State

Tooltip state lives as `useState` inside `CanvasViewport`. It is lightweight and only triggers a React re-render of the `<Tooltip>` component (which is a sibling of the canvas, not a parent).

```typescript
interface TooltipState {
  content: string;
  cssX: number;
  cssY: number;
} | null
```

Updates are throttled (see hit detection section 2.7). The tooltip component is rendered with `position: absolute` relative to the canvas container, so it floats above the canvas without affecting its rendering.

### 3.6 NPC Dialog State

The NPC commentator reacts to simulation events. Dialog state is managed with a queue pattern.

```typescript
// app/hooks/useNpcDialog.ts
export interface NpcMessage {
  id: string;
  text: string;
  trigger: 'step' | 'add-vehicle' | 'phase-change' | 'error' | 'milestone';
  priority: number;  // higher = shown first if queue is full
}

export interface NpcDialogState {
  queue: NpcMessage[];
  current: NpcMessage | null;
  visible: boolean;
  displayTimer: number;  // ms remaining for current message
}
```

Messages are enqueued from a `useEffect` that watches simulation state transitions.

**Trigger conditions (aligned with UX Research Section 5.3):**

| Trigger | Condition | Example Comment |
|---------|-----------|-----------------|
| First launch | User opens the simulator for the first time | "Hey! I'm Officer Pixel. Welcome to the intersection!" |
| First vehicle added | User adds their first vehicle | "A car from the north! Let's see where it goes." |
| First step executed | User clicks Step for the first time | "The lights changed! See which direction got green?" |
| Queue threshold reached | Any single queue reaches 5+ vehicles | "Getting busy on the north road! That's a lot of cars." |
| Phase change | Phase changes from NS to EW or vice versa | "Now it's east-west's turn. The phases alternate!" |
| Emergency vehicle added | User adds an emergency vehicle | "Emergency vehicle incoming! Watch how it gets priority." |
| Idle detection (15s) | User has not interacted for 15 seconds | "Try adding some vehicles and hitting Step to see what happens!" |
| All queues cleared | All queues reach zero | "Empty intersection! You cleared everyone through." |
| Milestone | 10+ vehicles departed in a session | "12 vehicles through! This intersection is flowing nicely." |
| Error | Simulation engine returns an error | NPC reports the error in kid-friendly language |

**Suppression conditions (aligned with UX Research Section 5.3):**

| Condition | Reason |
|-----------|--------|
| Auto-play is active | Do not interrupt automated simulation with commentary |
| User dismissed NPC within last 60 seconds | Respect the dismissal |
| Same comment category triggered within last 3 steps | Avoid repetition |
| More than 3 comments shown within last 60 seconds | Prevent comment fatigue |
| User is actively interacting (clicking rapidly) | Do not distract during focused interaction |

Messages auto-dismiss after 3 seconds. The queue holds max 3 messages; lower-priority messages are dropped when full.

---

## 4. Data Flow

### 4.1 Simulation Step -> Canvas Render

```
User clicks "Step" button
       │
       ▼
ControlBar dispatches { type: 'STEP' }
       │
       ▼
simulationReducer adds { type: 'step' } to commands[]
       │
       ▼
useEffect in useSimulation detects commands change
       │
       ▼
runSimulation(commands, options) called
       │  (calls src/simulator/engine.ts -- simulate())
       ▼
dispatch({ type: 'STEP_RESULT', payload: { stepStatuses, telemetry } })
       │
       ▼
React re-renders PixelSimulatorApp
       │
       ├──▶ HudBar re-renders with new stats (React DOM)
       │
       ├──▶ CanvasViewport useEffect writes new SimulationSnapshot to snapshotRef
       │         │
       │         ▼
       │    Game loop reads snapshotRef.current on next frame
       │         │
       │         ▼
       │    Animation state resets: interpFactor = 0, new target positions computed
       │         │
       │         ▼
       │    Over next ~300ms: vehicles interpolate to new positions
       │    Traffic lights update color immediately
       │    Departure particles spawn for leftVehicles
       │
       ├──▶ NPC dialog useEffect detects step event, enqueues message
       │
       └──▶ StepLog re-renders with new entry (React DOM)
```

### 4.2 User Click -> Simulation Action -> Re-render

```
User clicks <PixelButton label="N"> (Add Car from North) in AddVehiclePanel
       │
       ▼
// vehicleId is auto-generated via incrementing counter: "V001", "V002", etc.
// See generateVehicleId() below.
dispatch({ type: 'ADD_VEHICLE', payload: { vehicleId, startRoad, endRoad, priority } })
       │
       ▼
simulationReducer appends addVehicle command to commands[]
       │
       ▼
useEffect re-runs simulation (includes the new vehicle in queues)
       │
       ▼
New StepStatuses flow through same pipeline as 4.1
       │
       ▼
Canvas shows new vehicle appearing at back of queue (fade-in animation)
```

### 4.3 Mouse Position -> Hit Detection -> Tooltip Display

```
User moves mouse over <canvas>
       │
       ▼
onMouseMove handler fires (throttled to 60ms)
       │
       ▼
cssToGame(event.clientX, event.clientY, canvasRect) -> { gx, gy }
       │
       ▼
findHitZone(currentZones, gx, gy) -> HitZone | null
       │
       ├──▶ Zone found:
       │         setTooltip({
       │           content: zone.getTooltip(),
       │           cssX: gameToCSS(zone.rect.x, zone.rect.y).cssX,
       │           cssY: gameToCSS(zone.rect.x, zone.rect.y).cssY
       │         })
       │
       └──▶ No zone:
                 setTooltip(null)
       │
       ▼
<Tooltip> component renders/hides based on tooltip state
(React DOM, absolutely positioned over canvas)
```

### 4.4 NPC Trigger Events -> Dialog Queue -> Display

```
useEffect watches state transitions
       │
       ├──▶ state.stepStatuses.length changed (new step)
       │         │
       │         ▼
       │    generateStepMessage(newStep, stepCount) -> NpcMessage
       │         │
       │         ▼
       │    enqueueMessage(message) -- adds to NpcDialogState.queue
       │
       ├──▶ state.commands has new addVehicle
       │         │
       │         ▼
       │    generateVehicleMessage(vehicle) -> NpcMessage
       │
       ├──▶ state.error changed to non-null
       │         │
       │         ▼
       │    generateErrorMessage(error) -> NpcMessage (high priority)
       │
       └──▶ phase changed
                 │
                 ▼
            generatePhaseMessage(newPhase) -> NpcMessage
       │
       ▼
NPC dialog display loop (runs in useEffect with timer):
  1. If current is null and queue is not empty:
     - Dequeue highest priority message
     - Set current, visible = true, displayTimer = 3000
  2. displayTimer counts down via setInterval
  3. When displayTimer reaches 0: visible = false, current = null
  4. Loop back to step 1
       │
       ▼
<NpcDialog> component renders current message with pixel speech bubble
NPC sprite on canvas plays "talk" animation while message is visible
```

---

## 5. File Structure

### 5.1 New Directory Layout

```
app/
  page.tsx                              [MODIFY] -- swap SimulationApp for PixelSimulatorApp
  layout.tsx                            [KEEP]   -- add pixel-art font import

  components/
    SimulationProvider.tsx               [KEEP]   -- no changes
    PixelSimulatorApp.tsx                [NEW]    -- replaces SimulationApp.tsx

    hud/
      HudBar.tsx                         [NEW]
      HudStat.tsx                        [NEW]

    canvas/
      CanvasViewport.tsx                 [NEW]    -- core canvas component

    overlay/
      Tooltip.tsx                        [NEW]
      NpcDialog.tsx                      [NEW]
      StepLog.tsx                        [NEW]

    controls/
      ControlBar.tsx                     [NEW]
      PixelButton.tsx                    [NEW]
      PixelSelect.tsx                    [NEW]
      SpeedSlider.tsx                    [NEW]
      AddVehiclePanel.tsx                [NEW]

    # OLD COMPONENTS -- removed after migration
    SimulationApp.tsx                    [REMOVE after migration complete]
    IntersectionView.tsx                 [REMOVE]
    TrafficLight.tsx                     [REMOVE]
    VehicleQueue.tsx                     [REMOVE]
    VehicleMarker.tsx                    [REMOVE]
    ControlPanel.tsx                     [REMOVE]
    AddVehicleForm.tsx                   [REMOVE]
    CommandLog.tsx                       [REMOVE]
    ErrorBanner.tsx                      [REMOVE]
    TelemetryDashboard.tsx              [REMOVE]
    ConfigPanel.tsx                      [REMOVE]
    JsonPanel.tsx                        [REMOVE]

  canvas/
    constants.ts                         [NEW]    -- GAME_WIDTH, PIXEL_SCALE, etc.
    types.ts                             [NEW]    -- RenderContext, SimulationSnapshot, etc.
    game-loop.ts                         [NEW]    -- createGameLoop
    viewport.ts                          [NEW]    -- cssToGame, gameToCSS
    hit-detection.ts                     [NEW]    -- HitZone, findHitZone
    animation.ts                         [NEW]    -- AnimationState, interpolation utils

    layers/
      background.ts                      [NEW]    -- drawBackground
      roads.ts                           [NEW]    -- drawRoads
      traffic-lights.ts                  [NEW]    -- drawTrafficLights
      vehicles.ts                        [NEW]    -- drawVehicles
      npc.ts                             [NEW]    -- drawNpc
      effects.ts                         [NEW]    -- drawOverlayEffects
      index.ts                           [NEW]    -- exports ordered layer array

    sprites/
      types.ts                           [NEW]    -- SpriteDefinition, PALETTE
      draw-sprite.ts                     [NEW]    -- drawSprite, createCachedSprite
      vehicles.ts                        [NEW]    -- car sprite definitions per direction
      traffic-lights.ts                  [NEW]    -- light sprite definitions
      npc.ts                             [NEW]    -- NPC sprite definitions (idle, talk)
      environment.ts                     [NEW]    -- tiles, trees, decorations
      ui.ts                              [NEW]    -- speech bubble sprites

  hooks/
    useSimulation.ts                     [KEEP]   -- no changes
    useAutoPlay.ts                       [KEEP]   -- no changes
    useNpcDialog.ts                      [NEW]    -- NPC message queue logic
    useHitDetection.ts                   [NEW]    -- mouse tracking + zone lookup
    useGameLoop.ts                       [NEW]    -- hook wrapping createGameLoop lifecycle

  lib/
    simulation-adapter.ts                [KEEP]   -- no changes
    derive-phase.ts                      [KEEP]   -- no changes
    npc-messages.ts                      [NEW]    -- message generation functions
    pixel-font.ts                        [NEW]    -- pixel font rendering utility (for canvas text)
    vehicle-id.ts                        [NEW]    -- generateVehicleId(): "V001", "V002", etc. (incrementing counter with prefix)
```

### 5.2 Summary of Changes

| Category | Keep | New | Remove |
|----------|------|-----|--------|
| Components | 2 (Provider, layout) | 12 | 12 (after migration) |
| Hooks | 2 | 3 | 0 |
| Lib | 2 | 2 | 0 |
| Canvas modules | 0 | 17 | 0 |
| **Total** | **6** | **34** | **12** |

---

## 6. Performance Considerations

### 6.1 Sprite Caching via Offscreen Canvas

Drawing sprites pixel-by-pixel with `fillRect` each frame is too slow for 30 FPS with many sprites. Instead, each sprite frame is pre-rendered once to an `OffscreenCanvas`, then blitted via `drawImage`.

```typescript
// app/canvas/sprites/draw-sprite.ts
const spriteCache = new Map<string, HTMLCanvasElement[]>();

export function getCachedSprite(sprite: SpriteDefinition): HTMLCanvasElement[] {
  const key = sprite.name;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const canvases = sprite.frames.map((frameData) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = sprite.width;
    offscreen.height = sprite.height;
    const octx = offscreen.getContext('2d')!;
    const imageData = octx.createImageData(sprite.width, sprite.height);

    for (let i = 0; i < frameData.length; i++) {
      const colorIndex = frameData[i];
      if (colorIndex === 0) continue;
      const color = PALETTE[colorIndex];
      const [r, g, b] = parseHexColor(color);
      const offset = i * 4;
      imageData.data[offset] = r;
      imageData.data[offset + 1] = g;
      imageData.data[offset + 2] = b;
      imageData.data[offset + 3] = 255;
    }

    octx.putImageData(imageData, 0, 0);
    return offscreen;
  });

  spriteCache.set(key, canvases);
  return canvases;
}

export function drawCachedSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteDefinition,
  frameIndex: number,
  x: number,
  y: number
): void {
  const frames = getCachedSprite(sprite);
  ctx.drawImage(frames[frameIndex % frames.length], x, y);
}
```

### 6.2 Static Layer Caching

Layers 0 (background) and 1 (roads) are completely static. They are rendered once to a shared offscreen canvas and blitted as a single `drawImage` call each frame.

```typescript
let staticLayerCache: HTMLCanvasElement | null = null;

function getStaticLayers(layers: LayerDrawFn[]): HTMLCanvasElement {
  if (staticLayerCache) return staticLayerCache;
  staticLayerCache = document.createElement('canvas');
  staticLayerCache.width = GAME_WIDTH;
  staticLayerCache.height = GAME_HEIGHT;
  const ctx = staticLayerCache.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const dummyRc = /* minimal RenderContext for static layers */;
  layers[0](dummyRc); // background
  layers[1](dummyRc); // roads

  return staticLayerCache;
}
```

This reduces per-frame cost to: 1 `drawImage` for static layers + drawing dynamic layers only.

### 6.3 Full Redraw vs Dirty Rect

**Decision: full redraw.** At 320x240 game resolution, clearing and redrawing all layers each frame costs approximately 0.5-2ms on modern hardware. Dirty-rect tracking adds code complexity that is not justified at this resolution. The `drawImage` blit for static layers keeps the constant factor low.

If profiling reveals frame drops on low-end devices, dirty-rect optimization can be added later by tracking which zones changed between frames.

### 6.4 React Re-render Isolation

The canvas must not trigger React re-renders, and React re-renders must not disrupt the canvas.

**Mechanisms:**

1. **Snapshot via `useRef`**: The game loop reads from `snapshotRef.current`, not from props or state.
2. **`useEffect` bridge**: A `useEffect` in `CanvasViewport` copies derived data from React state into the ref. This runs once per state change, not once per frame.
3. **Tooltip state isolation**: `Tooltip` is a sibling of `CanvasViewport`, not a child. Changes to tooltip state re-render only `Tooltip`, not the canvas component.
4. **`React.memo` boundaries**: `CanvasViewport` is wrapped in `React.memo` with a custom comparator that returns `true` (never re-renders from props). All communication is via refs and effects.

```typescript
export const CanvasViewport = React.memo(function CanvasViewport(/* ... */) {
  // ... component body
}, () => true);  // never re-render from parent
```

### 6.5 Memory Budget

| Asset | Count | Size per item | Total |
|-------|-------|---------------|-------|
| Vehicle sprites (4 dirs x 2 types) | 8 | 16x8 px = 128 B RGBA | ~1 KB |
| Traffic light sprites | 6 | 8x16 px = 128 B | ~0.8 KB |
| NPC sprites (idle 4f + talk 4f) | 8 | 16x24 px = 384 B | ~3 KB |
| Environment tiles | ~12 | 16x16 px = 256 B | ~3 KB |
| UI sprites | ~6 | various, avg 200 B | ~1.2 KB |
| Static layer cache | 1 | 320x240x4 = 307 KB | 307 KB |
| **Total sprite memory** | | | **~316 KB** |

This is well within budget for any device capable of running a web browser. The main `<canvas>` buffer itself is 960x720x4 = ~2.7 MB.

---

## 7. Testing Strategy

### 7.1 Test Categories

| Category | What | How | Files |
|----------|------|-----|-------|
| **Sprite unit tests** | Sprite definitions are valid (dimensions match data length, palette indices in range) | Vitest assertions | `app/canvas/sprites/__tests__/*.test.ts` |
| **Canvas utility unit tests** | `cssToGame`, `gameToCSS`, `findHitZone`, interpolation math | Vitest, pure function tests | `app/canvas/__tests__/*.test.ts` |
| **Game loop unit tests** | `createGameLoop` calls layers in order, respects FPS throttle | Vitest with mocked `requestAnimationFrame` and `CanvasRenderingContext2D` | `app/canvas/__tests__/game-loop.test.ts` |
| **NPC dialog unit tests** | Message queue logic, priority ordering, auto-dismiss timing | Vitest | `app/hooks/__tests__/useNpcDialog.test.ts` |
| **React component tests** | HudBar, ControlBar, Tooltip, NpcDialog render correctly | Vitest + @testing-library/react | `app/components/__tests__/*.test.tsx` |
| **Integration tests** | CanvasViewport mounts, game loop starts, snapshot updates flow through | Vitest + jsdom (with canvas mock) | `app/components/canvas/__tests__/CanvasViewport.test.tsx` |
| **Visual regression tests** | Canvas output matches reference images | Vitest + `node-canvas` for headless rendering, pixel comparison | `app/canvas/__tests__/visual/*.test.ts` |
| **Existing tests** | All 366 existing tests | `pnpm test` | Unchanged |

### 7.2 Canvas Rendering Tests

Canvas output cannot be tested with DOM assertions. Strategy:

**Option A: Headless canvas with snapshot comparison (recommended for CI)**

Use `canvas` npm package (node-canvas) to run draw functions in Node.js. Compare output buffers against committed reference PNGs using pixel-level diff with a tolerance threshold.

```typescript
// app/canvas/__tests__/visual/roads.visual.test.ts
import { createCanvas } from 'canvas';
import { drawRoads } from '../../layers/roads';
import { compareToReference } from '../helpers/pixel-compare';

test('roads layer matches reference', () => {
  const canvas = createCanvas(320, 240);
  const ctx = canvas.getContext('2d');
  drawRoads(/* render context with ctx */);
  const buffer = canvas.toBuffer('image/png');
  expect(compareToReference(buffer, 'roads-reference.png')).toBeLessThan(0.01); // < 1% diff
});
```

**Option B: Structural tests (no pixel comparison)**

Test that draw functions call the expected canvas API methods in the expected order, using a mock context. Less brittle than pixel comparison but does not catch visual regressions.

```typescript
test('drawTrafficLights draws 4 lights', () => {
  const ctx = createMockContext2D();
  drawTrafficLights(/* render context */);
  expect(ctx.drawImage).toHaveBeenCalledTimes(4);
});
```

**Recommendation:** Use Option B for CI (fast, stable). Use Option A as an optional visual regression suite run manually or in a separate CI job.

### 7.3 React Overlay Component Tests

Standard `@testing-library/react` tests. These components are simple presentational React:

```typescript
// app/components/__tests__/HudBar.test.tsx
test('displays step count', () => {
  render(<HudBar steps={5} queued={3} departed={2} phase="NS_STRAIGHT" />);
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

### 7.4 Integration: Canvas + React Interaction

Test that dispatching an action causes the snapshot ref to update, which the game loop would read. Since jsdom has no real `<canvas>`, mock the canvas context and verify the bridge:

```typescript
test('STEP action updates snapshot ref', async () => {
  const { result } = renderHook(() => useSimulationContext(), {
    wrapper: SimulationProvider,
  });
  act(() => result.current.dispatch({ type: 'STEP' }));
  // Verify derived state is correct
  // (Snapshot ref update is tested separately in CanvasViewport tests)
});
```

### 7.5 What Cannot Be Unit Tested

- **Actual visual appearance** on real browsers (requires Playwright or similar)
- **Frame rate performance** (requires real browser with `requestAnimationFrame`)
- **CSS `image-rendering: pixelated`** behavior across browsers

These are covered by manual testing and, optionally, Playwright screenshot tests in a separate E2E suite.

---

## 8. Migration Plan

### 8.1 Implementation Order

The migration is structured so the app remains functional at every step. Old and new components coexist until the switch is complete.

**Phase 1: Foundation (no visible changes)**

| Step | Task | Files Created/Modified |
|------|------|-----------------------|
| 1.1 | Canvas constants and types | `app/canvas/constants.ts`, `app/canvas/types.ts` |
| 1.2 | Sprite system (types, palette, draw-sprite, caching) | `app/canvas/sprites/types.ts`, `app/canvas/sprites/draw-sprite.ts` |
| 1.3 | Viewport coordinate transforms | `app/canvas/viewport.ts` |
| 1.4 | Game loop core | `app/canvas/game-loop.ts` |
| 1.5 | Animation state and interpolation utils | `app/canvas/animation.ts` |
| 1.6 | Hit detection module | `app/canvas/hit-detection.ts` |
| 1.7 | Unit tests for all foundation modules | `app/canvas/__tests__/*.test.ts` |

**Phase 2: Sprites**

| Step | Task | Files Created/Modified |
|------|------|-----------------------|
| 2.1 | Environment sprites (grass, sidewalk, tree) | `app/canvas/sprites/environment.ts` |
| 2.2 | Road surface sprites (asphalt, markings) | `app/canvas/sprites/environment.ts` (extended) |
| 2.3 | Vehicle sprites (4 directions, normal + emergency) | `app/canvas/sprites/vehicles.ts` |
| 2.4 | Traffic light sprites | `app/canvas/sprites/traffic-lights.ts` |
| 2.5 | NPC sprites (idle + talk animations) | `app/canvas/sprites/npc.ts` |
| 2.6 | UI sprites (speech bubble parts) | `app/canvas/sprites/ui.ts` |
| 2.7 | Sprite validation tests | `app/canvas/sprites/__tests__/*.test.ts` |

**Phase 3: Canvas Layers**

| Step | Task | Files Created/Modified |
|------|------|-----------------------|
| 3.1 | Background layer (grass tiles) | `app/canvas/layers/background.ts` |
| 3.2 | Road layer (asphalt, markings, crosswalks) | `app/canvas/layers/roads.ts` |
| 3.3 | Traffic light layer | `app/canvas/layers/traffic-lights.ts` |
| 3.4 | Vehicle layer (with interpolation) | `app/canvas/layers/vehicles.ts` |
| 3.5 | NPC layer | `app/canvas/layers/npc.ts` |
| 3.6 | Effects layer (particles, transitions) | `app/canvas/layers/effects.ts` |
| 3.7 | Layer index (ordered array export) | `app/canvas/layers/index.ts` |
| 3.8 | Visual regression references (optional) | `app/canvas/__tests__/visual/` |

**Phase 4: React Components (new)**

| Step | Task | Files Created/Modified |
|------|------|-----------------------|
| 4.1 | PixelButton, PixelSelect base components | `app/components/controls/Pixel*.tsx` |
| 4.2 | HudBar + HudStat | `app/components/hud/Hud*.tsx` |
| 4.3 | ControlBar + SpeedSlider | `app/components/controls/ControlBar.tsx`, `SpeedSlider.tsx` |
| 4.4 | AddVehiclePanel | `app/components/controls/AddVehiclePanel.tsx` |
| 4.5 | Tooltip component | `app/components/overlay/Tooltip.tsx` |
| 4.6 | NPC dialog component + hook | `app/components/overlay/NpcDialog.tsx`, `app/hooks/useNpcDialog.ts` |
| 4.7 | StepLog | `app/components/overlay/StepLog.tsx` |
| 4.8 | Component tests | `app/components/__tests__/*.test.tsx` |

**Phase 5: Integration (the switch)**

| Step | Task | Files Created/Modified |
|------|------|-----------------------|
| 5.1 | CanvasViewport component (wires game loop + snapshot bridge) | `app/components/canvas/CanvasViewport.tsx` |
| 5.2 | useGameLoop hook | `app/hooks/useGameLoop.ts` |
| 5.3 | useHitDetection hook | `app/hooks/useHitDetection.ts` |
| 5.4 | PixelSimulatorApp (composes all new components) | `app/components/PixelSimulatorApp.tsx` |
| 5.5 | Update `app/page.tsx` to use `PixelSimulatorApp` | `app/page.tsx` |
| 5.6 | Integration tests | Various `__tests__/` directories |
| 5.7 | NPC message content | `app/lib/npc-messages.ts` |
| 5.8 | Full integration smoke test | Manual + automated |

**Phase 6: Cleanup**

| Step | Task | Files Modified |
|------|------|----------------|
| 6.1 | Remove old components (IntersectionView, TrafficLight, VehicleQueue, etc.) | Delete 12 files |
| 6.2 | Remove `SimulationApp.tsx` | Delete file |
| 6.3 | Verify all 366+ tests pass | `pnpm test` |
| 6.4 | Performance profiling at 30 FPS target | Manual in Chrome DevTools |

### 8.2 Keeping the App Working During Migration

The key insight is that `app/page.tsx` is the only file that selects which top-level component to render. During migration:

1. **Phases 1-4**: The old app continues to work unchanged. New code is added alongside but not wired into the page.
2. **Phase 5.5**: `app/page.tsx` is updated to render `PixelSimulatorApp` instead of `SimulationApp`. This is the single switch point.
3. **Rollback**: If the new app has issues, reverting `page.tsx` to use `SimulationApp` instantly restores the old GUI. All old components remain in place until Phase 6.

A feature flag approach is also possible (render old or new based on a query param), but given this is a full redesign rather than a gradual rollout, the clean switch is simpler.

### 8.3 Component Survival Summary

| Survives unchanged | Gets replaced | Gets removed (no equivalent) |
|-------------------|---------------|-------------------------------|
| `SimulationProvider.tsx` | `SimulationApp.tsx` -> `PixelSimulatorApp.tsx` | `JsonPanel.tsx` |
| `useSimulation.ts` | `IntersectionView.tsx` -> `CanvasViewport.tsx` | `ConfigPanel.tsx` |
| `useAutoPlay.ts` | `TrafficLight.tsx` -> canvas layer | |
| `simulation-adapter.ts` | `VehicleQueue.tsx` -> canvas layer | |
| `derive-phase.ts` | `VehicleMarker.tsx` -> canvas sprite | |
| | `ControlPanel.tsx` -> `ControlBar.tsx` | |
| | `AddVehicleForm.tsx` -> `AddVehiclePanel.tsx` | |
| | `CommandLog.tsx` -> `StepLog.tsx` | |
| | `ErrorBanner.tsx` -> `NpcDialog.tsx` (errors via NPC) | |
| | `TelemetryDashboard.tsx` -> `HudBar.tsx` | |

---

## ADR-GUI-ARCH-001: Canvas + React Hybrid Rendering

### Status
Proposed

### Context
The redesign requires pixel-art rendering at a fixed low resolution (320x240) scaled up. The current SVG-based approach in `IntersectionView.tsx` cannot achieve the pixel-art aesthetic (SVG antialiases everything, has no concept of "game pixels"). We need a rendering approach that supports pixel-perfect sprites, animation loops, and smooth vehicle interpolation while keeping the existing React-based state management and control UI.

### Decision
Use a single HTML `<canvas>` element for the game scene, with React components rendered as DOM overlays for the HUD, controls, tooltips, and dialogs. The canvas runs its own `requestAnimationFrame` loop at 30 FPS, reading from a React-state-derived snapshot stored in a `useRef`. React components communicate with the canvas through refs and effects, never by forcing canvas re-renders.

### Consequences
**Easier:**
- Pixel-art rendering is natural (integer coordinates, `imageSmoothingEnabled = false`)
- Animation is smooth (game loop controls timing, not React render cycle)
- React UI components remain idiomatic (accessibility, keyboard nav, styling)

**Harder:**
- Two rendering models to understand (React DOM + Canvas imperative)
- Hit detection requires manual spatial indexing (no DOM events on canvas objects)
- Testing canvas output requires either mocks or headless canvas
- Developers need to understand the ref-based bridge between React and canvas

---

## ADR-GUI-ARCH-002: Inline Sprite Definitions

### Status
Proposed

### Context
Per BRIEF.md: "All pixel-art sprites created inline in code (no external asset files)." We need a sprite format that is easy to author, type-safe, and efficient to render.

### Decision
Sprites are defined as TypeScript arrays of palette indices. A 32-color palette (PICO-8 inspired) is shared across all sprites. At runtime, sprite frames are pre-rendered to offscreen canvases via `ImageData` and cached. Drawing a sprite is a single `ctx.drawImage()` call.

### Consequences
**Easier:**
- No asset pipeline, no image loading, no async sprite loading
- Sprites are type-checked and can be validated in unit tests
- Adding/modifying sprites is a code change with full version control

**Harder:**
- Authoring sprites as number arrays is tedious (mitigated by helper comments showing the visual layout)
- No sprite editor integration (could be added later as a dev tool)
- Palette changes require updating all sprites that use affected indices
