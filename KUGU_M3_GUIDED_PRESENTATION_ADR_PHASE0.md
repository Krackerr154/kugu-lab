# M3 Guided Presentation — Phase 0 Architecture Decision Record

**Phase:** 0 — Baseline, ownership, and deployment decision (investigation only)
**Scope of this task:** Read-only inspection + non-destructive network probes. No feature code, no config change, no deployment.
**Owner:** Gerald Arya Dewangga
**Date recorded:** 2026-09-29
**Baseline commit:** `feat/m3-guided-journey` @ 33cd3cf (M3 five-stage journey; branched off `main` @ 9ca1abe)

---

## 0. Summary for the impatient

- The M3 feature work is now committed on a clean branch, so the plan's "dirty worktree" precondition is satisfied. The tree has exactly one remaining untracked file: `KUGU_M3_GUIDED_PRESENTATION_PLAN.md` (the plan itself), plus this ADR.
- Local baseline is green: `tsc --noEmit` clean, `next build` passes, 123 Playwright tests pass.
- **Production is down**: `https://g-labs.my.id/` returns `502 Bad Gateway` from `openresty`. The reverse proxy is up; the Next.js origin behind it is not responding. This is a deploy/ops problem, independent of this feature.
- The app is a **pure static Next.js site today** — zero Route Handlers, empty `next.config.ts`, all 20 routes prerendered as static. There is no backend process in this project at all.
- **Recommended architecture:** a small, standalone WebSocket relay hosted on **Forge** (10.66.66.5), separate from the Next.js app, fronted by WSS. This fits your "lightweight, avoid Docker on Olympus" constraint and keeps the relay's lifecycle independent of the static site.
- **One blocker to resolve before ANY relay code (Phase 4):** Node.js is not installed on Forge (Docker 29.8.0 is). Pick the relay runtime and get it installed, or containerize.

---

## 1. Verified baseline

### 1.1 Toolchain (matches plan §2)
| Item | Value | Source |
| --- | --- | --- |
| Next.js | 16.3.0 | `node -e require('next/package.json').version` |
| React / react-dom | 19.2.8 | `package.json` |
| TypeScript | ^5 | `package.json` devDeps |
| Playwright | 1.62.1 | `package.json` devDeps |
| Scripts | `dev`, `build`, `start`, `test:e2e` | `package.json` |
| `next.config.ts` | present but **empty** (`{}`) | read |

### 1.2 Build / test baseline (this session, feat/m3-guided-journey)
| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | passes; 20 routes, all `○ (Static) prerendered` |
| `npx playwright test` | **123 passed** (7 spec files) |
| M3 review probes | pass (beaker-agents 970 model cases + 6 viewports; codeposition; peg-dendrites) |

> Note: this baseline already includes the PEG-in-bare-bath fix made this session. There is no pre-existing failing baseline to distinguish a feature regression from — the tree is green.

### 1.3 Routing reality — important
- **No `route.ts` / `route.js` anywhere in `app/`.** `search_files` for route handlers → 0 results.
- All 18 page files are `page.tsx`; `next build` marks every route `○ (Static)`.
- **Consequence:** the project currently ships as static HTML/CSS/JS. It has no server-side request handling and no long-lived process. A WebSocket relay cannot be "just added" as a Next.js Route Handler on a static host — this confirms the plan's warning (§4) and points to a **separate relay service**.

---

## 2. State-ownership map (plan §5 deliverable)

Who owns what state in M3 today, and what a presentation snapshot may/may not touch:

