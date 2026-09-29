# M3 Sn–Bi — Layout and navigation polish

## Stand

The five-stage M3 rebuild and wider ModuleLayout were already present as uncommitted work at session start. This pass preserves those changes and focuses on layout, readability, and mobile navigation. No commits or deployments were made.

Implementation and verification are complete. Independent review identified one rapid native-selector keyboard race under normal motion. It was reproduced with a failing test, corrected in ModuleJourney by making native select navigation instant while preserving smooth button navigation, and verified again by the parent against the full suite. No outstanding demonstrated review defect remains.

## Änderungen

- ModuleLayout has an opt-in `compactHeader` used only by M3. All six learning outcomes remain available in a native, keyboard-operable disclosure. Other modules retain their expanded objectives.
- The mobile M3 header measured 438px before and 250px after at 390px viewport width. The full module title now has 324px rather than 244px of reading width.
- ModuleJourney uses a native stage selector with previous/next controls below 768px, and five numbered buttons above it. The rail is 61px tall. Duplicate guiding text was removed from the rail, not the section headers.
- Section anchor clearance and scroll tracking use the same measured sticky geometry; headings remain below the rail. Stage navigation does not award completion ticks from scroll position.
- Main explanatory copy uses 16px text, 28px line height, and a 72ch maximum measure. Reagent mechanism text uses 14px/24px and a 44px close control. Chemistry wording and numerical inputs were not changed.
- The existing 1720px desktop container and all localStorage keys remain intact.

## Prüfung

Final verification after the independent-review correction:

- `npm run build`: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed (Git emits existing LF/CRLF notices).
- `npx playwright test`: 111 passed, including the new normal-motion rapid-keyboard regression.
- `node tests/review/m3-layout-polish-verify.mjs`: 11/11 viewports passed, from 320px through 2560px, including short landscape. All five stages and all three reagent dialogs exercised; no page overflow, clipped nav labels, or browser errors.
- Existing review probes passed: module journey, complexing agents, alloy mode, calculator/cell fixes, electrolyte preparation, and complete pre-lab walkthrough.
- Static added-line security scan: no findings.
- Impeccable detector: four advisory raw font-size findings; the touched glyph/number classes were normalized to standard utilities. The detector was not rerun.
- Independent review: no security concern; the reported normal-motion rapid keyboard selection bug was corrected. The `rapid keyboard` test failed before the correction and passed afterward; focus retention and resumed manual scroll tracking are covered.

Evidence and screenshots: `artifacts/m3-layout-polish/`.
Presentation regressions: `tests/e2e/m3-navigation-polish.spec.ts`.
Viewport evidence harness: `tests/review/m3-layout-polish-verify.mjs`.

## Offen

- Changes remain uncommitted, including the earlier five-stage rebuild.
- Evidence-backed readiness/progress remains a separate follow-up. The Ready panel still has pre-existing static preparation checks; this session did not build a completion engine.
- No chemistry-content review, physical-lab authorization, or deployment was performed.
- Impeccable's generated `.impeccable/design.json` is older than DESIGN.md; refreshing it is separate maintenance, not part of this UI pass.

## Ergänzung: interaktive Kodeposition

The animation now has a deterministic, seekable frame model rather than independent infinite CSS loops. Manual pp. 20–24 were re-read before authoring the illustration.

- New CodepositionWorkbench: start/pause, manual checkpoints, keyboard-native timeline, replay, and 0.5x/1x/2x animation speed. It starts paused and retains the final deposit.
- Main cell plus cathode close-up show solution species, reduction, and persistent metal particles. Bi/Sn are distinguishable by label and shape, not color alone. Reaction-focus controls connect Bi, Sn, and hydrogen to the existing balanced half-reactions.
- The bath toggle pauses playback and compares scenarios at the same timeline position. Sn can approach the interface without reducing in the selected uncomplexed scenario; transport is not treated as a mechanical barrier.
- Authored timing, particle counts, spacing and thickness explicitly do not predict composition, mass, efficiency, laboratory duration or crystal structure. Layer allocation excludes non-depositing species so later particles never float over missing underlayers.
- The shared clock freezes offscreen and in hidden documents. Reduced-motion users retain manual checkpoints and scrubbing without continuous spatial animation.
- Existing six cell hotspots, potential explanations, prediction gate and Faraday calculator remain intact. No dependencies added. Old M3-only CSS loops were retired.

