# KUGU Lab UI Rebuild Plan

**Status:** Visual-system migration implemented; verification complete
**Product:** KUGU Lab, interactive companion for Praktikum Kimia Anorganik KI3131, FMIPA ITB
**Primary audience:** Students preparing for chemistry practicum
**Primary goal:** Help students understand what they will do, why they will do it, what they should observe, what can go wrong, and whether they are ready to enter the physical laboratory.

---

## 1. Product Direction

KUGU Lab should become a guided pre-lab preparation workspace, not a generic dashboard, content library, game, or replacement for hands-on laboratory work.

The central experience is a staged learning journey:

1. Brief: What will I do?
2. Understand: What theory explains it?
3. Rehearse: How do I perform the procedure and make decisions?
4. Prove: Can I predict, observe, explain, and act safely?
5. Ready: What have I completed, and what still needs instructor confirmation?

The core UI unit is a learning decision rather than a decorative card:

- Add this reagent
- Predict this observation
- Identify this ion
- Explain this equation
- Choose this safety action
- Record this evidence

The redesign must preserve the existing chemistry content, routes, interactive logic, chemical notation, safety boundaries, and instructor-review warnings.

## 2. Research Basis

Chemistry pre-lab research identifies three preparation jobs: conceptual preparation, technique preparation, and affective preparation. It also recommends separating supportive information given in advance from procedural information delivered just before an action.[19]

A chemistry pre-lab program combining demonstration videos with compulsory e-quizzes moved more analytical thinking into the pre-lab phase and reduced the likelihood of cognitive overload at the beginning of class. It improved perceived preparedness, but did not improve laboratory-report academic performance.[12]

Online preparation videos paired with questions resembling later data analysis were valued as part of a portfolio of preparation resources and improved comfort with laboratory equipment, although some outcomes were perception-based.[13]

A simulated chemistry pre-lab encouraged students to ask more theoretical questions during the real laboratory activity and use chemistry knowledge more correctly and complexly.[2]

A flipped chemistry laboratory model using procedure videos and pre-lab questions was associated with better understanding of theory, better handling of complex steps, less anxiety, and improved work efficiency.[14]

Simulation research also warns that simulations complement rather than replace hands-on equipment and physical technique.[6]

Retrieval practice supports asking students to produce or select an answer before showing the explanation.[20][23]

The UI should favor recognition and contextual cues early, then progress toward independent recall and explanation.[22]

Animations must be purposeful, replayable, pauseable where appropriate, and respectful of reduced-motion preferences.[16][17]

These findings guide the design. They are not a claim that the rebuilt product will automatically improve grades or practical performance. Those outcomes require local evaluation.

## 3. Experience Principles

### 3.1 Prepare students for the real scene

Every page should connect theory to a physical action, observation, instrument, material, or decision in the upcoming practicum.

### 3.2 Separate observation from interpretation

Students must learn the difference between:

- Observation: what is visibly or measurably present
- Interpretation: what the observation may mean chemically
- Evidence requirement: what additional test supports the interpretation

This is especially important for M1 qualitative ion identification.

### 3.3 Ask before revealing

The system should pause before reagent additions, equipment choices, observation classification, branching decisions, and data interpretation. Students predict first; the interface then reveals the expected result and explanation.

### 3.4 Use progressive support

Start with recognition and guided choices. Progress toward choosing the next step, explaining why, writing equations, and interpreting data independently.

### 3.5 Treat safety as part of the workflow

Safety is not a footer or a generic warning. It must appear at the relevant step and block progression when the local procedure requires acknowledgment or instructor confirmation.

### 3.6 Completion means digital preparation, not authorization

The final state may say the student completed digital preparation. It must not imply that the student is authorized to work independently or that KUGU replaces SOPs, SDS documents, or instructor judgment.

### 3.7 Keep the interface calm and operational

The visual language should feel like a clean laboratory notebook and instrument console used before entering the bench:

- Precise
- Calm
- Structured
- Serious about safety
- Supportive rather than intimidating
- Dense enough for repeated study
- Clear for first-time laboratory students

