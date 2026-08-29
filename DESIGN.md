---
name: "KUGU Lab"
description: "Interactive pre-lab companion for KI3131 inorganic chemistry practicals."
colors:
  primary: "#000613"
  bench-navy: "#001f3f"
  signal-gold: "#fcd400"
  gold-on-signal: "#6e5c00"
  gold-ink: "#705d00"
  paper: "#f8f9fa"
  surface-white: "#ffffff"
  ink: "#191c1d"
  muted-ink: "#43474e"

  danger: "#ba1a1a"
  danger-soft: "#ffdad6"
  success: "#16a34a"
  success-soft: "#dcfce7"
typography:
  headline:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  utility:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
  eyebrow:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: "1rem"
    letterSpacing: "0.18em"
  icon:
    fontFamily: "Material Symbols Outlined"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: "1rem"
rounded:
  base: "0.25rem"
  control: "0.5rem"
  card: "0.75rem"
  feature: "1rem"
  pill: "9999px"
spacing:
  compact: "0.5rem"
  control-y: "0.625rem"
  control-x: "1.25rem"
  card: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.bench-navy}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  status-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.5rem"
  status-chip-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.5rem"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "{spacing.compact}"
  navigation-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.signal-gold}"
    rounded: "{rounded.pill}"
    padding: "{spacing.compact}"
  attention-banner:
    backgroundColor: "{colors.signal-gold}"
    textColor: "{colors.gold-on-signal}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  safety-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "0.75rem"
  verification-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem"
  verification-feedback:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem"
---

# Design System: KUGU Lab

## Overview

**Creative North Star: "The Academic Instrument Notebook"**

KUGU Lab makes pre-lab preparation feel like working through a precise, calm laboratory record beside a purposeful instrument panel. The interface supports repeated study and procedural decision-making: dense enough to retain meaningful chemistry context, yet disciplined enough that the next action, safety status, and evidence remain scannable.

Midnight Bench Navy establishes the controlled laboratory frame; Safety Signal Gold is the visible cue for action, progression, and attention. Soft paper-like grays keep long study sessions quiet, while gentle ambient lift separates operational surfaces without turning the application into a glossy dashboard.

**Key Characteristics:**
- Calm academic precision over marketing or gamification.
- Operational hierarchy: task, status, evidence, then secondary reference material.
- Safety cues are explicit, local to the decision, and never merely decorative.
- Rounded, low-contrast containers support dense study material without visual noise.
- Motion communicates progress or a physical laboratory phenomenon and always has a reduced-motion equivalent.

## Colors

The palette is a working hierarchy, not a collection of accents: Midnight Bench Navy holds structure, Safety Signal Gold carries meaningful attention, and cool paper surfaces make extended reading and evidence review comfortable.

### Primary
- **Midnight Bench Navy:** use for the persistent navigation rail, primary headings, high-emphasis action surfaces, and the application’s authoritative frame.
- **Bench Navy:** use as the controlled interactive layer inside the primary system, especially decisive progression actions.

### Secondary
- **Safety Signal Gold:** use for primary attention, current progress, active context, and approved caution states.
- **Gold Ink:** use for legible text and iconography on light surfaces where gold must remain an information cue rather than a fill.

### Tertiary
- **Safety Red:** reserve for unresolved hazards, blocking conditions, and explicit error feedback.
- **Verification Green:** reserve for a completed check or verified correct response; never use it as a substitute for physical-lab authorization.

### Neutral
- **Cool Paper:** the application background and quiet study ground.
- **White Surface:** raised reading and working surfaces.
- **Graphite Ink and Muted Ink:** primary and secondary reading hierarchy.
- **Soft Outline:** low-contrast structural separation for cards, fields, and lists.

### Named Rules
**The Signal-Not-Decoration Rule.** Gold signals a meaningful action, active state, progress marker, or safety-relevant emphasis. Do not scatter it across neutral cards for decoration.

**The Safety Has a Voice Rule.** Danger and warning colors must arrive with clear text, an icon or label, and an actionable boundary; color alone never carries the meaning.

## Typography

**Display Font:** Montserrat

**Body Font:** Inter

**Character:** Montserrat gives section and procedure titles a compact, decisive academic voice. Inter keeps dense instructional copy, data labels, table values, and controls legible at repeated-study scale.

### Hierarchy
- **Headline:** the `headline` role names screens, major panels, and procedure sections; it is bold, compact, and never ornamental.
- **Body:** the `body` role carries explanatory chemistry content and keeps a generous reading line-height.
- **Utility:** the `utility` role supports metadata, manual-page references, chips, table cells, and secondary actions.
- **Eyebrow:** the `eyebrow` role marks course and context information in uppercase, widely tracked text; it is a locator, not a headline.

