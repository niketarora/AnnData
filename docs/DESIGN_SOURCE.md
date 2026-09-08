---
name: AgriFintech Operating System
colors:
  surface: '#f2fcf2'
  surface-dim: '#d2ddd3'
  surface-bright: '#f2fcf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf6ec'
  surface-container: '#e6f1e7'
  surface-container-high: '#e1ebe1'
  surface-container-highest: '#dbe5db'
  on-surface: '#151e18'
  on-surface-variant: '#3f4940'
  inverse-surface: '#29332c'
  inverse-on-surface: '#e9f3e9'
  outline: '#6f7a6f'
  outline-variant: '#becabd'
  surface-tint: '#006d37'
  primary: '#006a36'
  on-primary: '#ffffff'
  primary-container: '#188648'
  on-primary-container: '#f6fff4'
  inverse-primary: '#77db94'
  secondary: '#166c3b'
  on-secondary: '#ffffff'
  secondary-container: '#a2f5b6'
  on-secondary-container: '#1f7241'
  tertiary: '#535f59'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7771'
  on-tertiary-container: '#f5fff8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#93f8ae'
  primary-fixed-dim: '#77db94'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#a2f5b6'
  secondary-fixed-dim: '#87d89c'
  on-secondary-fixed: '#00210d'
  on-secondary-fixed-variant: '#005229'
  tertiary-fixed: '#d9e6de'
  tertiary-fixed-dim: '#bdcac2'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4944'
  background: '#f2fcf2'
  on-background: '#151e18'
  surface-variant: '#dbe5db'
  surface-canvas: '#F7F9F7'
  surface-card: '#FFFFFF'
  text-primary: '#17201A'
  text-secondary: '#66736A'
  border-structural: '#E5EAE6'
  status-success-base: '#1F8A4C'
  status-success-tint: '#EAF7EF'
  status-warning-base: '#D97706'
  status-warning-tint: '#FEF3C7'
  status-danger-base: '#DC2626'
  status-danger-tint: '#FEE2E2'
  status-info-base: '#2563EB'
  status-info-tint: '#EFF6FF'
typography:
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  currency-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-card:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-base-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  caption-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  badge-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  touch-min: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

### Personality & Market Positioning
The design system bridges robust institutional financial technology and high-stakes agricultural logistics. It serves two distinct personas:
1. **Farmers:** Requiring outdoor daylight legibility, zero-ambiguity vernacular terms, prominent currency notation (₹), and instant decision drivers ("LEAVE NOW" vs. "WAIT").
2. **Institutional Buyers & Mandi Traders:** Demanding operational density, lot traceability, queue velocity management, and audit-grade transaction security.

The emotional resonance is anchored in **dignity, trust, and frictionless prosperity**. It strips away decorative bloat in favor of tactile utility, field resilience, and transactional clarity.

### Design Style: Modern Pragmatic Fintech
The visual philosophy pairs crisp modern fintech surfaces with high-contrast structural borders:
- **Canvas Quality:** Warm, anti-glare tinted canvas (`#F7F9F7`) reduces eye strain under direct sun while preventing the sterile clinical feel of pure cold white.
- **Card Materiality:** Pure white `#FFFFFF` layered cards with precise `1px` structural borders (`#E5EAE6`), preventing washouts in outdoor high-lux environments.
- **Tactile Weight:** Generous touch footprints (minimum 48px), explicit state bounding, and weighted currency representations emphasize tangible asset security.

## Colors

### Core Color Roles
- **Primary Green (`#1F8A4C`):** Applied strictly to actionable decision points, primary task executions, interactive toggles, and positive transaction balances.
- **Dark Green (`#146B3A`):** High-contrast anchors for crucial financial figures, header surfaces, pressed CTA feedback, and verified operational state tags.
- **Light Green (`#EAF7EF`):** Low-contrast semantic wash for accepted bid backgrounds, positive delta callouts, and selected list item fills.
- **Neutral Foreground (`#17201A`):** Pure deep charcoal with a faint olive-green baseline, maximizing contrast against light surfaces without the visual harshness of `#000000`.

### Semantic Matrix
The status system enforces operational clarity:
- **Earnings / Accepted / Paid (`#1F8A4C` / `#EAF7EF`):** Realized cash flow, confirmed gate check-ins, completed grade inspections.
- **Wait / Pending / In-Queue (`#D97706` / `#FEF3C7`):** Market transit delays, escrow holds, vehicle parking queue holds.
- **Risk / Disputed / Cancelled (`#DC2626` / `#FEE2E2`):** Quality grade rejection, moisture threshold failures, payment disputes.
- **Inspection / Transit / Arriving (`#2563EB` / `#EFF6FF`):** Logistics dispatch, Mandi gate weighbridge arrival, lab quality assay in progress.

## Typography

### Structural Pairings
- **Display & Headings:** `Plus Jakarta Sans` provides geometric weight, generous apertures, and contemporary authority, making key decision banners, Mandi lot codes, and financial totals immediately scan-readable.
- **Body & Numerical Values:** `Inter` handles operational rows, form entries, contextual metadata, and quantitative specs. Its tabular numeral alternates (`tnum`) ensure clean vertical alignment across multi-row price ledgers and weighbridge readouts.

### Indian Rupee (₹) Presentation Rules
- The currency symbol (`₹`) is always set in the exact weight and family of its associated numerical value.
- Never add a whitespace character between `₹` and the integer sequence (e.g., `₹48,250`, not `₹ 48,250`).
- For projected or calculated amounts (e.g., net realization after moisture cut), append the unit label directly using `body-base-medium` (e.g., `₹2,450 / Quintal`).

## Layout & Spacing

