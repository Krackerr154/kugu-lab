# M4 Content Cleanup and Motion Polish Plan

Status: plan only; no UI implementation changes from this request.

## Scope interpretation

The two screenshots identify two removable content groups on the M4 page:

1. The integrated agent panel titled `Yang masih harus Anda jawab`.
2. The entire M4 `Format Laporan` readiness/log block:
   - `Persiapan digital`;
   - `Wajib konfirmasi asisten`;
   - the digital-preparation boundary disclaimer;
   - `Log Elektrodeposisi M4` and its form.

The report-format placeholder remains. Instructor/presenter access remains, because it is a control surface rather than the student log/readiness content. Shared `LabNotebook` remains for other modules and `/notebook`; only the M4 instance is removed.

## Research findings

### Current implementation evidence

- `ElectrolyteFunctionCard` currently renders the open-question panel from `ComplexingAgent.openQuestion`.
- `lib/m3-complexing-agents.ts` stores the open-question copy for EDTA, citrate, and PEG400.
- `ReadinessSummary` is used only by the M4 page. It renders both screenshoted readiness columns and the boundary text.
- `LabNotebook` is shared by multiple modules, but the `Log Elektrodeposisi M4` instance is only in the M4 page.
- The M4 page currently has a long live document (about 7,805 px at the inspected desktop viewport), so removing the readiness/log block will also reduce scroll burden before motion is added.
- Existing browser evidence shows the main page and major surfaces currently compute `transition: all` in places, while the static M4 diagram/card surfaces have no entry animation. This is a good reason to replace broad transitions with explicit properties rather than layering more animation on top.
- The codeposition animation already uses one requestAnimationFrame clock, pauses offscreen, supports manual stepping, and listens to `prefers-reduced-motion`; that clock must remain the only source of particle/deposition motion.
- Existing global View Transitions animate opacity plus directional movement, and existing global reduced-motion rules shorten transitions/animations. The polish should consolidate and clarify this behavior rather than introduce a second navigation system.

### External motion guidance used

- web.dev, “Animations and performance”: maintain a smooth frame rate; prefer `transform` and `opacity`; avoid animating layout/paint properties; use `will-change` sparingly and only near an imminent animation.
  https://web.dev/articles/animations-and-performance
- web.dev, “prefers-reduced-motion”: use the media query for CSS and listen for preference changes when JavaScript controls a running animation.
  https://web.dev/articles/prefers-reduced-motion
- MDN, `prefers-reduced-motion`: scaling and panning can trigger vestibular discomfort; reduce or replace non-essential motion.
  https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- W3C WCAG 2.3.3, Animation from Interactions: interaction-triggered motion should be disableable unless essential to the function or information.
  https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- Material Design 3 motion guidance: use differentiated enter/exit durations and easing rather than one global speed. Useful reference ranges are approximately 150–200 ms for micro feedback, 250–300 ms for utility transitions, and 350–400 ms for larger content entry; exits should be shorter than enters.
  https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration

## Implementation plan

### 1. Remove the requested content everywhere it is rendered

- Modify `components/interactives/ElectrolyteFunctionCard.tsx`:
  - remove the `Yang masih harus Anda jawab` panel;
  - remove the `openQuestion` rendering and any related help icon/callout styling;
  - keep mechanism, deposit effect, working amount, equation, and reference content.
- Modify `lib/m3-complexing-agents.ts`:
  - remove `openQuestion` from `ComplexingAgent`;
  - remove the three open-question strings so the text cannot reappear through another consumer.
- Modify `app/modules/m3-sn-bi-electrodeposition/page.tsx`:
  - remove the `ReadinessSummary` import and invocation;
  - remove the M4 `LabNotebook` instance and its fields;
  - retain the report-format placeholder and `M4PresenterAccess`.
- Remove `components/shared/ReadinessSummary.tsx` after confirming it has no remaining consumers.
- Do not remove `components/shared/LabNotebook.tsx`; it remains used by other modules and the notebook route.
- Search the full repository after the edit for the removed headings and screenshoted copy. No rendered M4 route should contain them.

### 2. Establish a small motion contract

- Add named motion tokens/utilities in `app/globals.css` or a small shared motion stylesheet:
  - micro feedback: ~150 ms, standard ease;
  - utility state change: ~200–250 ms;
  - content enter: ~300–350 ms, emphasized/decelerate easing;
  - content exit: ~150–200 ms, emphasized/accelerate easing.
- Replace `transition-all` on the M4 path and shared module shell with explicit properties such as `color`, `background-color`, `border-color`, `opacity`, and `transform`. Never animate width, height, grid tracks, padding, or margins for ordinary state feedback.
- Keep motion on the compositor-friendly properties (`opacity`/`transform`) whenever movement is needed. Do not add `will-change` globally; apply it only to an element immediately before a short-lived transition if browser evidence shows it is needed.
- Keep the existing reduced-motion rule, but make newly added motion explicitly honor it. The JavaScript-driven codeposition clock continues to stop/manual-step when reduced motion is active.

