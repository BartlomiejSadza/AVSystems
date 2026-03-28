# Cross-Spec Review: GUI Redesign Specifications

**Reviewer:** Senior Code Reviewer
**Date:** 2026-03-27
**Documents reviewed:**
- `specs/gui-redesign/BRIEF.md`
- `specs/gui-redesign/research/UX-RESEARCH.md`
- `specs/gui-redesign/design/GAME-DESIGN.md`
- `specs/gui-redesign/architecture/FRONTEND-ARCHITECTURE.md`

**Verdict:** CONDITIONAL PASS -- implementation BLOCKED until all CRITICAL items are resolved. WARNING items should be resolved before implementation begins but are not strict blockers.

---

## CRITICAL (must fix before implementation)

### C-01: Pixel scale contradiction between BRIEF and Game Design

**BRIEF.md** line 10 states: "1 game pixel = 3-4 CSS pixels, canvas ~320x240 rendered at ~960x720"

**GAME-DESIGN.md** line 7 locks it to: "1 game pixel = 3 CSS pixels"

**FRONTEND-ARCHITECTURE.md** line 126 sets: `PIXEL_SCALE = 3`

The BRIEF allows 3 OR 4. The downstream specs chose 3. This needs to be explicitly ratified in the BRIEF so there is no ambiguity during implementation. If someone reads only the BRIEF, they might choose 4x (1280x960), which would break every absolute coordinate in the game design spec. **Update BRIEF.md to lock PIXEL_SCALE = 3.**

### C-02: Traffic light housing dimensions are internally inconsistent in GAME-DESIGN.md

The traffic light spec (Section 2.3) says:
- Housing size: **7 x 18 px**
- But the pixel layout shows rows 0 through 19 -- that is **20 rows**, not 18.

Count the rows: Row 0 through Row 19 = 20 rows. The table says 18. The actual pixel map is 7 x 20. This is a direct contradiction that will confuse any implementer. The table must be corrected to **7 x 20 px**, or the pixel map must be trimmed by 2 rows.

### C-03: HUD and Control Bar placement conflicts between Game Design and Architecture

**GAME-DESIGN.md** Section 3.1 places HUD top bar and control bar **inside the canvas** (y=0 to y=15, y=216 to y=239), reducing the game scene to a 200px tall zone.

**FRONTEND-ARCHITECTURE.md** Section 1.1 defines HudBar and ControlBar as **React DOM components** overlaid above and below the canvas. The canvas is described as containing only the game scene (layers 0-5: background, roads, traffic lights, vehicles, NPC, effects).

These are two fundamentally different layout models:
1. Game Design: Canvas draws everything (HUD in canvas, controls in canvas, game scene in canvas).
2. Architecture: Canvas draws only the game scene; HUD and controls are React DOM.