### Grid & Viewport Model
- **Mobile First (360px – 430px):** Default presentation framework for on-ground usage. Driven by a single-column layout with a 4-column sub-grid, `16px` lateral page gutters, and vertical stacking cards.
- **Tablet & Trader Terminals (768px – 1024px+):** Fluid 8-column layout. Adapts split panes: live Mandi arrivals on the left (5 columns), real-time lot bidding and gate logs on the right (3 columns).
- **Desktop Logistics Dashboard (1280px+):** 12-column fixed-max layout (`1280px` max-width container) centered with `24px` gutters for multi-lot tracking.

### Vertical Rhythm & Touch Guardrails
- Baseline modular unit is **4px** with primary spacing jumps at **8px**, **12px**, **16px**, and **24px**.
- **Touch Target Enclosure:** All actionable components (input boundaries, quick filters, navigation chips, stepper selectors) must resolve to at least **48px (`3rem`)** along their vertical and horizontal axes to facilitate accurate one-handed field interaction.

## Elevation & Depth

### Low-Contrast Structural Depth
Because the platform is used extensively in high-ambient sunlight and outdoor dust environments, traditional multi-layered blurry drop shadows wash out and reduce readability. Depth is expressed through **structural containment borders paired with subtle, warm, low-opacity tints**.

### Depth Layers
- **Level 0 (Canvas Base):** Flat `#F7F9F7`. Un-elevated root canvas.
- **Level 1 (Card & Section Containers):** `#FFFFFF` fill bounded by a crisp `1px solid #E5EAE6` perimeter. Subtle diffuse ambient shadow: `0px 1px 3px rgba(23, 32, 26, 0.05)`.
- **Level 2 (Interactive Floating / Active States):** Selected bids, active dispatch lot cards, and filter sheets. Elevated with `0px 4px 12px rgba(23, 32, 26, 0.08)` plus an active border accent (`#1F8A4C` at 50% opacity or `#E5EAE6`).
- **Level 3 (Modal Sheets & Persistent Bottom Drawers):** Gate pass QR sheets, grading detail overlays, and check-in dialogues. Surface `#FFFFFF` with `0px -4px 24px rgba(23, 32, 26, 0.12)`, anchored by a 40% black scrim (`rgba(23, 32, 26, 0.40)`).

## Shapes

### Shape Language & Geometry
The application uses **Rounded (Scale Level 2)** geometry:
- **Cards & Data Modules:** `0.75rem` (`12px`) to `1rem` (`16px`) corner radius. Provides an approachable yet structured financial utility aesthetic.
- **Buttons & Core Form Inputs:** `0.625rem` (`10px`) radius, balancing tactile pressability with structured containment.
- **Chips, Pills, & Status Badges:** Fully rounded capsule format (`9999px`), distinguishing informational tags and operational status flags from interactive square buttons and rectangular cards.
- **QR Token Enclosures:** Crisp `0.5rem` (`8px`) inner boundary with contrasting white isolation borders to ensure immediate scanner camera lock-on at check-in barriers.

## Components

### Buttons
- **Primary Action:** `#1F8A4C` solid background, white text (`Inter` Semibold 15px), minimum 48px height, `10px` radius. Active state: `#146B3A`. Focus: `3px` outline ring in `#EAF7EF`.
- **Secondary / Outline:** `#FFFFFF` background, `1.5px` border in `#1F8A4C`, text color `#1F8A4C`.
- **Urgent Decision Button (Split Action):** Full-width sticky button bar. Example: "WAIT AT FARM" (50% width, neutral background `#FFFFFF`, border `#E5EAE6`) paired with "LEAVE FOR MANDI NOW" (50% width, `#1F8A4C` solid).

### Cards & Metric Modules
- **Lot / Commodity Card:** Container `#FFFFFF`, `1px solid #E5EAE6`, `12px` corner radius, `16px` internal padding. Features a split header: Commodity & Grade on the left, Status Chip on the right.
- **Financial Metric Card:** Distinct container with a top highlight band or subtle `#EAF7EF` gradient fill for net earnings. The currency amount is styled with `currency-display` (`32px` bold) in `#146B3A`.

### Status Badges & Operational Chips
- **Pill Formation:** Height `24px` to `28px`, `9999px` corner radius, internal padding `4px 10px`.
- **Status Tokens:**
  - *Accepted / Cleared:* `#EAF7EF` fill, `#1F8A4C` text, paired with a solid `6px` green dot icon.
  - *Pending / Queue Delay:* `#FEF3C7` fill, `#D97706` text, paired with a solid `6px` amber dot.
  - *Risk / Rejection:* `#FEE2E2` fill, `#DC2626` text, paired with a solid `6px` red dot.
  - *Weighbridge / In-Transit:* `#EFF6FF` fill, `#2563EB` text, paired with a solid `6px` blue dot.

### Form Inputs & Large Touch Selectors
- **Input Fields:** Minimum height `50px`, background `#FFFFFF`, border `1.5px solid #E5EAE6`, radius `10px`, font `15px`. Floating top micro-label in `#66736A`. Active focus ring: `2px solid #1F8A4C`.
- **Stepper / Quantity Counters:** Oversized circular touch targets (`44px x 44px`) on either side of the numerical field for easy adjustment of Quintals or Bags while in the field.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** `22px x 22px`, `6px` rounded corners. Default border `#E5EAE6`. When selected: `#1F8A4C` fill with a bold white checkmark.
- **Radio Buttons:** `22px x 22px` outer circle. When active: `2px` solid `#1F8A4C` border with an inner `10px` solid `#1F8A4C` disc.

### Lists & Queue Tables
- List items are isolated by `#E5EAE6` hairline dividers (`1px`).
- Buyer-side density includes row heights clamped at `56px` with tabular numeric alignment for weights (`Quintals`), price per unit (`₹/Q`), and queue positions (`#04`).