// ComplexingAgentExplorer — M3 "Peran Agen Pengompleks" as clickable cards that
// open an animated detail modal, matching the M1 reaction-inspector pattern
// (animate-backdrop-enter + animate-popup-enter, Escape to close, focus trap).
//
// Content lives in lib/m3-complexing-agents.ts so the chemistry is reviewable
// separately from the presentation.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { COMPLEXING_AGENTS, type ComplexingAgent } from "@/lib/m3-complexing-agents";

// Tailwind cannot see dynamically built class names, so each hue is spelled out.
const HUE = {
  purple: {
    card: "border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200 hover:border-purple-500",
    title: "text-purple-900",
    body: "text-purple-800",
    chipBg: "bg-purple-50 border-purple-300 text-purple-900",
    iconWrap: "bg-purple-200/70 text-purple-900",
    ring: "focus-visible:ring-purple-500",
    accent: "text-purple-700",
    modalHeader: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300",
  },
  blue: {
    card: "border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 hover:border-blue-500",
    title: "text-blue-900",
    body: "text-blue-800",
    chipBg: "bg-blue-50 border-blue-300 text-blue-900",
    iconWrap: "bg-blue-200/70 text-blue-900",
    ring: "focus-visible:ring-blue-500",
    accent: "text-blue-700",
    modalHeader: "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300",
  },
  teal: {
    card: "border-teal-300 bg-gradient-to-br from-teal-100 to-teal-200 hover:border-teal-500",
    title: "text-teal-900",
    body: "text-teal-800",
    chipBg: "bg-teal-50 border-teal-300 text-teal-900",
    iconWrap: "bg-teal-200/70 text-teal-900",
    ring: "focus-visible:ring-teal-500",
    accent: "text-teal-700",
    modalHeader: "bg-gradient-to-br from-teal-100 to-teal-200 border-teal-300",
  },
} as const;

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
      <p className="mb-3 text-xs text-[var(--muted)]">
        Pilih satu agen untuk melihat mekanisme, pengaruhnya pada deposit, dan pertanyaan yang masih
        harus Anda jawab sendiri.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COMPLEXING_AGENTS.map((a) => {
          const hue = HUE[a.hue];
          return (
            <button
              key={a.id}
              type="button"
              onClick={(e) => open(a.id, e.currentTarget)}
              aria-haspopup="dialog"
              aria-expanded={openId === a.id}
              className={`group flex flex-col items-start rounded-lg border-2 p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${hue.card} ${hue.ring}`}
            >
              <div className="mb-2 flex w-full items-start gap-2">
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[20px] ${hue.iconWrap}`}
                >
                  {a.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-bold ${hue.title}`}>{a.name}</h4>
                  <p className={`text-[11px] ${hue.body}`}>{a.solution}</p>
                </div>
              </div>

              <p className={`text-[11px] font-semibold uppercase tracking-wider ${hue.accent}`}>
                {a.kind}
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${hue.body}`}>{a.summary}</p>

              <div className={`mt-2 w-full rounded-md border px-2 py-1 font-mono text-[11px] ${hue.chipBg}`}>
                <ChemText>{a.formulaLabel}</ChemText> · {a.concentration}
              </div>

              <span
                className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${hue.accent} group-hover:underline`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                  touch_app
                </span>
                Lihat mekanisme
              </span>
            </button>
          );
        })}
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
            className="animate-popup-enter relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] text-[var(--foreground)] shadow-2xl"
          >
            {/* Header keeps the card's own hue so the origin of the modal is obvious */}
            <div
              className={`flex shrink-0 items-start justify-between gap-3 border-b p-4 ${HUE[agent.hue].modalHeader}`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[22px] ${HUE[agent.hue].iconWrap}`}
                >
                  {agent.icon}
                </span>
                <div className="min-w-0">
                  <h3
                    id="m3-agent-modal-title"
                    className={`text-base font-bold ${HUE[agent.hue].title}`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {agent.name}
                  </h3>
                  <p className={`text-xs ${HUE[agent.hue].body}`}>
                    <ChemText>{agent.formulaLabel}</ChemText> · {agent.solution}
                  </p>
                  <p
                    className={`mt-1 text-[11px] font-bold uppercase tracking-wider ${HUE[agent.hue].accent}`}
                  >
                    {agent.kind}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={`Tutup penjelasan ${agent.name}`}
                className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Konsentrasi (penuntun)
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[var(--foreground)]">
                    {agent.concentration}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Tanpa persamaan kesetimbangan
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--foreground)]">
                    Adsorpsi permukaan tidak punya stoikiometri tunggal seperti reaksi kompleksasi,
                    jadi tidak ada persamaan yang dapat dituliskan di sini.
                  </p>
                </div>
              )}

              {/* Mechanism */}
              <section className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    psychology
                  </span>
                  Mekanisme
                </p>
                <ul className="space-y-1.5">
                  {agent.mechanism.map((m, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-[var(--foreground)]">
                      <span className={`font-bold ${HUE[agent.hue].accent}`}>{i + 1}.</span>
                      <span className="flex-1">
                        <ChemText>{m}</ChemText>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Effect on the deposit */}
              <section className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    layers
                  </span>
                  Pengaruh pada deposit
                </p>
                <ul className="space-y-1.5">
                  {agent.effect.map((e, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-[var(--foreground)]">
                      <span aria-hidden="true" className={HUE[agent.hue].accent}>
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
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--warning-ink)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    help
                  </span>
                  Yang masih harus Anda jawab
                </p>
                <p className="text-xs leading-relaxed text-[var(--foreground)]">
                  <ChemText>{agent.openQuestion}</ChemText>
                </p>
              </section>

              <p className="text-[11px] italic leading-relaxed text-[var(--muted)]">
                Rujukan: {agent.reference}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
