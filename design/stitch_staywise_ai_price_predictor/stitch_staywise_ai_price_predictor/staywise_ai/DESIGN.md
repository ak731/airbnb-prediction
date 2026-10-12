---
name: StayWise AI
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5a403f'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e706f'
  outline-variant: '#e2bebc'
  surface-tint: '#b52330'
  primary: '#b52330'
  on-primary: '#ffffff'
  primary-container: '#ff5a5f'
  on-primary-container: '#61000e'
  inverse-primary: '#ffb3b0'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#5e5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#949393'
  on-tertiary-container: '#2b2c2c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b0'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001b'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  metric-numeral:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an editorial, hospitality-informed SaaS aesthetic tailored for property hosts, real estate investors, and revenue managers. It bridges the intuitive warmth of premium travel marketplaces with the precision and analytical authority required for AI-driven revenue intelligence.

The visual direction centers on **Warm Editorial Minimalism**:
- Generous breathing room and high optical clarity prioritize high-stakes financial decisions without cognitive clutter.
- Surfaces feel tactile, organic, and grounded rather than cold or synthetic.
- Visual elements evoke quiet hospitality luxury: balanced proportions, purposeful micro-interactions, subtle transitions, and meticulous typographic hierarchies.
- Data visualizations are treated as primary interface narratives, presenting revenue curves, dynamic pricing multipliers, and seasonal trends through calm, legible, high-precision geometry.

## Colors

The palette establishes warmth and high contrast while deliberately reserving high-chroma tones for focal actions and critical yield indicators:

- **Canvas & Surfaces:**
  - Base canvas: Warm White (`#FAFAF8`).
  - Elevated cards & containers: Pure White (`#FFFFFF`).
  - Muted wells, table headers, and secondary chips: Soft Warm Gray (`#F0F0EE`).
  - Border and divider tones: Structural Warm Gray (`#E8E8E3`).

- **Brand & Action:**
  - Primary Brand: Coral Red (`#FF5A5F`) for primary calls-to-action, key AI recommendation triggers, and high-priority metrics.
  - Primary Hover/Active: Deeper Coral (`#E0484D`).

- **Intelligence & Status:**
  - Positive Yield & AI Confidence: Subtle Sage Green (`#2E7D32`) on light tint backgrounds (`#EBF5ED`).
  - Warning & Anomaly: Warm Amber (`#D97706`) on light amber (`#FEF3C7`).
  - Critical/Loss: Crimson (`#DC2626`) on soft red (`#FEE2E2`).

- **Typography & Content:**
  - Headings, hero numbers, and primary labels: Dark Charcoal (`#222222`).
  - Secondary metadata, chart axis labels, and supporting notes: Subdued Slate (`#717171`).
  - Tertiary borders and low-emphasis icons: Light Neutral (`#B0B0A8`).

## Typography

The type system is built on **Inter**, optimized for high-density tabular reads, fluid variable pricing updates, and analytical charts:

- **Numerical Hierarchy:** Primary predictive numbers, occupancy percentages, and target revenue multipliers utilize tabular numbers (`tnum`) with tight negative letter-spacing (`-0.025em` to `-0.03em`) for optical stability during dynamic recalculations.
- **Micro-Copy & Indicators:** Metadata, status indicators, and currency units employ `label-sm` with slight positive tracking (`0.02em`) to guarantee crisp legibility against subtle warm background fills.
- **Editorial Balance:** Headings favor robust medium-to-bold weights with restrained letter spacing, generating modern editorial polish without compromising interface efficiency.

## Layout & Spacing

The layout is grounded in a mobile-first responsive architecture designed for swift on-the-go price adjustments, scaling smoothly to multi-pane desktop revenue management:

- **Breakpoints:**
  - Mobile: `< 640px` (single column, fixed sticky interaction docks, 1rem margins).
  - Tablet: `640px – 1024px` (6-column fluid structure, 1.5rem margins).
  - Desktop: `> 1024px` (12-column max-width grid constrained to 1280px, 2rem margins).

- **Vertical Rhythm & Padding:**
  - Component spacing relies on standard 4px/8px increments.
  - Deep padding (`space-lg` to `space-xl`) inside cards ensures revenue forecasts and dynamic curve visualizers feel breathable and uncluttered.
  - Compact micro-padding (`space-xs` to `space-sm`) is strictly reserved for status pill badges, interactive segmented switches, and compact data inputs.

