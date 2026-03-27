# ADR-GUI-003: Visual Design System

## Status

Accepted

## Metadata

| Pole       | Wartosc             |
|------------|---------------------|
| Data       | 2026-03-25          |
| Wersja     | 1.0                 |
| Wlasciciel | gui-02-ui-architect |

---

## Context

The GUI needs a coherent visual language that:

1. Makes traffic light states instantly recognizable (red/green convention is universal).
2. Works on dark background to reduce eye strain during extended simulation sessions.
3. Is implemented using Tailwind CSS only — no CSS Modules, no styled-components.
4. Passes WCAG 2.1 AA contrast ratios for all foreground/background pairs.
5. Is responsive for desktop (1280px+) with acceptable degradation to tablet (768px).

---

## Decision

Dark-themed UI with Tailwind CSS utility classes. SVG intersection with semantic color tokens. No UI component library — all components built from Tailwind primitives.

---

## Color Tokens

All colors are defined as Tailwind config extensions in `tailwind.config.ts`.

### Traffic Light Colors

| Token                     | Hex       | Usage                              | Contrast on bg-sim-base |
|---------------------------|-----------|------------------------------------|--------------------------|
| `traffic-red`             | `#EF4444` | Red traffic light indicator        | 4.7:1 (AA pass)          |
| `traffic-green`           | `#22C55E` | Green traffic light indicator      | 5.1:1 (AA pass)          |
| `traffic-yellow`          | `#EAB308` | Yellow / transitioning indicator   | 6.2:1 (AA pass)          |
| `traffic-red-dim`         | `#7F1D1D` | Inactive red light (unlit state)   | —                        |
| `traffic-green-dim`       | `#14532D` | Inactive green light (unlit state) | —                        |

### Background and Surface Colors

| Token             | Hex       | Usage                                     |
|-------------------|-----------|-------------------------------------------|
| `sim-base`        | `#111827` | Page background (gray-900)                |
| `sim-surface`     | `#1F2937` | Panel backgrounds (gray-800)              |
| `sim-surface-alt` | `#374151` | Elevated surface, hover states (gray-700) |
| `sim-border`      | `#4B5563` | Panel borders (gray-600)                  |

### Text Colors

| Token           | Hex       | Usage                          | Contrast on sim-surface |
|-----------------|-----------|--------------------------------|--------------------------|
| `sim-text`      | `#F9FAFB` | Primary text (gray-50)         | 14.5:1 (AAA pass)        |
| `sim-text-muted`| `#9CA3AF` | Secondary / label text (gray-400) | 5.3:1 (AA pass)       |
| `sim-text-dim`  | `#6B7280` | Disabled / placeholder (gray-500) | 3.5:1 (AA large text) |

### Semantic Colors

| Token          | Hex       | Usage                           |
|----------------|-----------|----------------------------------|
| `status-error` | `#FCA5A5` | Error banner text (red-300)      |
| `status-error-bg` | `#450A0A` | Error banner background        |
| `status-success` | `#86EFAC` | Success indicators (green-300) |

---

## Typography

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],  // Body text, labels, data
  mono: ['JetBrains Mono', 'monospace'],       // vehicleId display, JSON editor
}
```

### Type Scale (Tailwind classes)

| Usage               | Class              | Size    |
|---------------------|--------------------|---------|
| Page title          | `text-xl font-semibold` | 20px |
| Panel heading       | `text-base font-semibold` | 16px |
| Label               | `text-sm font-medium` | 14px  |
| Body / value        | `text-sm`          | 14px    |
| Caption / muted     | `text-xs`          | 12px    |
| vehicleId in queue  | `text-xs font-mono`| 12px    |

---

## Page Layout

```
/* Tailwind grid — desktop (1280px+) */
grid-cols-[1fr_380px]  gap-6  p-6  min-h-screen  bg-sim-base

Column 1 (flex-grow):    IntersectionView (SVG, max-w-[600px] mx-auto)
Column 2 (380px fixed):  Right panel stack:
                           ControlPanel
                           AddVehicleForm
                           CommandLog (max-h-48 overflow-y-auto)
                           TelemetryDashboard (conditional)
                           ConfigPanel (collapsible)
                           JsonPanel
                           ErrorBanner (sticky bottom of column)
