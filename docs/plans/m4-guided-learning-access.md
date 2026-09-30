# M4 Guided Learning Access Plan

> For Hermes: implement this plan task-by-task with test-first changes and an independent review before commit.

Goal: Add an M4-only first-visit access layer that asks students for a local NIM in a modal, then reveals instructor guided-learning controls only after a separate operator unlock using code `1920`.

Architecture: Keep NIM as local personalization, never authentication. Keep the existing semantic presentation contract, BroadcastChannel transport, WSS relay, room IDs, and presenter tickets unchanged. The `1920` code is a UI-control unlock only; the actual presenter session remains protected by the existing relay ticket. The browser cannot start a Docker/Node server, so the new button starts/reveals the existing presenter flow rather than launching a server process.

Current facts:

- `StudentIdentityProvider` reads/writes `kugu-student-identity` in localStorage and already supports the exact `^10524\\d{3}$` format, guest mode, namespaced checklist/notebook data, and copy-only legacy migration.
- `StudentIdentityGate` currently renders an inline optional NIM row inside the M4 Tujuan Praktikum stage.
- `M3PresentationProvider` already starts local BroadcastChannel presentation when no relay URL exists and uses the WSS relay when `NEXT_PUBLIC_M3_RELAY_URL` exists.
- Relay mode requires both a room ID and presenter ticket; the ticket must remain in memory and never enter a URL or localStorage.
- `M3PresenterDeck` currently renders in the M4 Format Laporan stage and exposes the existing “Mulai presentasi” flow.
- Canonical and legacy Sn–Bi routes share the same implementation and must keep sharing the same identity/storage/presentation behavior.

Security boundary:

- Do not treat NIM as login, attendance, room authorization, or authentication.
- Do not hardcode `1920` into client JavaScript if it is intended to protect instructor controls. Configure `M4_GUIDED_ACCESS_CODE=1920` as a server/runtime secret and validate it through a same-origin server route.
- Do not use the 1920 unlock as relay authentication. The relay presenter ticket remains the real presenter credential.
- Do not put the NIM, unlock code, presenter ticket, or room credential in a URL, BroadcastChannel message, presentation state, or localStorage.
- Do not expose a public room-creation endpoint or the relay admin secret. Existing room issuance remains the operator-side `relay/admin.mjs` flow unless a separately authenticated operator API is designed later.
- Keep the guest path as a secondary “Lanjut sebagai tamu” action unless Gerald explicitly changes the existing guest-browsing policy.

## Task 1: Define the access contract and server-side unlock boundary

Objective: Establish testable pure rules and a server-only code validation path before changing the UI.

Files:

- Create: `lib/m4-guided-access.ts`
- Create: `app/api/m4-guided/unlock/route.ts`
- Modify: `compose.yaml` or the deployment environment documentation only if needed to document `M4_GUIDED_ACCESS_CODE`; never commit its value into source.
- Test: `tests/e2e/m4-guided-access.spec.ts` and/or a pure contract test near existing M3 identity tests.

Implementation:

- Define a small client-safe state type such as `GuidedAccessState = "locked" | "student" | "instructor-unlocked"` without storing the secret.
- Define an API request `{ code: string }` and a minimal response `{ unlocked: boolean }`.
- The route accepts same-origin POST JSON only, compares the submitted value with `process.env.M4_GUIDED_ACCESS_CODE`, returns a generic failure for missing/wrong code, and applies a bounded rate limit or cooldown suitable for the deployment.
- On success, return a short-lived HttpOnly, SameSite cookie or another server-verifiable short-lived unlock marker. Do not return the configured code or a reusable presenter credential.
- If the project is not ready for a server route in local static mode, fail closed when the environment variable is absent; do not add a production fallback of `1920` in bundled client code.

Acceptance:

- Wrong, missing, or malformed codes never unlock.
- The response never contains the configured code, NIM, room ID, presenter ticket, or admin secret.
- The route is not a room issuer and cannot start the relay process.

## Task 2: Build the M4 first-visit NIM modal gate

Objective: Replace the M4 inline-first-visit experience with an accessible modal overlay while preserving existing local identity behavior.

Files:

- Create or modify: `components/shared/M4GuidedAccessGate.tsx`
- Refactor: `components/shared/StudentIdentityGate.tsx` into reusable identity form/badge pieces, or add a controlled `variant="modal"` without breaking other consumers.
- Modify: `app/modules/m3-sn-bi-electrodeposition/page.tsx`
- Test: extend `tests/e2e/m3-identity.spec.ts` with the modal behavior.

Implementation:

- Mount the gate inside `StudentIdentityProvider` and around the M4 `ModuleLayout` content so it affects both `/modules/m4-sn-bi-electrodeposition` and the legacy `/modules/m3-sn-bi-electrodeposition` alias.
- When `ready === false`, render the existing hydration-safe blank state.
- When no identity exists, render a full-page overlay with a blurred, non-interactive background and a focused `role="dialog"` / `aria-modal="true"` card.
- The primary field uses `inputMode="numeric"`, the existing exact placeholder `10524xxx`, and the existing strict validation without trimming or normalization.
- Keep “Lanjut sebagai tamu” as an explicit secondary action so guest browsing remains possible and no identity is falsely implied.
- Lock background interaction and page scrolling while the dialog is open. Move focus to the NIM field, trap focus within the dialog, keep a visible focus ring, and restore focus to the triggering element when the gate closes.
- Preserve `Ganti NIM`, local-only copy behavior, `storageOk` messaging, and all existing namespaced checklist/notebook keys. Never delete or rewrite prior student data.
- Do not put the dialog above the global shell in a way that creates a second page heading or breaks the four-stage rail geometry.

Acceptance:

