// Student identity for KUGU Lab — a self-declared NIM used ONLY for local
// personalization: it namespaces THIS browser's saved work (bench checklist,
// notebook) so a shared machine does not mix two students' data.
//
// Confirmed policy (2026-09-29, Gerald): NIM is local-only. It is NOT
// authentication, is NEVER sent over the network, and NEVER appears in a URL.
// Guest browsing is allowed. No attendance feature. KI3131 NIM format for this
// cohort is `10524` followed by three digits (8 digits total).
//
// Pure module: no React, no side effects beyond guarded localStorage access, so
// the validation/namespacing/migration rules are unit-testable on their own.

export const NIM_PATTERN = /^10524\d{3}$/;
export const IDENTITY_KEY = "kugu-student-identity";
// Marker recording that the one-time legacy (pre-feature) work has been claimed.
export const LEGACY_MIGRATION_MARKER = "kugu-legacy-namespaced";

// localStorage bases holding private per-student M3 work that must be namespaced
// by identity. Other modules keep their existing un-namespaced keys for now
// (Phase 1 non-goal: do not change other modules' behavior).
export const M3_SCOPED_STORAGE_BASES = ["m3-bench-checklist", "m3-notebook"] as const;

export type StudentMode = "nim" | "guest";

export interface StudentIdentity {
  version: 1;
  mode: StudentMode;
  /** Present only when mode === "nim". */
  nim: string | null;
}

export const GUEST_IDENTITY: StudentIdentity = { version: 1, mode: "guest", nim: null };

export type NimValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Validate a self-entered NIM against the confirmed KI3131 cohort format. */
export function validateNim(raw: string): NimValidation {
  const value = raw;
  if (!value) return { ok: false, error: "Masukkan NIM Anda atau lanjut sebagai tamu." };
  if (!/^\d+$/.test(value)) return { ok: false, error: "NIM hanya terdiri dari angka." };
  if (!NIM_PATTERN.test(value)) return { ok: false, error: "NIM harus berformat 10524xxx (8 digit)." };
  return { ok: true, value };
}

/** Stable per-identity token used to namespace storage keys. */
export function scopeToken(identity: StudentIdentity | null): string {
  if (identity?.mode === "nim" && identity.nim) return `nim-${identity.nim}`;
  return "guest";
}

/** Namespace a base storage key by identity, e.g. "m3-notebook::nim-10524001". */
export function namespacedKey(base: string, identity: StudentIdentity | null): string {
  return `${base}::${scopeToken(identity)}`;
}

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Probe whether localStorage is writable (false under private mode / blocked). */
export function storageWritable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__kugu_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** Read the stored identity. Returns null when unset or unreadable/corrupt. */
export function readIdentity(): StudentIdentity | null {
  const raw = safeGet(IDENTITY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StudentIdentity>;
    if (parsed?.mode === "guest") return GUEST_IDENTITY;
    if (parsed?.mode === "nim" && typeof parsed.nim === "string" && NIM_PATTERN.test(parsed.nim)) {
      return { version: 1, mode: "nim", nim: parsed.nim };
    }
    return null; // malformed → treat as unset so the UI degrades safely
  } catch {
    return null;
  }
}

/** Persist an identity choice. Returns false if storage is blocked. */
export function writeIdentity(identity: StudentIdentity): boolean {
  return safeSet(IDENTITY_KEY, JSON.stringify(identity));
}

/**
 * One-time, marker-gated migration of pre-feature (un-namespaced) work into the
 * FIRST NIM that claims it. It COPIES — never deletes — the legacy key, so no
 * stored student data is destroyed (respects the no-automatic-deletion policy).
 * Guarded by a marker so a later, different NIM on the same browser can never
 * inherit it. Guest work is never migrated or attributed to a NIM.
 */
export function migrateLegacyWorkOnce(
  nim: string,
  bases: readonly string[] = M3_SCOPED_STORAGE_BASES,
): void {
  if (typeof window === "undefined") return;
  if (safeGet(LEGACY_MIGRATION_MARKER)) return; // already claimed by someone
  const identity: StudentIdentity = { version: 1, mode: "nim", nim };
  for (const base of bases) {
    const legacy = safeGet(base);
    if (legacy == null) continue;
    const target = namespacedKey(base, identity);
    if (safeGet(target) == null) safeSet(target, legacy); // never overwrite existing
  }
  safeSet(LEGACY_MIGRATION_MARKER, `nim-${nim}`);
}
