---
version: alpha
name: Terminal Grid
description: A dense, monospaced, instrument-panel aesthetic for personal data apps — one font, one size, sharp edges, hairline rules, and a single accent that flips for dark mode.
colors:
  ink: "#171717"
  paper: "#ffffff"
  rule: "#e5e5e5"
  rule-subtle: "#f5f5f5"
  accent-light: "#3b82f6"
  accent-dark: "#f59e0b"
  dark-ink: "#f5f5f5"
  dark-paper: "#0a0a0a"
  dark-rule: "#262626"
  dark-rule-subtle: "#171717"
typography:
  base:
    fontFamily: '"TX-02", ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  tag:
    fontFamily: '"TX-02", ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.03em
    textTransform: uppercase
rounded:
  none: 0
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  gap: 8px
  row-y: 4px
  row-x: 8px
  row-x-md: 32px
  page-y: 16px
  page-y-md: 32px
stroke:
  hairline: 1px
  icon: 1.5px
breakpoints:
  md: 768px
grid:
  columns: 12
  gap: "{spacing.gap}"
components:
  surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    fontFamily: "{typography.base.fontFamily}"
    fontSize: "{typography.base.fontSize}"
  tile:
    border: "{stroke.hairline} solid {colors.rule}"
    borderRadius: "{rounded.none}"
    paddingX: 16px
    paddingY: 12px
  list-row:
    gridColumns: 12
    gapX: "{spacing.gap}"
    paddingX: "{spacing.row-x}"
    paddingXMd: "{spacing.row-x-md}"
    paddingY: "{spacing.row-y}"
    divider: "{stroke.hairline} solid {colors.rule}"
  button-ghost:
    paddingX: 4px
    paddingY: 2px
    border: "{stroke.hairline} solid {colors.rule}"
    borderRadius: "{rounded.none}"
    textTransform: uppercase
    letterSpacing: "{typography.tag.letterSpacing}"
    hoverOpacity: 0.5
    disabledOpacity: 0.5
    cursor: pointer
  selection-indicator:
    size: 8px
    borderRadius: "{rounded.full}"
    backgroundColor: "{colors.accent-light}"
    backgroundColorDark: "{colors.accent-dark}"
  link:
    textDecoration: underline
    color: inherit
  icon:
    stroke: "{stroke.icon}"
    strokeColor: currentColor
    strokeLinecap: round
    strokeLinejoin: round
  skeleton:
    backgroundColor: "{colors.rule-subtle}"
    animation: pulse
---

## Overview

Terminal Grid reads like a reference instrument: one typeface, one size,
sharp corners, and hairline rules that organize dense information. The
brand personality is the opposite of a marketing page — quiet, technical,
and deferential to the content. Think blueprint, shop tool, or
early-engineering CRT. Nothing decorates; everything measures. The
interaction model reinforces this: vim-style shortcuts and short
uppercase verb codes make the screen feel like a console you operate
rather than a site you browse.

Apps in the suite share a naming convention: a three-letter, two-digit
call sign (e.g. `STR-01`, `LOG-02`) rendered in the page title. It
signals that these are tools, not products, and that they compose into
a consistent kit.

## Colors

There is no brand palette in the traditional sense. The system leans on
system defaults and a single accent that inverts for dark mode. Light
and dark are equal first-class themes via `color-scheme: light dark`.

