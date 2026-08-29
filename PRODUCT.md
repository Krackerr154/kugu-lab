# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the repository: the primary users are students preparing for practical sessions in Praktikum Kimia Anorganik KI3131 at FMIPA ITB. They need to understand the upcoming procedure, connect theory to physical observations and decisions, rehearse technique and safety choices, and prepare evidence for their practical work.

Inferred secondary users are instructors who review course content and unresolved conflicts found while mapping practical manuals.

## Product Purpose

Inferred from the repository: KUGU Lab is an interactive companion for Praktikum Kimia Anorganik KI3131, Kimia Unsur Golongan Utama. It supports preparation before the physical laboratory session through module briefs, theory, procedure walkthroughs, prediction and analysis activities, structured notebook entries, reports, and safety references.

Success means that a student can identify what to prepare next, understand why the procedure matters, rehearse relevant decisions, record observations and evidence, and recognize when instructor confirmation is still required before entering the physical laboratory.

## Positioning

Inferred from the repository: KUGU Lab is a guided pre-lab preparation workspace organized around learning decisions and evidence rather than a generic content library or dashboard. Its distinctive mechanism is the staged preparation journey: brief, understand, rehearse, prove, and ready, connected to the actual chemistry modules and bench workflow.

## Operating Context

Inferred from the repository: students use KUGU Lab while preparing for six inorganic chemistry practicum modules. The workflow connects qualitative reaction observations, material synthesis, electrodeposition, zeolite synthesis, XRD, TGA, notebook records, data analysis, and report preparation.

The product is used alongside the practicum manual, SOPs, SDS documents, instructor decisions, and physical laboratory work. The application currently stores notebook and preparation state locally in the browser through localStorage.

## Capabilities and Constraints

Inferred from the repository:

- Six module routes are available: M1 reactions, M2 Mg2SnO4, M3 Sn-Bi electrodeposition, M4 zeolite FAU, M5 XRD, and M6 TGA.
- The application provides pre-lab pages, module pages, interactive chemistry workspaces, procedure walkthroughs, structured lab notebooks, report checklists, data-analysis resources, safety/reference material, and an instructor room.
- Existing chemistry notation, interactive logic, safety boundaries, instructor-review warnings, and routes are durable product behavior to preserve during future UI work.
- Digital completion is preparation progress only. It must not imply authorization to work independently or replace physical technique, SOPs, SDS documents, or instructor judgment.
- Unresolved content conflicts identified from practical manuals require instructor review before content is treated as final or published.
- The current progress model is browser-local through localStorage; account-based persistence and instructor visibility are not established product capabilities.

## Evidence on Hand

Repository evidence includes the six module routes under `app/modules/`, pre-lab routes under `app/prelab/`, shared interactive and notebook components under `components/`, module and conflict data under `lib/`, and the product direction documented in `UI_REBUILD_PLAN.md`.

The repository references the Penuntun Praktikum Anorganik KI3131, FMIPA ITB, Semester 1 2025/2026. It also explicitly states that KUGU Lab is not a replacement for SOPs, SDS, instructor decisions, or physical laboratory work.

No user-provided testimonials, customer metrics, deployment claims, or independent outcome evidence are established. Future work must not fabricate them.

## Product Principles

- Prepare students for the real physical laboratory scene.
- Separate observation, interpretation, and the evidence needed to support an interpretation.
- Ask students to predict or decide before revealing explanations where the learning task benefits from retrieval.
- Treat safety and instructor hold points as part of the workflow.
- Make digital completion mean preparation, never authorization or replacement of hands-on work.