**The Architecture approach is correct** (it matches the BRIEF's "React overlay (HUD, tooltips, controls)" language). But the Game Design spec's pixel-perfect layouts for HUD elements (Section 4.1, 4.2) define positions in game pixels on the canvas, including font size "5px" which refers to the pixel font rendered on canvas.

This means either:
- The Game Design HUD/Control specs need to be rewritten for React DOM (CSS pixels, not game pixels), OR
- The Architecture needs to clarify that HUD and controls are rendered in the canvas too.

The UX-RESEARCH.md (Section 3.1, line 183-186) explicitly recommends the hybrid approach: "HUD text: Render in React overlay at CSS resolution. In-game text: Render in Canvas." This supports the Architecture approach. **The Game Design HUD and Control Bar sections must be rewritten to specify CSS-based React components, not canvas-rendered elements.** The pixel-perfect layouts in game coordinates are misleading.

### C-04: NPC dialog rendering conflicts between specs

**GAME-DESIGN.md** Section 4.3 defines the NPC Dialog Box at the game-pixel level (120x40 game px, with internal pixel layout, pixel font at 5px, portrait at 24x24 px). This implies canvas rendering.

**FRONTEND-ARCHITECTURE.md** Section 1.1 defines `<NpcDialog>` as a **React component** ("React -- pixel speech bubble with NPC messages"), rendered as a DOM overlay.

**GAME-DESIGN.md** line 570 itself says: "The dialog box appears as a React overlay positioned above the canvas." But then it specifies everything in game pixels, including a pixel font and a portrait sprite.

**Resolution needed:** If NpcDialog is a React component (correct per Architecture), then its dimensions should be in CSS pixels, its text should use a CSS font (or a webfont), and the portrait should be a small canvas element or an inline SVG within the React component. The game-pixel specifications in Game Design Section 4.3 will not translate directly to a React overlay. The spec needs to clearly distinguish between "this is the visual intent" and "this is the rendering implementation."

### C-05: Palette index mismatch between Game Design and Architecture

**GAME-DESIGN.md** defines a 32-color palette with indices 00-31, where:
- Index 00 = `#1D2B53` (Midnight Blue)
- Index 01 = `#2C2C34` (Dark Asphalt)
- etc.

**FRONTEND-ARCHITECTURE.md** Section 2.4 defines the PALETTE array where:
- Index 0 = `transparent`
- Index 1 = `#000000` (black)
- Index 2 = `#1D2B53` (dark blue)
- Index 3 = `#7E2553` (dark purple)
- etc.

These are completely different index mappings. Game Design index 00 (`#1D2B53`) maps to Architecture index 2. Game Design has no transparent index; Architecture reserves index 0 for transparency. The Architecture palette is a 16-color PICO-8 base with a comment "extended to 32 as needed," but the Game Design palette has 32 specific colors that do not match the Architecture's ordering.

**Every sprite pixel map in the Game Design spec uses the Game Design palette indices.** If an implementer follows the Architecture palette, all sprites will render with wrong colors. This is a showstopper. **One canonical palette must be established and both specs must reference it.**

### C-06: Game Design font spec contradicts UX Research recommendation

**GAME-DESIGN.md** Section 7 specifies all text (HUD, tooltips, dialog, buttons) rendered in a single 5px bitmap font directly on canvas. Section 7.3 explicitly states: "All text is 5px (one standard font size)."

**UX-RESEARCH.md** Section 6.3 (line 541) explicitly recommends: "Use the React overlay (rendered at CSS resolution) for all critical informational text (HUD, control labels, statistics). Reserve pixel font rendering in Canvas for atmospheric/decorative text only."

**FRONTEND-ARCHITECTURE.md** aligns with UX Research: HUD is React DOM, controls are React DOM, tooltips are React DOM.

The Game Design spec ignores this recommendation entirely and specifies pixel-font rendering for everything. This directly contradicts both the UX Research and the Architecture. **Game Design must be updated to limit pixel font usage to canvas-only text (road labels, overflow counters, vehicle labels) and specify that HUD/control/tooltip text uses CSS rendering.**

---

## WARNING (should fix, could cause problems)

### W-01: Colorblind shapes differ between UX Research and Game Design

**UX-RESEARCH.md** Section 6.2 specifies:
- Red = square or **octagonal** shape (stop sign association)
- Green = **arrow or triangular** shape pointing in traffic flow direction
- Amber = circle or diamond

**GAME-DESIGN.md** Section 2.3 specifies:
- Red = **square** shape (5x5 solid fill)
- Green = **circle/diamond** shape (5x5 with corners cut)
- No amber shape specified (yellow is listed as "unused in sim, always off")

The green signal shape differs: UX Research says "arrow or triangle" (directional), Game Design says "circle/diamond" (non-directional). These are meaningfully different for accessibility. An arrow communicates direction AND state; a diamond only communicates state. The UX Research recommendation is stronger for educational purposes. **Reconcile the shape choice and update both docs to match.**

### W-02: Amber/yellow traffic light handling is contradictory

**UX-RESEARCH.md** Section 6.2 specifies an amber signal color `#FFA300` and defines its behavior (pulsing/blinking animation during transition).

**GAME-DESIGN.md** Section 2.3, row 8 of the traffic light pixel layout says: "Y = yellow lamp area (unused in sim, always off)."

**GAME-DESIGN.md** Section 5.3 then specifies a yellow flash during phase transitions: "Yellow lamp pulses ON-OFF-ON (100ms each)" lasting 300ms.

So the yellow lamp is "always off" in Section 2.3 but animated during transitions in Section 5.3. Furthermore, the amber color itself differs: UX Research uses `#FFA300` (orange-amber), while Game Design maps Signal Yellow to `#FFEC27` (bright yellow, same as Marking Yellow). **Clarify the yellow lamp behavior and pick one color.**

### W-03: Maximum visible vehicles is too low for the expected use case

**GAME-DESIGN.md** Section 3.6 specifies maximum visible vehicles per queue:
- North/South: **5 vehicles**
- East/West: **9 vehicles**

**UX-RESEARCH.md** Section 2.6 principle 5 says: "Celebrate curiosity. When users create extreme scenarios (50 cars from one direction), respond with delight." Section 4.3 mentions queue visualization must "scale gracefully from 1 to 15+ vehicles."

5 visible vehicles on N/S roads is very low. The overflow counter ("+N") is specified, but at 5 visible cars, users will see "+N" very quickly during normal experimentation. The Persona 1 (Maja) description mentions adding "10+ vehicles from one direction." The Game Design limits her to seeing only 5 of them.

**Consider increasing the visible vehicle count** or making the slot spacing dynamic (compress from 14px to 10px when queues are longer). The N/S road arm is 88px tall (y=16 to y=104), and vehicles are 12px tall, so with 2px gaps, 88/14 = 6.28, meaning the math only supports ~6 at 14px spacing. The spec says 5, which is conservative. Consider reducing slot spacing to 10px for queues > 5, supporting up to 8 vehicles visible.

### W-04: Node-canvas dependency for visual regression tests contradicts BRIEF

**BRIEF.md** line 28: "No external dependencies for rendering (pure Canvas API)."

**FRONTEND-ARCHITECTURE.md** Section 7.2 recommends `canvas` npm package (node-canvas) for visual regression tests.

While this is a dev dependency (not a runtime rendering dependency), the BRIEF's constraint could be interpreted strictly to exclude it. More practically, node-canvas is a native dependency with complex build requirements (needs Cairo, Pango, etc. on the system), which could break CI on different platforms. **Clarify in the BRIEF that the "no external dependencies" constraint applies to runtime, not test infrastructure. Or use Option B (structural tests) for CI and skip pixel comparison entirely.**

### W-05: East-facing car sprite has inconsistent width

**GAME-DESIGN.md** Section 2.2.1 states the East-facing car sprite is 12w x 8h. But the pixel layout shows 12 characters per row, which is consistent. However, looking at the actual pixel layout:

```
Row 0:  ..TBBT......    (12 chars)
Row 1:  .BBBBBBBB.RR    (12 chars)
```

Row 0 has characters at positions 2-5 (TBBT) and then dots through position 11. Row 1 ends with RR at positions 10-11. The layout appears correct at 12 wide. However, the taillights (R) are at the right edge of the east-facing car. For an east-facing car, the hood should be on the right (the direction of travel) and the rear/taillights on the left. **The east-facing car pixel map appears to have the taillights on the wrong side** (right edge instead of left edge). The spec says "hood on the right side" but the taillights are also on the right. Compare with the note: "West-facing car: Mirror of east horizontally. Hood on the left side." If the east car's hood is on the right, taillights should be on the left. **Verify and fix the east-facing car pixel layout.**

### W-06: No specification for window resize or responsive behavior

The BRIEF says "Desktop-first" but does not exclude smaller viewports. The Architecture sets the canvas to `width: '100%', maxWidth: 960px` with `aspectRatio`, which will scale down on smaller screens. But no spec addresses:

- What happens below 960px width? The canvas scales down, but at what point do game pixels become too small to read?
- What is the minimum supported viewport width?
- Do the React overlay components (HUD, controls) reflow or also scale?
- What happens on a 1366x768 school monitor (mentioned in UX Research Section 1.4) -- does the 720px-tall canvas plus HUD plus control bar fit vertically?

The total height of the app is: HUD bar (CSS height, unspecified) + canvas (720px CSS max) + control bar (CSS height, unspecified). On a 768px-tall display with browser chrome (~100px), available height is ~668px. The canvas alone at 720px will not fit. **The Architecture must specify how the layout adapts to 1366x768 viewports**, which is explicitly called out as the minimum target in UX Research.

### W-07: Bus sprite not accounted for in the domain model

**GAME-DESIGN.md** Section 2.2.2 specifies a Bus vehicle type (8x20 px / 20x8 px).

**src/simulator/types.ts** defines `Vehicle` with no `type` or `vehicleType` field. There is only `priority: 'normal' | 'emergency'`. The domain model has no concept of bus vs car vs ambulance at the type level -- only normal vs emergency priority.

The Architecture spec does not mention buses at all. The sprite definitions reference "car-north, car-south... emergency-car variants" but no bus variants.

**The bus has no way to be triggered from the simulation engine.** Either:
1. Remove the bus from the Game Design spec (simplest),
2. Add it as a cosmetic-only variation (randomly assign bus sprite to some normal vehicles), or
3. Add a vehicle type to the domain model (violates the BRIEF constraint: "Simulation logic must NOT be modified").

**Option 2 is recommended**: randomly assign bus sprites to some percentage of normal vehicles for visual variety, with no domain model changes.

### W-08: Architecture palette is incomplete

**FRONTEND-ARCHITECTURE.md** Section 2.4 defines only 17 palette entries (indices 0-16, including transparent) with the comment "extended to 32 as needed by sprite design spec." But the Game Design spec relies on all 32 colors being available at specific indices.

**The Architecture must include the full 32-color palette** (or explicitly reference the Game Design palette as canonical). Leaving it as "extended as needed" means the implementer has to reverse-engineer the mapping, which invites errors.

### W-09: NPC trigger conditions differ between UX Research and Architecture

**UX-RESEARCH.md** Section 5.3 defines detailed NPC trigger conditions including:
- Queue threshold: 5+ vehicles
- Idle detection: 15 seconds
- Suppression: No comments during auto-play, 60-second dismissal cooldown, same-category cooldown of 3 steps, max 3 comments per 60 seconds

**FRONTEND-ARCHITECTURE.md** Section 3.6 defines NPC triggers as:
- First step, phase change, vehicle added, emergency vehicle, error, every 10 steps
- Auto-dismiss after 3 seconds
- Queue holds max 3 messages

The Architecture omits: idle detection, queue threshold triggers, the suppression rules (auto-play silence, dismissal cooldown, rapid interaction silence), and the "all queues cleared" trigger. **The Architecture's NPC system is significantly simpler than what UX Research specifies.** Either the Architecture must be updated to support the full trigger/suppression system, or the UX Research must be pared down to match what will actually be built. The discrepancy will cause ambiguity for the implementer.

### W-10: AddVehicle form design conflicts between Game Design and Architecture

**GAME-DESIGN.md** Section 4.2 specifies dedicated buttons in the bottom control bar: "Add Car (N)", "Add Car (S)", "Add Car (E)", "Add Car (W)", and "Add Emergency" -- each as a separate 20x16 px or 40x16 px button. This is a one-click-per-direction design.

**FRONTEND-ARCHITECTURE.md** Section 1.1 specifies an `AddVehiclePanel` with dropdown selects: `<PixelSelect label="From" />`, `<PixelSelect label="To" />`, `<PixelSelect label="Priority" />`, and `<PixelButton label="Add" />`. This is a form-based design.

These are fundamentally different interaction patterns. The Game Design approach (one button per direction) is faster and more game-like but loses the ability to specify the destination road and priority in a single flow. The Architecture approach (form with dropdowns) is more flexible but less game-like.

**The UX Research (Section 4.5) supports the game-like approach**: "Center the primary actions... mimicking a game controller's face buttons. Use large, visually distinct pixel-art buttons." **Pick one approach and update both specs.**

---

## NOTE (nice to fix, minor issues)

### N-01: Game Design specifies buildings overlapping grass quadrant boundaries

Building positions in Section 3.6:
- "Building: School" at (200, 20) in NE quadrant. NE quadrant starts at x=178. A 32-wide building at x=200 ends at x=232, which is within bounds.
- "Building: Apt" at (280, 24) in NE quadrant. NE quadrant ends at x=320. A 32-wide building at x=280 ends at x=312, within bounds.

These check out. However, the NPC position at (8, 188) is in the SW grass quadrant (x=0, y=134, w=142, h=82, ending at y=216). y=188 is within bounds (134 to 216). The NPC is 16x24, so it extends to y=212, also within bounds. This is fine.

Tree D at (20, 160) in SW quadrant. The NPC at (8, 188) is 16px wide, ending at x=24. Tree D at (20, 160) is 10px wide, ending at x=30. At y=160, the tree is above the NPC (y=188). The tree is 14px tall (ending at y=174). No overlap. Fine, but it is tight. **Add a note that decorative element placement must be verified for overlaps during implementation.**

### N-02: No acceptance criteria defined per feature

None of the three specs include formal acceptance criteria in a testable format (Given/When/Then or checkboxes). The testing strategy in the Architecture is structured by category but does not list specific pass/fail criteria for individual features. For example: "traffic light displays red when phase is E-W" is implied but never stated as a criterion.

**Recommendation:** Add an acceptance criteria appendix to the Game Design spec, listing each visual feature with a testable condition.

### N-03: Pixel font character set lacks lowercase in Game Design

**GAME-DESIGN.md** Section 7.2 specifies: "A-Z uppercase, 0-9, common punctuation." No lowercase.

**UX-RESEARCH.md** Section 6.3 lists as needed: "A-Z uppercase" for labels AND "a-z lowercase" for NPC speech.

The NPC dialog messages throughout all specs use mixed case: "Welcome! I'm Officer Pixel. Let's learn about traffic lights!" This requires lowercase. **Game Design pixel font spec must include lowercase a-z**, or NPC dialog must be ALL CAPS (which would feel aggressive for the target audience).

### N-04: Tooltip delay differs slightly between specs

**UX-RESEARCH.md** recommends 400-600ms delay for children.
**GAME-DESIGN.md** specifies 400ms.

400ms is the lower bound of the UX Research range. This is fine but worth noting. 500ms might be safer for the youngest users (11-year-olds).

### N-05: Architecture uses `document.createElement('canvas')` instead of `OffscreenCanvas`

Section 6.1 mentions `OffscreenCanvas` in the prose ("pre-rendered to `OffscreenCanvas`") but the code example uses `document.createElement('canvas')`. `OffscreenCanvas` is supported in all modern browsers and would be more appropriate (it is designed for off-screen rendering and works in workers). However, the `document.createElement` approach is more universally compatible, especially on older school Chromebooks. **Not a bug, but the prose should match the code.** Either use `OffscreenCanvas` API or remove the reference to it.

### N-06: No specification for vehicle ID generation in the GUI

The domain model requires a `vehicleId: string`. The current `useSimulation.ts` expects the caller to provide it. The Architecture's `AddVehiclePanel` dispatches `ADD_VEHICLE` with a `vehicleId`, but no spec defines how vehicle IDs are generated in the new GUI. The Game Design shows tooltip content like "Car [ID]" but does not specify the ID format (V001? CAR-1? Random?).

**Add a vehicle ID generation strategy to the Architecture** (e.g., incrementing counter with prefix: `V001`, `V002`, etc.).

---

## PRAISE (what is done well)

### P-01: Exceptional UX Research depth

The UX Research document is outstanding. The persona definitions (Maja, Kacper, Zara) are specific, research-grounded, and directly actionable. The user journey map is detailed enough to validate design decisions against. The analysis of existing educational software (SimCity, Mini Motorways, Cities: Skylines, Khan Academy) extracts concrete, applicable patterns rather than vague inspiration. The NPC trigger/suppression conditions are the most thorough specification of NPC behavior I have seen in a spec of this scope.

### P-02: Colorblind accessibility is treated as a first-class concern

All three specs address colorblind safety, and the Game Design spec goes further with multi-channel redundancy (color + position + shape + animation + text). The specific pixel maps for square-red and circle-green lamp shapes are immediately implementable. The blue halo for green signals is a thoughtful touch. This is significantly above average for educational software specifications.

### P-03: Architecture's migration plan is sound

The six-phase migration plan with a single switch point (`app/page.tsx`) is clean engineering. The fact that old and new components coexist until the final cleanup phase means the app remains functional throughout development. The rollback strategy (revert one file) is simple and credible. The `React.memo(() => true)` pattern for isolating the canvas from React re-renders is correct and well-explained.

### P-04: Sprite specifications are implementation-ready

The Game Design spec provides actual pixel maps for every sprite variant. A developer could implement these sprites directly from the spec without any design interpretation. The 4-color-per-sprite constraint, the directional variants, and the animation frame specifications are all precise enough to code from.

### P-05: State management architecture respects existing code

The decision to keep `useSimulation.ts`, `useAutoPlay.ts`, `simulation-adapter.ts`, and `derive-phase.ts` unchanged is exactly correct. The ref-based bridge between React state and the canvas game loop is a clean separation that avoids coupling two rendering models. The snapshot pattern ensures the game loop never triggers React re-renders.

### P-06: Performance analysis is realistic

The Architecture's assessment that full redraw at 320x240 costs ~0.5-2ms is accurate. The sprite caching via pre-rendered offscreen canvases is the standard approach. The memory budget calculation (316 KB for all sprites) is realistic and well within any device's capability. The decision to defer dirty-rect optimization is pragmatic.

---

## Summary of Required Actions

| ID | Category | Action Required | Blocks Implementation? |
|----|----------|----------------|----------------------|
| C-01 | CRITICAL | Lock PIXEL_SCALE=3 in BRIEF.md | Yes |
| C-02 | CRITICAL | Fix traffic light housing dimensions (7x18 vs 7x20) | Yes |
| C-03 | CRITICAL | Resolve HUD/ControlBar rendering model (canvas vs React DOM) | Yes |
| C-04 | CRITICAL | Resolve NPC dialog rendering model (canvas vs React DOM) | Yes |
| C-05 | CRITICAL | Establish single canonical palette with consistent indices | Yes |
| C-06 | CRITICAL | Align font rendering strategy across all three specs | Yes |
| W-01 | WARNING | Reconcile colorblind signal shapes (arrow vs diamond for green) | Recommended |
| W-02 | WARNING | Clarify amber/yellow lamp behavior and color | Recommended |
| W-03 | WARNING | Increase max visible vehicles or specify dynamic spacing | Recommended |
| W-04 | WARNING | Clarify "no external dependencies" scope (runtime vs dev) | Recommended |
| W-05 | WARNING | Verify east-facing car sprite orientation | Recommended |
| W-06 | WARNING | Specify responsive behavior for 1366x768 viewports | Recommended |
| W-07 | WARNING | Decide bus sprite strategy (remove, cosmetic-only, or domain change) | Recommended |
| W-08 | WARNING | Complete the Architecture palette to 32 colors | Recommended |
| W-09 | WARNING | Reconcile NPC trigger/suppression rules across specs | Recommended |
| W-10 | WARNING | Pick one AddVehicle interaction pattern (buttons vs form) | Recommended |