### 3. Smooth the shared M4 shell without animating scroll-spy

- `ModuleLayout.tsx`:
  - replace broad `transition-all` on the outer shell and navigation controls with explicit transition properties;
  - add a small press response only to actionable buttons/links, not layout containers;
  - keep the sticky companion rail static so it does not jitter during scroll.
- `ModuleJourney.tsx`:
  - retain smooth user-initiated stage navigation and instant remote/reduced-motion navigation;
  - add only active-state color/background/outline transitions to the rail;
  - do not animate every section as it enters the viewport, because scroll-spy updates would create repeated motion and visual jitter;
  - preserve current focus restoration and anchor-clearance behavior.
- `TransitionLink.tsx` and the existing View Transition CSS:
  - preserve directional route transitions;
  - normalize durations/easing to the motion contract;
  - keep the persistent shell fixed and animate only the page content snapshot;
  - preserve AbortError handling and reduced-motion instant behavior.

### 4. Smooth each M4 interactive component deliberately

- `M4GuidedAccessGate.tsx`:
  - add a short backdrop fade and dialog enter/exit using opacity/transform;
  - keep the blur/inert/focus trap semantics active for the entire locked state;
  - ensure focus moves after the enter state is ready and returns after exit;
  - reduced motion: show/hide immediately without scale/pan.
- `ElectrochemicalCellExplorer.tsx`:
  - animate selected-component detail replacement with a short opacity/translate transition only when the selection changes;
  - preserve keyboard activation and half-reaction content;
  - do not animate the SVG anatomy merely because scroll-spy or unrelated state changes.
- `SnBiPotentialGapDiagram.tsx`:
  - use a single, once-per-mount reveal at most; no looping or scroll-triggered replay;
  - keep the numerical labels readable and static after entry;
  - reduced motion: render final state immediately.
- `CodepositionWorkbench.tsx` and `CellSimulation.tsx`:
  - keep the single seekable RAF timeline as the only physical animation clock;
  - add explicit micro-transitions only for selected focus, scenario button state, and control feedback;
  - avoid CSS animation on individual particles, deposits, or ligands that could desynchronize from the shared frame;
  - verify pause, manual step, replay, offscreen pause, and reduced-motion manual inspection after the polish.
- `ElectrolyteFunctionCard.tsx`:
  - animate solution, agent, and final-addition panel changes with opacity/short translate rather than height animation;
  - keep stable `aria-controls` targets and preserve active-panel focus semantics;
  - avoid auto-replaying the same transition from incidental rerenders;
  - keep the removed open-question content absent.
- `M3FollowControls.tsx`, `M4InstructorUnlock.tsx`, and `M4PresenterAccess.tsx`:
  - give status changes and the instructor form expansion a short opacity/state transition;
  - do not animate network status indefinitely or imply that “connecting” means connected;
  - keep controls usable immediately and preserve private-state boundaries.
- `StudentIdentityGate.tsx`:
  - keep the compact identity badge/prompt stable; use only a small state transition when changing identity mode;
  - never animate private work into view or expose it through presentation state.
- `ReadinessSummary`/M4 `LabNotebook`:
  - no motion work, because the requested surfaces are removed from M4.

### 5. Verification and evidence

Use browser tooling first, not Playwright:

1. Verify the removed headings/copy are absent from the canonical M4 route and legacy M3 compatibility route.
2. Verify the report-format placeholder and instructor controls remain.
3. Exercise real interactions:
   - stage rail buttons/select and previous/next;
   - solution/agent/addition tabs;
   - component hotspots and selected detail;
   - codeposition play/pause/step/replay and scenario toggle;
   - access-gate open/close and instructor form expansion.
4. Measure normal and reduced motion at 390×844, 768×1024, and desktop width:
   - no horizontal overflow;
   - no persistent unexpected animations after settling;
   - transitions use opacity/transform or explicit low-cost properties;
   - reduced motion reaches the same final state without essential information loss;
   - keyboard focus remains visible and is not moved by incidental animations.
5. Capture a browser-only before/after motion evidence report under `artifacts/m4-motion-polish/` if the implementation needs durable evidence.
6. Run `npx tsc --noEmit`, `npm run build`, and `git diff --check`.
7. Update review assertions for the removed readiness/log/open-question content and add a targeted motion review probe if needed. Do not run Playwright unless explicitly requested.

## Acceptance criteria

- The screenshoted open-question callout, readiness split, boundary disclaimer, and M4 log form are absent from every M4 render.
- No unrelated module loses its shared notebook behavior.
- M4 route navigation and the instructor/presenter path still work.
- Motion is coherent rather than globally animated: meaningful state changes move/fade once; static chemistry diagrams remain calm; the codeposition animation remains clock-driven.
- Reduced-motion users receive an immediate/manual equivalent state, not a partially rendered or stuck interaction.
- Desktop and mobile remain overflow-free and keyboard-operable.
