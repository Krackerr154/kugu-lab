# Cohort Concept Check ("Cek Pemahaman Beregu") — Design Spec

**Status:** Planned / deferred. Not implemented.
**Scope:** Extends the existing M3/M4 guided-learning (co-presenter) system.
**Decision owner:** Gerald.

---

## 1. Intent

A live, cohort-wide concept check run by the assistant during guided learning.
Interaction speed of a Quizizz round, but the *competitive* layer is relocated
away from the individual so it does not damage the students who most need the
pre-lab.

It is a **diagnostic instrument first**, an engagement device second. The output
the assistant actually needs is: *who is confidently wrong?* — because those
students will carry a broken mental model into the lab.

### Explicit non-goals

- Not graded, not attendance, not evidence of lab readiness.
- Not a public individual ranking.
- Not speed-scored.
- Not a replacement for the assistant's judgement or the SOP.

---

## 2. Research base

### Gamified quizzing works

| Source | Finding |
|---|---|
| ACM 2022 meta-analysis (Kahoot vs Quizizz) | Effect sizes **0.655** (Kahoot) / **0.775** (Quizizz), p<0.001. Quizizz slightly ahead. |
| Özdemir, *J. Computer Assisted Learning* (43 studies, ~3,350 students) | **0.772** on achievement; **1.492** on knowledge retention. |
| CBE—Life Sciences Education (n=694 + n=60, two universities) | Non-graded Kahoot rated *less* stressful than 20+ other classroom activities. Lower-performing students reported the largest engagement gain. |

> **Conflict of interest:** the 0.72 / 0.772 figures come from meta-analyses
> commissioned by Kahoot. The independent ACM analysis is the more trustworthy
> magnitude. Direction is consistent across both; treat the size as inflated.

### Competition damages the bottom of the distribution

| Source | Finding |
|---|---|
| Hanus & Fox 2015 (semester-long, controlled) | Badges + leaderboard → **lower** intrinsic motivation, satisfaction, *and* final exam scores than ungamified control. Worse, not neutral. |
| 2023 systematic review, leaderboards in education | Effects are **position-dependent**: help the top, reliably hurt the bottom, who disengage. Class averages hide this. |
| 2024 longitudinal study, higher-ed online course | Leaderboard **decreased** motivation. |
| 5-month Kahoot classroom trial | **59%** of low-performing students disliked competitive mode. Their test scores were slightly *lower* after competitive treatment and slightly *higher* after team treatment. Competitive mode nonetheless had the highest raw engagement (85% vs 77% team vs 72% no-score). |
| Same study, quiet high-achiever interview | *"I don't like them because it's embarrassing when you get it wrong."* |
| Motivation literature | Negative feedback harms intrinsic motivation **more than no feedback at all**. |
| Four separate papers | Speed-scored points cause **guessing**. |
| Wang & Lieberoth | Kahoot *without* points and audio produced the **worst** outcome — stripping all game elements also fails. |

### The design conclusions

1. The ranking is not the active ingredient — **feedback is**. "Leaderboards
   without meaningful feedback are just a list of names."
2. Competition must be relocated from the individual to the **team**, and from
   **speed** to **calibrated confidence**.
3. Every correction ships with an explanation *and* a destination.

---

## 3. Core mechanic — staked confidence (Certainty-Based Marking)

Each answer requires **two taps**: the choice, then a stake.

| | Yakin | Ragu | Tebak |
|---|---|---|---|
| **Benar** | +3 | +2 | +1 |
| **Salah** | −2 | −1 | **0** |

Derived from Gardner-Medwin / UCL Certainty-Based Marking.

**Why the incentive math is correct:** staking *Yakin* only pays when actual
confidence exceeds 50%. Wrong + *Tebak* scores zero, so honest ignorance is
never punished, while confident error is.

**Evidence for CBM:**
- 80.9% of students found the certainty scale beneficial.
- 86.4% said it helped identify knowledge gaps.
- 78.3% changed their answer after reflecting on certainty.

**No score is ever awarded for speed.** A countdown may close a round for
pacing; time never touches the score.

---

## 4. Team model

- Teams = the **existing practicum groups**. No new grouping.
- Scores aggregate per team. The board shows **team names and totals only**.
- No individual student appears anywhere in this feature — not on the board,
  not on the projector, not in the assistant's view.

### Safe engagement elements