## Elevation & Depth

Visual hierarchy uses a refined blend of subtle surface tinting, hairline boundary strokes, and multi-stage ambient shadows:

- **Level 0 (Base Canvas):** `#FAFAF8` – Flat, ground-level foundation.
- **Level 1 (Card Rest):** Background `#FFFFFF`, bordered by a subtle 1px stroke `#E8E8E3`, accompanied by a dual-step ambient shadow: `0 1px 2px rgba(34, 34, 34, 0.03), 0 4px 12px rgba(34, 34, 34, 0.04)`.
- **Level 2 (Interactive Floating / Active Hover):** Elevated cards on pointer hover or active dynamic filters: `0 6px 20px rgba(34, 34, 34, 0.08)`, border tone transitions smoothly to `#D9D9D2`.
- **Level 3 (Modals, Overlays, Floating Price Calculator):** Detached high-elevation sheets: `0 12px 36px -4px rgba(34, 34, 34, 0.12)`, backed by an ultra-thin border `#E0E0DB`.

## Shapes

The geometric identity balances modern precision with hospitable curves:

- **Primary Cards & Containers:** Standardized at `rounded-2xl` (1.5rem / 24px) to channel the soft, friendly card metaphor pioneered by Airbnb.
- **Interactive Controls:** Buttons, text input fields, drop-down menus, and search selectors use `rounded-xl` (0.75rem / 12px) to provide a comfortable, tap-friendly visual anchor.
- **Badges, Tags & Range Thumbs:** Rendered as full pills (`rounded-full`) to immediately signal interactive toggles or discrete metadata tags.

## Components

### Buttons
- **Primary Action (Book/Apply Price/AI Optimize):** Coral Red (`#FF5A5F`) fill, pure white text, `rounded-xl`, subtle downward shadow `0 2px 8px rgba(255, 90, 95, 0.25)`. Transitions to `#E0484D` on hover.
- **Secondary Action:** Transparent fill with a 1px border `#E8E8E3`, Dark Charcoal (`#222222`) label. Hover triggers background shift to `#F0F0EE`.
- **Ghost/Tertiary:** No border, `#717171` label, shifts to `#222222` with soft warm gray fill on press.

### Data Badges & AI Pill Tags
- **Confidence/Yield Badge:** Background `#EBF5ED`, text `#2E7D32`, 1px border `rgba(46, 125, 50, 0.15)`, `rounded-full`, accompanied by a small 6px pulse dot for live AI synchronization.
- **Neutral Metric Pill:** Background `#F0F0EE`, text `#717171`, `rounded-full`, compact padding (`4px 10px`).

### Sliders (Dynamic Price Sensitivity & Occupancy Tuning)
- **Track:** 6px thickness, background `#E8E8E3`. Active range fill rendered in `#222222` or `#FF5A5F`.
- **Thumb:** 24px pure white disc, 1px stroke `#E8E8E3`, supported by elevated drop shadow `0 2px 6px rgba(0, 0, 0, 0.12)`. Expands slightly on active drag with high-contrast tooltip displaying instant calculated ADR (Average Daily Rate).

### Interactive Chips & Segmented Controls
- **Segmented Toggle (Daily / Weekly / Seasonal):** Background container `#F0F0EE`, inner active tab `#FFFFFF` with `rounded-lg` and subtle elevation `0 1px 3px rgba(0,0,0,0.06)`, active text `#222222`, inactive text `#717171`.

### Input Fields & Selectors
- **Form Controls:** 48px height for touch ergonomics, background `#FFFFFF`, border 1px solid `#E8E8E3`, `rounded-xl`. On focus: stroke shifts to `#222222` with a 2px outer ring in `rgba(34, 34, 34, 0.08)`.

### Cards & Analytical Panels
- **Predictor Card:** White canvas, `rounded-2xl`, bordered with `#E8E8E3`. Clear separation between variable parameters (left/top) and predicted outcome readout (right/bottom highlighted with a gentle `#FAFAF8` inner panel).

### Charts & Data Visualizations
- Clean, uncluttered sparklines and revenue projections with stroke width 2.5px. Primary baseline curve in `#222222`, predicted AI curve in `#FF5A5F` with an underlying gradient fill fading to transparent, and confidence interval zones shaded in subtle sage green (`#2E7D32` at 6% opacity).