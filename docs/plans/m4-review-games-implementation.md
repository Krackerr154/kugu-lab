# M4 Review Games ("Cek Pemahaman") — Implementation Plan

**Status:** Plan drafted. Ready for review and execution.
**Scope:** Interactive quiz/game experience on Slide 10 of Modul 4 (Sn–Bi Electrodeposition) for both live guided sessions and solo self-study.
**Authoritative Curriculum Reference:** *Modul Praktikum KUGU 2025*, `cohort-concept-check.md`, `lib/m4-games.ts`.

---

## 1. Executive Summary & Intent

The review session game is a **diagnostic and reinforcement activity ("seru-seruan")** conducted immediately after the assistant walks through the review slides. It tests mental models and key practicum concepts before students write their formal lab reports.

### Confirmed Principles (Locked by Course Assistant)
1. **Post-Review Placement:** Sits on Slide 10 (the closing slide) after the 100-point report rubric.
2. **Individual Scoring with Prize:** Small prize (snack/camilan) for the top scorer. At 12 students per session, group-level masking is unnecessary; individual stakes drive high engagement.
3. **No Speed Penalty:** Speed-scoring incentivizes guessing. Pacing is controlled by the assistant, but zero points depend on reaction time.
4. **Certainty-Based Marking (CBM):**
   - **Yakin:** +3 correct, −2 wrong
   - **Ragu:** +2 correct, −1 wrong
   - **Tebak:** +1 correct, 0 wrong
   *Why this works:* Staking "Yakin" is only mathematically optimal when confidence > 50%. Honest ignorance ("Tebak") is never penalized, while confident misconceptions are exposed.
5. **Private Ranks, Top 3 Podium:** No live floating leaderboard while answering. The leaderboard is revealed only at the very end and displays Top 3 only. Every other student sees only their private score and accuracy badge.
6. **Tie-Break via Sudden Death:** In the event of a tie for 1st place, a single sudden-death question is drawn at random from the 3 reserved questions.

---

## 2. Current State Audit

### What is Already Built & Working:
- **Core Chemistry & Logic (`lib/m4-games.ts`):**
  - 8 curriculum-approved questions (Sn-Bi alloy rationale, ΔE° potential gap, ammonia/EDTA sequence, HCl role, Q=I·t calculation, >100% current efficiency diagnostics, dendritic growth / PEG400 levelling, report weighting).
  - Pure CBM scoring functions (`scoreAnswer`, `CONFIDENCE_POINTS`).
  - Round generator (`selectRound`: 5 played, 3 reserved for sudden death).
  - Public question sanitizer (`toPublicQuestion`: strips correct answer index).
- **Server Store & State Machine (`lib/server/m4-games-store.ts`):**
  - Room-keyed in-memory session: `lobby` → `question` → `revealed` → `next` → `finished` → `sudden-death`.
  - First-write-wins answer collection, distribution aggregator, tie detector.
  - Comprehensive unit test suite (`tests/unit/m4-games.test.mjs`, 49 tests passing).
- **HTTP API Routes:**
  - `GET /api/m4-guided/games`: Asprak control data (live answer count, distribution, correct answer).
  - `POST /api/m4-guided/games`: Asprak actions (`start`, `next`, `reveal`, `sudden-death`, `end`).
  - `POST /api/m4-guided/games/join`: Student registration via display name (NIM stays private!).
  - `POST /api/m4-guided/games/answer`: Token-gated answer submission.
  - `GET /api/m4-guided/games/state`: Student polling endpoint (2s interval).
- **Existing Components:**
  - `ReviewGames.tsx`: Student quiz card.
  - `AsprakGamesPanel.tsx`: Assistant game dashboard.

