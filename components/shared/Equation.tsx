// Equation — KaTeX rendering + accessible text alternative
"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface EquationProps {
  tex: string;
  label?: string;
  description?: string;
  compact?: boolean;
}

export function Equation({ tex, label, description, compact = false }: EquationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(tex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.textContent = tex;
        }
      }
    }
  }, [tex]);

  return (
    <div
      className={`min-w-0 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] ${
        compact ? "p-2.5" : "p-4"
      }`}
    >
      {label && (
        <p className={`font-bold text-[var(--primary)] mb-1 flex items-center gap-1 ${compact ? "text-[10px] uppercase tracking-wider" : "text-sm"}`}>
          {label}
        </p>
      )}
      <div className="overflow-x-auto py-0.5">
        {/* The rendered maths is inside this element, so an aria-label here
            would be announced *in addition* to KaTeX's own MathML/HTML output —
            a screen reader read the equation twice, the second time as raw TeX
            ("CaCO3(s)→CaO(s)+CO2(g)\\text{CaCO}_3(s)..."). The purpose of the
            label was to give the formula an accessible name, and KaTeX already
            does that, so the attribute is gone. `role="img"` keeps the formula
            as a single stop in the accessibility tree. */}
        <div ref={containerRef} role="img" />
      </div>
      {description && !compact && (
        <p className="mt-2 text-xs text-[var(--muted)]" aria-label="Penjelasan persamaan">
          {description}
        </p>
      )}
    </div>
  );
}