### Named Rules
**The Two-Voice Rule.** Use Montserrat only for hierarchy-bearing headings and short emphasis. Use Inter for everything that must be read, compared, entered, or acted on.

## Layout

The desktop shell is an operational frame: an 80px fixed navy rail expands to 256px on hover, while an 80px contextual header keeps the current course and utilities visible. Main content clears the rail and sits in a centered container capped at 1280px, with responsive horizontal padding that grows from 1rem to 3rem.

Use grids to separate related work rather than to create decorative tile walls. Major operational pairs may be asymmetric; card collections flatten deliberately as width narrows. At the installed Tailwind `lg` breakpoint, the rail yields to a sticky mobile top bar and full-screen navigation drawer. Controls retain clear touch targets, and no critical state relies on the desktop hover expansion.

The spacing rhythm is compact within a component and more generous between sections: use `compact` for chips and related controls, `card` for card interiors, and `section` for transitions between learning blocks.

## Elevation & Depth

Depth is tonal first and shadow second. Paper and white surfaces layer against the cool page ground with low-contrast outlines; the shared ambient shadow is a restrained navy-tinted lift for raised cards and the navigation rail. Sticky surfaces use a near-opaque paper field with backdrop blur so contextual controls stay distinct without becoming a separate visual world.

### Shadow Vocabulary
- **Ambient lift** (`0 8px 32px rgba(0, 31, 63, 0.08)`): use for a primary card, interactive walkthrough, or persistent rail that needs separation from the page ground.
- **Control lift:** use the platform’s subtle default shadow only for active segmented controls or small interactive objects; it must not compete with the content hierarchy.

### Named Rules
**The Paper-Before-Shadow Rule.** Establish hierarchy with surface tone and outline first. Add ambient shadow only when a surface truly needs elevation or interaction emphasis.

## Shapes

The form language is softly engineered: small fields use the base radius, buttons and compact controls use the control radius, standard containers use the card radius, and immersive rehearsal surfaces may step up to the feature radius. Pills are reserved for progress, status, compact metadata, and circular navigation affordances.

Borders are quiet and cool-gray. Containers should feel like instrument panels and notebook inserts—stable, lightly bounded, and never glassy by default. The one intentional translucency is the sticky contextual header; it supports wayfinding rather than decoration.

## Components

### Buttons

High-emphasis actions use Bench Navy with white text, compact bold Inter labels, and the control radius. Hover states are opacity or surface-tone shifts rather than scale theatrics. Secondary actions stay outlined or quiet on white; focus uses the gold-accent ring.

### Cards / Containers

Cards use white or low-contrast cool-gray surfaces, the card radius, a soft outline, and the card padding token. A raised card may use ambient lift, but ordinary list and worksheet containers remain tonally layered and calm.

### Inputs / Fields

Fields and answer options are white, clearly outlined, compactly padded, and direct. Focus uses a visible navy or gold system cue. Correct, incorrect, disabled, and selected states must be textually understandable as well as visually distinct.

### Status Chips

Status chips are compact pills. They pair a short text label with a small dot or icon when useful; gold denotes active/progress context, gray denotes neutral or scheduled context, red denotes blocking attention, and green denotes a verified in-app check.

### Navigation

Desktop navigation is a fixed navy rail with circular icon affordances; the active route receives the gold signal. The rail may expand on hover to expose labels, but labels must remain available through titles and the mobile drawer. Mobile navigation is a sticky top bar that opens a full-screen, keyboard-dismissible drawer.

### Procedure Walkthrough

The signature learning component is a one-step-at-a-time procedure surface. It combines a gold progress bar, step markers, a numbered navy stage marker, contextual equipment chips, safety callouts, prediction checks, and obvious previous/next controls. Its visual hierarchy must always make the current physical action and its rationale more prominent than decorative treatment.

## Do's and Don'ts

### Do:
- **Do** use Midnight Bench Navy to establish the application frame and Safety Signal Gold to indicate meaningful action or progression.
- **Do** use Montserrat for short hierarchy and Inter for instructional, data-heavy, or interactive copy.
- **Do** keep cards quiet: white or cool-gray surfaces, soft outlines, and ambient navy lift only where hierarchy demands it.
- **Do** pair every safety, correctness, and progress color with readable text and a semantic control or live-status treatment.
- **Do** preserve visible keyboard focus and the existing reduced-motion fallback for every animated or interactive state.

### Don't:
- **Don't** turn the system into a marketing hero, a game reward layer, or an analytics dashboard full of decorative metrics.
- **Don't** use gold as a generic accent on every card, or use red/green without an explicit safety or verification meaning.
- **Don't** replace the two-font hierarchy with display-heavy or novelty typography.
- **Don't** use hard black shadows, high-gloss glass panels, or unbounded animation to create false importance.
- **Don't** let a digital completion state imply independent authorization for physical laboratory work.
