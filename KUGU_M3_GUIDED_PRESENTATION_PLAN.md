# KUGU Lab M3 — Guided Presentation Mode

**Status:** Implementation plan; no feature code or deployment changes authorized by this document.  
**Owner:** Gerald Arya Dewangga  
**Target:** `app/modules/m3-sn-bi-electrodeposition`  
**Implementation method:** One independently reviewable phase at a time, with tests and a stop/go decision after each phase.

## 1. Objective

A student enters their NIM when starting the M3 Sn–Bi module and can explore the module independently. During a live class, the student may choose **Ikuti presentasi** to follow Gerald's teaching context: the current stage, designated section, and selected demonstration overlay. They may leave follow mode, browse freely, and rejoin the current presentation without losing private work.

This is **state-driven co-browsing**, not screen sharing. The same *teaching content and selected context* should appear in each browser, rendered responsively. It is not a pixel-identical mirror, a shared mouse cursor, or a guarantee of zero latency.

### Initial success criterion

From a presenter laptop, Gerald can move to any M3 stage and open a designated teaching overlay; a voluntarily following student on a phone receives the current state, while a student in solo mode remains undisturbed. Both retain their own checklist, calculations, and written answers.

## 2. Verified starting point and constraints

Read-only inspection of the Olympus working copy at `E:\Project_G-Labs\KUGU-prak\kugu-lab` found:

- Next.js 16.3.0, React 19.2.8, TypeScript, and Playwright. `package.json` exposes `dev`, `build`, `start`, and `test:e2e` scripts.
- The M3 page is `app/modules/m3-sn-bi-electrodeposition/page.tsx`. It composes `ModuleLayout` and the client-side `ModuleJourney`.
- `ModuleJourney` is shared by other modules. Its five M3 IDs are `brief`, `understand`, `rehearse`, `prove`, and `ready`. It currently derives its active stage from scrolling and navigates by semantic section IDs.
- `ComplexingAgentExplorer` owns a local dialog state; `BenchChecklist` persists selections under the fixed browser key `m3-bench-checklist`; `ClaimEvidenceReasoning` holds student text locally.
- The M3 working tree contains substantial uncommitted changes, including modified and untracked components/tests. **Do not reset, clean, overwrite, or silently bundle this unrelated work.** Coordinate ownership or use a safe worktree/patch strategy before coding.
- The live M3 URL returned HTTP 502 during read-only inspection. This is a deployment-readiness question, not evidence that the new feature is broken.

The repo's `AGENTS.md` instructs coding agents to read the installed Next.js documentation under `node_modules/next/dist/docs/` before modifying code. Follow it.

### Explicit non-goals for the first release

- Streaming video, DOM snapshots, mouse position, or raw pixel scroll offsets.
- Broadcasting student-entered NIM, personal notes, checklist ticks, calculator inputs, or CER answers.
- Treating NIM as authentication or using an unverified NIM as proof of attendance.
- Automatically commandeering a student's browser before they press **Ikuti presentasi**.
- Synchronizing every interaction in every M3 component at once.
- Modifying other practicum modules or changing their `ModuleJourney` behavior.

## 3. Design invariants

1. **Voluntary control:** Follow mode is opt-in and reversible. Students can always use M3 alone.
2. **Presenter authority:** Only an authenticated presenter connection can publish or end a session; room membership and a self-entered NIM confer no publishing rights.
3. **Private student state:** Personal inputs never enter presentation messages. Live guidance must not overwrite them.
4. **Semantic navigation:** Broadcast stage and allowlisted section/overlay IDs, not browser coordinates.
5. **Snapshot on join:** Late joiners and reconnecting followers load the authoritative latest state before consuming incremental events.
6. **Failure containment:** Network loss never blocks solo use of M3; stale state is labeled disconnected, not shown as live.
7. **Narrow compatibility:** The shared module shell remains compatible with other modules and existing keyboard/mobile behavior.
8. **Lab authority:** A guided page or checked item is not an assistant's safety approval; existing SOP/SDS and assistant confirmation boundaries stay intact.

## 4. Proposed architecture

```text
Presenter M3 page ── authenticated publish ──┐
                                            │
                                      Realtime room relay
                                  (current snapshot + presence)
                                            │
Student M3 page ── opt-in subscribe ─────────┘
       │
       └── local NIM and private module work remain in that student's browser
```