- First visit shows the modal and blurred background.
- Invalid NIM stays locked and shows the existing exact-format error.
- A valid NIM unlocks the page and persists across reload without appearing in the URL.
- Guest mode unlocks the page without creating a NIM.
- Existing NIM data, legacy migration, identity switching, checklist separation, notebook separation, and canonical/legacy routes remain intact.

## Task 3: Add the operator unlock and guided-learning launch control

Objective: Reveal instructor controls only after successful code validation without confusing UI unlock with relay authorization.

Files:

- Create: `components/shared/M4InstructorUnlock.tsx` or keep it inside `M4GuidedAccessGate.tsx` if the state remains small.
- Modify: `components/shared/M3GuidedJourney.tsx` only through additive props if presentation controls need an unlock state.
- Modify: `app/modules/m3-sn-bi-electrodeposition/page.tsx`.
- Test: add instructor-unlock cases to `tests/e2e/m4-guided-access.spec.ts`.

Implementation:

- Provide a low-prominence, keyboard-accessible “Akses pengajar” disclosure; do not rely on an invisible CSS-only input.
- Submit the code to `/api/m4-guided/unlock`; keep the input value in React state only and clear it after success/failure.
- On success, reveal a clearly labeled “Mulai mode pengajar” / “Mulai guided learning” button and the existing presenter deck entry point. Do not label this as starting a server unless it only means starting the browser presenter session.
- The revealed control should focus itself after unlock and explain the next required relay fields when `relayMode` is active: room ID and presenter ticket.
- Reuse `startPresenting()` and the existing `M3PresentationProvider`; do not create a second transport or new message type.
- In local mode, the button starts the existing local presentation transport. In relay mode, it only starts after the existing room/ticket requirements pass.
- Keep the presenter ticket in memory, never in localStorage, URLs, NIM data, semantic presentation state, or BroadcastChannel messages.
- On logout/unlock expiry/tab close, hide the instructor controls and return to the normal student view. Do not alter student identity or private work.

Acceptance:

- Wrong code reveals no instructor control and gives a generic error.
- Code `1920` succeeds only when the server-side configured code is `1920`.
- The visible control is absent before unlock and present after unlock.
- Starting presentation still uses the existing local/relay transport and existing ticket checks.
- Student followers never receive the unlock state, NIM, or presenter ticket.

## Task 4: Preserve the existing semantic presentation contract

Objective: Ensure the new gate does not change the allowlisted guided-learning state or private-data boundary.

Files:

- Modify only if required: `components/shared/M3PresentationProvider.tsx`, `lib/m3-presentation.ts`, `components/shared/M3GuidedJourney.tsx`.
- Test: `tests/e2e/m3-presentation-follow.spec.ts`, `tests/e2e/m3-presentation-contract.spec.ts`, and the new access spec.

Rules:

- Keep the semantic state limited to stage, allowlisted focus, and allowlisted demo overlay.
- Never broadcast NIM, unlock status, checklist, notebook, calculator fields, CER answers, or lab inputs.
- Keep old `rehearse` compatibility mapping and the current four visible M4 stages.
- Do not put the access modal or unlock state in the presentation snapshot.
- Verify that a student can remain solo and private while a presenter session is active.

## Task 5: Responsive and accessibility pass

Objective: Make the modal and instructor disclosure usable at M4 phone and desktop sizes.

Files:

- `components/shared/M4GuidedAccessGate.tsx`
- `components/shared/M4InstructorUnlock.tsx`
- `app/globals.css` only if a reusable modal/backdrop rule is required.
- New review probe: `tests/review/m4-guided-access-verify.mjs`.

Browser checks to perform after implementation:

- 360×740, 390×844, 768×1024, and 1440×900.
- Dialog has one accessible name, focus starts in the NIM input, Tab/Shift+Tab remains inside, and Escape follows the chosen policy.
- Background content is visibly blurred and cannot be clicked or focused while locked.
- Modal buttons retain at least 44 px touch targets.
- No horizontal overflow, clipped NIM error, or off-screen unlock control.
- After unlock, the guided-learning button and presenter deck remain reachable without moving private student work into the shared UI.

## Task 6: Regression and deployment documentation

Objective: Verify the complete behavior and document the operator workflow without exposing secrets.

Files:

- `tests/e2e/m4-guided-access.spec.ts`
- `tests/review/m4-guided-access-verify.mjs`
- `docs/deployment/kugu-forge.md`
- `PRODUCT.md` only if the access model becomes a committed product behavior.

Test cases:

- First-visit locked modal.
- Invalid NIM, valid NIM, guest path, reload persistence, identity switch, and copy-only legacy migration.
- Wrong operator code, correct `1920` code, unlock expiry, and no code/NIM/ticket leakage in URL or presentation messages.
- Local presenter start and relay-mode validation of room/ticket requirements.
- Canonical M4 and legacy M3 routes.
- Existing full migration, identity, presentation, responsive, type, and build gates.

Deployment documentation must state:

- Set `M4_GUIDED_ACCESS_CODE=1920` through the Forge secret environment only; never commit `.env` or print the value.
- Issue rooms using the existing relay admin command.
- The page reveals/starts the existing presenter session; it does not launch Docker or the relay server.
- Restarting the relay ends in-memory rooms and requires a new room/ticket.

## Implementation order and gates

1. Approve the access policy, especially whether guest browsing remains available. Recommended default: keep the guest action.
2. Implement and test the pure/server unlock contract.
3. Implement the modal gate and preserve identity/storage migration.
4. Implement the instructor reveal and connect it to the existing presenter deck.
5. Run focused browser checks and fix accessibility/responsive findings.
6. Run the full type/build/browser gates and request an independent staged-diff review.
7. Only then consider commit/deploy; no deployment is part of this plan until the gates pass.