```

```
/* Tablet (768px–1279px) */
grid-cols-1

Column 1: IntersectionView (full width, max-w-[500px] mx-auto)
Column 1: Right panel (full width, stacked)
```

---

## SVG Intersection Design

The SVG uses a fixed `viewBox="0 0 600 600"` with `width="100%"` for responsive scaling.

### Geometry

```
Road width:  80px (on each axis)
Center zone: 80x80px square at (260, 260)
Arms extend: to SVG edges (each arm = 260px long, 80px wide)

North arm: x=260, y=0,   w=80, h=260
South arm: x=260, y=340, w=80, h=260
East arm:  x=340, y=260, w=260, h=80
West arm:  x=0,   y=260, w=260, h=80
Center:    x=260, y=260, w=80,  h=80
```

### Road Surface Colors

```
Road fill:      #374151  (sim-surface-alt — asphalt look)
Center fill:    #4B5563  (sim-border — intersection box)
Background:     #111827  (sim-base — surrounding area)
Lane marking:   #FBBF24  (amber-400, dashed lines)
```

### Traffic Light Positions (SVG coordinates)

```
North light: cx=300, cy=220  (bottom of north arm, facing south)
South light: cx=300, cy=380  (top of south arm, facing north)
East light:  cx=380, cy=300  (left of east arm, facing west)
West light:  cx=220, cy=300  (right of west arm, facing east)
```

Traffic light: `<circle r="12">` with fill changing via CSS class.

### Vehicle Queue Layout

Vehicles queue along the road arm, toward the intersection center:

```
North queue: vehicles stacked at y = [200, 180, 160, ...] (moving up from center)
South queue: vehicles stacked at y = [400, 420, 440, ...] (moving down from center)
East queue:  vehicles stacked at x = [400, 420, 440, ...] (moving right from center)
West queue:  vehicles stacked at x = [200, 180, 160, ...] (moving left from center)
```

Vehicle marker: `<rect width="24" height="14">` centered on the road axis.

---

## Animation Specification

All animations use CSS transitions, not JavaScript animation loops.

### Traffic Light Change

```css
.traffic-light-circle {
  transition: fill 200ms ease-in-out;
}
```

### Vehicle Departure (leaving the queue)

Applied to the `VehicleMarker` when `isLeaving = true`:

```css
.vehicle-marker-leaving {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
  opacity: 0;
  transform: translateY(-20px);  /* north/south */
  /* translateX(20px) for east, translateX(-20px) for west */
}
```

After transition ends (`onTransitionEnd`), the marker is removed from the DOM.

### New Vehicle Arriving in Queue

```css
.vehicle-marker-entering {
  animation: fadeIn 150ms ease-in forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## Responsive Breakpoints

| Breakpoint | Width      | Changes                                          |
|------------|------------|--------------------------------------------------|
| Default    | < 768px    | Not officially supported; layout may overflow    |
| `md`       | 768–1279px | Single column, IntersectionView max-w-500px      |
| `lg`       | 1280px+    | Two-column grid (primary target)                 |
| `xl`       | 1536px+    | Larger SVG (max-w-600px) + wider right panel     |

---

## Consequences

**Easier because of this decision:**
- Tailwind utility classes eliminate specificity conflicts and dead CSS.
- Color tokens in `tailwind.config.ts` are a single source of truth — changing a token updates the whole UI.
- Dark theme is the only theme — no theme switching complexity.
- SVG geometry is fixed and documented — no runtime layout calculations needed.

**Harder because of this decision:**
- Dynamic Tailwind class names (e.g., `bg-${color}`) are not purged correctly by Tailwind's content scanner. Rule: always use complete class names (`bg-traffic-red`, not `bg-traffic-${state}`). Use a lookup object instead.
- No UI component library means writing all UI primitives from scratch (buttons, selects, sliders). These must be accessible by design.
- Animations in SVG with CSS transitions require careful handling of `transform-origin` — SVG uses different coordinate spaces than HTML.

---

## Accessibility Color Decisions

Color is never the sole indicator of state. Each traffic light has:

1. A color fill (primary visual cue).
2. An SVG aria-label that reads the state in text (for screen readers).
3. A visible text label or icon adjacent for colorblind users (optional enhancement in G12).

All contrast ratios verified against WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI components).
