// Issue one pilot room without exposing the admin secret to the browser.
const secret = process.env.ADMIN_SECRET;
const base = process.env.RELAY_INTERNAL_URL || "http://127.0.0.1:8787";
if (!secret) { console.error("ADMIN_SECRET is required"); process.exit(2); }
const response = await fetch(`${base}/internal/rooms`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
if (!response.ok) { console.error(`issuer failed: HTTP ${response.status}`); process.exit(1); }
const room = await response.json();
console.log(JSON.stringify(room, null, 2));