| State | Owner | Persistence | Broadcast-safe? | Notes |
| --- | --- | --- | --- | --- |
| Active stage (brief/understand/rehearse/prove/ready) | `ModuleJourney` `activeId` | none (scroll-derived) | **YES** — this is the core sync target | Derived from scroll via rAF sampling of all 5 headings. See §3 risk. |
| Stage navigation intent | `ModuleJourney.goTo()` | none | **YES** (as a command) | Already separates smooth (button) vs instant (select) scroll. |
| Cell component selection | `ElectrochemicalCellExplorer` `selected` (ComponentKey) | none | **YES** (allowlisted focus target) | Lifted into `hotspot()` passed down to `CodepositionWorkbench`. |
| Codeposition clock / playback | `CodepositionWorkbench` `time/playing/speed` | none | **DEFER** (Phase 6+, privacy-neutral but noisy) | Single seekable clock; syncing it is possible but not MVP. |
| Complexant scenario toggle | `CodepositionWorkbench` `complexed` | none | **DEFER** | Candidate for "one demo overlay" after stage sync. |
| Species focus (Semua/Bi/Sn/H₂) | `CodepositionWorkbench` `focus` | none | **DEFER** | |
| Active bath agent (EDTA/citrate/PEG) | `CodepositionWorkbench` `activeAgent` | none | **YES (MVP demo overlay)** | This is the plan's `demoOverlay.kind:"complexing-agent"`. Best first synced interaction beyond stage. |
| ComplexingAgentExplorer dialog | `ComplexingAgentExplorer` `openId` | none | maybe | Separate component from the workbench's agent selection; don't conflate. |
| Bench checklist ticks | `BenchChecklist` `checked` Set | **localStorage `m3-bench-checklist`** | **NEVER** (private student work) | Fixed key → shared-browser leak risk. Phase 1 namespacing target. |
| Lab notebook fields | `LabNotebook` `values` | **localStorage `m3-notebook`** | **NEVER** | Free-text student data. |
| CER answers | `ClaimEvidenceReasoning` `fields` | none (in-memory) | **NEVER** | claim/evidence/reasoning text. |
| Faraday calculator inputs | `ElectrodepositionCalculator` `metal/valence/…` | none | **NEVER** for student values | A presenter *demo* value could be broadcast later, but not a student's. |
| Prediction prompt text | `PredictionPrompt` `prediction/revealed` | none | **NEVER** | |
| Compact header disclosure | `ModuleLayout` `<details>` (compactHeader) | none (native) | no | Native disclosure, not React state. |

**localStorage keys in the codebase:** `m3-bench-checklist` (BenchChecklist), `m3-notebook` (LabNotebook via storageKey), `notebook-<title>` fallback (LabNotebook default). These are the Phase 1 namespacing surface.

**Allowlist recommendation for the versioned snapshot (plan §4):**
```ts
type M3PresentationState = {
  version: 1;
  stageId: "brief" | "understand" | "rehearse" | "prove" | "ready";
  focusId?: "cell-map" | "complexing-agents" | "calculator"; // section anchors, NOT pixels
  demoOverlay?: { kind: "complexing-agent"; id: "edta" | "citrate" | "peg400" } | null;
};
```
MVP order: **(1) stageId first**, then **(2) demoOverlay = active bath agent**. Everything in the "NEVER" rows stays out of the wire protocol permanently.

---

## 3. Biggest code risk: ModuleJourney (confirmed by reading it)

`components/shared/ModuleJourney.tsx` is **shared by all six modules** and derives `activeId` from a scroll listener (rAF → samples all five heading `top`s against measured sticky clearance). Two concrete hazards for controlled navigation:

1. **Feedback loop.** If a remote snapshot calls something like `goTo(stageId)`, the resulting smooth scroll fires the scroll listener, which recomputes `activeId` mid-animation and could fight the remote command — and, if naively wired, re-broadcast it. Mitigation (already half-present): the mobile `<select>` path uses `behavior:"instant"` precisely so "scroll tracking cannot overwrite rapid selections" (comment at line 107). A controlled remote apply must reuse the **instant** path and must **never** re-publish applied state.
2. **Shared-component blast radius.** M1–M6 all use this. The refactor must be **purely additive** (an optional controlled-nav prop), leaving the default scroll-spy path untouched. There are existing regression tests (`m3-navigation-polish.spec.ts`, `m3-module-journey-verify.mjs`) that already cover rapid-keyboard + reduced-motion — Phase 2 must keep them green.

This is the single task most likely to cause regressions, and it should be its own reviewable change in Phase 2.

---

## 4. Deployment topology (plan §2 + §4 deliverable)

### 4.1 What's actually deployed
- **Domain:** `g-labs.my.id` → `103.197.189.138`.
- **Edge:** `Server: openresty` (nginx+Lua) reverse proxy. It is **up** (it answers, with a 502).
- **Origin:** returns `502 Bad Gateway` on `/`, `/modules/m3-...`, and `/_next/static/`. openresty has no healthy upstream to proxy to → the Next.js app (or its container/process) behind the proxy is **not running / crashed / misconfigured upstream**.
- This is exactly the 502 the plan flagged. It is a pre-existing ops incident, **not** caused by and **not** blocking the presentation feature's local development.

### 4.2 Forge as relay host (from memory + probe)
`ssh forge` (10.66.66.5, Ubuntu 24.04, 56 GB RAM) is reachable. Probe result:
- Docker **29.8.0** present (user in docker group).
- **Node.js NOT installed.**
- WireGuard mesh: Forge is `.5`; peers include main-vps `.1` and nat-vps `.2`; `forge-pub` = 20.214.237.128 (public ingress candidate).