Avoid marketing-style hero layouts, excessive decorative cards, game-like reward systems, generic dashboard metrics, and animation without instructional purpose.

## 4. Information Architecture

### Primary student navigation

- Home
- My Preparation
- Modules
- Notebook
- Data Analysis
- Safety & References

### Secondary or instructor-oriented navigation

- Reports
- Instructor Room

The current routes should remain available. Navigation hierarchy may change without deleting routes.

### Module-local navigation

Every module should expose a consistent local progress rail or step selector:

1. Brief
2. Understand
3. Rehearse
4. Prove
5. Ready

Desktop: persistent local rail or compact vertical progress navigation.

Mobile: sticky compact progress bar with a step selector or horizontally scrollable stage control.

The current stage must expose:

- Active location
- Completed stages
- Locked stages
- Next action
- Block reason, when applicable

## 5. Dashboard Direction

The dashboard should answer one question immediately: “What should I prepare next?”

### First viewport

Show:

- Current or recommended module
- Preparation status
- Next unfinished stage
- Estimated remaining time
- One clear Continue preparation action
- Immediate safety or prerequisite message when relevant

Example content structure:

> M1 — Reaksi Golongan Utama
> Preparation status: 2 of 5 sections complete
> Next: Rehearse reagent sequence
> Estimated remaining time: 35 minutes
> Continue preparation

### Module map

Group the six modules by educational progression:

- Observe and explain: M1
- Synthesize materials: M2–M4
- Characterize materials: M5–M6
- Integrate evidence: cross-module work

Each module item should show:

- Module number and title
- Practical purpose
- Theory focus
- Preparation status
- Estimated time
- Safety state
- Next action

### Secondary dashboard content

Place below the learning journey:

- Notebook and report shortcuts
- Data analysis resources
- Reference materials
- Assessment overview
- Instructor content-review status

The current unresolved-conflict data remains important, but student-facing copy should explain only what affects the student. Detailed editorial conflicts belong in Ruang Pengajar.

## 6. Module Page Direction

Every module page should use the same content architecture while allowing discipline-specific interactives.

### Section A: Brief

Include:

- Plain-language purpose
- Physical actions the student will perform
- Expected duration
- Manual page reference
- Sample lineage
- Expected output or evidence
- Primary safety boundary

### Section B: Understand

Use short theory units. Each unit should contain:

- Concept statement
- Chemical notation or diagram
- Worked example
- Relevance to the physical procedure
- One retrieval or prediction check
- Optional glossary support

Avoid large uninterrupted theory paragraphs. Use progressive disclosure for detailed explanations.

### Section C: Rehearse

Use the existing `ProcedureWalkthrough` and module-specific interactive components as the implementation foundation.

Each step should expose:

- Action
- Equipment and material
- Rationale
- Safety note
- Expected observation
- Common error or contamination risk
- Hold point, when applicable
- Estimated time
- Next decision

### Section D: Prove

Evaluate distinct skills separately:

- Conceptual knowledge
- Procedural sequence
- Observation quality
- Safety behavior
- Chemical reasoning
- Data interpretation

Use task-specific checks rather than one overall score.

### Section E: Ready

Show a readiness summary:

- Theory completed
- Procedure rehearsed
- Safety gate passed
- Questions answered
- Notebook or pre-lab journal prepared
- Items requiring instructor confirmation

The final state should remain honest about what the digital experience cannot verify physically.

## 7. Module-Specific Priorities

### M1 — Reaksi Golongan Utama

Make M1 the reference implementation for the new module system.

Required learning interactions:

- Solubility and precipitation explanation
- Group reagent sequence
- Observation versus inference classification
- Prediction before HCl or other reagent addition
- Unknown-ion decision tree
- Net ionic equation construction
- Heavy-metal waste and H2S safety gates
- Evidence trail from observation to conclusion

### M2 — Fotokatalis Mg2SnO4

Prioritize:

- Synthesis timeline
- Sonochemistry explanation
- pH and yield log
- Conductivity and band-gap worksheet
- Absorbance-versus-time interpretation
- UV, furnace, chemical, and powder safety states

### M3 — Elektrodeposisi Sn-Bi

Prioritize:

