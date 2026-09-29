# KUGU Forge Release Implementation Plan

> For Hermes: use subagent-driven-development for independent workstreams, with spec review before quality review. Preserve existing work and remote services; do not delete files, data, or containers.

Goal: serve KUGU and a secure, working M3 guided-presentation relay from one Forge project at /home/arya/kugu, through the existing Gateway NPM at https://kugu.g-labs.my.id.

Architecture: production Next.js standalone web container and separate Node WebSocket relay, root Compose stack. Gateway 10.66.66.1 forwards web and /presentation/ws to Forge 10.66.66.5 through WireGuard. NPM already exists; preserve all other domains, certificates and services. Public release requires authenticated presenter publishing, private student state, voluntary follow and honest recovery. No permanent browser presenter secret.

Tech stack: Next.js 16 / React 19 / TypeScript, Node supported LTS containers, ws, node:test, Playwright, Docker Compose, existing NPM.

## Authorization and protocol contract

- Trust source: operator's existing SSH/Docker access to Forge. An in-container CLI calls a loopback-only, admin-secret-protected room issuer. It returns an opaque roomId and high-entropy, short-lived per-room presenterTicket. Ticket stays in browser memory, never URL/log/localStorage. No public create-room API, no NIM authentication.
- Internal issuer POST /internal/rooms (Authorization Bearer ADMIN_SECRET, loopback caller only), response {roomId,presenterTicket,expiresAt}. node relay/admin.mjs invokes it using environment secret without printing the admin secret.
- Public WebSocket path /presentation/ws, no query credentials. First client message {t:'join',roomId,role:'student'|'presenter',ticket?}. No room creation on student join. Exact Origin allowlist.
- After join client intents: {t:'present',state}, {t:'snapshot'}, {t:'end'}, {t:'ping'}. Only ticketed presenter may present/end. Server owns epoch and sequence. Snapshot and rejoin return latest full state.
- Server messages: state {t,roomId,epoch,seq,state,presenterConnected,expiresAt}; presence {t:'presence',roomId,epoch,connected}; ended {t:'ended',roomId,epoch,reason}; error {t:'error',code}; pong {t:'pong'}.
- Shared source shared/m3-contract.mjs plus declarations exports stage/focus/agent allowlists and coercePresentationState; normalize nested overlay too. No arbitrary student fields. Valid focus belongs to stage, non-null complexing-agent overlay belongs to understand. Browser and server reuse it.
- Pilot rooms are in-memory with absolute expiry: restart ends sessions; unknown room returns ended/unavailable, never silently recreates. Presenter socket loss emits disconnected presence; reconnect before expiry may recover same session. Explicit end revokes authority and prevents reanimation.
- Bound payloads, rate, rooms, connections, unauthenticated join time; heartbeat and backpressure. No secrets or input bodies logged.

## Tasks / ownership

1. Baseline and discovery (parent): inspect source, installed Next docs, NPM existing configuration, Forge address/ports/firewall. Record actual preflight. Baseline commit 630806e; relay/ draft is untracked and preserved. tsc clean before edits.
2. Relay implementation (relay worker): owns relay/* and shared/m3-contract.*. TDD slices for private room issuer, authenticated join, publish/snapshot, expiry/end/restart, limits and privacy. Commands: npm --prefix relay install; npm --prefix relay test. Tests use real sockets. Preserve draft files through edits, not deletes. No remote operations or commits.
3. Identity hardening (identity worker): owns identity helpers/provider/gate, BenchChecklist and LabNotebook, identity tests. Fix storage key-switch save races; no pre-identity legacy content leak or automatic attribution; explicit non-destructive import; guarded malformed/blocked storage; preserve guest path and other modules. Test actual helpers/UI, no reimplementation inside tests. No presentation files or commits.
4. Browser integration (parent): lib/m3-presentation.ts transport/provider/deck/navigation/agent dialog, tests. Write real relay acceptance tests before implementation. Reach all stages and semantic anchors, open/close actual complexing-agent dialog, keep private values stable, real rejoin and bounded reconnect; room input and presenter credential memory-only. Preserve compact arrival and keyboard/mobile accessibility. Local BroadcastChannel is development-only, explicitly labelled, never production authority.
5. Packaging/deploy (parent): next.config.ts standalone, Dockerfile, .dockerignore, compose.yaml, deployment documentation and scripts. Use reproducible lockfiles and supported image tags, private WG-bound ports, read-only/cap-drop runtime where compatible, healthchecks and capped logs. Stage verified release on Forge without deleting previous relay directory. Protect generated secrets and back up existing state.
6. NPM cutover (parent): verify existing kugu host, back up config/database/cert metadata securely, use supported NPM management to route only kugu subdomain to Forge web and relay path, enable WS and valid TLS. If management login required and not available, ask rather than guess. Do not mutate unrelated proxy hosts/admin access without confirmed scope.
7. Verification/release: independent spec review then code/security review; fix demonstrated issues with regression tests. Run relay tests, tsc, production build, full Playwright and public HTTPS/WSS end-to-end on isolated student contexts. Verify unauthorized/expired publishing rejection, cross-room isolation, normal/reduced motion, mobile, late join/rejoin, private payload boundaries, relay restart behavior. Record actual results, version, operating/rollback commands. A genuine classroom/cellular pilot needs the user's devices; never claim it happened automatically.

## Acceptance / cutover gate

No public activation until relay authority and private-state tests pass. Verify external writes by readback of exact Compose containers and NPM host. Keep previous images/configuration as rollback. Do not automatically delete student storage or older artifacts. New origin has separate browser storage from localhost/apex; no automatic migration claim.
