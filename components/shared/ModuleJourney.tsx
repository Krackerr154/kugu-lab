// ModuleJourney — the shared Brief / Understand / Rehearse / Prove / Ready
// staged-learning shell from UI_REBUILD_PLAN.md §4. The sticky navigation uses
// a full-label stage picker on phones and a numbered rail on larger screens.
// Location is not completion: scrolling never awards a completed-stage tick.
//
// Each stage names what success looks like for the learner at that point:
//   Brief      — what will I do?
//   Understand — what theory explains it?
//   Rehearse   — how do I perform it and decide?
//   Prove      — can I predict, explain, and act safely?
//   Ready      — what have I finished, and what still needs the instructor?
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface JourneyStage {
  id: string;
  /** Short rail label (Montserrat, hierarchy-bearing). */
  label: string;
  /** Material Symbols ligature name. */
  icon: string;
  /** The learner question this stage answers, shown under the active label. */
  question: string;
  content: ReactNode;
}

/**
 * Optional externally-controlled navigation request. When `token` changes the
 * journey jumps INSTANTLY to `stageId` (instant, not smooth, so scroll-tracking
 * cannot overwrite the requested stage — same reasoning as the mobile picker).
 * A changing token lets the same stageId be re-applied (e.g. a follower
 * re-syncing to the presenter's current stage). Undefined = default solo
 * behavior, so every other module is completely unaffected.
 */
export interface JourneyNavRequest {
  stageId: string;
  token: number;
}

interface ModuleJourneyProps {
  stages: JourneyStage[];
  /** External nav command (guided-presentation follower). Optional/additive. */
  navRequest?: JourneyNavRequest | null;
}

export function ModuleJourney({ stages, navRequest }: ModuleJourneyProps) {
  const [activeId, setActiveId] = useState(stages[0]?.id ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const appliedNavToken = useRef<number | null>(null);

  // Use the same measured clearance for anchors and the reading position.
  // Sampling all five headings also handles upward scrolls and large jumps;
  // IntersectionObserver's changed entries alone cannot establish location.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    let clearance = 160;
    const update = () => {
      frame = 0;
      let current = stages[0]?.id ?? "";
      for (const stage of stages) {
        const node = sectionRefs.current.get(stage.id);
        if (node && node.getBoundingClientRect().top <= clearance + 1) current = stage.id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      clearance = (parseFloat(getComputedStyle(rail).top) || 0) + rail.getBoundingClientRect().height + 16;
      rootRef.current?.style.setProperty("--journey-offset", `${clearance}px`);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  }, [stages]);

  const activeIndex = Math.max(0, stages.findIndex((s) => s.id === activeId));

  const goTo = (id: string, focusHeading = true, behavior: ScrollBehavior = "smooth") => {
    const node = sectionRefs.current.get(id);
    if (!node) return;
    // Honor reduced-motion: jump instantly rather than animating the scroll.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduced ? "auto" : behavior, block: "start" });
    setActiveId(id);
    if (focusHeading) node.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  // Apply an externally-controlled nav request (guided-presentation follower).
  // Jump INSTANTLY and without stealing focus so a remote stage change cannot be
  // overwritten by the scroll observer and does not yank the follower's caret.
  // Applying never re-publishes: this component only consumes the request.
  useEffect(() => {
    if (!navRequest) return;
    if (appliedNavToken.current === navRequest.token) return;
    if (!stages.some((s) => s.id === navRequest.stageId)) return;
    appliedNavToken.current = navRequest.token;
    goTo(navRequest.stageId, false, "instant");
    // goTo is stable enough for this purpose; stageId/token are the real deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navRequest?.token, navRequest?.stageId, stages]);

  return (
    <div ref={rootRef}>
      {/* Sticky local stage rail. Sits below the app header on both breakpoints. */}
      <nav
        ref={railRef}
        aria-label="Tahap persiapan modul"
        className="no-print sticky top-16 z-20 -mx-4 mb-6 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 px-4 py-2 backdrop-blur-sm sm:mx-0 sm:px-0 lg:top-20"
      >
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Tahap sebelumnya"
            disabled={activeIndex === 0}
            onClick={() => goTo(stages[activeIndex - 1].id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true" className="material-symbols-outlined">chevron_left</span>
          </button>
          {/* Jump instantly so scroll tracking cannot overwrite rapid keyboard selections. */}
          <select
            aria-label="Pilih tahap persiapan"
            value={activeId}
            onChange={(event) => goTo(event.target.value, false, "instant")}
            className="control-field min-h-11 min-w-0 flex-1 px-3 text-base font-semibold"
          >
            {stages.map((stage, i) => (
              <option key={stage.id} value={stage.id}>{i + 1} / {stages.length} · {stage.label}</option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Tahap berikutnya"
            disabled={activeIndex === stages.length - 1}
            onClick={() => goTo(stages[activeIndex + 1].id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true" className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <ol className="hidden grid-cols-5 gap-2 md:grid">
          {stages.map((stage, i) => {
            const active = stage.id === activeId;
            return (
              <li key={stage.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goTo(stage.id)}
                  aria-current={active ? "step" : undefined}
                  className={`group flex min-h-11 w-full items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${
                    active
                      ? "border-[var(--primary-container)] bg-[var(--primary-container)] text-[var(--on-primary)]"
                      : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--muted)] hover:border-[var(--primary-container)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-[var(--on-primary)]/20 text-[var(--on-primary)]"
                        : "bg-[var(--surface-muted)] text-[var(--muted)]"
                    }`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="truncate text-xs font-bold uppercase tracking-wide"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {stage.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

      </nav>

      {/* Stage sections */}
      <div className="space-y-10">
        {stages.map((stage, i) => (
          <section
            key={stage.id}
            id={stage.id}
            aria-labelledby={`${stage.id}-heading`}
            ref={(node) => {
              if (node) sectionRefs.current.set(stage.id, node);
              else sectionRefs.current.delete(stage.id);
            }}
            style={{ scrollMarginTop: "var(--journey-offset, 10rem)" }}
          >
            <header className="mb-4 flex items-start gap-3 border-b border-[var(--border)] pb-3">
              <span
                aria-hidden="true"
                className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-xl text-[var(--primary-container)]"
              >
                {stage.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Tahap {i + 1} dari {stages.length}
                </p>
                <h2
                  id={`${stage.id}-heading`}
                  tabIndex={-1}
                  className="text-xl font-bold text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-container)]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {stage.label}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{stage.question}</p>
              </div>
            </header>
            <div className="space-y-4">{stage.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
