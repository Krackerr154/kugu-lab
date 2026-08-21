// Equation — KaTeX rendering + accessible text alternative
"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface EquationProps {
  tex: string;
  label?: string;
  description?: string;
}

export function Equation({ tex, label, description }: EquationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(tex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.textContent = tex;
        }
      }
    }
  }, [tex]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      {label && (
        <p className="mb-2 text-sm font-semibold text-[var(--primary-dark)]">{label}</p>
      )}
      <div className="overflow-x-auto">
        <div ref={containerRef} aria-label={tex} />
      </div>
      {description && (
        <p className="mt-2 text-xs text-[var(--muted)]" aria-label="Penjelasan persamaan">
          {description}
        </p>
      )}
    </div>
  );
}
