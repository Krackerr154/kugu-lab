// ComplexingAgentExplorer — M3 "Peran Agen Pengompleks" as clickable cards that
// open an animated detail modal, matching the M1 reaction-inspector pattern
// (animate-backdrop-enter + animate-popup-enter, Escape to close, focus trap).
//
// Content lives in lib/m3-complexing-agents.ts so the chemistry is reviewable
// separately from the presentation.
//
// Colour: Academic Precision only — paper surfaces, cool outlines, navy ink,
// gold reserved as the "open" action signal. The three reagents are told apart
// by icon, role label and formula, not by a rainbow of card hues (the previous
// purple/blue/teal treatment violated the design system).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { COMPLEXING_AGENTS, type ComplexingAgent } from "@/lib/m3-complexing-agents";

export function ComplexingAgentExplorer() {
  const [openId, setOpenId] = useState<ComplexingAgent["id"] | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Focus must return to the card the student opened, not to the top of the page.
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const agent = openId ? COMPLEXING_AGENTS.find((a) => a.id === openId) ?? null : null;

  const close = useCallback(() => {
    setOpenId(null);
    lastTriggerRef.current?.focus();
  }, []);

  const open = (id: ComplexingAgent["id"], trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setOpenId(id);
  };

  // Escape closes, Tab cycles inside the dialog, and the page behind cannot
  // scroll while the modal is up.
  useEffect(() => {
    if (!openId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    // Focus the close button so keyboard users land inside the dialog.
    const raf = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);
    };
  }, [openId, close]);

  return (
    <div>
      <p className="mb-3 text-sm leading-6 text-[var(--muted)]">
        Pilih satu agen untuk melihat mekanisme, pengaruhnya pada deposit, dan pertanyaan yang masih
        harus Anda jawab sendiri.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COMPLEXING_AGENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={(e) => open(a.id, e.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={openId === a.id}
            className="group flex flex-col items-start rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-left shadow-xs transition-colors hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
          >
            <div className="mb-2 flex w-full items-start gap-2">
              <span
                aria-hidden="true"
                className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[20px] text-[var(--primary-container)]"
              >
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[var(--foreground)]">{a.name}</h4>
                <p className="text-xs text-[var(--text-secondary)]">{a.solution}</p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              {a.kind}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{a.summary}</p>

            <div className="mt-2 w-full rounded-md border border-[var(--outline-variant)] bg-[var(--surface)] px-2 py-1 font-mono text-sm leading-6 text-[var(--foreground)]">
              <ChemText>{a.formulaLabel}</ChemText> · {a.concentration}
            </div>

            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary-container)] group-hover:underline">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                touch_app
              </span>
              Lihat mekanisme
            </span>
          </button>
        ))}
      </div>

      {/* Animated detail modal — same treatment as the M1 reaction inspector */}
      {agent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm animate-backdrop-enter sm:p-4 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="m3-agent-modal-title"
            className="animate-popup-enter relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--foreground)] shadow-ambient"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-xl text-[var(--primary-container)]"
                >
                  {agent.icon}
                </span>
                <div className="min-w-0">
                  <h3
                    id="m3-agent-modal-title"
                    className="text-base font-bold text-[var(--primary)]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {agent.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <ChemText>{agent.formulaLabel}</ChemText> · {agent.solution}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    {agent.kind}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={`Tutup penjelasan ${agent.name}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-lg">
                  close
                </span>
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
              {/* Quantities as used at the bench */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Konsentrasi (penuntun)
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[var(--foreground)]">
                    {agent.concentration}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Jumlah kerja
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[var(--foreground)]">
                    {agent.workingAmount}
                  </p>
                </div>
              </div>

              {/* Governing equilibrium, when one can honestly be written */}
              {agent.tex ? (
                <Equation tex={agent.tex} label={agent.texLabel} compact />
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Tanpa persamaan kesetimbangan
                  </p>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--foreground)]">
                    Adsorpsi permukaan tidak punya stoikiometri tunggal seperti reaksi kompleksasi,
                    jadi tidak ada persamaan yang dapat dituliskan di sini.
                  </p>
                </div>
              )}

              {/* Mechanism */}
              <section className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    psychology
                  </span>
                  Mekanisme
                </p>
                <ul className="space-y-1.5">
                  {agent.mechanism.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-6 text-[var(--foreground)]">
                      <span className="font-bold text-[var(--primary-container)]">{i + 1}.</span>
                      <span className="flex-1">
                        <ChemText>{m}</ChemText>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Effect on the deposit */}
              <section className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--secondary)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    layers
                  </span>
                  Pengaruh pada deposit
                </p>
                <ul className="space-y-1.5">
                  {agent.effect.map((e, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-6 text-[var(--foreground)]">
                      <span aria-hidden="true" className="text-[var(--primary-container)]">
                        →
                      </span>
                      <span className="flex-1">
                        <ChemText>{e}</ChemText>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* What the manual leaves open — never answered on the student's behalf */}
              <section className="rounded-xl border-2 border-[var(--secondary)]/50 bg-[var(--secondary-container)]/15 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--warning-ink)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    help
                  </span>
                  Yang masih harus Anda jawab
                </p>
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  <ChemText>{agent.openQuestion}</ChemText>
                </p>
              </section>

              <p className="text-xs italic leading-relaxed text-[var(--muted)]">
                Rujukan: {agent.reference}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
