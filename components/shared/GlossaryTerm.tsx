// GlossaryTerm — inline glossary tooltip
"use client";

import { useState } from "react";

interface GlossaryTermProps {
  term: string;
  english?: string;
  definition: string;
}

export function GlossaryTermInline({ term, english, definition }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-help border-b border-dashed border-[var(--primary)] text-[var(--primary-dark)] hover:bg-[var(--primary-light)] rounded"
        aria-expanded={open}
        aria-label={`Definisi: ${term}`}
      >
        {term}
      </button>
      {open && (
        <span
          className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-[var(--border)] bg-white p-3 text-sm shadow-lg"
          role="tooltip"
        >
          <span className="font-semibold">{term}</span>
          {english && <span className="text-xs text-[var(--muted)]"> ({english})</span>}
          <br />
          <span className="text-slate-600">{definition}</span>
        </span>
      )}
    </span>
  );
}
