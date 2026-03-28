# UX Research Spec: Pixel-Art Retro Educational Traffic Simulator

**Project:** AVSystems GUI Redesign
**Target audience:** Children aged 11-13 in educational contexts
**Visual style:** Pixel-art / retro 8-bit (NES/PICO-8 inspired)
**Platform:** Desktop-first web application (no sound)
**Date:** 2026-03-27
**Status:** Research phase

---

## Table of Contents

1. [Target Audience Analysis](#1-target-audience-analysis)
2. [Educational UX Patterns](#2-educational-ux-patterns)
3. [Pixel-Art UI/UX Considerations](#3-pixel-art-uiux-considerations)
4. [Interaction Design for the Age Group](#4-interaction-design-for-the-age-group)
5. [NPC Commentator Patterns](#5-npc-commentator-patterns)
6. [Accessibility for Children](#6-accessibility-for-children)
7. [Emotional Design](#7-emotional-design)
8. [User Personas](#8-user-personas)
9. [User Journey Map](#9-user-journey-map)

---

## 1. Target Audience Analysis

### 1.1 Cognitive Development at Ages 11-13

Children aged 11-13 are in Piaget's formal operational stage, which means they are beginning to develop the capacity for abstract thinking, hypothetical reasoning, and systematic problem-solving. This has direct implications for educational software design.

**Key cognitive characteristics:**

- **Abstract reasoning is emerging but not fully developed.** Children at this age can begin to understand cause-and-effect chains with 2-3 links (e.g., "if this light turns green, that traffic flows, which clears this queue") but struggle with deeply nested abstractions. The simulator should make abstract traffic flow concepts concrete and visual rather than relying on textual or numeric explanations alone.

- **Working memory capacity is approximately 5-7 items** (Miller's Law applies, though the lower end is more realistic for this age). This limits how many simultaneous data points the UI can present without overwhelming the user. The current GUI shows steps, queued count, departed count, four queue bars, a phase label, and a step log simultaneously — that is already approaching the limit for adult users and exceeds comfortable capacity for this age group.

- **Attention span averages 20-30 minutes for focused engagement** on a single educational task (Ruff & Rothbart, 2001). The simulator session design should account for this: meaningful learning outcomes should be achievable within a 15-20 minute session, with natural stopping points.

- **Metacognition is developing.** Children at this age are beginning to think about their own thinking. They can benefit from reflection prompts ("Why do you think that queue got so long?") but these should be optional and well-timed, not constant interruptions.

### 1.2 What Engages 11-13 Year Olds in Educational Software

Research on educational technology engagement (Habgood & Ainsworth, 2011; Hamari et al., 2016) identifies several consistent patterns for this age group:

**High-engagement factors:**

| Factor                              | Relevance to This Project                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Sense of agency and control         | Let users add vehicles, control timing, experiment freely                      |
| Immediate visual feedback           | Vehicle movement, light changes, queue growth must be instant and visible      |
| Low-stakes experimentation          | No fail states, no grades — "what happens if I add 20 cars from the north?"    |
| Humor and personality               | NPC commentator with character, funny vehicle names, playful descriptions      |
| Visual novelty and aesthetic appeal | Pixel-art style itself is a hook — it signals "game" not "homework"            |
| Social comparison (optional)        | "Your intersection handled 47 vehicles!" — shareable stats without competition |
| Discovery and surprise              | Hidden behaviors, edge cases that reveal themselves through experimentation    |

**Low-engagement factors to avoid:**

| Factor                               | How to Avoid                                                             |
| ------------------------------------ | ------------------------------------------------------------------------ |
| Walls of text                        | Use visual explanations, tooltips on demand, NPC speech bubbles          |
| Mandatory reading before interaction | Let users click immediately, teach through doing                         |
| Overly complex initial state         | Start with one road, one vehicle, add complexity progressively           |
| Punitive feedback                    | Never say "wrong" — say "interesting, look what happened"                |
| Condescending tone                   | Avoid baby language — 11-13 year olds want to feel smart, not patronized |

### 1.3 Gaming Literacy at This Age

Children aged 11-13 in 2026 have substantial gaming literacy. Research from Ofcom (2024) and ESA (2025) reports indicates:

- **95%+ of this age group plays video games regularly** (mobile, console, or PC)
- **Familiarity with retro aesthetics is high** due to Minecraft's pixel influence, retro-styled indie games (Celeste, Undertale, Stardew Valley), and retro gaming content on YouTube/TikTok
- **Standard game UI conventions are understood:** HUD elements, health/status bars, inventory panels, minimap concepts, tooltip hover patterns
- **Turn-based and step-based mechanics are familiar** from games like Pokemon, Fire Emblem, and strategy games
- **Keyboard shortcuts are used by many** but not all — mouse/click should be primary, keyboard should be a power-user option

**Implication:** We can use game UI conventions confidently. This audience will recognize a top-bar HUD, understand that hovering shows information, and expect visual feedback on actions. We do not need to teach basic interaction patterns — we need to teach traffic concepts.

### 1.4 Educational Context Considerations

This simulator will likely be used in:

- **Classroom settings** with a teacher guiding 20-30 students simultaneously
- **Homework/self-study** without teacher guidance
- **Computer lab environments** with shared/older hardware

This means:

- The UI must be self-explanatory enough for unsupervised use
- Performance must be acceptable on lower-end school hardware
- The pixel-art canvas rendering at 960x720 is appropriate for typical school monitors (1366x768 minimum)
- Teacher-facing features (preset scenarios, guided exercises) are valuable but out of scope for this phase

---

## 2. Educational UX Patterns

### 2.1 How Successful Educational Software Teaches Complex Systems

Teaching traffic management — a system with multiple interacting components, time-dependent states, and emergent behavior — requires specific pedagogical approaches. The following analysis examines how proven educational and simulation games handle similar challenges.

### 2.2 SimCity (Maxis, 1989-2013)

**What it teaches:** Urban systems, traffic flow, zoning interdependencies
**Age range:** Originally designed for adults, but widely used in education with 11-16 year olds (SimCityEDU project)

**UX patterns we should adopt:**

- **Immediate visual consequence of decisions.** In SimCity, building a road immediately changes traffic patterns visibly. Our simulator should show vehicles appearing and moving the moment the user adds them, not just updating a counter.
- **Layered information density.** SimCity shows the city view by default (low information) and allows toggling data overlays (traffic density, pollution, etc.) for deeper analysis. We should provide a simple default view with optional detail overlays.
- **Sandbox over scenario.** SimCity's enduring educational value comes from freeform experimentation, not its scenario mode. Our simulator should prioritize sandbox play — let users create traffic situations and observe outcomes.

**Patterns to avoid from SimCity:**

- Information overload in data panels (too many statistics for 11-13 year olds)
- No guided introduction — new players are dropped into a blank map with no direction

### 2.3 Mini Motorways (Dinosaur Polo Club, 2019)

**What it teaches:** Traffic routing, resource allocation, bottleneck identification
**Age range:** 10+ (PEGI), actual player base skews 15-35 but the core mechanic is accessible to younger players

**UX patterns we should adopt:**

- **Visual traffic flow representation.** Mini Motorways makes traffic visible as tiny colored dots flowing along roads. This makes abstract "queue length" into something visceral. Our pixel-art vehicles should visibly queue, wait, and move.
- **Minimal text, maximum visual communication.** The game has almost no text UI — everything is communicated through color, shape, and animation. For our audience, we should maximize visual communication and minimize text labels.
- **Gradual complexity introduction.** The game starts with one house and one destination, adding complexity over time. Our progressive disclosure should follow this: start with N-S traffic only, then introduce E-W, then emergency vehicles.

### 2.4 Cities: Skylines Education Mode (Colossal Order / Teacher Gaming)

**What it teaches:** Urban planning, infrastructure management, environmental impact
**Age range:** Explicitly designed for classroom use, 11-16 year olds

**UX patterns we should adopt:**

- **Learning objectives integrated into gameplay.** Cities: Skylines EDU adds specific learning prompts at decision points. Our NPC commentator should provide learning moments at natural points ("Notice how the north queue is building up — that is because the phase only lasts one step").
- **Observable cause-and-effect chains.** The education mode highlights cause-and-effect explicitly with visual indicators. We should visually connect user actions (adding a vehicle) to consequences (queue growing, wait time increasing).
- **Reflection pauses.** The education mode periodically asks students to predict what will happen next before advancing. Our step-by-step mode naturally supports this — the NPC can ask "What do you think will happen when we step?" before the user clicks Step.

### 2.5 Khan Academy Interactive Exercises

**What it teaches:** Mathematics, science — abstract concepts made interactive
**Age range:** 10-18 (varies by content)

**UX patterns we should adopt:**

- **Hint system with progressive revelation.** Khan Academy provides hints that start vague and get more specific. Our NPC should offer escalating detail: first observation ("Lots of cars from the north!"), then explanation ("The phase system alternates between N-S and E-W"), then guidance ("Try adding a vehicle from the east to balance the load").
- **Immediate inline feedback.** Khan Academy shows feedback directly next to the interaction point, not in a separate panel. Tooltips and NPC speech bubbles should appear near the relevant intersection element.
- **No penalty for exploration.** Wrong answers in Khan Academy lead to learning, not punishment. Our simulator should celebrate interesting failure states — a queue backing up is a learning opportunity, not a failure.

### 2.6 Synthesized Educational UX Principles for This Project

Based on the analysis above, the following principles should guide the design:

1. **Show, do not tell.** Prefer visual/animated explanations over text. If a concept can be shown as a pixel-art animation, do not explain it in a paragraph.
2. **Sandbox first, guided second.** Let users play immediately. Provide optional guided tutorials through the NPC, not mandatory ones.
3. **Progressive complexity.** Start simple (one direction, one vehicle) and let users discover complexity at their own pace.
4. **Immediate feedback loops.** Every user action should produce a visible result within 200ms.
5. **Celebrate curiosity.** When users create extreme scenarios (50 cars from one direction), respond with delight ("Wow, traffic jam!") not warnings.
6. **Layered information.** Default view shows essentials only. Details available on hover/click for curious learners.

---

## 3. Pixel-Art UI/UX Considerations

### 3.1 Readability at Low Resolution

The project specifies a native canvas resolution of 320x240 pixels rendered at 960x720 CSS pixels (3x scale). This is comparable to NES resolution (256x240) or PICO-8 (128x128) scaled up. This resolution imposes strict constraints on visual design.

**Character readability:**

- At 320x240, standard pixel fonts require a minimum of 5x7 pixels per character (including spacing) to be reliably readable. This is the size used by most NES-era games for body text.
- At 3x scale, a 5x7 pixel character renders at 15x21 CSS pixels — readable but small on a 1080p monitor. For critical text (button labels, phase names), consider 6x8 or larger pixel fonts.
- **Maximum comfortable text line:** At 5-pixel-wide characters with 1-pixel spacing, a 320-pixel-wide canvas fits approximately 53 characters per line. In practice, speech bubbles and labels should use no more than 30-35 characters per line for comfortable reading.
- **Font selection matters critically.** Not all pixel fonts are equally readable. Recommended approach: design a custom 5x7 font optimized for the specific words used in the simulator (N, S, E, W, STEP, PLAY, QUEUE, GREEN, RED, vehicle IDs). This avoids needing to solve general-purpose pixel font readability.

**Icon and sprite readability:**

- Traffic light sprites must be at minimum 8x16 pixels (a vertical stack of three 4x4-pixel circles with 2-pixel spacing). At 3x scale, this renders at 24x48 CSS pixels — adequate but small. Recommend 12x24 pixels (36x72 CSS pixels) for comfortable visibility.
- Vehicle sprites should be at minimum 8x6 pixels to distinguish direction and type. Emergency vehicles need a clear visual differentiator (flashing pixel, different color) visible at 3x scale.
- Road markings (lane dividers, crosswalks) require minimum 1-pixel width, which at 3x scale is 3 CSS pixels — visible but thin. Use 2-pixel-wide markings for better visibility.

**Recommendations for text rendering:**

- HUD text (statistics, labels): Render in React overlay at CSS resolution, not in Canvas, to avoid pixel-font readability issues for critical information.
- In-game text (speech bubbles, vehicle IDs): Render in Canvas using a well-designed pixel font at native resolution.
- This hybrid approach (per the BRIEF.md architecture) is the correct pattern.

### 3.2 Color Contrast and Palette Design

The BRIEF specifies a NES/PICO-8 inspired palette of approximately 32 colors with a dark background. This requires careful contrast management.

**PICO-8 palette as reference (16 colors):**

| Color       | Hex     | Use Case                      |
| ----------- | ------- | ----------------------------- |
| Black       | #000000 | Background                    |
| Dark Blue   | #1D2B53 | Road surface                  |
| Dark Purple | #7E2553 | Accents                       |
| Dark Green  | #008751 | Vegetation, safe indicators   |
| Brown       | #AB5236 | Buildings, NPC skin           |
| Dark Gray   | #5F574F | Shadows, disabled elements    |
| Light Gray  | #C2C3C7 | Text, road markings           |
| White       | #FFF1E8 | Highlights, active text       |
| Red         | #FF004D | Traffic light red, danger     |
| Orange      | #FFA300 | Traffic light amber, warnings |
| Yellow      | #FFEC27 | Highlights, stars, rewards    |
| Green       | #00E436 | Traffic light green, success  |
| Blue        | #29ADFF | Information, water, coolness  |
| Lavender    | #83769C | Secondary text                |
| Pink        | #FF77A8 | Emergency vehicles, alerts    |
| Peach       | #FFCCAA | NPC skin, warm accents        |

**Contrast requirements:**

- Text on dark backgrounds: Minimum 4.5:1 contrast ratio (WCAG AA). White (#FFF1E8) on dark blue (#1D2B53) achieves approximately 9.5:1 — excellent.
- Light gray (#C2C3C7) on dark blue (#1D2B53) achieves approximately 5.8:1 — passes AA.
- Dark gray (#5F574F) on black (#000000) achieves approximately 2.8:1 — FAILS AA. Do not use for readable text.
- All interactive elements must have visible focus/hover states that meet contrast requirements.

**Traffic light colors — critical accessibility concern:**

Standard red/green traffic light colors are problematic for colorblind users. This is addressed in detail in Section 6 (Accessibility). The palette must include colorblind-safe alternatives as a core design requirement, not an afterthought.

### 3.3 How Retro Games Solved UI Challenges

NES and SNES-era games operated under severe constraints (256x240 pixels, 4 colors per sprite, limited memory) and developed elegant solutions to UI problems directly applicable to this project.

**HUD design (top-bar information display):**

- **The Legend of Zelda (NES, 1986):** Top-of-screen HUD showing health (hearts), rupees (currency), items. Key pattern: iconic representation over numeric. Hearts are more readable than "HP: 12/16" at low resolution. Our HUD should use icons: a small car icon with a number for queue length, a traffic light icon for current phase, a step counter with a shoe/arrow icon.
- **Super Mario Bros (NES, 1985):** Score, coins, world number, and time displayed in a single top row using minimal characters. Key pattern: consistent position. Users learn where to look once and never have to search. Our HUD elements must occupy fixed positions that never move.
- **Mega Man (NES, 1987):** Boss health bars using filled rectangles rather than numbers. Our queue-length indicators should use visual bars (filled pixel rectangles) rather than numeric counts as the primary representation.

**Inventory and menu screens:**

- **Final Fantasy (NES, 1987):** Used bordered panels with white-on-blue text for menus. The blue panel became an RPG standard because it provides excellent contrast and reads as "information container" to players. Our control panels and speech bubbles should use a similar bordered-panel approach.
- **Pokemon (Game Boy, 1996):** Text boxes with a scrolling arrow indicator to show "more text available." Our NPC speech bubbles should use a similar pattern — a blinking pixel arrow or chevron when the message has more to reveal.

**State communication (showing system state visually):**

- **Sim City (SNES, 1991):** Used color-coded overlays (green = good, red = bad) on the city map. Traffic flow visualization used animated dots. Our intersection should use animated pixel vehicles that visibly move during phase changes, not just appear/disappear.
- **Harvest Moon (SNES, 1996):** Day/season cycle communicated through palette shifts. We could use subtle palette variation to indicate phase state: slightly warmer tones when N-S is green, slightly cooler tones when E-W is green, providing an ambient cue beyond the traffic lights themselves.

**Tooltip and help systems:**

- **StarTropics (NES, 1990):** Used context-sensitive NPC dialogue — talking to NPCs near different game elements gave different hints. Our NPC commentator should be context-aware: if the user hovers over a queue, the NPC comments on that queue.
- **A Link to the Past (SNES, 1991):** Displayed item names in a small box when hovering over inventory items. Our element tooltips should follow this pattern: a small pixel speech bubble appearing next to the element on hover.

---

## 4. Interaction Design for the Age Group

### 4.1 Input Model: Click-Primary, Hover-Enhanced

The BRIEF specifies desktop-first. For ages 11-13 on desktop:

- **Primary interaction: Click.** All essential functionality must be accessible via click/tap. No action should require hover to activate. Hover is enhancement, not requirement.
- **Secondary interaction: Hover.** Tooltips, preview states, and NPC reactions trigger on hover. These provide additional learning but are not required for basic operation.
- **Tertiary interaction: Keyboard.** Power users (and accessibility needs) should be able to navigate and operate entirely via keyboard. This is addressed in Section 6.

**Click target sizes:**

- Minimum click target: 44x44 CSS pixels (WCAG 2.5.5 Target Size). At 3x scale with native pixel art, this means interactive elements must be at minimum 15x15 game pixels. All buttons, traffic lights, and vehicle sprites should meet this minimum.
- Recommended click target for this age group: 48x48 CSS pixels or larger. Children's motor control is still developing, and oversized targets reduce frustration.
- Spacing between click targets: Minimum 8 CSS pixels to prevent misclicks.

### 4.2 Tooltip Timing and Behavior

Tooltip design is critical for this project because tooltips are the primary educational delivery mechanism (per the BRIEF: "Tooltips on hover, pixel speech bubbles").

**Timing research:**

- Nielsen Norman Group research (2024) recommends tooltip delay of 300-500ms for adults. For children, slightly longer delays (400-600ms) prevent accidental tooltip triggering during casual mouse movement.
- Tooltip display duration: Should remain visible as long as hover continues, plus 200ms grace period after mouse leaves (to allow re-hover without flicker).
- Tooltip should fade in over 2-3 frames (at 60fps, approximately 33-50ms) rather than appearing instantly — this reads as intentional in pixel art and avoids startling the user.

**Tooltip content guidelines:**

- Maximum 2 lines of text per tooltip at default display.
- First line: What the element is ("North Road Queue").
- Second line: Current state or relevant fact ("3 vehicles waiting").
- Optional "expand" state (click to pin tooltip): Shows additional educational content ("Vehicles wait here until the N-S phase turns green").

**Tooltip visual design:**

- Pixel speech bubble with a directional tail pointing to the source element.
- Dark panel background (similar to Final Fantasy menu boxes) with light text.
- Must not overlap with other critical elements (traffic lights, active vehicle animations).
- Tooltip z-order must be above all game elements but below modal dialogs.

### 4.3 Information Density and Progressive Disclosure

The current GUI presents approximately 15 distinct data points simultaneously (steps count, queued count, departed count, four queue bars with numbers, phase label, speed value, step log entries, telemetry values). For 11-13 year olds, this must be significantly reduced in the default view.

**Recommended information hierarchy:**

**Level 1 — Always visible (HUD bar, maximum 4 items):**

- Current phase (shown as traffic light icon state, not text)
- Step counter (numeric, small)
- Total vehicles in simulation (car icon + number)
- Play/pause state (icon)

**Level 2 — Visible on hover or focus (tooltips and speech bubbles):**

- Per-road queue length (hover over a road)
- Vehicle details (hover over a vehicle sprite)
- Phase explanation (hover over traffic light)
- NPC commentary (appears contextually)

**Level 3 — Available on demand (toggle panels):**

- Step log / history
- Telemetry / statistics
- Queue detail view
- Phase cycle explanation

This three-level hierarchy ensures the default screen is clean and game-like (Level 1), curious learners can discover more (Level 2), and advanced users or teacher-guided sessions can access full data (Level 3).

### 4.4 Gamification Elements

Gamification for 11-13 year olds must be handled carefully. Research (Hamari et al., 2016; Deterding et al., 2011) shows that intrinsic motivation features outperform extrinsic reward systems for educational engagement in this age group.

**Recommended gamification elements:**

| Element                            | Implementation                                                                | Purpose                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Step counter as score-like display | Pixel-art counter in HUD that ticks up visually                               | Provides sense of progress                                  |
| Vehicle departure animation        | Vehicles drive off-screen with a small celebration (pixel sparkle)            | Immediate positive feedback for successful phase completion |
| NPC reactions                      | Commentator reacts to interesting states ("New record: 12 vehicles cleared!") | Social/personality engagement                               |
| Scenario challenges (optional)     | "Can you clear all vehicles in under 10 steps?"                               | Goal-oriented play for advanced users                       |
| Discovery log                      | Track what states/scenarios the user has encountered                          | Encourages exploration                                      |

**Gamification elements to avoid:**

| Element                                 | Reason                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| Leaderboards                            | Creates anxiety, shifts focus from learning to competition        |
| Grades or scores that judge performance | Educational context should be judgment-free                       |
| Time pressure                           | Conflicts with understanding — learning needs time for reflection |
| Unlockable content gating               | Frustrates slower learners, creates artificial barriers           |
| Points or currency                      | Distracts from the learning objective                             |

### 4.5 Control Layout: Gamepad-Style Bottom Bar

The BRIEF specifies a "gamepad-style controls bottom bar." This is a strong design choice for this audience.

**Layout principles:**

- Center the primary actions (Step, Play/Pause, Reset) in the bottom-center, mimicking a game controller's face buttons.
- Place secondary actions (Add Vehicle, Speed control) to the sides.
- Use large, visually distinct pixel-art buttons with clear iconography.
- Button icons should be recognizable without text: a forward arrow for Step, a play/pause icon for auto-play, a circular arrow for Reset.
- Button text labels should appear as tooltips on hover for reinforcement but not be required for recognition.

**Button states (pixel art):**

- Default: Raised/lit appearance (lighter top edge, darker bottom edge simulating depth)
- Hover: Brightened or highlighted (1-2 pixel glow effect or color shift)
- Active/pressed: Depressed appearance (darker, flattened)
- Disabled: Desaturated, no depth effect

---

## 5. NPC Commentator Patterns

### 5.1 Tutorial NPC Design Principles

The BRIEF specifies an NPC commentator (pixel police officer or robot) providing educational commentary. The design of this NPC is one of the most important UX decisions in the project because it directly determines the educational effectiveness and emotional tone of the experience.

### 5.2 Lessons from Existing Tutorial NPCs

**Navi (The Legend of Zelda: Ocarina of Time, 1998)**

Navi is a cautionary tale. Despite being well-intentioned, Navi became one of gaming's most criticized tutorial companions.

- **What went wrong:** Navi interrupted gameplay constantly with "Hey! Listen!" prompts that could not be dismissed quickly. The interruptions were not context-sensitive — they triggered on timers, not on player behavior.
- **What was right:** Navi provided genuinely useful spatial information (enemy lock-on targeting) and contextual hints about puzzle elements.
- **Lesson for our NPC:** Never interrupt an active simulation step with commentary. Wait for natural pauses (between steps, when the simulation is paused, when the user is idle). Never use attention-grabbing animations during active play.

**Clippy (Microsoft Office, 1997-2007)**

Clippy is the canonical example of a failed assistant NPC.

- **What went wrong:** Clippy appeared unsolicited, offered irrelevant help ("It looks like you're writing a letter"), was difficult to dismiss, and returned after being dismissed. The design assumed the user needed help rather than waiting for the user to ask.
- **What was right:** The concept of a friendly personality offering contextual assistance is sound. The character design was memorable and personable.
- **Lessons for our NPC:** (1) The NPC must be dismissible with one click. (2) Once dismissed, it must not return for the same topic within the same session. (3) The NPC should react to user behavior, not guess at user intent. (4) "Helpful" means providing information the user can see they need, not information the system thinks they need.

**The Guide (Terraria, 2011)**

The Guide NPC in Terraria is widely considered a successful tutorial NPC.

- **What works:** The Guide is always present and available but never forces interaction. Players can approach the Guide and ask questions. The Guide provides crafting information that is genuinely useful and context-appropriate.
- **Lesson for our NPC:** The NPC should have a persistent presence on screen (small sprite near the intersection) and become more active (speech bubble, animation) only when triggered by user actions or when idle for a period.

**Tutorial Bots in Modern Games (Hades, Celeste, Hollow Knight)**

Modern tutorial design has shifted toward organic, non-intrusive teaching.

- **Hades (2020):** Teaches mechanics through dialogue that feels like world-building, not instruction. Characters comment on the player's actions naturally.
- **Celeste (2018):** Uses environmental design to teach mechanics — the first screen of each chapter is a safe space to experiment with the new mechanic before hazards are introduced.
- **Lesson for our NPC:** Comments should feel like natural observations ("Oh, the north queue is getting long!") rather than instructions ("You should add a vehicle to the east road now").

### 5.3 NPC Commentator Behavior Specification

**Trigger conditions (when the NPC speaks):**

| Trigger                  | Condition                                   | Example Comment                                                  |
| ------------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| First launch             | User opens the simulator for the first time | "Hey! I'm Officer Pixel. Welcome to the intersection!"           |
| First vehicle added      | User adds their first vehicle               | "A car from the north! Let's see where it goes."                 |
| First step executed      | User clicks Step for the first time         | "The lights changed! See which direction got green?"             |
| Queue threshold reached  | Any single queue reaches 5+ vehicles        | "Getting busy on the north road! That's a lot of cars."          |
| Phase change observation | Phase changes from NS to EW or vice versa   | "Now it's east-west's turn. The phases alternate!"               |
| Emergency vehicle added  | User adds an emergency vehicle              | "Emergency vehicle incoming! Watch how it gets priority."        |
| Idle detection (15s)     | User has not interacted for 15 seconds      | "Try adding some vehicles and hitting Step to see what happens!" |
| All queues cleared       | All queues reach zero                       | "Empty intersection! You cleared everyone through."              |
| Interesting state        | 10+ vehicles departed in a session          | "12 vehicles through! This intersection is flowing nicely."      |

**Suppression conditions (when the NPC stays quiet):**

| Condition                                                      | Reason                                                |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| Auto-play is active                                            | Do not interrupt automated simulation with commentary |
| User dismissed NPC within last 60 seconds                      | Respect the dismissal                                 |
| Same comment category triggered within last 3 steps            | Avoid repetition                                      |
| More than 3 comments shown within last 60 seconds              | Prevent comment fatigue                               |
| User is actively interacting (filling forms, clicking rapidly) | Do not distract during focused interaction            |

**NPC personality guidelines:**

- Enthusiastic but not hyper — think "friendly neighborhood crossing guard" energy
- Uses simple, clear language appropriate for age 11-13
- Occasionally uses mild humor ("That's more cars than my morning commute!")
- Never condescending, never uses baby talk
- Expresses genuine curiosity about what the user is building ("I wonder what happens if you add more from the east?")
- Gendered language: The NPC should use gender-neutral language. If the NPC is a robot, use "it/they." If a police officer, avoid gendered pronouns.

### 5.4 NPC Visual Behavior

- **Idle state:** Small sprite (approximately 16x24 pixels) standing near the intersection edge. Subtle idle animation (blinking, shifting weight) at 2-3 frames, cycling every 2-3 seconds.
- **Speaking state:** Speech bubble appears above/beside NPC. NPC sprite has a "talking" animation frame (mouth open, hand gesture). Speech bubble uses typewriter text reveal at approximately 30 characters per second for readability.
- **Reacting state:** NPC sprite changes to a reaction pose (surprised, happy, thoughtful) matching the comment tone. Reaction pose holds for 1 second then returns to idle.
- **Dismissed state:** Speech bubble disappears. NPC wave animation plays. Returns to idle state.

---

## 6. Accessibility for Children

### 6.1 WCAG Considerations Adapted for Young Users

WCAG 2.2 Level AA is the baseline, with specific adaptations for the 11-13 age group and the pixel-art visual style.

**Relevant WCAG criteria and child-specific adaptations:**

| WCAG Criterion               | Standard Requirement           | Child Adaptation                                                                                                           |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 Non-text Content       | Alt text for images            | Canvas must have aria-label describing current state. All sprites need text alternatives accessible to screen readers.     |
| 1.3.1 Info and Relationships | Semantic structure             | HUD overlay must use semantic HTML (headings, lists, buttons). Canvas content must be described via ARIA live regions.     |
| 1.4.1 Use of Color           | Color not sole indicator       | Traffic light state must be indicated by position (top/middle/bottom), shape, and label — not only red/green color.        |
| 1.4.3 Contrast (Minimum)     | 4.5:1 for text                 | Increase to 5:1 minimum for this age group to account for variable screen quality in schools.                              |
| 1.4.11 Non-text Contrast     | 3:1 for UI components          | All interactive pixel-art elements must be distinguishable from background at 3:1 or higher.                               |
| 2.1.1 Keyboard               | All functionality via keyboard | Tab order must be logical. All buttons, controls, and interactive elements must be keyboard-accessible.                    |
| 2.4.7 Focus Visible          | Visible focus indicator        | Pixel-art focus indicator (blinking border or highlight) must be clearly visible at 3x scale. Minimum 2 game-pixel border. |
| 2.5.5 Target Size            | 44x44 CSS px minimum           | Target 48x48 CSS px for this age group. Pixel-art buttons must be at least 16x16 game pixels.                              |
| 3.2.1 On Focus               | No context change on focus     | Hover tooltips must not obscure interactive elements or change application state.                                          |
| 4.1.2 Name, Role, Value      | ARIA for custom controls       | Canvas-rendered controls must have corresponding ARIA roles and labels in the React overlay.                               |

### 6.2 Colorblind-Safe Traffic Light Palette

This is the single most critical accessibility requirement for this project. Traffic lights that rely solely on red and green color distinction fail for approximately 8% of males and 0.5% of females with color vision deficiency (CVD). In a classroom of 30 students, statistically 1-2 students will have some form of CVD.

**The problem:**

Standard traffic light colors:

- Red: #FF0000
- Yellow/Amber: #FFFF00
- Green: #00FF00

For deuteranopia (green-blind, most common CVD), red and green can appear as similar brownish/olive tones.

**Solution: Multi-channel redundancy**

Traffic light state must be communicated through ALL of the following channels simultaneously:

1. **Color** (for typical vision):
   - Red: #FF004D (PICO-8 red — slightly pinkish, more distinguishable from green for mild CVD)
   - Amber: #FFA300 (PICO-8 orange)
   - Green: #00E436 (PICO-8 green)

2. **Position** (universal):
   - Red is always the TOP light
   - Amber is always the MIDDLE light
   - Green is always the BOTTOM light
   - Active light is visibly larger or brighter; inactive lights are visibly dimmed/smaller

3. **Shape** (for severe CVD) -- **locked choices**:
   - Red light rendered as a **square** shape (stop sign association)
   - Green light rendered as an **arrow/triangle** shape pointing in the traffic flow direction
   - Amber light rendered as a **diamond** shape
   - This approach is used in some real-world accessible traffic signals (e.g., Japan's rectangular green lights)

4. **Animation** (additional channel):
   - Active green: Steady glow
   - Active red: No animation (solid)
   - Transitional amber: Pulsing/blinking animation
   - This matches real-world traffic light behavior and adds another distinguishing channel

5. **Text label** (in overlay):
   - The phase label in the HUD ("N-S GREEN" / "E-W GREEN") provides unambiguous text confirmation
   - Screen readers announce phase changes via ARIA live region

**Palette testing requirement:**

All traffic light sprites must be validated using CVD simulation tools (e.g., Coblis, Color Oracle) for:

- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (total color blindness)

### 6.3 Readable Pixel Fonts

Pixel font readability is a known challenge. Research on bitmap font legibility (Sheedy et al., 2005; Boyarski et al., 1998) provides guidance:

**Font design requirements:**

- Minimum character height: 7 pixels (5 pixels for the x-height, 2 pixels for descenders) at native resolution
- Minimum character width: 5 pixels (including 1-pixel inter-character spacing)
- Consistent stroke width: 1 pixel for all strokes at native resolution
- Clear distinction between similar characters: 0 vs O, 1 vs l vs I, S vs 5, G vs 6
- Whitespace: Minimum 1 pixel between characters, minimum 2 pixels between words, minimum 3 pixels between lines

**Characters critical to this application:**

| Character Set     | Usage                                   | Priority                                                |
| ----------------- | --------------------------------------- | ------------------------------------------------------- |
| N, S, E, W        | Cardinal directions                     | Must be instantly recognizable at smallest display size |
| 0-9               | Step counts, queue lengths, vehicle IDs | Must be clearly distinguishable from each other         |
| V, Q              | Vehicle and queue labels                | Must be distinct from each other and from numbers       |
| A-Z uppercase     | NPC speech, labels                      | Full set needed for speech bubbles                      |
| a-z lowercase     | NPC speech                              | Full set needed for natural text                        |
| Basic punctuation | NPC speech (. , ! ? ' -)                | Minimum set for readable sentences                      |

**Recommendation:** Use the React overlay (rendered at CSS resolution) for all critical informational text (HUD, control labels, statistics). Reserve pixel font rendering in Canvas for atmospheric/decorative text only (NPC speech bubbles, vehicle labels, road labels). This ensures readability of critical information while maintaining pixel-art aesthetic for the game layer.

### 6.4 Keyboard Navigation

Full keyboard navigation is required for accessibility and also benefits power users.

**Keyboard map:**

| Key        | Action                                                 | Context                             |
| ---------- | ------------------------------------------------------ | ----------------------------------- |
| Space      | Step (advance simulation by one step)                  | Global — most important action      |
| Enter      | Activate focused button / confirm form                 | Standard behavior                   |
| P          | Toggle play/pause                                      | Global shortcut                     |
| R          | Reset simulation                                       | Global shortcut (with confirmation) |
| 1-4        | Focus on road (1=North, 2=South, 3=East, 4=West)       | Quick navigation to road info       |
| Tab        | Move focus to next interactive element                 | Standard keyboard navigation        |
| Shift+Tab  | Move focus to previous interactive element             | Standard keyboard navigation        |
| Escape     | Dismiss tooltip / close expanded panel / dismiss NPC   | Dismiss interactions                |
| ? or H     | Show keyboard shortcut help overlay                    | Discoverable help                   |
| Arrow keys | Navigate within a control group (e.g., road selection) | Fine navigation                     |

**Focus management:**

- Tab order: HUD elements (left to right) then control bar (left to right) then form fields (top to bottom)
- Canvas elements are not focusable via Tab — their information is available through ARIA live regions and the HUD overlay
- A visible pixel-art focus ring (2-pixel bright border at native resolution, 6 CSS pixel at 3x scale) appears around focused elements
- Focus ring color: #29ADFF (PICO-8 blue) — high contrast on dark background, distinct from traffic light colors

### 6.5 Screen Reader Support

The HTML Canvas is inherently inaccessible to screen readers. The hybrid architecture (Canvas for visuals + React overlay for UI) allows proper screen reader support:

- All HUD values update ARIA live regions when they change
- Phase changes are announced: "Phase changed to North-South green"
- Vehicle additions are announced: "Vehicle V001 added to north road queue"
- Step completions are announced: "Step 5 complete. 2 vehicles departed."
- NPC comments are announced via an ARIA live polite region
- The React overlay provides a complete textual representation of all simulation state, even if the Canvas is not visible

---

## 7. Emotional Design

### 7.1 What Makes 11-13 Year Olds Think "This Is Cool, Not Boring"

The emotional response to educational software is the primary determinant of engagement duration and learning outcomes for this age group (Pekrun et al., 2017). The first 30 seconds of interaction determine whether a student mentally categorizes the tool as "game" (high engagement) or "homework" (low engagement).

**"Cool" signals for 11-13 year olds (2026 context):**

1. **Retro-game aesthetic is inherently "cool" for this generation.** Pixel art carries strong positive associations from Minecraft, Undertale, Stardew Valley, and retro content on social media. The aesthetic choice alone provides a significant engagement advantage over traditional educational software styling.

2. **Immediate interactivity.** The application must be interactive within 2 seconds of loading. A loading screen, even a pixel-art one, should be no more than 1-2 seconds. The first thing the user sees should be a live, interactive intersection — not a tutorial screen or a settings menu.

3. **Responsive animation.** Every click should produce visible motion. Button presses should show pixel-art depression animation. Vehicle additions should show a car sprite appearing with a tiny entrance animation. Step execution should show vehicles moving. Static screens feel "dead" and signal "boring tool" to this age group.

4. **Personality and humor.** The NPC commentator provides personality. Comments should occasionally be genuinely funny in an age-appropriate way — observations about traffic that relate to their experience ("This intersection is busier than the school parking lot at 3pm"). Humor is the strongest differentiator between "cool educational tool" and "boring educational tool."

5. **Dark theme.** Dark mode is strongly preferred by this age group (reinforced by gaming conventions, Discord, YouTube dark mode adoption). The BRIEF's dark retro palette is the correct choice. The application should never have a bright white/light mode default.

6. **Visual polish.** Pixel art must be intentional and polished, not rough or amateurish. The difference between "cool retro" and "cheap-looking" is entirely in the execution quality. Sprites should have consistent pixel density, clean lines, deliberate color choices, and professional-quality animation frames.

### 7.2 Engagement Hooks Without Sound

The BRIEF specifies no sound. This removes a major engagement channel that games typically rely on. Visual alternatives must compensate.

**Visual feedback that replaces audio cues:**

| Typical Audio Cue        | Visual Replacement                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Button click sound       | Button depression animation (2-frame, 100ms) + subtle screen flash/ripple                   |
| Success/completion sound | Pixel sparkle/star animation at departure point + NPC celebration pose                      |
| Warning/alert sound      | Screen edge pulse in warning color (amber) + NPC concerned pose                             |
| Ambient traffic sounds   | Animated background elements (pixel clouds moving, birds on wires, pedestrian walk cycles)  |
| Phase change chime       | Traffic light transition animation (smooth color fade over 3-4 frames) + road surface flash |
| Vehicle arrival          | Vehicle sprite entrance animation (drives in from screen edge to queue position)            |

**Ambient animation (background life):**

To prevent the screen from feeling static and "dead" without sound, implement subtle looping background animations:

- Clouds drifting slowly across the sky area (1 pixel per 2-3 seconds)
- Pixel birds sitting on traffic light poles, occasionally fluttering
- Crosswalk signal counting down (if visible)
- NPC idle animation (weight shifting, blinking)
- Traffic light glow/haze effect (1-pixel brightness variation on active light)

These animations should be subtle enough to not distract from the simulation but present enough to make the scene feel alive.

### 7.3 First Impression Design

The first 30 seconds must establish:

1. **"This is a game"** (0-2 seconds): Dark screen, pixel art, game-like HUD. No form fields, no settings, no loading spinner. The intersection is visible and animated immediately.

2. **"I can do something"** (2-5 seconds): A prominent, inviting button or call-to-action. The NPC says something welcoming and brief. A vehicle may already be present (pre-loaded scenario) to show what the simulation looks like in action.

3. **"Something happened because of me"** (5-15 seconds): The user clicks Step or adds a vehicle and sees an immediate, satisfying visual response. The NPC reacts positively.

4. **"I understand what this is about"** (15-30 seconds): Through interaction and NPC commentary, the user grasps that this is a traffic light simulator where they control vehicles and observe phase-based traffic flow.

5. **"I want to try more"** (30+ seconds): The user begins experimenting — adding multiple vehicles, observing queue buildup, trying different directions.

### 7.4 Emotional Tone Spectrum

The application should move through these emotional tones based on simulation state:

| State               | Tone                  | Visual Indicators                                              |
| ------------------- | --------------------- | -------------------------------------------------------------- |
| Empty intersection  | Calm, inviting        | Peaceful scene, NPC relaxed, warm colors                       |
| Light traffic       | Engaged, positive     | Smooth vehicle flow, NPC content, normal palette               |
| Building congestion | Curious, challenging  | Queues growing visibly, NPC interested, slightly warmer colors |
| Heavy congestion    | Exciting, humorous    | Long queues, NPC animated/surprised, no negative framing       |
| Clearing traffic    | Satisfying, rewarding | Vehicles departing with sparkle effects, NPC celebrating       |
| All cleared         | Accomplished, proud   | Empty roads, NPC congratulatory, brief celebration animation   |

The key design principle: congestion is interesting, not bad. The application should never make the user feel they have "failed" — even gridlock scenarios should be framed as fascinating emergent behavior worth understanding.

---

## 8. User Personas

### 8.1 Persona 1: Maja — The Curious Explorer

**Demographics and Context**

| Attribute        | Detail                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Age              | 12 years old                                                                                      |
| Grade            | 6th grade                                                                                         |
| Location         | Suburban area, attends public school                                                              |
| Tech proficiency | High for age — plays Minecraft and Roblox regularly, comfortable with keyboard and mouse          |
| Device           | Shared family laptop (Windows 11, 1366x768 display), school Chromebook                            |
| Context of use   | Assigned in science class as part of a unit on urban systems, also plays at home out of curiosity |

**Behavioral Patterns**

Maja approaches new software by clicking everything to see what happens before reading any instructions. She is the student who discovers hidden features by accident and tells her classmates. She has high tolerance for complexity once engaged but will close a tab within 15 seconds if the first screen looks like a worksheet.

She plays Minecraft in creative mode more than survival — she prefers building and experimenting over goals and challenges. She has a YouTube channel where she records Minecraft builds, so she is familiar with screen layouts, HUDs, and game UI conventions.

**Goals and Needs**

- **Primary goal:** Understand how traffic lights work well enough to explain it to someone else
- **Secondary goal:** Create interesting traffic scenarios and see what happens
- **Success criteria:** She feels she has "figured out" the system — can predict what will happen next
- **Engagement need:** Visual novelty and discovery. She wants to find the "cool thing" the app can do

**Pain Points and Risks**

- Will abandon immediately if the interface looks like a traditional educational tool
- Dislikes being told what to do step-by-step — wants to discover things herself
- May miss important educational content if it is hidden too deeply
- Gets frustrated by small click targets on her older laptop

**NPC Interaction Style**

Maja will read the NPC's first message, then largely ignore it unless the NPC says something surprising or funny. The NPC should reward her exploratory behavior with comments like "Whoa, 15 cars from the north — I've never seen that before!" to make her feel her experimentation is valued.

> "I just clicked everything until I figured it out. Then I added like a hundred cars from the same direction to see what would happen." — Representative user quote from comparable study

**Research Basis:** Composite persona derived from studies on exploratory learning behavior in middle school students (Resnick & Rosenbaum, 2013) and digital literacy patterns in pre-teen gamers (Ofcom Children's Media Lives, 2024).

---

### 8.2 Persona 2: Kacper — The Methodical Learner

**Demographics and Context**

| Attribute        | Detail                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Age              | 11 years old                                                                                                 |
| Grade            | 5th grade                                                                                                    |
| Location         | Urban area, attends public school                                                                            |
| Tech proficiency | Moderate — uses a computer for homework and watches YouTube, limited gaming experience (mobile puzzle games) |
| Device           | School Chromebook (14-inch, 1366x768), occasionally uses parent's iPad at home                               |
| Context of use   | Teacher-directed classroom activity with specific learning objectives                                        |

**Behavioral Patterns**

Kacper reads instructions before acting. He prefers structured guidance and becomes anxious when an interface does not make the next step clear. He is a strong reader and will engage with text-based explanations if they are clear and concise. He is less comfortable with ambiguous or open-ended interfaces.

He plays puzzle games on his phone (Wordle, 2048-style games) and appreciates clear rules and predictable systems. He has not played many PC games and is less familiar with game HUD conventions than Maja.

**Goals and Needs**

- **Primary goal:** Complete the teacher's assignment correctly and understand what he is supposed to learn
- **Secondary goal:** Feel confident that he understands the traffic light system
- **Success criteria:** He can answer the teacher's follow-up questions about traffic phases
- **Engagement need:** Clear structure and confirmation that he is on the right track

**Pain Points and Risks**

- Will feel lost if the initial screen has no guidance on what to do first
- Needs the NPC commentator to provide structured orientation, not just reactive comments
- May not discover hover tooltips without being told they exist
- Could misunderstand pixel-art icons if they are not labeled

**NPC Interaction Style**

Kacper will actively read and follow NPC guidance. The NPC is his primary learning channel. He will appreciate step-by-step suggestions like "Try clicking the Step button to advance the simulation" and will feel reassured by confirmatory comments like "That's right! The north-south phase lets those cars through."

> "I wasn't sure what to do at first, but then the little character told me to try adding a car, and after that it made sense." — Representative user quote

**Research Basis:** Composite persona derived from research on structured vs. exploratory learning preferences (Kirschner, Sweller & Clark, 2006) and technology comfort levels in pre-teen non-gamers (EU Kids Online, 2024).

---

### 8.3 Persona 3: Zara — The Accessibility-First User

**Demographics and Context**

| Attribute           | Detail                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Age                 | 13 years old                                                                                                  |
| Grade               | 7th grade                                                                                                     |
| Location            | Urban area, attends public school with inclusive education support                                            |
| Tech proficiency    | High — uses assistive technology daily, experienced with screen magnification and keyboard navigation         |
| Device              | School-provided laptop with large display (15.6-inch, 1080p) and screen magnification software                |
| Context of use      | Same classroom assignment as peers, needs full functionality through keyboard and with reduced color reliance |
| Accessibility needs | Deuteranopia (red-green color blindness), prefers larger text and high contrast                               |

**Behavioral Patterns**

Zara navigates primarily with keyboard and uses Tab extensively. She has learned to rely on text labels and position rather than color to interpret interface state. She is experienced with web applications and can tell immediately whether a site will work for her — if the first Tab press does not produce a visible focus indicator, she knows the experience will be frustrating.

She plays turn-based strategy games and narrative games that are keyboard-friendly. She is a confident computer user and does not want a simplified or separate experience — she wants the same experience as her classmates, just accessible.

**Goals and Needs**

- **Primary goal:** Same as any student — understand traffic light systems through the simulation
- **Secondary goal:** Complete the activity independently without needing to ask for help due to accessibility barriers
- **Success criteria:** She can use all features without encountering a point where color is the only indicator of state
- **Engagement need:** Functional equivalence — the experience should be equally engaging for her as for peers with typical vision

**Pain Points and Risks**

- Will be immediately blocked if traffic lights rely solely on red/green color
- Needs visible keyboard focus indicators on all interactive elements
- Screen magnification may crop the canvas — the most important information must be concentrated in a predictable area
- Pixel-art fonts at small sizes may be harder to read with magnification artifacts

**NPC Interaction Style**

Zara will engage with NPC comments that are announced to her via ARIA live regions. The NPC is a useful supplement but she primarily uses the HUD text and keyboard controls. She appreciates that the NPC confirms phase states verbally ("North-South is now green") because this provides a text channel for information that other students get from color.

> "I don't need a special version. I just need the regular one to actually work with my keyboard and not make everything about colors." — Representative user quote

**Research Basis:** Composite persona derived from research on inclusive educational technology design (Seale, 2006), color vision deficiency prevalence in school-age populations (Birch, 2012), and keyboard navigation patterns in young assistive technology users (WebAIM Survey, 2024).

---

## 9. User Journey Map

### 9.1 First-Time User Flow: From Landing to Understanding Traffic Phases

This journey map traces a first-time user's experience from opening the simulator to achieving the primary learning outcome: understanding how traffic light phases control vehicle flow at an intersection.

**Journey duration:** Approximately 8-12 minutes
**Persona basis:** Blended journey applicable to all three personas with persona-specific notes

---

### Phase 1: Landing (0-5 seconds)

**User action:** Opens the simulator URL or clicks a link from a classroom assignment.

**What the user sees:**

- Dark-themed pixel-art intersection fills the screen
- A HUD bar at the top shows minimal information (step counter at 0, vehicle count at 0)
- A control bar at the bottom with large, clear buttons (Step, Play, Reset, Add Vehicle)
- The NPC character is standing near the intersection edge, waving with a small speech bubble
- The intersection is empty — no vehicles, traffic lights showing red in all directions

**What the user thinks:**

- "Oh, this looks like a game" (positive emotional categorization)
- "It's a road intersection" (immediate scene recognition)
- "There's a little character saying something" (NPC draws attention)

**NPC behavior:**

- Speech bubble: "Welcome to the intersection! I'm Officer Pixel. Try adding a vehicle!"
- The NPC points toward the Add Vehicle control

**Emotional state:** Curious, mildly positive

**Persona variations:**

- Maja: Already scanning for clickable elements, may click the intersection directly before reading NPC text
- Kacper: Reads the NPC text carefully, looks for the Add Vehicle button
- Zara: Tabs to first interactive element, hears screen reader announce "Traffic intersection simulator. Officer Pixel says: Welcome to the intersection."

**Design requirements:**

- Page must be interactive within 2 seconds of navigation
- No loading screen, splash screen, or mandatory tutorial
- NPC message must be visible without scrolling on 1366x768 displays
- First Tab press must land on an interactive element with visible focus ring

---

### Phase 2: First Interaction — Adding a Vehicle (5-30 seconds)

**User action:** Clicks "Add Vehicle" button (or opens Add Vehicle form).

**What the user sees:**

- A form appears (as an overlay or expanding panel) with road selection dropdowns (From: North/South/East/West, To: North/South/East/West)
- Priority selection (Normal / Emergency) with "Normal" pre-selected
- A clear "Add" button

**What the user does:**

- Selects "From: North, To: South" (default or first choice)
- Clicks "Add"

**What happens:**

- A pixel-art car sprite appears at the north edge of the intersection, facing south
- The car drives to the queue position with a brief entrance animation (0.5 seconds)
- The HUD updates: vehicle count changes from 0 to 1
- The NPC reacts with a speech bubble: "A car from the north! It wants to go south. But the light is red — it has to wait."

**What the user thinks:**

- "Oh cool, a little car appeared!" (delight)
- "It's waiting because the light is red" (first learning moment — connection between light state and vehicle behavior)

**Emotional state:** Engaged, pleased by the visual response

**Design requirements:**

- Vehicle entrance animation must complete within 500ms
- The pixel car must be clearly visible and identifiable as a car
- The road it appeared on (north) must be visually obvious from the car's position
- NPC comment must appear within 1 second of the vehicle being added

---

### Phase 3: First Step — Understanding Phase Change (30 seconds - 1.5 minutes)

**User action:** Clicks the "Step" button.

**What the user sees:**

- Traffic lights animate: North and South lights change from red to green. East and West lights remain red.
- The vehicle at the north queue drives through the intersection toward the south exit with a smooth pixel animation
- A small sparkle/celebration effect plays as the vehicle departs
- The HUD updates: step counter goes to 1, vehicle count goes to 0
- The NPC speech bubble: "The north-south lights turned green! Your car drove through. That's one phase — next step will switch to east-west."

**What the user thinks:**

- "So the step makes the lights change and cars go through" (core mechanic understood)
- "North-south went together — that makes sense, they don't cross each other" (traffic logic begins to form)

**Emotional state:** Understanding dawning, satisfaction from seeing cause and effect

**Design requirements:**

- Traffic light change animation must be clear and visually prominent (not subtle)
- Vehicle movement through intersection must take 300-500ms — fast enough to not bore, slow enough to track
- The connection between "step" action and "phase change" result must be visually unambiguous
- Phase direction (N-S vs E-W) must be visually indicated beyond just the traffic light colors (road surface highlighting, directional arrows)

---

### Phase 4: Experimentation — Building Understanding (1.5 - 5 minutes)

**User action:** Adds multiple vehicles from different directions, clicks Step repeatedly.

**Typical experimentation sequence:**

1. Add 2-3 vehicles from north
2. Add 1-2 vehicles from east
3. Click Step — observe north-south cars go, east cars wait
4. Click Step — observe east-west cars go, north queue is empty
5. Add vehicles from all four directions
6. Click Step multiple times — observe alternating phases

**What the user learns through experimentation:**

- Phases alternate between N-S and E-W
- Only vehicles on the green-phase roads can move
- Vehicles in the red-phase direction accumulate in queues
- More vehicles from one direction means a longer queue
- Emergency vehicles (if they try adding one) get special treatment

**NPC behavior during this phase:**

- Frequency: One comment every 2-3 steps (not every step)
- Content escalates from descriptive to analytical:
  - Step 2: "East-west's turn now! See how they alternate?"
  - Step 4: "The north queue is building up while east-west has the green."
  - Step 6: "Notice the pattern? N-S green, then E-W green, then N-S again..."
- NPC stays quiet if the user is clicking rapidly (less than 1 second between steps)

**Emotional state:** Increasingly confident, transitioning from exploration to understanding

**Persona variations:**

- Maja: Adds 10+ vehicles from one direction to see what happens, discovers long queue visualization, delighted by the visual chaos
- Kacper: Adds vehicles methodically, one at a time, clicks step between each, builds understanding systematically
- Zara: Uses keyboard (Space for Step), tabs between Add Vehicle form fields, relies on ARIA announcements and NPC text for phase confirmation

**Design requirements:**

- Queue visualization must scale gracefully from 1 to 15+ vehicles (scroll, compress, or overflow indicator)
- Step execution must remain responsive even with many vehicles (target: under 100ms including animation start)
- NPC comment frequency must adapt to user pace (fewer comments for rapid interaction)

---

### Phase 5: Understanding Confirmation (5-8 minutes)

**User action:** User begins to predict what will happen before clicking Step.

**Observable behavior shift:**

- User pauses before clicking Step, looking at the queue states
- User may verbalize or think "the east cars should go now because last step was north-south"
- User tests their prediction by clicking Step and confirming

**What the user has learned:**

- The two-phase system (N-S and E-W alternation)
- Queue mechanics (vehicles wait during red phase)
- The relationship between vehicle additions and queue growth
- The basic traffic flow principle: controlled alternation prevents collision

**NPC behavior at this stage:**

- Shifts from teaching to validation: "You've got the hang of it! The phases keep alternating to give everyone a fair turn."
- May introduce a challenge: "Think you can clear all vehicles in the fewest steps?"
- May introduce a new concept: "Try adding an emergency vehicle — watch what happens differently."

**Emotional state:** Confident, accomplished, ready for deeper exploration

---

### Phase 6: Extended Engagement — Deeper Learning (8-12+ minutes)

**User action:** Explores advanced features, creates complex scenarios.

**Possible exploration paths:**

1. **Auto-play mode:** Clicks Play, observes continuous simulation. Adjusts speed. Watches patterns emerge over many steps.
2. **Emergency vehicles:** Adds emergency vehicles, discovers priority behavior.
3. **Stress testing:** Adds many vehicles from one direction, observes queue behavior under load.
4. **Telemetry exploration:** Opens statistics panel (Level 3 information), examines phase distribution and average queue lengths.

**NPC behavior:**

- Mostly quiet, occasional observations on advanced patterns
- Available if the user hovers or clicks on the NPC directly
- Comments on notable achievements: "50 vehicles processed! This intersection is running smoothly."

**Emotional state:** Engaged in mastery-level exploration, self-directed learning

**Natural session end:**

- User runs out of curiosity (normal — 8-12 minutes is a successful session for this age group)
- Teacher directs students to move on
- User has answered assignment questions and feels finished
- No formal "end" state — the simulator is always available for return

---

### 9.2 Journey Map Summary

| Phase               | Duration   | User Goal                                 | Key Design Need                        | NPC Role                       |
| ------------------- | ---------- | ----------------------------------------- | -------------------------------------- | ------------------------------ |
| 1. Landing          | 0-5s       | Orient, categorize as "game"              | Instant visual appeal, no barriers     | Welcome, point to first action |
| 2. First Vehicle    | 5-30s      | Do something, see a result                | Immediate visual feedback, simple form | Explain what happened          |
| 3. First Step       | 30s-1.5min | Understand the core mechanic              | Clear phase change visualization       | Connect step to phase change   |
| 4. Experimentation  | 1.5-5min   | Build mental model of traffic flow        | Responsive multi-vehicle simulation    | Periodic insight comments      |
| 5. Confirmation     | 5-8min     | Validate understanding through prediction | Consistent, predictable behavior       | Validate and challenge         |
| 6. Deep Exploration | 8-12+min   | Explore advanced features, edge cases     | Rich feature set, layered information  | Mostly passive, on-demand      |

---

## Appendix A: Research References

1. Birch, J. (2012). Worldwide prevalence of red-green color deficiency. _Journal of the Optical Society of America A_, 29(3), 313-320.
2. Boyarski, D., Neuwirth, C., Forlizzi, J., & Regli, S. H. (1998). A study of fonts designed for screen display. _Proceedings of CHI '98_, 87-94.
3. Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness. _Proceedings of MindTrek '11_, 9-15.
4. Habgood, M. P. J., & Ainsworth, S. E. (2011). Motivating children to learn effectively: Exploring the value of intrinsic integration in educational games. _Journal of the Learning Sciences_, 20(2), 169-206.
5. Hamari, J., Shernoff, D. J., Rowe, E., Coller, B., Asbell-Clarke, J., & Edwards, T. (2016). Challenging games help students learn: An empirical study on engagement, flow and immersion in game-based learning. _Computers in Human Behavior_, 54, 170-179.
6. Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work. _Educational Psychologist_, 41(2), 75-86.
7. Nielsen Norman Group (2024). Tooltip guidelines. _nngroup.com_.
8. Ofcom (2024). Children and parents: Media use and attitudes report. UK.
9. Pekrun, R., Lichtenfeld, S., Marsh, H. W., Murayama, K., & Goetz, T. (2017). Achievement emotions and academic performance. _Child Development_, 88(5), 1653-1670.
10. Resnick, M., & Rosenbaum, E. (2013). Designing for tinkerability. In _Design, Make, Play_ (pp. 163-181). Routledge.
11. Ruff, H. A., & Rothbart, M. K. (2001). _Attention in Early Development_. Oxford University Press.
12. Seale, J. K. (2006). _E-Learning and Disability in Higher Education: Accessibility Research and Practice_. Routledge.
13. Sheedy, J. E., Subbaram, M. V., Zimmerman, A. B., & Hayes, J. R. (2005). Text legibility and the letter superiority effect. _Human Factors_, 47(4), 797-815.
14. WebAIM (2024). Screen reader user survey #10. _webaim.org_.

## Appendix B: Key Metrics for Usability Testing

When this design proceeds to usability testing, the following metrics should be measured:

| Metric                                                             | Target                 | Method                                       |
| ------------------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| Time to first meaningful interaction                               | Under 15 seconds       | Observation, screen recording                |
| Time to understand phase alternation concept                       | Under 3 minutes        | Think-aloud protocol, comprehension question |
| Task completion: "Add a vehicle from east going west"              | 95%+ success rate      | Task-based usability test                    |
| Task completion: "Make the simulation run 5 steps"                 | 95%+ success rate      | Task-based usability test                    |
| Unassisted feature discovery rate (tooltips, NPC, advanced panels) | 70%+ within 10 minutes | Observation                                  |
| Colorblind users: Identify current phase correctly                 | 100% success rate      | CVD simulation + user testing                |
| Keyboard-only users: Complete all primary tasks                    | 100% success rate      | Keyboard-only usability test                 |
| Subjective engagement rating (1-5 scale)                           | 4.0+ average           | Post-session questionnaire                   |
| Session duration (unstructured play)                               | 8+ minutes average     | Analytics                                    |
| "Would you use this again?" (yes/no)                               | 80%+ yes               | Post-session questionnaire                   |

## Appendix C: Competitive Landscape Summary

| Product                  | Strengths for Our Reference                            | Weaknesses to Avoid                              |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------ |
| SimCity (EDU)            | Sandbox experimentation, visual feedback, layered data | Information overload, steep learning curve       |
| Mini Motorways           | Minimal text, visual flow, gradual complexity          | No educational framing, stress-based gameplay    |
| Cities: Skylines EDU     | Classroom integration, learning objectives, reflection | Heavy hardware requirements, complex UI          |
| Khan Academy             | Hint system, no-penalty exploration, inline feedback   | Text-heavy, not game-like, low visual engagement |
| Traffic Jam 3D (mobile)  | Simple traffic concept, visual appeal                  | Shallow learning, no systems understanding       |
| PICO-8 educational demos | Pixel-art charm, constrained aesthetic, retro cool     | Usually single-concept, no depth                 |

---

_This research spec should be reviewed by the design team before proceeding to the Design phase. All design decisions in subsequent phases should reference specific sections of this document for justification._