**Recommended deployment:** Keep the Next.js page and a small realtime relay as separate services. A Forge-hosted relay behind HTTPS/WSS is a viable option *if* the public KUGU deployment can route to it reliably. Confirm the actual production host, reverse proxy, domain/TLS ownership, and port/firewall policy before implementing deployment. A managed realtime service is an alternative if operating a separate server is undesirable. Do not select infrastructure solely from the presence of `next.config.ts`.

Ordinary Next.js Route Handlers are not a portable long-lived WebSocket server on all hosts. Current Vercel documentation also describes WebSocket Functions **in beta**, with function-duration, reconnection, and cross-instance-state caveats. If considering that route, verify the actual project deployment and plan for an external shared state store. Sources: [Next.js Backend for Frontend deployment caveats](https://nextjs.org/docs/app/guides/backend-for-frontend#deployment-environment); [Vercel WebSockets](https://vercel.com/docs/functions/websockets).

### Initial presentation state

Keep this contract small and versioned:

```ts
type M3StageId = "brief" | "understand" | "rehearse" | "prove" | "ready";

type M3PresentationState = {
  version: 1;
  stageId: M3StageId;
  focusId?: "cell-map" | "complexing-agents" | "calculator";
  demoOverlay?: { kind: "complexing-agent"; id: string } | null;
};
```

The exact IDs must be derived from existing M3 content and validated on both sides. For the MVP, synchronize stage navigation first, then one demonstration overlay. A component's private form values must not be included merely because Gerald happened to edit them during class.

### Wire protocol (illustrative; refine in Phase 2)

```json
{
  "type": "presentation.state",
  "roomId": "opaque-room-id",
  "epoch": "server-issued-session-instance-id",
  "sequence": 12,
  "state": {
    "version": 1,
    "stageId": "understand",
    "focusId": "complexing-agents",
    "demoOverlay": { "kind": "complexing-agent", "id": "validated-agent-id" }
  }
}
```

The server owns `roomId`, `epoch`, and monotonically increasing `sequence`. Clients reject an older sequence for the same epoch and request a fresh snapshot when the epoch changes. Define bounded maximum message sizes and allowed update rates; do not forward arbitrary client JSON.

## 5. Implementation phases

### Phase 0 — Baseline, ownership, and deployment decision

**Agent tasks**

- Read `AGENTS.md`, `DESIGN.md`, relevant installed Next.js 16 guides, M3 page, `ModuleJourney`, and the M3 interactive components.
- Capture the working-tree status and current test/build baseline without discarding existing work.
- Produce a state-ownership map: who controls stage selection, dialogs, simulator options, calculator fields, checklist, and written responses.
- Identify the production deployment topology and investigate the existing HTTP 502 independently.
- Decide the NIM privacy/retention policy and whether attendance is out of scope.
- Identify a safe branch/worktree or coordinated integration approach for the pre-existing uncommitted changes.

**Deliverable:** Short architecture decision record with the file ownership map, deployment choice, baseline results, and privacy decision.

**Gate:** No relay coding until the host and branch strategy are understood.

### Phase 1 — NIM entry and local identity

**Agent tasks**

- Add an M3 entry dialog/screen for NIM, with actual KI3131 format rules confirmed by Gerald/course staff rather than invented in code.
- Persist a student identity record in browser storage and expose a **Ganti NIM** control. Store only what is needed.
- Decide whether the NIM requirement blocks access or permits a guest/preview path; document the decision.
- Namespace existing browser-stored student work by identity, or explicitly keep the current behavior with a visible warning. Plan migration from `m3-bench-checklist` so a shared browser does not silently expose another student's checklist.
- Ensure private browsing, blocked storage, and malformed stored data degrade safely.

**Acceptance:** First visit prompts; reload retains identity; switching identity does not reveal the previous student's work; offline M3 remains usable. NIM never appears in URLs or broadcasts.

**Boundary:** NIM is a self-declared label, not an authentication credential.

### Phase 2 — Typed state model and local-only follow prototype

**Agent tasks**

- Create M3-scoped presentation types, validators, and allowlisted semantic section IDs.
- Refactor `ModuleJourney` only as much as necessary to accept an optional controlled navigation request. Keep existing scroll-tracking and solo navigation behavior for all other modules.
- Provide an adapter that applies an externally supplied snapshot to M3 without rebroadcasting it or causing a scroll-observer feedback loop.
- Support a selected `ComplexingAgentExplorer` demo overlay through a controlled, opt-in interface; keep student-triggered dialog behavior intact in solo mode.
- Scroll to section anchors with sticky-header clearance; preserve keyboard focus and reduced-motion behavior.

**Acceptance:** In a local test harness with no network, applying a snapshot takes a follower to each of the five stages and opens/closes the allowlisted overlay. Existing standalone M3 and other module journeys still pass their tests.

### Phase 3 — Presenter deck and voluntary student controls

**Student controls**

- `Jelajahi mandiri` — local browsing, no remote navigation.
- `Ikuti presentasi` — subscribe and apply the current snapshot.
- `Berhenti mengikuti` — detach without deleting personal work.
- `Kembali ke presenter` — resubscribe, fetch current state, then apply it.
- Explicit connection labels: connecting, following, reconnecting, disconnected, and presentation ended.

**Presenter controls**

- Start/end an M3 session; choose a stage; publish a focus anchor or supported demonstration overlay; see room/connection status.
- Prefer **intentional publish controls** to automatic broadcast of every click or scroll. The presenter can explore a detail privately without forcing everyone to jump.
- A connected count may be shown. Do not claim the count measures attention.

**Acceptance:** One local presenter and two local student views can demonstrate follower versus independent behavior before connecting a production relay.

### Phase 4 — Realtime room relay and recovery

**Agent tasks**

- Implement room creation/end, subscribe, presenter publish, current-snapshot read, and optional minimal presence.
- Validate protocol version, state enum values, maximum message size, rate limits, and room expiry on the server.
- Send the latest full snapshot on every join/rejoin; do not rely on replaying all previous clicks.
- Implement reconnect with bounded exponential backoff, resubscription, and snapshot reload.
- Treat stale or ended rooms explicitly; decide whether a service restart terminates the classroom session or whether external durable storage is required.
- Add a health endpoint and logs that omit NIM and secrets.

**Pilot option:** One relay instance with in-memory rooms is acceptable only if the UI clearly announces session termination on restart. **Production option:** Persist authoritative session state and coordinate broadcasts if multiple instances or seamless restart recovery are required.

**Acceptance:** Late join, reconnect, duplicate/out-of-order event, room end, and relay restart tests pass. Solo M3 survives relay unavailability.

### Phase 5 — Authorization, privacy, and deployment hardening

**Agent tasks**

- Issue presenter authority server-side using an existing login mechanism or a short-lived ticket. A browser client must never contain a permanent presenter secret, including in `NEXT_PUBLIC_*` configuration.
- Allow students to subscribe only. Reject student publish, state mutation, and end-session attempts server-side.
- Check WebSocket `Origin`, enforce WSS, expire rooms/tickets, and bound connections and traffic. An invite code is not a presenter credential.
- Keep NIM out of the relay for the MVP unless an approved attendance requirement exists.
- If attendance is later approved, specify notice/consent, verification limits, access control, retention, export, and deletion procedure separately.
- Expose the relay under the chosen HTTPS deployment with a documented rollback and monitoring path. Do not alter existing unrelated proxy routes.

**Acceptance:** Unauthorized publish is rejected; expired authority fails; one room does not receive another room's events; network inspection finds no NIM, student answer, checklist, or lab measurement in presentation messages.

### Phase 6 — Automated and human-facing verification

**Playwright scenarios**

- Presenter plus two students in separate browser contexts with isolated storage.
- Late join applies the latest stage and overlay.
- One student follows while the other explores independently.
- Independent student rejoins and snaps to the current snapshot.
- Disconnection, reconnection, presenter tab close, session end, relay restart, duplicate and older sequence.
- Desktop presenter to narrow mobile student: same content and semantic anchor without horizontal overflow or raw-pixel scrolling.
- Keyboard navigation, modal focus/close/return, and reduced motion.
- Student checklist, calculator, and CER content survive entering and leaving follow mode.

**Quality gates:** Run TypeScript checking (`npx tsc --noEmit`), production build (`npm run build`), focused M3 tests, and the existing Playwright suite (`npm run test:e2e` or bounded focused runs). Capture actual command output and regressions. Avoid interpreting an old baseline failure as a feature failure; document both.

### Phase 7 — Classroom pilot and release

- Pilot first with a small group across laptop and phone browsers, Wi-Fi and cellular networks.
- Observe join failures, stale indicators, time to visible stage change, reconnect success, and whether students can understand the leave/rejoin controls.
- Verify a verbal fallback: if sync fails, students still access M3 and Gerald can direct them to a named stage.
- Fix pilot blockers before enabling the feature for the full practicum. Record deployment version, relay health, rollback steps, and support owner.

## 6. Test matrix and data boundaries

| Situation | Expected result |
| --- | --- |
| Student has not joined | Presenter actions do not move their page. |
| Student joins late | Full current snapshot applies immediately after successful subscription. |
| Student leaves follow mode | Remote updates stop moving them; local exploration resumes. |
| Student changes NIM on shared browser | Earlier identity's work is not silently presented as theirs. |
| Student edits calculator or CER | Their input remains local; it is neither overwritten by guidance nor broadcast. |
| Presenter navigates to a semantic anchor | Followers scroll to the corresponding section in their own viewport. |
| Presenter loses connection | Followers see a clear disconnected/ended state, not a false live indicator. |
| Student tries to publish | Relay rejects the action regardless of modified browser JavaScript. |
| Unknown event/state version arrives | Client rejects it safely and requests a compatible snapshot or shows an update-needed state. |
| Reconnect delivers old event | Client ignores older sequence within the same epoch. |

## 7. Risk register and trade-offs

- **State coupling:** Existing interactive components own their state. Bulk synchronization would create brittle changes. Mitigation: introduce small controlled adapters one at a time.
- **Competing scroll updates:** `ModuleJourney` derives stage from scroll. Mitigation: treat remote commands distinctly from observer updates and never rebroadcast applied state.
- **Responsive mismatch:** Desktop coordinates cannot map to phones. Mitigation: semantic anchor IDs and native responsive rendering.
- **Private data leakage:** Automatic broadcasting of complete component state could reveal student or real lab data. Mitigation: narrow allowlisted demo state; no private form synchronization.
- **NIM impersonation:** Anyone can type a NIM. Mitigation: never treat it as authentication; verify attendance through a separate institutional process if needed.
- **Wi-Fi and deployment interruptions:** WebSocket sessions disconnect. Mitigation: reconnect/backoff, full snapshots, TTL/epoch handling, and solo-mode fallback.
- **Existing dirty worktree:** Unreviewed M3 changes could be lost or accidentally committed. Mitigation: preserve it and establish branch ownership in Phase 0.
- **Operations:** A realtime server adds health monitoring, TLS, process restart, and rollback duties. Mitigation: keep it small and choose the deployment only after infrastructure discovery.

## 8. Agent execution contract

Assign **one phase per implementation task**, not the entire roadmap in one prompt. Every agent handoff must include:

1. The phase goal and permitted file scope.
2. The pre-existing dirty-worktree warning and prohibition on reset/clean/delete.
3. The interface/contract frozen by the previous phase.
4. Tests to write or update **before** declaring completion.
5. A report containing actual changed paths, test commands and results, screenshots/demo evidence where relevant, security/privacy impact, and open blockers.
6. A stop/go review by Gerald before the next phase or any production deployment.

**No deletion of files, containers, services, or stored student data is authorized by this plan.** Any such operation requires Gerald's explicit approval.

## 9. Decisions Gerald should approve before implementation

- **Identity policy:** Is NIM mandatory just for local personalization, or is formal attendance intended? Recommended for MVP: local personalization only.
- **Guest mode:** Can a student explore without entering NIM? Recommended: permit a limited guest preview if the educational requirement allows it.
- **Presenter authority:** Which existing auth mechanism or one-time ticket issuer will be trusted?
- **Hosting:** Forge relay, managed realtime service, or another verified deployment topology? Recommended: separate relay after confirming the current web host and HTTP 502 cause.
- **Restart semantics:** Is ending an in-memory pilot room on relay restart acceptable? Recommended for the first pilot if clearly communicated.
- **First synced interactions:** Recommended: stage + one designated complexing-agent teaching overlay; add simulator and demonstration calculator values only after privacy review.

## 10. Definition of done for the complete feature

- A student can identify themselves, use M3 independently, voluntarily follow, leave, and rejoin a live session.
- Presenter state propagates as a validated snapshot without copying private student data or requiring video streaming.
- Presenter authority is enforced on the server, not through UI visibility or a NIM.
- Late joins, reconnects, disconnections, and session end behave clearly.
- Desktop/mobile and existing M3 learning interactions remain usable and accessible.
- Automated tests and a real classroom-network pilot pass; the public web route and relay are healthy and rollback is documented.

**References:** [Next.js Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend), [Vercel WebSockets (beta)](https://vercel.com/docs/functions/websockets), [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).