### Existing Gaps to Resolve:
1. **Solo / Practice Mode Gap:** On Slide 10, `{currentSlide.embeddedComponent === "games" && roomId && ...}` renders **nothing** if `roomId` is empty (e.g. self-study). Students outside a live room need a standalone practice quiz mode.
2. **Mobile Landscape Density:** In `SlideDeckCanvas`, Slide 10 currently retains the 50% left-column bullet points, forcing the game into a cramped 350px-wide right column. In compact landscape viewports (852×393, ~191px card height), options and confidence buttons overflow vertically.
3. **Stage Layout Transformation:** During active gameplay, Slide 10 should transition into a full-width focus canvas (similar to Slides 7, 8, and 9) with questions on the left and a 2×2 option grid + inline confidence buttons on the right.
4. **Visual & Celebration Polish:** Podium reveal on finish, explanation cards on reveal, and clear transition states for sudden death.

---

## 3. Implementation Phases

### Phase 1: Solo Practice Mode & Fallback Architecture
- **Objective:** Ensure Slide 10 works gracefully in all modes (solo practice vs live guided session).
- **Implementation:**
  - If `roomId` is present and active: mount `<ReviewGames roomId={roomId} />` (live multiplayer).
  - If in solo mode (`!roomId`): mount `<SoloPracticeGames />` allowing students to play through 5 randomized questions locally with the same CBM scoring and immediate feedback.
  - Clean mode toggle so an assistant opening a room seamlessly upgrades connected students to multiplayer.

### Phase 2: Full-Width Responsive Game Canvas (Mobile Landscape First)
- **Objective:** Eliminate vertical scrollbars on landscape mobile (852×393) and maximize clarity.
- **Implementation:**
  - In `SlideDeckCanvas`, when `currentSlide.embeddedComponent === "games"` and gameplay is active:
    - Omit the static left bullet list, expanding the game panel to full container width (`w-full h-full`).
    - Two-column landscape layout:
      - **Left (45%):** Question metadata, topic pill, full question prompt, progress indicator (`Soal X/5`), live answer counter (`X/12 praktikan`).
      - **Right (55%):** 2×2 compact option buttons (A, B, C, D) + horizontal 3-pill confidence selector (Yakin, Ragu, Tebak) + submit action.
    - Compact card height strictly ≤ 189px without scrollbars.
  - Portrait mobile layout: single-column vertical flow with responsive touch targets (≥44px height).

### Phase 3: Assistant Control & Realtime Misconception Map
- **Objective:** Empower the assistant to diagnose and discuss misconceptions before revealing answers.
- **Implementation:**
  - In `PresenterConsole` Slide 10 dock:
    - Live answered counter (`12/12 Menjawab`).
    - "Buka Distribusi": shows anonymous bar breakdown (e.g., A: 2, B: 8, C: 2, D: 0) so the assistant can say *"Banyak yang terkecoh di B, mari kita lihat..."*.
    - "Buka Jawaban & Pembahasan": triggers reveal state across all student devices.
    - "Soal Berikutnya" / "Selesaikan Kuis".

### Phase 4: Podium Reveal, Explanation Cards & Sudden Death
- **Objective:** Exciting, non-toxic conclusion.
- **Implementation:**
  - **Reveal State:** Green border on correct option, red on user's wrong option. Lightbulb explanation card highlighting the core chemical principle.
  - **Finish Podium:** Top 3 podium cards (Gold, Silver, Bronze badges) displaying display names and scores.
  - **Individual Calibration:** Personal card: *"Skor Anda: X pt"* + calibration analysis (e.g. *"Akurasi Tinggi: 4/5 Yakin terbukti benar"* or *"Jujur: Tepat menggunakan Tebak pada soal sulit"*).
  - **Sudden Death:** Automatic banner if 1st place has a tie; assistant clicks "Mulai Sudden Death" to draw 1 question from the 3 unused pool questions.

---

## 4. Verification & Testing Protocol

1. **Unit Tests:** `node --test tests/unit/m4-games.test.mjs` (scoring, shuffling, sanitization).
2. **Browser Interaction Test (`browser_exec`):**
   - Solo mode practice flow at 393×852 (portrait) and 852×393 (landscape).
   - Dual-tab multiplayer relay test: Presenter Console controls -> Student follower answers with Yakin/Ragu/Tebak -> Reveal -> Podium.
   - Verify zero horizontal and vertical scrollbars inside `.m4-deck-panel` on mobile landscape.
3. **Build & Typecheck:** `npx tsc --noEmit` and `npm run build`.
