# Implementation Plan: Universal Landscape Card & Proportional Font Auto-Scaling

**Target:** `SlideDeckCanvas.tsx`, `app/globals.css`, and related slide components in KUGU Live Review Modul 4.  
**Objective:** Eliminate irregular dead gaps between content cards and the bottom navigation bar across all mobile/tablet landscape viewports (from Galaxy A55 360px up to iPhone 16 Pro Max 440px and tablets), ensuring cards stretch 100% to the footer with typography and internal spacing scaling proportionally.

---

## 1. Problem Statement & Root Cause Analysis

### Observed Behavior
When previewing the presentation deck across different mobile landscape devices:
- **Samsung Galaxy A55 (800 × 360):** Card height is ~180px, bottom dead gap is ~30px.
- **Google Pixel 9 Pro (952 × 427):** Card height is ~175px, bottom dead gap is ~107px.
- **iPhone 16 Pro Max (956 × 440):** Card height is ~170px, bottom dead gap is **~120px**.

### Root Cause
1. **Broken Flex Height Chain:**
   - Root container `.m4-deck-fit` is fixed `100dvh` flex-column.
   - `.m4-deck-slidebody` has `flex: 1` and occupies remaining screen height (~286px to ~366px).
   - However, its direct child `[data-slide-direction]` is an unconstrained block container with `height: auto` (`space-y-5`).
   - Consequently, `.m4-deck-split` and child `.m4-deck-bullets` receiving `height: 100%` evaluate to `auto` (intrinsic content height) rather than the parent flex container height.
   - The card halts wherever the 3 text lines finish, creating a massive empty void above the footer on taller landscape screens.
2. **Static Typography:**
   - Typography uses fixed sizes (`text-sm` / `text-base` / `0.8125rem`).
   - On taller landscape devices (440px), even if the container stretches, static small text becomes stranded with excessive empty space between items.
   - On short landscape devices (360px), overly large static text triggers internal card scrollbars.

---

## 2. Architecture & Design Principles

### Principle 1: Unbroken Height Inheritance (CSS Flex Stretch)
In landscape mode (`@media (orientation: landscape)`):
Every level of the DOM hierarchy from the slide body down to the content cards must participate in the flex column with `min-height: 0`:
```css
.m4-deck-slidebody {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.m4-deck-slidebody > [data-slide-direction] {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.m4-deck-chapter {
  flex-shrink: 0;
}
.m4-deck-split {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.m4-deck-bullets,
.m4-deck-panel {
  flex: 1;
  min-height: 0;
  height: 100%;
}
```

### Principle 2: Proportional Typography Scaling via CSS `clamp()`
Scale font size, line height, and gaps dynamically based on the vertical height budget (`vh` / `dvh`):

1. **Heading (`.m4-deck-heading`):**
   - `font-size: clamp(1.0625rem, 4.8vh, 1.375rem)` (~17px to 21px).
   - `line-height: 1.25`.

2. **Standard 3-Bullet Cards (Slide 1, Slide 3):**
   - Font size: `clamp(0.8125rem, 3.8vh, 1.0625rem)` (~13px to 17px).
   - Line height: `clamp(1.35, 4.2vh, 1.5)`.
   - Vertical list gap: `flex flex-col justify-between h-full` or `gap: clamp(0.35rem, 2vh, 0.75rem)`.
   - Bullet check badges: `height: clamp(18px, 4.5vh, 22px); width: clamp(18px, 4.5vh, 22px)`.

3. **5-Bullet Timeline Cards (Slide 2):**
   - Font size: `clamp(0.72rem, 2.9vh, 0.875rem)` (~11.5px to 14px).
   - Vertical list gap: `gap: clamp(0.2rem, 1.5vh, 0.45rem)`.
   - Sequential step badges: `height: 18px; width: 18px`.

4. **Split 2-Column Slides (Slide 4, Slide 5, Slide 6):**
   - Left text card: `clamp(0.6875rem, 2.5vh, 0.8125rem)`.
   - Right diagram / workbench: fills 100% height, internal SVG/canvas scales to container bounds.

5. **3-Card Slides (Slide 7, Slide 8, Slide 9):**
   - Grid container: `grid grid-cols-3 h-full items-stretch`.
   - Card internal padding: `p-1.5 sm:p-2`.
   - Card titles: `clamp(0.6875rem, 2.4vh, 0.8125rem)`.
   - Internal rows: `flex flex-col justify-between h-full`.

---

## 3. Systematic Slide-by-Slide Strategy

| Slide | Layout Archetype | Card Target Behavior | Typography & Spacing Target |
| :--- | :--- | :--- | :--- |
| **Slide 1** (Tujuan & Output) | Full-width 3 bullets | Stretches to footer line (`gap: 8px`) | `3.8vh` (~13.6px on A55, ~16.7px on iPhone 16) |
| **Slide 2** (Workflow 5 Langkah) | Full-width 5 bullets + timeline | Stretches to footer line | `2.9vh` (~11.6px on A55, ~12.8px on iPhone 16) with vertical timeline connector |
| **Slide 3** (Mengapa Paduan Sn–Bi) | Full-width 3 bullets | Stretches to footer line | `3.8vh` font scaling, items spaced evenly |
| **Slide 4** (Apa itu Elektrodeposisi) | 2-column split (Bullets + Sel) | Both cards match identical 100% height | Bullets: `2.5vh`; Sel SVG: `viewBox` centered, 3-component bottom strip flush |
| **Slide 5** (Peta Potensial Sn vs Bi) | Dedicated diagram slide | Diagram card stretches 100% height | SVG axis centered, 2 takeaway chips at bottom flush with zero scroll |
| **Slide 6** (Workbench Pengompleks) | 2-column split (Workbench + Notes) | Workbench + simulation canvas fill 100% height | Simulation frame `flex-1 min-h-0`, control bar top flush, explanation right flush |
| **Slide 7** (Larutan A, B, C) | 3-column multi-card grid | 3 cards stretch to identical 100% height | Card title top, chemical chips bottom `mt-auto`, zero card scroll |
| **Slide 8** (Faraday Formula) | 3-column calculation cards | 3 cards stretch to identical 100% height | Formulas display mode, parameter badges `mt-auto pt-1` |
| **Slide 9** (Rubrik Laporan 100 pt) | 3-column rubric cards | 3 cards stretch to identical 100% height | 4 items per card stacked vertically, point badges flush right |
| **Slide 10** (Review Games Lobby) | Panel / Games Card | Games panel fills 100% height | Question cards & countdown timer centered, answers fill height |

---

## 4. Verification Protocol

1. **Multi-Device Landscape Verification via `browser_exec`:**
   - iPhone 16 Pro Max (`956 × 440`) $\to$ assert `gapBelowBullets <= 8px` and `cardScrollH <= cardH`.
   - Google Pixel 9 Pro (`952 × 427`) $\to$ assert `gapBelowBullets <= 8px`.
   - Samsung Galaxy A55 (`800 × 360`) $\to$ assert `gapBelowBullets <= 8px` and zero vertical scrollbar.
   - iPhone SE (`667 × 375`) $\to$ assert zero vertical scrollbar.
   - iPad Mini (`1024 × 768` landscape) $\to$ assert centered, proportional scaling.
2. **Automated Unit & E2E Tests:**
   - `node --test tests/unit/*.test.mjs` (all 49 passing).
   - `npx tsc --noEmit` clean.
