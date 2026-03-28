# Review Fixes Summary

**Date:** 2026-03-27
**Reviewer issues addressed:** All 6 CRITICAL (C-01 through C-06) and all 10 WARNING (W-01 through W-10) items from `REVIEW.md`.
**NOTE items addressed:** N-03, N-05, N-06. Items N-01, N-02, N-04 deferred (minor, non-blocking).

---

## CRITICAL Fixes

### C-01: PIXEL_SCALE locked to 3

- **BRIEF.md:** Changed "3-4 CSS pixels" to "3 CSS pixels (PIXEL_SCALE = 3, locked)".
- All three specs now consistently specify PIXEL_SCALE = 3.

### C-02: Traffic light housing dimensions corrected to 7x20

- **GAME-DESIGN.md:** Changed housing size from "7 x 18 px" to "7 x 20 px" in the property table, the pixel layout header, and the E/W horizontal variant reference (now "20x7" instead of "18x7"). The pixel map already had rows 0-19 (20 rows); the table was simply wrong.

### C-03 / C-04 / C-06: Canvas vs React DOM boundary resolved

- **Decision:** Architecture spec wins. HUD, ControlBar, NPC Dialog, and Tooltips are React DOM overlays. Only the intersection scene renders on Canvas.
- **GAME-DESIGN.md Section 3.1:** Removed the three-zone canvas split (HUD/scene/control). Canvas is now full 320x240 for the game scene. HUD and controls are React DOM overlays positioned above/below via CSS grid.
- **GAME-DESIGN.md Section 4.1 (HUD Top Bar):** Rewritten as a React DOM component specification. Dimensions now in CSS pixels (960x48). Font specified as CSS pixel font ("Press Start 2P" or custom @font-face), not canvas bitmap.
- **GAME-DESIGN.md Section 4.2 (Control Bar):** Rewritten as a React DOM component. Dimensions in CSS pixels. Button specs use CSS styling (border, background, transform for press effect). Per-direction AddVehicle buttons retained (game-like UX).
- **GAME-DESIGN.md Section 4.3 (NPC Dialog):** Rewritten as a React DOM component. Portrait rendered as inline canvas or img element. Text uses CSS pixel font. Dimensions in CSS pixels.
- **GAME-DESIGN.md Section 4.4 (Tooltips):** Rewritten as React DOM overlays with CSS pixel font and CSS-pixel dimensions.
- **GAME-DESIGN.md Section 7 (Pixel Font):** Completely restructured into dual font strategy: (1) Canvas bitmap font for in-game atmospheric text only (overflow counters, road labels), (2) CSS pixel font for all React DOM overlays (HUD, controls, dialog, tooltips). Added font usage matrix.
- South road arm bottom extended from y=215 to y=224 to use the space freed by removing the in-canvas control bar. SW/SE grass quadrants extended by 8px vertically to fill.

### C-05: Palette indices unified -- Architecture wins (index 0 = transparent)

- **GAME-DESIGN.md Section 1.1:** Completely rewritten palette. Index 0 is now `transparent`. Indices 1-16 are PICO-8 core colors matching Architecture. Indices 17-31 are project extensions. Documented as "single canonical palette shared by both specs."
- **GAME-DESIGN.md Section 1.2:** Transparency rule changed from "index -1 (canvas clearRect)" to "index 0 -- sprite pixel data uses 0 for transparent pixels."
- **FRONTEND-ARCHITECTURE.md Section 2.4:** Expanded PALETTE array from 17 entries to full 32 entries with comments mapping each index to its purpose. Added note that this is the single canonical palette shared with Game Design.
- Amber signal color unified to `#FFA300` (index 10) across all specs. The old Game Design "Signal Yellow" at `#FFEC27` is removed as a traffic light color.

---

## WARNING Fixes

### W-01: Colorblind shapes unified

- **Decision:** UX Research version wins (square=red, arrow/triangle=green, diamond=amber).
- **GAME-DESIGN.md:** Updated colorblind shape encoding section with directional arrow variants for each facing (N/S/E/W). Added amber diamond shape. Green is now "ARROW/TRIANGLE" not "CIRCLE/DIAMOND."
- **UX-RESEARCH.md:** Narrowed "square or octagonal" to "square" and "circle or diamond" to "diamond" with "locked choices" annotation.

### W-02: Amber lamp behavior clarified

- **Decision:** Game Design version wins (full amber transition phase, 300ms pulse ON-OFF-ON).
- **GAME-DESIGN.md:** Changed "unused in sim, always off" to "DIAMOND shape when active during transitions" in the pixel map. Updated lamp active states to include amber with `#FFA300` (index 10) and reference to Section 5.3 for timing.
- Amber color unified to `#FFA300` across all three specs.

### W-03: Visible vehicle limits increased

- **Decision:** N/S roads increased to 8 vehicles (with 10px compressed spacing), E/W decreased to 6 vehicles (14px standard spacing).
- **GAME-DESIGN.md:** Updated vehicle queue positions table with new max visible counts and slot spacing column. Updated slot anchor formulas (N/S use N*10, E/W use N*14).

### W-04: "No external dependencies" scope clarified

- **BRIEF.md:** Changed to "No external runtime dependencies for rendering (pure Canvas API). Dev/test dependencies (e.g., node-canvas for visual regression tests) are permitted."

