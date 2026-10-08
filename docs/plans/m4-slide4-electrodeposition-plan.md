# Implementation Plan — Slide 4: "Apa itu Elektrodeposisi?"

**Document:** `docs/plans/m4-slide4-electrodeposition-plan.md`  
**Status:** Plan ready for user review. No application code altered yet.  
**Scope:** Transform Slide 4 (`p4`) in the 17-slide review deck from a plain 3-bullet text slide into a definition and schematic electrodeposition cell diagram.

---

## 1. Context & Objectives

Currently, Slide 4 (`p4`) is titled *"Bagaimana Arus Membentuk Lapisan"* and contains 3 generic bullets without an embedded visual.
The user requested:
1. Change Slide 4 title to **"Apa itu Elektrodeposisi?"**
2. Content must provide the **formal academic definition of electrodeposition**.
3. Include an **interactive/schematic diagram of the electrodeposition process** (two-electrode DC cell, electron flow, ion migration, and cathode deposit formation).

---

## 2. Pedagogical & Chemistry Content (KI3131 Modul 4 Fidelity)

### 2.1 Slide Metadata
- **Slide ID:** `p4`
- **Chapter:** `understand` (*Pembahasan*)
- **Chapter Label:** `Pembahasan`
- **Slide Label:** `Definisi elektrodeposisi`
- **Slide Title:** `Apa itu Elektrodeposisi?`
- **Rubric Badge:** `Poin f.1 (35 pt)` — *Deskripsi Proses Sintesis & Prinsip Elektrodeposisi*

### 2.2 Takeaway Bullets (Formal Academic Indonesian)
1. **Definisi:** Pengendapan lapisan tipis padat (logam atau paduan) pada permukaan elektroda (katoda) melalui reduksi kation dari elektrolit yang dialiri arus listrik searah (DC).
2. **Reaksi Katoda:** Elektron mereduksi kation logam di batas fasa: $M^{n+} + n e^- \rightarrow M^0$ (membentuk deposit paduan $Sn–Bi$ pada substrat plat $Cu$).
3. **Komponen Inti:** Terdiri dari katoda kerja ($Cu$), anoda lawan inert ($C$), medium elektrolit pembawa ion ($Sn^{2+}, Bi^{3+}$), dan catu daya DC eksternal.

### 2.3 Script & Pedagogical Notes
- **Script:** *"Elektrodeposisi pada dasarnya adalah proses pelapisan material secara elektrokimia. Arus searah (DC) menyuplai elektron ke katoda plat Cu kalian, sehingga kation timah dan bismut di larutan tereduksi dari fasa cair menjadi lapisan paduan padat di permukaan elektroda."*
- **Pedagogical Note:** Menekankan bahwa elektrodeposisi membutuhkan 4 komponen serentak: katoda (tempat reduksi), anoda (tempat oksidasi), larutan elektrolit (penghantar ionik), dan sirkuit eksternal DC (penyedia elektron).

---

## 3. Diagram Specification (`ElectrodepositionDiagram.tsx`)

A dedicated, responsive SVG/HTML component following Academic Precision design tokens:
- **Design Tokens:** `--surface`, `--surface-container-low`, `--outline-variant`, `--primary`, `--chart-navy`, `--chart-gold`, `--secondary`.
- **Anatomy Illustrated:**
  1. **External DC Circuit (Top):**
     - DC Power Supply box with (+) and (-) polarity terminals.
     - External wiring with directed electron flow ($e^-$ arrows) from Anode (+) to Cathode (-).
  2. **Electrochemical Beaker (Middle/Bottom):**
     - Beaker silhouette with electrolyte liquid bath (subtle tint).
     - **Anode (+, Left):** Inert Carbon Rod ($C$) with label *"Anoda Karbon (inert)"*.
     - **Cathode (-, Right):** Copper Plate ($Cu$) with label *"Katoda Plat Cu (aktif)"*.
     - **Surface Deposit Layer:** Visual $Sn–Bi$ alloy deposit film forming along the immersed face of the Cu cathode.
     - **Electrolyte Solution:** Cation markers ($Sn^{2+}$ in navy, $Bi^{3+}$ in gold) migrating toward the cathode with migration vector arrows.
  3. **Reaction Badges (Bottom/Footer of diagram):**
     - Cathode reaction callout: $M^{n+} + ne^- \rightarrow M^0$ *(Reduksi & Deposisi)*.
     - Anode reaction callout: $2H_2O \rightarrow O_2 + 4H^+ + 4e^-$ *(Oksidasi)*.

---

## 4. Architecture & File Changes

| File | Change Scope |
|---|---|
| `components/interactives/ElectrodepositionDiagram.tsx` | **NEW:** Compact, responsive schematic diagram of the DC electrodeposition cell. |
| `lib/m4-review-deck-data.ts` | Update `p4` title, bullets, script, and set `embeddedComponent: "electrodeposition-diagram"`. Add `"electrodeposition-diagram"` to `EmbeddedComponentType`. |
| `lib/m4-review-slides.ts` | Update `p4` title and label for consistency with review slide catalog. |
| `components/presentation/SlideDeckCanvas.tsx` | Add renderer for `currentSlide.embeddedComponent === "electrodeposition-diagram"`. |
| `components/presentation/PresenterConsole.tsx` | Add preview render block for `currentSlide.embeddedComponent === "electrodeposition-diagram"`. |
| `tests/unit/m4-review-deck-data.test.mjs` | Update assertion for `p4.embeddedComponent === "electrodeposition-diagram"`. |

---

## 5. Responsive & Layout Budget

- **Landscape Viewports (~393px height, e.g. iPhone 14 Pro 852x393):**
  - Uses existing `.m4-deck-split:has(.m4-deck-panel)` two-column CSS grid.
  - Left column: 3 takeaway definition bullets styled at ~12px compact density with hanging colons.
  - Right column: `ElectrodepositionDiagram` wrapped in `.m4-deck-panel` with clean SVG aspect ratio (~200px height), fitting within the `calc(100vh - 12.625rem)` frame with zero card overflow or scrollbars.
- **Portrait Viewports (e.g. 393x852):**
  - Single-column stacked layout: Definition card followed by the diagram card.
  - Full touch targets and readable labels.

---

## 6. Verification Plan

1. **TypeScript Check:** `npx tsc --noEmit` must remain 100% clean (0 errors).
2. **Unit Tests:** `node --test tests/unit/*.test.mjs` (all 48 tests pass).
3. **Relay Contract Tests:** `node --test relay/test/*.test.mjs` (all 13 tests pass).
4. **Browser Verification via `browser_exec`:**
   - Verify Slide 4 renders with the new title, definition bullets, and diagram.
   - Test iPhone 14 Pro landscape (852x393): zero card scrollbars, zero page overflow, proper colon alignment.
   - Test portrait (393x852): clean vertical flow without collision.
   - Verify Slide 4 preview inside `PresenterConsole`.
5. **Production Build:** `npm run build` succeeds cleanly.
