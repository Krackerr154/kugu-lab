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
      className={`rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] ${
        compact ? "p-2.5" : "p-4"
      }`}
    >
      {label && (
        <p className={`font-bold text-[var(--primary)] mb-1 flex items-center gap-1 ${compact ? "text-[10px] uppercase tracking-wider" : "text-sm"}`}>
          {label}
        </p>
      )}
      <div className="overflow-x-auto py-0.5">
        <div ref={containerRef} aria-label={tex} />
      </div>
      {description && !compact && (
        <p className="mt-2 text-xs text-[var(--muted)]" aria-label="Penjelasan persamaan">
          {description}
        </p>
      )}
    </div>
  );
}