### W-05: East-facing car sprite corrected

- **GAME-DESIGN.md:** Flipped the east-facing car pixel layout so taillights (R) are on the left (rear) and hood is on the right (direction of travel). Windshield also moved to the correct side.

### W-06: Responsive behavior specified

- **FRONTEND-ARCHITECTURE.md:** Added new Section 2.6 "Responsive Behavior and Minimum Viewport" specifying: minimum viewport 1024x768, canvas scaling behavior at different widths, vertical fit on 768px displays, dark gutters on large screens.

### W-07: Bus sprite marked as Phase 2

- **GAME-DESIGN.md:** Bus section header changed to "Phase 2 -- future-ready, not implemented in initial release." Added note explaining it is cosmetic-only (no domain model changes) and will not be in the first implementation.

### W-08: Architecture palette completed to 32 colors

- **FRONTEND-ARCHITECTURE.md:** PALETTE array expanded from 17 entries to all 32 entries, with comments documenting purpose. Exact indices match the Game Design canonical palette.

### W-09: NPC trigger/suppression rules unified

- **Decision:** UX Research version wins (more detailed trigger table and suppression conditions).
- **FRONTEND-ARCHITECTURE.md Section 3.6:** Replaced the simple trigger list with the full trigger table from UX Research (including queue threshold, idle detection, all queues cleared). Added suppression conditions table (auto-play silence, dismissal cooldown, same-category cooldown, rapid interaction silence).

### W-10: AddVehicle interaction pattern unified

- **Decision:** Per-direction pixel-art buttons from Game Design (more game-like, one-click).
- **FRONTEND-ARCHITECTURE.md:** Updated component tree to show per-direction PixelButtons (N, S, E, W, SOS) instead of PixelSelect dropdowns. Updated AddVehiclePanel component description. Updated data flow diagram. PixelSelect retained for potential future use but not used by AddVehiclePanel.

---

## NOTE Fixes

### N-03: Lowercase character set added

- **GAME-DESIGN.md Section 7.2:** Character set expanded to include "a-z lowercase" in addition to A-Z uppercase. Required for NPC dialog messages that use mixed case.

### N-05: OffscreenCanvas prose/code mismatch resolved

- **FRONTEND-ARCHITECTURE.md:** Changed prose from "pre-rendered to OffscreenCanvas" to "pre-rendered to off-screen HTMLCanvasElement instances via document.createElement('canvas')." Added note that OffscreenCanvas was considered but HTMLCanvasElement is more compatible with older school Chromebooks.

### N-06: Vehicle ID generation strategy added

- **FRONTEND-ARCHITECTURE.md:** Added `vehicle-id.ts` to file structure with description "generateVehicleId(): V001, V002, etc. (incrementing counter with prefix)." Added comment in AddVehicle data flow referencing the auto-generation.

---

## Consistency Verification

After all fixes, the three specs are consistent on these key decisions:

| Decision              | BRIEF         | UX Research                            | Game Design                             | Architecture                                      |
| --------------------- | ------------- | -------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| PIXEL_SCALE           | 3 (locked)    | 3x scale referenced                    | 3                                       | PIXEL_SCALE = 3                                   |
| Canvas content        | Scene only    | Hybrid: scene on canvas, text on React | Scene only (HUD/controls are React DOM) | Scene on canvas, HUD/controls React DOM           |
| Palette index 0       | --            | --                                     | transparent                             | transparent                                       |
| Palette size          | ~32 colors    | 16 PICO-8 base referenced              | 32 (full, canonical)                    | 32 (full, matches Game Design)                    |
| Amber color           | --            | #FFA300                                | #FFA300 (index 10)                      | #FFA300 (index 10)                                |
| Colorblind shapes     | --            | square/arrow/diamond (locked)          | square/arrow/diamond                    | -- (references Game Design)                       |
| HUD rendering         | React overlay | React overlay recommended              | React DOM overlay                       | React DOM component                               |
| NPC dialog rendering  | React overlay | React overlay + canvas NPC             | React DOM overlay                       | React DOM component                               |
| AddVehicle UX         | --            | Game-like buttons recommended          | Per-direction buttons (N,S,E,W,SOS)     | Per-direction PixelButtons                        |
| NPC triggers          | --            | Full trigger/suppression table         | Trigger/message examples                | Full trigger/suppression table (from UX Research) |
| Traffic light housing | --            | --                                     | 7x20 px                                 | -- (references Game Design)                       |
| Bus sprite            | --            | --                                     | Phase 2 (future-ready)                  | Not referenced (Phase 2)                          |
| Min viewport          | Desktop-first | 1366x768 school monitors               | --                                      | 1024x768 minimum                                  |
| Font strategy         | --            | CSS for HUD, canvas for game           | Dual: CSS pixel font + canvas bitmap    | React DOM uses CSS, canvas uses bitmap            |
| Vehicle IDs           | --            | --                                     | "Car [ID]" in tooltips                  | generateVehicleId(): V001, V002, ...              |
| No-dependency scope   | Runtime only  | --                                     | --                                      | Runtime only (dev deps OK)                        |

**Status:** All CRITICAL and WARNING items resolved. Implementation may proceed.
