# GUI Redesign — Pixel-Art Educational Traffic Simulator

## Vision
Transform the current minimal dark-mode GUI into a **pixel-art retro game-style** educational traffic lights simulator for children aged 11–13.

## Design Decisions (Locked)
- **Visual style**: Pixel-art / retro 8-bit aesthetic
- **Layout**: Game-style — intersection centered, HUD top bar, gamepad-style controls bottom bar
- **Rendering**: HTML Canvas (pixel scene) + React overlay (HUD, tooltips, controls)
- **Pixel scale**: 1 game pixel = 3 CSS pixels (PIXEL_SCALE = 3, locked), canvas 320x240 rendered at 960x720
- **Educational elements**: Tooltips on hover (pixel speech bubbles) + NPC commentator (pixel police officer/robot)
- **Sound**: None (visual only)
- **Target audience**: Children 11–13, educational context (how traffic lights work)
- **Theme**: Dark retro with NES/PICO-8 inspired palette (~32 colors)

## Existing Codebase
- **Framework**: Next.js 15 + TypeScript 5.6 + Tailwind CSS 4
- **Simulation engine**: Pure domain logic in `src/simulator/` — fully functional, 366 tests passing
- **Current GUI**: 13 React components in `app/`, SVG-based, minimal styling, functional but not polished
- **State management**: React useReducer + Context
- **Adapter**: `app/lib/simulation-adapter.ts` wraps engine for GUI use

## Constraints
- Simulation logic (`src/simulator/`) must NOT be modified
- All pixel-art sprites created inline in code (no external asset files)
- Must remain a Next.js app (no separate game engine)
- Must pass existing 366 tests + new visual/component tests
- No external runtime dependencies for rendering (pure Canvas API). Dev/test dependencies (e.g., node-canvas for visual regression tests) are permitted.

## Pipeline Phases
1. **Research** — UX research, game design research, accessibility for children
2. **Design** — Sprite design, color palette, layout specs, animation specs
3. **Architecture** — Canvas renderer architecture, component tree, state flow
4. **Implementation** — Sprites, renderer, components, integration
5. **Testing** — Visual regression, component tests, accessibility, usability

## Specs Location
All specs go to: `specs/gui-redesign/<phase>/`
