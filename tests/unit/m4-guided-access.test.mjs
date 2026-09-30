import test from 'node:test';
import assert from 'node:assert/strict';
import { createGuidedAccessService } from '../../lib/server/m4-guided-access.ts';

const origin = 'http://localhost:3000';
const code = 'operator-test-fixture';
const endpoint = `${origin}/api/m4-guided/unlock`;
function fixture(options = {}) {
  let now = 1_000;
  let configuredCode = code;
  const handle = createGuidedAccessService({
    getCode: () => configuredCode,
    getOrigin: () => origin,
    secureCookies: false,
    now: () => now,
    ...options,
  });
  return { handle, advance: (ms) => { now += ms; }, configure: (value) => { configuredCode = value; } };
}
function request(method = 'POST', body = { code }, headers = {}) {
  return new Request(endpoint, {
    method,
    headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
}
const cookieFrom = (response) => response.headers.get('set-cookie').split(';')[0];

test('fails closed without runtime configuration', async () => {
  const { handle } = fixture({ getCode: () => '' });
  const response = await handle(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { unlocked: false, error: 'unavailable' });
  assert.equal(response.headers.has('set-cookie'), false);
});

test('accepts exact code only; does not accept a NIM or normalize input', async () => {
  const { handle } = fixture();
  for (const value of ['10524001', '', ` ${code}`, `${code}\n`, code.toUpperCase()]) {
    const response = await handle(request('POST', { code: value }));
    assert.ok([400, 401].includes(response.status));
    assert.equal((await response.json()).unlocked, false);
    assert.equal(response.headers.has('set-cookie'), false);
  }
  const response = await handle(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).unlocked, true);
});

test('issues an opaque HttpOnly cookie without exposing codes or tokens in JSON', async () => {
  const { handle } = fixture({ secureCookies: true });
  const response = await handle(request());
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /kugu-m4-instructor=[A-Za-z0-9_-]{43};/);
  for (const flag of ['HttpOnly', 'SameSite=Strict', 'Secure', 'Path=/api/m4-guided', 'Max-Age=3600']) assert.ok(cookie.includes(flag));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ['expiresAt', 'unlocked']);
  assert.equal(JSON.stringify(body).includes(code), false);
  const status = await handle(request('GET', null, { Cookie: cookieFrom(response) }));
  assert.deepEqual(await status.json(), body);
});

test('expires and revokes server-verified sessions; forged cookie stays locked', async () => {
  const f = fixture();
  assert.deepEqual(await (await f.handle(request('GET', null, { Cookie: 'kugu-m4-instructor=forged' }))).json(), { unlocked: false });
  const cookie = cookieFrom(await f.handle(request()));
  f.advance(3_600_000);
  assert.deepEqual(await (await f.handle(request('GET', null, { Cookie: cookie }))).json(), { unlocked: false });
  const second = cookieFrom(await f.handle(request()));
  const logout = await f.handle(request('DELETE', null, { Cookie: second }));
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.deepEqual(await (await f.handle(request('GET', null, { Cookie: second }))).json(), { unlocked: false });
});

test('rotating or removing the code invalidates existing sessions', async () => {
  const f = fixture();
  const cookie = cookieFrom(await f.handle(request()));
  f.configure('different-runtime-code');
  assert.deepEqual(await (await f.handle(request('GET', null, { Cookie: cookie }))).json(), { unlocked: false });
});

test('rejects cross-origin writes and does not trust forwarded headers', async () => {
  const { handle } = fixture();
  for (const method of ['POST', 'DELETE']) {
    assert.equal((await handle(request(method, { code }, { Origin: 'https://elsewhere.example', 'X-Forwarded-Host': 'elsewhere.example' }))).status, 403);
    assert.equal((await handle(request(method, { code }, { Origin: '' }))).status, 403);
  }
  assert.equal((await handle(request('GET', null, { 'Sec-Fetch-Site': 'cross-site' }))).status, 403);
});

test('allows configured public origin behind a reverse proxy', async () => {
  const { handle } = fixture({ getOrigin: () => 'https://kugu.g-labs.my.id' });
  assert.equal((await handle(request('POST', { code }, { Origin: 'https://kugu.g-labs.my.id' }))).status, 200);
});

test('requires JSON with only a bounded code string and limits actual request bytes', async () => {
  const { handle } = fixture();
  assert.equal((await handle(request('POST', { code }, { 'Content-Type': 'text/plain' }))).status, 415);
  for (const body of ['{', null, [], { code: 1234 }, { code, nim: '10524001' }]) {
    assert.equal((await handle(request('POST', JSON.stringify(body)))).status, 400);
  }
  assert.equal((await handle(request('POST', 'x'.repeat(600)))).status, 413);
  assert.equal((await handle(request('POST', { code }, { 'Content-Length': '5000' }))).status, 413);
});

test('throttles guesses without relying on spoofable client IPs; cooldown recovers', async () => {
  const f = fixture();
  for (let i = 0; i < 10; i++) assert.equal((await f.handle(request('POST', { code: 'wrong' }, { 'X-Forwarded-For': `192.0.2.${i}` }))).status, 401);
  const response = await f.handle(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
  f.advance(60_001);
  assert.equal((await f.handle(request())).status, 200);
});

test('supports only the access lifecycle, not room issuance', async () => {
  const { handle } = fixture();
  for (const method of ['PUT', 'PATCH', 'OPTIONS']) assert.equal((await handle(request(method))).status, 405);
  assert.deepEqual(await (await handle(request('GET'))).json(), { unlocked: false });
});