- Interactive cell anatomy
- Anode/cathode distinction
- Electrolyte preparation sequence
- Preparation checklist
- Current-efficiency calculation
- Power-supply and chemical safety

### M4 — Zeolit FAU

Prioritize:

- Precursor stoichiometry
- Composition-temperature-time reasoning
- Crystallization timeline
- Isolation and drying procedure
- Hydrothermal vessel safety and unresolved manual constraints

### M5 — XRD

Prioritize:

- Bragg-law sandbox
- Peak recognition and selection
- FWHM and Scherrer calculation
- Crystal versus amorphous interpretation
- Reference-pattern comparison
- Data provenance and instrument safety

### M6 — TGA

Prioritize:

- Instrument run preparation
- Synchronized TG/DTG interpretation
- Mass-loss-region annotation
- Onset and inflection reasoning
- Thermal stability and decomposition mechanism
- Furnace, crucible, nitrogen, and gas hazard states

## 8. Implementation Phases

### Phase 1: Shared learning shell

Files likely to change:

- `app/layout.tsx`
- `app/globals.css`
- `components/layout/Navigation.tsx`
- `components/layout/AppHeader.tsx`
- `components/layout/ModuleLayout.tsx`
- New shared progress/readiness components under `components/shared/`
- `lib/modules.ts` only where additional progress metadata is required

Deliverables:

- Student-focused navigation
- Responsive mobile navigation
- Global design tokens and typography
- Module-local stage navigation
- Shared status, safety, and readiness patterns
- No loss of existing route access

### Phase 2: Dashboard rebuild

Files likely to change:

- `app/page.tsx`
- New dashboard-specific components under `components/shared/` or `components/dashboard/`
- `lib/modules.ts` for module presentation data only

Deliverables:

- Next-action first viewport
- Preparation progress model
- Educational module map
- Lower-priority resources and assessment sections
- Student-appropriate instructor warning treatment

### Phase 3: M1 reference module

Files likely to change:

- `app/prelab/m1-reactions/page.tsx`
- `components/shared/ProcedureWalkthrough.tsx`
- `components/interactives/M1LabRehearsal.tsx`
- `components/interactives/ReactionExplorer.tsx`
- New theory and readiness components as required

Deliverables:

- Brief / Understand / Rehearse / Prove / Ready structure
- Better separation of theory and procedure
- Prediction-before-reveal behavior
- Observation versus inference workflow
- Explicit safety hold points
- Honest completion state

### Phase 4: Replicate the module pattern

Files likely to change:

- `app/modules/m2-mg2sno4/page.tsx`
- `app/modules/m3-sn-bi-electrodeposition/page.tsx`
- `app/modules/m4-zeolite-fau/page.tsx`
- `app/modules/m5-xrd/page.tsx`
- `app/modules/m6-tga/page.tsx`
- Existing interactive workspaces for each module

Deliverables:

- Consistent student journey
- Module-specific theory units
- Module-specific procedural rehearsal
- Module-specific evidence checks
- Consistent readiness summaries

### Phase 5: Cross-module evidence flow

Files likely to change:

- `app/notebook/page.tsx`
- `app/analisis/page.tsx`
- `app/laporan/page.tsx`
- `components/shared/LabNotebook.tsx`
- `components/shared/ScientificChart.tsx`
- Cross-module data utilities under `lib/`

Deliverables:

- M2/M3/M4 synthesis outputs connect to M5/M6 analysis
- Notebook records preserve evidence and provenance
- Report preparation uses completed learning artifacts
- Students can see how synthesis leads to characterization and interpretation

## 9. Technical Constraints

- Preserve Next.js 16, React 19, TypeScript, Tailwind CSS v4, ECharts, and KaTeX unless a clear implementation blocker appears.
- Preserve App Router routes and existing module URLs.
- Preserve explicit chemical notation markup such as `_{}` and `^{}` through `ChemText`.
- Keep client-only interactivity in client components.
- Avoid adding a backend or database unless the user explicitly expands scope.
- Use browser `localStorage` for the current notebook/progress model unless persistence requirements change.
- Preserve the existing dirty worktree; do not revert unrelated changes.
- Keep the app usable without animation and respect `prefers-reduced-motion`.
- Keep safety wording subordinate to approved local SOP/SDS and instructor review.