Verification: 114 Playwright tests passed; production build, TypeScript, and diff checks passed. The frame probe sampled 121 frames in each bath scenario; real browser samples confirmed electron movement, approximately 2x playback at the 2x setting, offscreen freezing, and persistent final deposits. Controls/comparison/reduced-motion paths passed across six widths (320, 390, 768, 1024, 1440, 1920px), with no browser errors or horizontal overflow. Existing cell-explorer, input-guard and alloy-calculator review probes passed. Static security scan found no matching issues. The direct TypeScript import in the standalone Node probe emits a non-blocking module-type detection warning. Independent source review passed with no blocking issues. Its two suggestions were addressed: species focus now dims nonselected deposits in both views, and the controls probe exercises Enter and Space on all six hotspots from an unselected state. A final parallel suite exposed an existing 400ms sampling race in the page-transition test; that test now waits for hydrated event handlers and the actual transition.ready measurement instead of a fixed delay, without changing its displacement assertion. The final full suite passed again, followed by three parallel repetitions of the repaired transition check.

Evidence: `artifacts/m3-codeposition/` (motion-evidence.json, controls-evidence.json, screenshots, static-scan.json). Component screenshots temporarily hide fixed page chrome to avoid an overlay artifact in tall element captures; DOM geometry assertions run on the unchanged UI.

## Ergänzung: Liganden im Becher

- EDTA and citrate now have symbolic binding markers on representative Sn and Bi species inside the beaker and in the cathode close-up. The markers associate, follow a species, then return to solution after its metal deposits, using the same seekable clock. This is not a claim about protonation, exact coordination structure, speciation, kinetics, or an elementary reduction pathway.
- PEG400 is separately drawn as an approaching/adsorbed surface chain. It remains in both comparison scenarios; the complexant toggle explicitly compares EDTA/citrate rather than removing PEG.
- Three in-beaker agent labels support click, Enter, and Space. Full-sized equivalent buttons provide touch access. The selected agent controls highlights in both views and a contextual detail region, not bath chemistry or elapsed time.
- Agent names, stock formulas, solution origins, and concentrations reuse lib/m3-complexing-agents.ts (manual p.22). The absence notice for EDTA/citrate updates in the no-complexant scenario.
- Playback moved above the diagrams to keep it reachable near the beaker despite the longer explanations. The vessel/close-up provide room for returned ligands; an actual bounds test caught an EDTA glyph crossing the fluid surface, which was corrected.
- Architecture: lib/m3-ligands.ts; BathAgentLayer.tsx; BathAgentDetails.tsx. The shared frame now exposes complexed and zoom positions so overlays do not maintain separate trajectories.

Checks: 118 Playwright tests passed; build, TypeScript and diff checks passed; new agent probe passed 964 deterministic model cases and six viewport cases with five checkpoints each, real ligand movement, pause stability, liquid containment, three-agent details, keyboard/touch access, and scenario switching. Existing cell motion/control/half-reaction/prediction regressions passed. Impeccable detector returned no findings for the changed workbench/layer/detail/scene targets. Screenshots and DOM checks found no overlap or horizontal clipping; full-size duplicate agent controls are intentional touch equivalents.

Evidence: artifacts/m3-beaker-agents/ (evidence.json, screenshots, command logs, static-scan.json). Agent-overlay independent review passed with no blocking issues. Optional follow-ups from the review: make PEG follow local adsorption-site geometry instead of the overall deposit envelope, and add a short selected-agent announcement or jump-to-details link for narrow screens. These are refinements to the explicitly symbolic presentation and existing keyboard-operable controls, not blocked acceptance criteria. Everything remains uncommitted.


