# M4 Electrolyte Function Card Polish Plan

Goal: Make the complete electrolyte section easier to scan and more engaging while preserving the approved Module 4 recipe, quantities, formulas, safety boundaries, and responsive behavior.

Current surface: `components/interactives/ElectrolyteFunctionCard.tsx`, rendered below the M4 deposition animation in `CodepositionWorkbench.tsx`. Source data remains in `lib/m3-electrolyte.ts` and `lib/m3-complexing-agents.ts`.

## Proposed structure

1. Summary strip
   - Final volume: 100 mL.
   - Target pH: approximately 2.
   - Three preparation streams: A, B, C.
   - A short note that all listed molarities use the final 100 mL basis.

2. Functional grouping
   - Larutan A — “Persiapan pengompleks”
     - H₂O: initial solvent.
     - NH₃ concentrated: helps EDTA dissolve/deprotonate during A preparation.
     - EDTA: strong complexing agent for Sn/Bi effective-potential control.
   - Larutan B — “Sumber ion logam”
     - H₂O: initial solvent.
     - HCl concentrated: acidic medium and hydrolysis boundary.
     - SnCl₂·2H₂O: Sn²⁺ source.
     - Bi(NO₃)₃·5H₂O: Bi³⁺ source.
   - Larutan C — “Pengompleks pendamping”
     - H₂O: initial solvent.
     - HCl: maintains acidic medium.
     - Citric acid: secondary complexing agent and composition/morphology contributor.

3. Reagent role chips
   - Add consistent role labels to every reagent: `Pelarut`, `Pengatur keasaman`, `Sumber Sn`, `Sumber Bi`, `Pengompleks`, or `Aditif permukaan`.
   - Keep the role copy sourced from the existing electrolyte data; do not add unsupported speciation or mechanism claims.

4. Post-mixing sequence
   - Turn the existing A+B+C addition order into a numbered horizontal step rail on desktop and a stacked disclosure/list on mobile:
     1. A → B.
     2. A+B → C.
     3. PEG400 to final 0,20 M.
     4. NH₃ concentrated 0,5 mL.
     5. Dilute to 100 mL.
     6. Check and record pH ~2.
   - Each step displays one concise “why” line when opened.
   - Keep the volume budget and protocol current/time as a compact footer, not a competing card wall.

5. Engagement and hierarchy
   - Make each solution a clear phase group with a strong header, volume badge, purpose, and reagent rows.
   - Use a selected group/step state to reveal details rather than showing all explanatory paragraphs at equal weight.
   - Use existing Academic Precision tokens and Material Symbols only; no gradients, rainbow colors, or decorative animation.
   - Preserve formulas through `ChemText` and keep controls at touch-safe sizes.

## Files

- Modify: `components/interactives/ElectrolyteFunctionCard.tsx` — restructure markup and interactions.
- Modify: `lib/m3-electrolyte.ts` — add only typed presentation metadata (`groupLabel`, `roleLabel`, and concise step rationale) where it removes duplicated UI copy.
- Modify: `components/interactives/CodepositionWorkbench.tsx` only if the card’s placement or focus handoff needs adjustment.
- Add/update: `tests/review/m4-electrolyte-card-verify.mjs` — assert all reagents, grouped phases, addition order, role labels, and the no-overflow boundary.

## Verification plan

- Browser tool first: inspect the live M4 card at 390×844 and desktop width; verify group hierarchy, expanded step state, formulas, no horizontal overflow, and no console errors.
- TypeScript and production build.
- Run the new standalone review probe only after the UI is approved.
- Do not change the electrolyte quantities or deploy as part of this polish pass.