## 10. Verification Plan

### Build and code checks

Run from `E:/Project_G-Labs/KUGU-prak/kugu-lab`:

```bash
npm run build
npx tsc --noEmit
git diff --check
```

Expected:

- Build succeeds
- TypeScript succeeds
- No whitespace errors

### Route checks

Verify HTTP 200 for:

- `/`
- `/modules`
- `/prelab`
- `/prelab/m1-reactions`
- `/modules/m1-reactions`
- `/modules/m2-mg2sno4`
- `/modules/m3-sn-bi-electrodeposition`
- `/modules/m4-zeolite-fau`
- `/modules/m5-xrd`
- `/modules/m6-tga`
- `/notebook`
- `/analisis`
- `/laporan`
- `/referensi`
- `/pengajar`

### Browser checks

At minimum inspect desktop and mobile viewports:

- Dashboard first viewport
- M1 pre-lab first viewport
- M1 walkthrough interaction
- Mobile navigation open/close
- Keyboard focus and Escape behavior
- No horizontal overflow
- One meaningful page heading per route
- Distinct navigation landmarks
- All form controls labelled
- Reduced-motion behavior
- Console errors and hydration warnings

### Learning-flow checks

For M1, verify that a student can:

- Understand the practical purpose
- Read the relevant theory
- Predict an observation before reveal
- Select the next reagent or procedure step
- Distinguish observation from interpretation
- Answer a net ionic equation question
- Encounter a real safety hold point
- Reach a readiness summary without being told they are independently authorized

## 11. Risks and Open Decisions

### Risks

- Rebuilding the visual shell without improving the learning sequence would create cosmetic change only.
- A single progress percentage may conceal weak safety or reasoning performance.
- Overly long theory pages can recreate the cognitive-load problem the redesign is intended to solve.
- Animation can become decorative or inaccessible if it is not paired with static explanations.
- Manual inconsistencies must remain visible to instructors without confusing students or silently turning uncertain procedures into authoritative instructions.
- Existing module content may require content review before being presented as final student guidance.

### Open decisions before implementation

1. Should progress be stored only locally, or should KUGU later support student accounts and instructor visibility?
2. Should the dashboard show one recommended next action or allow students to freely choose modules?
3. Which M1 content is approved for student-facing publication, and which remains explicitly provisional?
4. Should the primary language remain Indonesian with English technical terms, or should a bilingual mode be planned?
5. Which procedure visuals should be authored as diagrams, and which should be represented through interactive HTML/CSS components?
6. What local SOP/SDS requirements must be confirmed before each safety gate is considered complete?

## 12. Definition of Done

The rebuild is not complete until:

- The dashboard makes the next preparation action obvious within seconds.
- Each module has a consistent five-stage learning structure.
- M1 demonstrates the full pattern from theory to readiness.
- Students predict and explain before seeing key answers.
- Observation and interpretation are explicitly separated.
- Safety gates appear at the point of relevant action.
- The interface works on desktop and mobile.
- Reduced-motion users receive equivalent information.
- Existing routes and chemistry interactives continue to work.
- Build, TypeScript, route, browser, accessibility, and console checks pass.
- The final UI does not claim to replace physical lab training, SOPs, SDS documents, or instructor judgment.

## Sources

[2] https://doi.org/10.1002/tea.20217
[6] https://phet.colorado.edu/en/research
[12] https://eric.ed.gov/?id=EJ1119563
[13] https://doi.org/10.1039/D0RP00240B
[14] https://doi.org/10.1039/C4RP00003J
[16] https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
[17] https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
[19] https://doi.org/10.1039/C7RP00140A
[20] https://doi.org/10.1037/a0037559
[21] https://www.cast.org/resources/tips-articles/udl-guidelines-3-0-a-community-driven-research-based-process-toward-fulfilling-the-promise-of-universal-design-for-learning
[22] https://www.nngroup.com/articles/recognition-and-recall
[23] https://www.retrievalpractice.org/strategies