- Brief reaction beat after each question (Quizizz's actual appeal).
- **Personal** streak counter, self-referenced, never ranked.
- Calibration badges: *Penembak Jitu* (confident + correct), and ***Jujur*** —
  awarded for correctly flagging uncertainty. Turns "I don't know" into a win.
- **Cohort boss-bar:** the class collectively reaches a point target to unlock
  something (worked example, bonus demo, skipping a slide). Comparison's energy
  aimed at a shared target.

### Avoid

- Speed-based scoring · individual public ranking · permanent always-visible
  board · names attached to wrong answers · ranking tied to grades or attendance
  · removing points/audio entirely (kills the benefit).

If an individual board is ever added: **opt-in only**, 10–30 peers, soft
demotion, framed as *improvement*. Duolingo's model is the only version that
survives the evidence.

---

## 5. UI

### Surface map

- **Student** → a "Cek Pemahaman" card inside the active stage section, under
  the stage heading. Opening a check auto-navigates everyone there via the
  existing instant-scroll `navRequest` path (same as `presentStage`).
- **Assistant** → a new section inside the existing presenter deck
  (`data-presenter-deck`) at the top of the guided journey.
- **Projector** → the assistant's screen doubles as the shared view. There is no
  separate student screen to project.

### Student — state 1: question open

```
+------------------------------------------------------------------+
|  [quiz]  CEK PEMAHAMAN                          Soal 2 dari 5     |
|  ================================================================|
|                                                                  |
|  Mengapa penambahan EDTA menurunkan potensial deposisi efektif   |
|  ion Sn^{2+}?                                                    |
|                                                                  |
|  [ ] A   Pembentukan kompleks menurunkan aktivitas ion bebas     |
|  [ ] B   EDTA mengoksidasi Sn^{2+} menjadi Sn^{4+}               |
|  [ ] C   EDTA meningkatkan konduktivitas larutan                 |
|  [ ] D   EDTA menurunkan pH larutan secara drastis               |
+------------------------------------------------------------------+
```

Real radio group (`fieldset` + `legend`), not styled buttons — keyboard arrows
work for free. Full-width rows, `min-h-11` so every option is a 44px tap target
at 390px. **No timer in this card** — time pressure is the documented cause of
guessing and it removes the only reason to rush.

### Student — state 2: confidence stake

Appears after an option is selected. The distinctive beat: a second, deliberate
decision.

```
+------------------------------------------------------------------+
|  Jawaban Anda: B                                                 |
|                                                                  |
|  Seberapa yakin Anda?                                            |
|                                                                  |
|  [  Yakin  ]      [  Ragu  ]      [  Tebak  ]                    |
|    benar +3         +2              +1                           |
|    salah -2         -1               0                           |
|                                                                  |
|  [                  Kirim Jawaban                  ]             |
+------------------------------------------------------------------+
```

The payout table is shown, small and muted. Transparency is a requirement of
the mechanic — students must be able to reason about the stake — but it stays
low-emphasis so the card reads academic, not game-show.

### Student — state 3: submitted

```
+------------------------------------------------------------------+
|  [check_circle]  Jawaban terkirim                                |
|  12 dari 20 praktikan telah menjawab.                            |
|  Menunggu asisten menutup sesi jawaban...                        |
+------------------------------------------------------------------+
```

Solves the "everyone finishes at different times" problem with a count instead
of a countdown. `aria-live="polite"`, throttled — not on every increment.

### Student — state 4: reveal

```
+------------------------------------------------------------------+
|  [lightbulb]  Jawaban yang tepat: B                              |
|  ================================================================|
|  Anda menjawab BENAR dengan keyakinan YAKIN               +3     |
|                                                                  |
|  Pembahasan                                                      |
|  EDTA membentuk kompleks dengan ion logam sehingga menurunkan    |
|  aktivitas ion bebas, yang menggeser potensial deposisi efektif  |
|  ke arah lebih negatif.                                          |
|                                                                  |
|  Runtutan benar: 2   ·   Poin tim (Kelompok 3): 47               |
+------------------------------------------------------------------+
|  Sebaran jawaban kelas    A 10%   B 60%   C 25%   D 5%           |
+------------------------------------------------------------------+
```

Confident-wrong variant — the teachable moment, handled gently:

```
|  Anda menjawab BELUM TEPAT dengan keyakinan YAKIN         -2     |
|  Tinjau kembali bagian Pemahaman sebelum praktikum.              |
```

Never "salah". The card points to the stage that fixes it. Negative feedback
without a next step costs more motivation than no feedback at all — so a
correction always ships with the explanation and a destination.

**Colour is never the only signal:** each result carries an icon and a worded
label, so it survives greyscale and colour-blindness.

### Assistant — four states in the presenter deck

**1. Idle**

```
|  [quiz]  Cek Pemahaman                                           |
|  Bank soal: Tahap Pemahaman · 5 soal                             |
|  [ Buka Soal 1 ]                                                 |
```

**2. Open**

```
|  [quiz]  Soal 2 terbuka · menunggu jawaban                       |
|  12 / 20 praktikan menjawab                                      |
|  [ Tampilkan Sebaran ]              [ Tutup Jawaban ]            |
```

Live distribution is **hidden by default while the question is open**. An
assistant who sees the spread early starts reacting to it, and stragglers read
the room. Count only, then open it on close.

**3. Closed**

```
|  Jawaban ditutup · 20 / 20                                       |
|  Sebaran:   A 10%   B 60%   C 25%   D 5%                         |
|  [ Tampilkan Jawaban ke Praktikan ]                              |
```

**4. Revealed — the payoff**

```
+------------------------------------------------------------------+
|  Peta Miskonsepsi — Soal 2                                       |
|                                                                  |
|  Salah + Yakin    ########  6   -> ajarkan ulang konsep ini      |
|  Salah + Ragu     ###       3   -> ulas singkat                  |
|  Benar + Ragu     ####      4   -> perlu latihan                 |
|  Benar + Yakin    #######   9   -> siap                          |
+------------------------------------------------------------------+
|  [ Soal Berikutnya ]        [ Akhiri Cek Pemahaman ]             |
+------------------------------------------------------------------+
```

This is the reason the confidence stake exists. It separates students who are
merely *uninformed* from those holding a **wrong mental model with certainty** —
and the latter will damage their experiment tomorrow. The bar chart is a
decision tool, not a scoreboard.

### Team board (phase 2, projector only)

```
+------------------------------------------------------------------+
|  Papan Tim                     diperbarui setelah tiap soal      |
|                                                                  |
|   1.  Kelompok 3   ##############   47                           |
|   2.  Kelompok 5   ###########      41                           |
|   3.  Kelompok 1   ########         33                           |
|   4.  Kelompok 2   ######           28                           |
+------------------------------------------------------------------+
```

### Tokens and motion

| Element | Token |
|---|---|
| Surfaces | `var(--surface-container-lowest)` cards on `var(--surface)` field; borders `var(--outline-variant)` |
| Header | `var(--primary)` icon + label, `var(--primary-container)` accent bar — matches the identity/follow cards above it |
| Correct | `var(--success)` fill, dark ink, icon + label |
| Your wrong | `var(--error-container)` outline only — never a red flood, and other students' wrong options are never marked |
| Accent | `var(--secondary-container)` for the confidence stake and cohort progress. Gold stays signal, not decoration |
| Motion | `m4-motion-control` on buttons, `m4-motion-enter` on card arrival, `m4-motion-color` on option state. Opacity and transform only. Under `prefers-reduced-motion` every transition is instant and the reveal simply appears |

### Mobile at 390px

- Options stack full width; the payout legend collapses under each button
  instead of sitting beside it.
- The waiting state shrinks to a single line.
- The misconception map scrolls horizontally rather than squeezing four rows
  into unreadable columns — it is an assistant-only view, tuned for the
  projector first and the phone second.

---

## 6. Technical integration

Extends the existing guided-presentation system rather than adding a parallel
one.

- **Presentation contract** carries only
  `{ checkId, questionId, status: "open" | "closed" | "revealed" }` — semantic
  IDs, no answers, no NIM. The existing `coercePresentationState()` choke point
  keeps working unchanged; the correct answer is never present in broadcast
  state before reveal.
- **Answers go over HTTP**, not the relay: `POST` → server-side aggregation.
  The relay stays a state-sync channel.
- **Ephemeral participant token** per browser session. NIM stays local, as it
  already does — answers associate with the token, never the NIM.
- **Reveal always carries the explanation.** Explanation feedback beats
  correct-answer-only feedback for transfer (Butler et al. 2013), and the
  feedback is what produces the learning gain.
- Server owns the authoritative state machine: `idle → open → closed →
  revealed`. The browser never decides whether a response is still valid.

---

## 7. Phasing

| Phase | Scope |
|---|---|
| **1** | One question, team scoring, confidence stakes, assistant open/close/reveal, anonymous distribution |
| **2** | Question bank per stage, misconception map, streaks + calibration badges, cohort boss-bar |
| **3** | Improvement-based team board, session history, "most-misunderstood concept" summary |

Phase 3 should not start until Phase 1 has run with a real cohort — the
improvement baseline needs real data to mean anything.

---

## 8. Open decisions

1. **Competitive layer is opt-in per session.** The assistant picks "Beregu" or
   "Diagnostik" when opening a check. Neutral mode hides the team board,
   streaks, and points entirely and runs the same questions with the
   misconception map intact — so the original non-competitive design stays
   available for a cohort where competition would land badly.
2. **Streaks are personal and never ranked.** There is no "longest streak" board.
3. **Cohort mismatch caveat:** most evidence is middle-school and intro-biology.
   KI3131 is a small, selective, high-achieving cohort — expect ceiling effects
   and a smaller lift. The demotivation risk is likely *lower* here, but the
   confident-misconception signal is arguably *more* valuable in a lab where a
   wrong mental model is expensive.