### 4.3 Options considered
| Option | Fit | Verdict |
| --- | --- | --- |
| WebSocket via Next.js Route Handler on the current host | App is static; no server runtime; plan + Next docs say Route Handlers aren't a portable long-lived WS server | **Rejected** |
| Vercel WebSocket Functions (beta) | Not on Vercel (openresty origin); beta duration/reconnect/cross-instance caveats | **Rejected for MVP** |
| Managed realtime service (Pusher/Ably/Supabase Realtime) | Zero ops, but external dependency + data leaves your infra + recurring cost | **Fallback only** |
| **Standalone WS relay on Forge, fronted by WSS** | Matches "lightweight, RAM-efficient, your infra"; Forge has spare RAM; independent of the static site's lifecycle | **RECOMMENDED** |

### 4.4 Recommended topology
```
Student/presenter browser
   │  WSS  (wss://<relay-host>/…)
   ▼
openresty (or Caddy) on public ingress  ──►  small WS relay process on Forge
   │  (TLS terminate, Origin check, rate limit)     (in-memory rooms for pilot)
Next.js static site (g-labs.my.id) stays exactly as-is, served separately.
```
The relay is a **separate service**. The static site only needs to know the relay's WSS URL (a public build-time constant — the relay URL is not a secret; the presenter *credential* is, and stays server-side per plan §5).

### 4.5 Blocker before Phase 4
Node.js is not on Forge. Decide the relay runtime and provision it:
- **Recommended:** install Node LTS on Forge and run the relay under a process supervisor (systemd unit or pm2). Smallest footprint, matches the "avoid Docker on Olympus" preference (this is Forge, not Olympus, but a bare process is still lighter than a container for one tiny relay).
- **Alternative:** containerize the relay (Docker is already there). Heavier, but zero host-runtime install.

---

## 5. NIM privacy / retention decision (plan §2, §5 deliverable)

**CONFIRMED by Gerald (2026-09-29):**
- **NIM is a self-declared local label for personalization only.** Not authentication, not attendance proof.
- **NIM never enters the relay, URLs, or any broadcast.** It stays in the student's browser storage.
- **Guest path allowed:** a student may explore M3 without entering a NIM (limited preview), so a blocked/private-storage browser degrades gracefully.
- **No attendance feature in scope.** If attendance is ever wanted, it is a separate project with its own consent/verification/retention design — explicitly out of this feature.
- **NIM format:** `10524xxx` — literal prefix `10524` followed by 3 digits (8 digits total). Validation regex: `^10524\d{3}$`. This is the confirmed KI3131 2024-intake pattern; older intakes (e.g. `10521…`) are out of scope for this cohort.

---

## 6. Branch / integration strategy (plan §0 deliverable)

- All prior M3 feature work is committed on **`feat/m3-guided-journey`** (33cd3cf). `main` is untouched at 9ca1abe. Nothing pushed.
- **Recommendation:** build the presentation feature on a new branch off `feat/m3-guided-journey` (e.g. `feat/m3-guided-presentation`) once that branch is reviewed/merged, OR stack it if you want them reviewed together. Do NOT develop the feature directly on `main`.
- The plan doc + this ADR are the only untracked files; commit them wherever you want the planning trail (recommend the feature branch, not the module commit).
- Reaffirm plan §8: **no deletion** of files, containers, services, or stored student data without your explicit approval. This ADR authorizes none.

---

## 7. Phase 0 gate — decision

**Gate criterion (plan §0):** "No relay coding until the host and branch strategy are understood." — **MET.**

Open items that must be closed before their dependent phases:
- [ ] **(before Phase 4)** Provision a relay runtime on Forge (install Node LTS + supervisor, or containerize) and choose the public WSS ingress (openresty vhost vs Caddy on forge-pub 20.214.237.128).
- [ ] **(ops, parallel)** Investigate & fix the production 502 on g-labs.my.id — separate from this feature, but the feature's public rollout (Phase 7) needs a healthy site.
- [ ] **(before Phase 1)** Confirm KI3131 NIM format with course staff.
- [ ] **(your approval)** Confirm the §9 decisions: NIM = local-only, guest allowed, relay on Forge, in-memory pilot rooms OK, first synced interaction = stage + bath-agent overlay.

**Go/no-go for Phase 1 (NIM entry + local identity):** ready to proceed on decisions above; Phase 1 is pure client-side and needs no relay, so it can start as soon as the NIM format + policy are confirmed.
