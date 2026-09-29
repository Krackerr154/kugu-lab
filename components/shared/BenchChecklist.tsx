// BenchChecklist — a checkable, phase-grouped procedure list for the Rehearse
// stage. Unlike ProcedureStepper (one-at-a-time, ephemeral) this is a full
// bench sheet a student ticks off while working: items persist in localStorage,
// hold points and safety notes are marked inline, and a phase is "done" only
// when every item in it is checked.
//
// It complements — never replaces — the interactive ProcedureWalkthrough on the
// pre-lab page and the assistant's approval. Checking a box is preparation, not
// authorization.
"use client";

import { useEffect, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { useStudentIdentity } from "@/components/shared/StudentIdentityProvider";
import { namespacedKey } from "@/lib/m3-identity";

export interface BenchItem {
  id: string;
  text: string;
  /** Marks a manual hold point / stage gate (resin cure, weigh-in, polarity check). */
  holdPoint?: boolean;
  /** Short safety reminder shown beneath the item; wording defers to SOP/SDS. */
  safety?: string;
}

export interface BenchPhase {
  /** Short manual tag, e.g. "M3a-1". */
  tag: string;
  label: string;
  /** Material Symbols ligature. */
  icon: string;
  items: BenchItem[];
}

interface BenchChecklistProps {
  title: string;
  storageKey: string;
  phases: BenchPhase[];
  /** Optional note under the title (e.g. cross-session scheduling reminder). */
  note?: string;
}

export function BenchChecklist({ title, storageKey, phases, note }: BenchChecklistProps) {
  const allIds = phases.flatMap((p) => p.items.map((it) => it.id));
  const { identity, ready } = useStudentIdentity();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Namespace saved ticks by identity so a shared browser never mixes two
  // students' work. Before a choice is made (identity === null) fall back to the
  // legacy un-namespaced key; a later NIM entry migrates that key forward.
  const effectiveKey = identity ? namespacedKey(storageKey, identity) : storageKey;

  // Load whenever the effective key changes (mount, or the student switches
  // identity). Reset first so the previous identity's ticks never linger.
  useEffect(() => {
    if (!ready) return;
    setHydrated(false);
    let next = new Set<string>();
    try {
      const raw = localStorage.getItem(effectiveKey);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        next = new Set(ids.filter((id) => allIds.includes(id)));
      }
    } catch {
      // ignore malformed storage
    }
    setChecked(next);
    setHydrated(true);
    // allIds is derived from static props; effectiveKey/ready are the real deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveKey, ready]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(effectiveKey, JSON.stringify([...checked]));
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [checked, hydrated, effectiveKey]);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const doneCount = allIds.filter((id) => checked.has(id)).length;
  const pct = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0;

  return (
    <section className="surface-panel p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {title}
          </h3>
          {note && <p className="mt-1 text-xs text-[var(--text-secondary)]">{note}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--primary-container)]">
          {doneCount}/{allIds.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-container-high)]">
        <div
          className="h-full rounded-full bg-[var(--secondary-container)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-5 space-y-5">
        {phases.map((phase) => {
          const phaseIds = phase.items.map((it) => it.id);
          const phaseDone = phaseIds.every((id) => checked.has(id));
          return (
            <div key={phase.tag}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[18px] text-[var(--primary-container)]"
                >
                  {phase.icon}
                </span>
                <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {phase.tag}
                </span>
                <h4 className="text-sm font-bold text-[var(--foreground)]">{phase.label}</h4>
                {phaseDone && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--success)]">
                    <span aria-hidden="true" className="material-symbols-outlined text-[14px]">check_circle</span>
                    Lengkap
                  </span>
                )}
              </div>

              <ul className="space-y-1.5">
                {phase.items.map((item) => {
                  const isChecked = checked.has(item.id);
                  return (
                    <li
                      key={item.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        isChecked
                          ? "border-[var(--success)]/50 bg-[var(--success-light)]/40"
                          : "border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary-container)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm ${
                                isChecked
                                  ? "text-[var(--muted)] line-through"
                                  : "text-[var(--foreground)]"
                              }`}
                            >
                              <ChemText>{item.text}</ChemText>
                            </span>
                            {item.holdPoint && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--danger-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--danger)]">
                                <span aria-hidden="true" className="material-symbols-outlined text-[12px]">pause_circle</span>
                                Hold Point
                              </span>
                            )}
                          </span>
                          {item.safety && (
                            <span className="mt-1 flex items-start gap-1.5 text-xs text-[var(--danger)]">
                              <span aria-hidden="true" className="material-symbols-outlined text-[14px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                                warning
                              </span>
                              <span className="flex-1"><ChemText>{item.safety}</ChemText></span>
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs italic text-[var(--muted)]">
        Ceklis ini adalah alat persiapan pribadi (tersimpan di browser Anda). Menandai langkah
        selesai bukan pengganti persetujuan asisten atau SOP/SDS laboratorium.
      </p>
    </section>
  );
}
