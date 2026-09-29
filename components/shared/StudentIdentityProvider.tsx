"use client";

// React context for the self-declared student identity (Phase 1). Holds the
// current identity, whether storage is usable, and the actions to set a NIM,
// continue as guest, or re-open the prompt. All persistence goes through the
// pure helpers in lib/m3-identity so this file stays a thin React shell.
//
// Switching identity NEVER deletes the previous student's saved work — it only
// changes which namespaced keys are active (no-automatic-deletion policy).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GUEST_IDENTITY,
  migrateLegacyWorkOnce,
  readIdentity,
  storageWritable,
  validateNim,
  writeIdentity,
  type StudentIdentity,
} from "@/lib/m3-identity";

interface IdentityContextValue {
  /** null = no choice yet (show the gate); otherwise the active identity. */
  identity: StudentIdentity | null;
  /** True once the mount effect has read storage; gates SSR/hydration flashes. */
  ready: boolean;
  /** False under private mode / blocked storage — the UI must degrade to session-only. */
  storageOk: boolean;
  /** Validate + persist a NIM. Returns an error string on invalid input, else null. */
  setNim: (raw: string) => string | null;
  continueAsGuest: () => void;
  /** Re-open the prompt without deleting any stored work. */
  changeIdentity: () => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function StudentIdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(storageWritable());
    setIdentity(readIdentity());
    setReady(true);
  }, []);

  const setNim = useCallback((raw: string): string | null => {
    const result = validateNim(raw);
    if (!result.ok) return result.error;
    migrateLegacyWorkOnce(result.value);
    const next: StudentIdentity = { version: 1, mode: "nim", nim: result.value };
    writeIdentity(next);
    setIdentity(next);
    return null;
  }, []);

  const continueAsGuest = useCallback(() => {
    writeIdentity(GUEST_IDENTITY);
    setIdentity(GUEST_IDENTITY);
  }, []);

  const changeIdentity = useCallback(() => setIdentity(null), []);

  const value = useMemo<IdentityContextValue>(
    () => ({ identity, ready, storageOk, setNim, continueAsGuest, changeIdentity }),
    [identity, ready, storageOk, setNim, continueAsGuest, changeIdentity],
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useStudentIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useStudentIdentity must be used within a StudentIdentityProvider");
  return ctx;
}

/**
 * Non-throwing variant for shared components (e.g. LabNotebook) that render both
 * inside M3 (provider present) and in other modules (no provider). Returns null
 * when there is no provider, so those modules keep their existing behavior.
 */
export function useOptionalStudentIdentity(): IdentityContextValue | null {
  return useContext(IdentityContext);
}
