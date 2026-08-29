// ProcedureWalkthrough — guided one-step-at-a-time procedure viewer
// Features: visual icons, progress bar, predict-reveal checks every N steps,
// safety notes, equipment list, keyboard nav, Academic Precision design system
"use client";

import { useState, useCallback } from "react";
import { ChemText } from "./ChemText";

export interface WalkthroughStep {
  id: number;
  title: string;
  detail: string;
  rationale?: string;
  equipment?: string[];
  safetyNote?: string;
  expectedObservation?: string;
  holdPoint?: boolean;
  estimatedTime?: string;
}

export interface WalkthroughCheck {
  /** Step index (0-based) after which this check appears */
  afterStep: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ProcedureWalkthroughProps {
  steps: WalkthroughStep[];
  checks?: WalkthroughCheck[];
  title?: string;
  intro?: string;
}

export function ProcedureWalkthrough({
  steps,
  checks = [],
  title = "Prosedur Praktikum",
  intro,
}: ProcedureWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [checkAnswers, setCheckAnswers] = useState<Record<number, number | null>>({});
  const [checkRevealed, setCheckRevealed] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const progressPct = Math.round((completed.size / totalSteps) * 100);

  // Find check that should appear after current step
  const activeCheck = checks.find((c) => c.afterStep === currentStep && !checkRevealed.has(c.afterStep));

  const canAdvance = useCallback(() => {
    if (!activeCheck) return true;
    const answered = checkAnswers[activeCheck.afterStep] !== undefined && checkAnswers[activeCheck.afterStep] !== null;
    return answered;
  }, [activeCheck, checkAnswers]);

  const handleNext = () => {
    if (!canAdvance()) return;
    setCompleted((prev) => new Set(prev).add(currentStep));
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerCheck = (checkAfterStep: number, optionIndex: number) => {
    setCheckAnswers((prev) => ({ ...prev, [checkAfterStep]: optionIndex }));
    setCheckRevealed((prev) => new Set(prev).add(checkAfterStep));
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const allDone = completed.size === totalSteps;

  return (
    <section className="rounded-xl bg-[var(--surface)] shadow-ambient border border-[var(--outline-variant)]/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[var(--surface-container-lowest)] border-b border-[var(--outline-variant)]/30">
        <div className="flex items-center gap-3 mb-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            list_alt
          </span>
          <h3 className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {title}
          </h3>
        </div>
        {intro && (
          <p className="text-sm text-[var(--on-surface-variant)]">{intro}</p>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Langkah {currentStep + 1} dari {totalSteps}
            </span>
            <span className="text-xs font-bold text-[var(--primary-container)]">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--secondary-container)] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
              aria-label={`Langkah ${i + 1}`}
            >
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all ${
                  i === currentStep
                    ? "h-2 w-6 bg-[var(--primary-container)]"
                    : completed.has(i)
                    ? "h-2 w-2 bg-[var(--secondary)]"
                    : "h-2 w-2 bg-[var(--outline-variant)] group-hover:bg-[var(--outline)]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        {/* Step number + title */}
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg transition-colors ${
            completed.has(currentStep)
              ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
              : "bg-[var(--primary-container)] text-[var(--on-primary)]"
          }`} style={{ fontFamily: "Montserrat, sans-serif" }}>
            {completed.has(currentStep) ? "✓" : currentStep + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="text-lg font-bold text-[var(--on-surface)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                <ChemText>{step.title}</ChemText>
              </h4>
              {step.holdPoint && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--error-container)] px-2.5 py-0.5 text-xs font-semibold text-[var(--error)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px]">pause_circle</span>
                  Hold Point
                </span>
              )}
              {step.estimatedTime && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--on-surface-variant)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px]">schedule</span>
                  {step.estimatedTime}
                </span>
              )}
            </div>

            {/* Detail */}
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
              <ChemText>{step.detail}</ChemText>
            </p>

            {/* Rationale */}
            {step.rationale && (
              <div className="mt-3 rounded-lg bg-[var(--surface-container-low)] p-3 border border-[var(--outline-variant)]/30">
                <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-1">
                  Mengapa?
                </p>
                <p className="text-sm text-[var(--on-surface)]"><ChemText>{step.rationale}</ChemText></p>
              </div>
            )}

            {/* Equipment */}
            {step.equipment && step.equipment.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
                  Alat & Bahan
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--on-surface)] border border-[var(--outline-variant)]/50"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--primary)]">science</span>
                      <ChemText>{eq}</ChemText>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety note */}
            {step.safetyNote && (
              <div className="mt-3 rounded-lg border border-[var(--error)] bg-[var(--error-container)]/30 p-3">
                <div className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--error)] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[var(--error)] uppercase tracking-wider">Keselamatan</p>
                    <p className="text-sm text-[var(--on-surface)] mt-0.5"><ChemText>{step.safetyNote}</ChemText></p>
                  </div>
                </div>
              </div>
            )}

            {/* Expected observation */}
            {step.expectedObservation && (
              <div className="mt-3 rounded-lg border border-[var(--secondary)]/30 bg-[var(--secondary-container)]/10 p-3">
                <p className="text-xs font-semibold text-[var(--primary-container)] uppercase tracking-wider mb-1">
                  Observasi yang Diharapkan
                </p>
                <p className="text-sm text-[var(--on-surface)]"><ChemText>{step.expectedObservation}</ChemText></p>
              </div>
            )}
          </div>
        </div>

        {/* Understanding check */}
        {activeCheck && (
          <div className="mt-6 rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface-container-low)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                quiz
              </span>
              <p className="font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Cek Pemahaman
              </p>
            </div>
            <p className="text-sm text-[var(--on-surface)] mb-4"><ChemText>{activeCheck.question}</ChemText></p>
            <div className="space-y-2">
              {activeCheck.options.map((opt, i) => {
                const selected = checkAnswers[activeCheck.afterStep] === i;
                const isCorrect = i === activeCheck.correctIndex;
                const revealed = checkRevealed.has(activeCheck.afterStep);

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerCheck(activeCheck.afterStep, i)}
                    disabled={revealed}
                    className={`w-full text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      revealed
                        ? isCorrect
                          ? "border-[var(--success)] bg-[var(--success-light)] text-[var(--success)]"
                          : selected
                          ? "border-[var(--error)] bg-[var(--error-container)]/30 text-[var(--error)]"
                          : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] opacity-60"
                        : "border-[var(--outline-variant)] text-[var(--on-surface)] hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        revealed
                          ? isCorrect
                            ? "bg-[var(--success)] text-white"
                            : selected
                            ? "bg-[var(--error)] text-white"
                            : "bg-[var(--surface-variant)]"
                          : "bg-[var(--surface-variant)]"
                      }`}>
                        {revealed ? (isCorrect ? "✓" : selected ? "✗" : "○") : String.fromCharCode(65 + i)}
                      </span>
                      <ChemText>{opt}</ChemText>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {checkRevealed.has(activeCheck.afterStep) && (
              <div className="mt-4 rounded-lg bg-[var(--surface-container-lowest)] p-4 border border-[var(--outline-variant)]/30">
                <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-1">
                  Penjelasan
                </p>
                <p className="text-sm text-[var(--on-surface)]"><ChemText>{activeCheck.explanation}</ChemText></p>
                {checkAnswers[activeCheck.afterStep] === activeCheck.correctIndex ? (
                  <p className="mt-2 text-sm font-semibold text-[var(--success)]">
                    ✓ Benar — Anda dapat melanjutkan
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-[var(--error)]">
                    ✗ Jawaban belum tepat — baca penjelasan lalu lanjutkan
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--outline-variant)] px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
            Sebelumnya
          </button>

          {!isLastStep ? (
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-container)] px-5 py-2.5 text-sm font-bold text-[var(--on-primary)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {activeCheck && !canAdvance() ? "Jawab cek pemahaman dulu" : "Lanjut"}
              {canAdvance() && <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-5 py-2.5 text-sm font-bold text-[var(--on-primary)]">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">check_circle</span>
              Prosedur Selesai
            </div>
          )}
        </div>

        {/* Completion notice */}
        {allDone && (
          <div className="mt-4 rounded-xl bg-[var(--secondary-container)]/15 border border-[var(--secondary)]/30 p-4 text-center">
            <p className="text-sm font-bold text-[var(--secondary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              ✓ Anda telah menyelesaikan semua langkah prosedur
            </p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">
              Anda siap untuk praktikum fisik. Tetap konsultasi dengan asisten sebelum mulai.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
