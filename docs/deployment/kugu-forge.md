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

`/home/arya/kugu` is a plain directory, NOT a git clone — `git pull` there does
nothing. Source is shipped as a `git archive` tarball over SSH. Build from a
clean tree only: the Dockerfile does `COPY . .`, so anything untracked in the
build context ends up in the image.

## Ship source to Forge

From the repo root, with a clean working tree and the commit already pushed:

    # 1. Export exactly what is committed (no node_modules, no .env, no .next)
    git archive --format=tar.gz -o /tmp/kugu-<sha>.tar.gz HEAD

    # 2. Upload and verify the transfer before touching the live tree
    scp /tmp/kugu-<sha>.tar.gz forge:/home/arya/
    sha256sum /tmp/kugu-<sha>.tar.gz
    ssh forge sha256sum /home/arya/kugu-<sha>.tar.gz   # must match

    # 3. Stage and carry the live .env across (it is NOT in the archive)
    ssh forge 'cd /home/arya && rm -rf kugu-new && mkdir kugu-new \
      && tar -xzf kugu-<sha>.tar.gz -C kugu-new \
      && cp -a kugu/.env kugu-new/.env && chmod 600 kugu-new/.env'

    # 4. Keep a rollback copy, then swap
    ssh forge 'cd /home/arya && rm -rf kugu.old && cp -a kugu kugu.old \
      && mv kugu kugu-new'

    # 5. Bump the image tag so the new build cannot collide with the old one
    ssh forge "sed -i 's/^KUGU_VERSION=.*/KUGU_VERSION=phase<N>/' /home/arya/kugu/.env"

Then run the Deploy steps below.

## Deploy

    cd /home/arya/kugu
    docker compose config --quiet
    docker compose up -d --build
    docker compose ps
    curl http://10.66.66.5:3034/
    curl http://10.66.66.5:8787/healthz

Confirm the shipped code actually reached the image — do not trust the build
log alone. The hashed asset names change per build, so read the page and fetch
whatever it references:

    curl -s https://kugu.g-labs.my.id/modules/m4-sn-bi-electrodeposition/presentation \
      | grep -oE '/_next/static/[^"]+\.css' | head -1

Then grep that file for a string you just changed. The CSS is minified, so
match the minified form (`clamp(.8125rem,4vh,1.125rem)`, not the spaced source).

`/presentation/ws` answers `404` to a plain GET. That is correct: the route is
handled only on the WebSocket `upgrade` event. Verify it with an upgrade
request and expect `101 Switching Protocols`, through the public host as well
as the relay port:

    curl -4 -s -i -N --max-time 5 \
      -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
      -H 'Sec-WebSocket-Version: 13' \
      -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
      -H 'Origin: https://kugu.g-labs.my.id' \
      https://kugu.g-labs.my.id/presentation/ws | head -3

`.env` is mode 600 and must contain `ADMIN_SECRET`, `NEXT_PUBLIC_M3_RELAY_URL`, `M4_GUIDED_ACCESS_CODE`, `M4_GUIDED_ORIGIN`, and the bounded room/rate settings. Set `M4_GUIDED_ACCESS_CODE` only in the Forge secret environment; never commit it or put the presenter ticket in a URL/browser storage.

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
