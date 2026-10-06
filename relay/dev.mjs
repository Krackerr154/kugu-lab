/**
 * Local dev entrypoint for the M3 presentation relay.
 *
 * The relay server reads its config from process.env, and its own .env is
 * gitignored (production fills it on Forge). This wrapper loads relay/.env.local
 * so `npm run relay` works out of the box for local device testing without
 * hand-exporting variables every shell.
 *
 * Production is unaffected: Docker uses relay/Dockerfile -> node relay/server.mjs.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, ".env.local");

function loadEnv(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return; // No local env file; rely on the real environment.
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Do not clobber an explicitly provided environment variable.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(envPath);

// server.mjs only self-starts when it is process.argv[1]. Importing it from this
// wrapper means that guard is false, so start it explicitly here.
const { createRelay } = await import("./server.mjs");

const relay = createRelay();
const address = await relay.listen();
console.log(
  `[kugu-m3-relay] listening on ${
    typeof address === "string" ? address : `${address.address}:${address.port}`
  }`
);

const shutdown = async () => {
  try {
    await relay.close();
  } finally {
    process.exit(0);
  }
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