- **Ink (#171717):** Default foreground. Used for all text, borders, and
  icon strokes by inheriting `currentColor`.
- **Paper (#ffffff):** Default background. Supplied by the user agent,
  never painted explicitly.
- **Rule (#e5e5e5 / dark #262626):** Hairline borders, dividers, row
  separators. This is the primary structural color of the UI.
- **Rule Subtle (#f5f5f5 / dark #171717):** Skeleton fills and any
  extra-quiet surface. One tonal step inside Rule.
- **Accent — Light Mode (#3b82f6):** Used only for selection and other
  single-point indicators. Never for text, never for large fills.
- **Accent — Dark Mode (#f59e0b):** The dark-mode counterpart. Chosen
  to pop on near-black without the aggression of cyan or magenta.

Contrast targets are WCAG AA. The accent is decorative only, so its
contrast against paper is not load-bearing.

## Typography

One family, one size, one weight. The system's personality is almost
entirely carried by the typeface.

- **Family:** `TX-02` (Berkeley Graphics), loaded via `next/font/local`
  from `public/fonts/TX-02.woff2`. It is a modern monospace with a warm, mechanical feel
  — slightly rounded terminals, even color on screen, and a strong
  all-caps lockup that suits short uppercase labels.
- **Fallback:** `ui-monospace, SFMono-Regular, Menlo, monospace`.
- **Size:** 12px for the entire document body. Do not introduce a
  second size without a very strong reason — the uniformity is the
  aesthetic.
- **Weight:** 400 only. Avoid bold; emphasis is achieved with brackets,
  uppercase, or position in the grid.
- **Tabular figures:** TX-02 is monospaced, so all numbers align by
  default; do not apply `font-variant-numeric` overrides.
- **Casing:** Use uppercase for action verbs and short tags. Mixed case
  for prose and data.

## Layout

A 12-column grid at 8px gap is the single layout primitive. Use it for
headers, lists, forms, and any compound region that needs alignment.
Cross-region vertical alignment is a feature, not an accident — put
every row on the same 12-column rails.

- **Scale:** 4px base. Common rhythms: 4 (tight row), 8 (grid gap), 16
  (region interior), 32 (outer page padding at `md`).
- **Page gutters:** 8px on mobile, 32px on `md+`. Page headers get
  16/32 vertical padding at the same breakpoints.
- **Breakpoint:** One breakpoint, `md` (768px). Mobile hides
  low-priority columns by toggling them to `hidden md:flex`.
- **Rows:** 4px vertical padding on list rows — a tight vertical
  rhythm that lets many items fit on one screen without scroll.
- **Selection anchoring:** When a list supports keyboard navigation,
  give rows a scroll margin near half the viewport height so the
  active row stays centered as the user moves through it.
- **Max width:** None. Content fills the viewport; the grid provides
  structure, not a shrinking centered column.

## Elevation & Depth

Depth is expressed exclusively through hairline borders and tonal
dividers. There are no shadows, no blurs, no z-layers. This keeps the
surface perfectly flat and reinforces the instrument-panel feel.

- **Separation:** 1px solid Rule for enclosed regions, divided lists
  for collections, top border for the leading edge of a list.
- **Grouping:** Whitespace and grid alignment do the work of cards.
  Surfaces are implied, not drawn.
- **Focus / selection:** A single 8px accent dot, not a background wash
  or ring. Selection must never change a row's geometry.
- **Hover / pressed:** `opacity: 0.5`. No color changes, no scale, no
  shadow lift.

## Shapes

The system is a rectilinear grid. Corners are square.

- **Default radius:** `0`. Every tile, button, input, and surface is
  square-cornered.
- **Exception:** The selection indicator dot uses `rounded-full`. This
  is the only curve in the system and it earns its place by being a
  single 8×8px pixel cluster.
- **Strokes:** 1px for UI borders and dividers; 1.5px for line-art
  icons with round caps and joins so small glyphs remain legible.

## Components

Atoms are deliberately few; compositions do the work.

- **Surface:** The page body. Paper background, Ink foreground, the
  base typography token applied globally. Never nest painted surfaces.
- **Tile:** A 1px-bordered rectangular region with 16×12 interior
  padding. Use as the container for any fixed-shape content block
  (metrics, form groups, read-only detail panels). Shape is defined by
  its grid span and aspect ratio at the call site, not by the
  component.
- **List Row:** 12-column grid with 8px column gap, a top border on
  the container and a divider between rows. Columns collapse by
  hiding less-critical cells on mobile. Reserve the leading cell for
  identity (optional icon + primary label + tag) and the trailing
  cell for actions.
- **Ghost Button:** 1px border, square corners, uppercase label, tight
  `px-1 py-0.5` padding. Buttons sit at the same visual weight as the
  borders around them — no fills. Hover drops to 50% opacity. Labels
  are short uppercase codes (typically 3 characters) so action
  clusters stay geometrically stable; set an explicit character-unit
  width to prevent reflow when a label swaps (e.g. busy / success
  states).
- **Tag:** A bracketed uppercase token inline with text, e.g. `[LR]`.
  Brackets are part of the tag; no border or fill. Use for categorical
  metadata that should be scannable but not visually loud.
- **Selection Dot:** 8×8px filled circle in the accent color, placed
  before the selected item. Hidden on mobile where keyboard nav is
  not in use.
- **Inline Icon:** SVG with 1.5px stroke, `currentColor`, round caps
  and joins. No fills. Size icons in multiples of 4px (16, 20, 24,
  32). Never introduce color inside an icon.
- **Skeleton:** Pulsing Rule-Subtle fill that matches the real
  component's geometry exactly, so layout does not shift on load.
- **Link:** Plain underline, inherited color. No hover color shift.
- **Empty / error state:** Centered prose, 32px padding, with a single
  underlined action link. No illustrations.
- **Form control (input, select, textarea):** Inherit the base
  typography. 1px border, square corners, 8×4 padding. Focus uses the
  accent as a 1px border color swap, not a glow.

## Interaction

The interaction vocabulary is part of the visual identity.

- **Keyboard first:** Expose vim-style single-key verbs for the primary
  actions in the current view (`j`/`k` to move, a letter per action).
  Every shortcut must have a visible clickable equivalent; every
  clickable action should have a shortcut.
- **Verb codes:** Name actions with short uppercase codes (usually
  three letters) that fit inside Ghost Buttons. Pick codes that are
  memorable and map naturally to their shortcut letter when possible.
- **Feedback states:** Idle → busy → success is conveyed by swapping
  the label inside the button (`CPY` → `...` → `√`), never by changing
  color or size.
- **Focus management:** On keyboard navigation, scroll the active row
  into a stable position (center of viewport) rather than the default
  "just in view" behavior.

## Do's and Don'ts

- **Do** keep the entire app at one font size (12px). If a value feels
  too small, give it more surrounding whitespace — do not enlarge it.
- **Do** use the accent color only for single-point indicators.
- **Do** label actions with short uppercase codes; they compose into a
  memorable keyboard verb vocabulary.
- **Do** pair every keyboard shortcut with a clickable equivalent, and
  vice versa — the app must be fully operable by either input method.
- **Do** treat light and dark as equal. Use `color-scheme: light dark`
  and let the UA paint backgrounds; never hard-code white.
- **Do** ship the mono webfont via `next/font/local` with
  `font-display: swap` and a monospace fallback so the layout is
  stable before the font loads.
- **Don't** introduce rounded corners on tiles, buttons, or inputs.
  The selection dot is the only `rounded-full` in the system.
- **Don't** add shadows, blurs, or gradients. Depth comes from 1px
  borders and dividers only.
- **Don't** use bold for emphasis. Use brackets, uppercase, or layout.
- **Don't** paint the accent across text, fills, or large regions.
- **Don't** introduce a second typeface. Personality is carried by
  TX-02 alone.
- **Don't** add decorative illustrations, mascots, or photography —
  this is an instrument, not a brochure.
