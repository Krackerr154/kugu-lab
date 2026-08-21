// ProcedureStepper — numbered, mobile-friendly, timer/hold point, checklist
"use client";

import { useState } from "react";

interface ProcedureStep {
  id: number;
  title: string;
  detail: string;
  rationale?: string;
  holdPoint?: boolean;
  estimatedTime?: string;
}

interface ProcedureStepperProps {
  steps: ProcedureStep[];
  title?: string;
}

export function ProcedureStepper({ steps, title = "Prosedur" }: ProcedureStepperProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [deviations, setDeviations] = useState<Record<number, string>>({});
  const [showDeviation, setShowDeviation] = useState<Set<number>>(new Set());

  const toggleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDeviation = (id: number) => {
    setShowDeviation((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`rounded-lg border p-3 transition-colors ${
              completed.has(step.id)
                ? "border-[var(--success)] bg-[var(--success-light)]"
                : "border-[var(--border)] bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleComplete(step.id)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  completed.has(step.id)
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : "border-slate-300 text-transparent hover:border-[var(--primary)]"
                }`}
                aria-label={`Tandai langkah ${step.id} selesai`}
              >
                ✓
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{step.id}.</span>
                  <span className="font-medium">{step.title}</span>
                  {step.holdPoint && (
                    <span className="rounded-full bg-[var(--danger-light)] px-2 py-0.5 text-xs font-medium text-[var(--danger)]">
                      <span aria-hidden="true">⏸</span> Hold Point
                    </span>
                  )}
                  {step.estimatedTime && (
                    <span className="text-xs text-[var(--muted)]"><span aria-hidden="true">⏱</span> {step.estimatedTime}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
                {step.rationale && (
                  <p className="mt-1 text-xs italic text-[var(--muted)]">Alasan: {step.rationale}</p>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => toggleDeviation(step.id)}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    {showDeviation.has(step.id) ? "Sembunyikan" : "Catat deviasi"}
                  </button>
                </div>
                {showDeviation.has(step.id) && (
                  <>
                    <label htmlFor={`deviation-${step.id}`} className="sr-only">Deviasi langkah {step.id}</label>
                    <textarea
                      id={`deviation-${step.id}`}
                    value={deviations[step.id] || ""}
                    onChange={(e) =>
                      setDeviations({ ...deviations, [step.id]: e.target.value })
                    }
                    placeholder="Catat deviasi dari prosedur..."
                    className="mt-2 w-full rounded-md border border-[var(--border)] p-2 text-sm"
                    rows={2}
                    />
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 text-sm text-[var(--muted)]">
        {completed.size} dari {steps.length} langkah selesai
      </div>
    </section>
  );
}
