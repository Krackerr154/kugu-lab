# KUGU Forge deployment

Production topology:

    browser
      -> https://kugu.g-labs.my.id
      -> Gateway Nginx Proxy Manager (10.66.66.1)
      -> WireGuard
      -> Forge 10.66.66.5
         kugu-web  10.66.66.5:3034 -> container :3000
         relay     10.66.66.5:8787 -> container :8787

The root Compose file is `compose.yaml`. The Forge checkout is `/home/arya/kugu`.
The previous relay checkout `/home/arya/kugu-m3-relay` is retained separately.

## Deploy

    cd /home/arya/kugu
    docker compose config --quiet
    docker compose up -d --build
    docker compose ps
    curl http://10.66.66.5:3034/
    curl http://10.66.66.5:8787/healthz

`.env` is mode 600 and must contain `ADMIN_SECRET`, `NEXT_PUBLIC_M3_RELAY_URL`, `M4_GUIDED_ACCESS_CODE`, `M4_GUIDED_ORIGIN`, and the bounded room/rate settings. Set `M4_GUIDED_ACCESS_CODE=1920` only in the Forge secret environment; never commit it or put the presenter ticket in a URL/browser storage.

## Issue a presentation room

Run on Forge (the command prints the room credential once):

    cd /home/arya/kugu
    docker exec kugu-m3-relay node /app/relay/admin.mjs

The presenter enters `roomId` and `presenterTicket` in the M4 Format Laporan presenter deck after the M4 instructor unlock. Students enter only the room ID. NIM remains local browser personalization and is not a room credential. The M4 unlock reveals browser controls; it does not start Docker or issue rooms.

## Gateway route

Existing NPM proxy host ID 19 for `kugu.g-labs.my.id` is retained. Its HTTPS certificate is `npm-29`. The host routes `/` to `10.66.66.5:3034` and `/presentation/ws` to `10.66.66.5:8787` with WebSocket upgrade enabled. Do not replace unrelated NPM hosts.

## Verification

    curl -4 -I https://kugu.g-labs.my.id/modules/m4-sn-bi-electrodeposition
    curl -4 -I https://g-labs.my.id/   # separate legacy apex; may have its own incident
    docker compose ps

Use `tests/review/m3-production-e2e.mjs` with `KUGU_ROOM` and `KUGU_TICKET` from a browser-capable network. It covers presenter/student follow, PEG400 overlay, ended state, and checks that NIM/ticket do not enter the URL.

## Rollback

Keep the previous image tag and the NPM database/config backup. To roll back the app only:

    docker compose down
    KUGU_VERSION=<previous-tag> docker compose up -d

Restore the NPM database/config only if a proxy configuration rollback is required; do not delete newer student/browser data or the current project directory without explicit approval.

## Pilot limitation

Rooms are in-memory. Relay restart or container replacement ends active rooms; followers receive an ended state and can start/join a new room. Persistent classroom sessions require a later durable relay state design.
