import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
test('factory imports without listening and serves an authenticated loopback issuer over real HTTP', async () => {
  const script = `
    import assert from 'node:assert/strict';
    import * as module from ${JSON.stringify(new URL('../server.mjs', import.meta.url).href)};
    try {
      assert.equal(typeof module.createRelay, 'function', 'createRelay export is required');
      const relay = module.createRelay({ port: 0, host: '127.0.0.1', adminSecret: 'test-admin-secret-32-characters-long', allowedOrigins: ['http://localhost:3000'] });
      assert.equal(relay.server.listening, false);
      const address = await relay.listen();
      const base = 'http://127.0.0.1:' + address.port;
      const health = await fetch(base + '/healthz');
      assert.deepEqual(await health.json(), { ok: true });
      const denied = await fetch(base + '/internal/rooms', { method: 'POST' });
      assert.equal(denied.status, 403);
      const issued = await fetch(base + '/internal/rooms', { method: 'POST', headers: { Authorization: 'Bearer test-admin-secret-32-characters-long' } });
      assert.equal(issued.status, 201);
      assert.equal(issued.headers.get('cache-control'), 'no-store');
      const room = await issued.json();
      assert.deepEqual(Object.keys(room).sort(), ['expiresAt', 'presenterTicket', 'roomId']);
      assert.match(room.roomId, /^[A-Za-z0-9_-]{32}$/);
      assert.match(room.presenterTicket, /^[A-Za-z0-9_-]{43}$/);
      assert.ok(room.expiresAt > Date.now());
      assert.ok(room.expiresAt <= Date.now() + 14400000);
      await relay.close();
      console.log('real issuer and factory passed');
      // Let undici finish closing its keep-alive socket on Windows before the
      // child process exits; forced process.exit can trigger a Node EPIPE/assert.
      await new Promise((resolve) => setImmediate(resolve));
    } catch (error) { console.error(error); process.exit(1); }
  `;
  const result = await exec(process.execPath, ['--input-type=module', '-e', script], {
    timeout: 5000, env: { ...process.env, PORT: '0' },
  }).catch(error => {
    assert.fail(error.stderr || error.message);
  });
  assert.match(result.stdout, /real issuer and factory passed/);
});
