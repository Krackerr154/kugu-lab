// M3 Electrochemical Cell Explorer — cell anatomy, half-reactions, and the
// reduction-potential gap that makes Sn-Bi codeposition non-trivial.
//
// Playback and diagrams live in CodepositionWorkbench; component copy and the
// ComponentKey union live in lib/m3-cell-components.ts.
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ChemText } from "@/components/shared/ChemText";
import { CodepositionWorkbench } from "@/components/interactives/CodepositionWorkbench";
import { CELL_COMPONENTS, type ComponentKey } from "@/lib/m3-cell-components";

export function ElectrochemicalCellExplorer() {
  const [selected, setSelected] = useState<ComponentKey | null>(null);
  const detail = selected ? CELL_COMPONENTS[selected] : null;

  // SVG shapes are not focusable by default. Each hotspot gets role="button",
  // tabIndex, an aria-label and Enter/Space handling so the diagram is fully
  // operable by keyboard and announced by screen readers.
  const hotspot = (key: ComponentKey, label: string) => ({
    role: "button" as const,
    "data-cell-component": key,
    tabIndex: 0,
    "aria-label": label,
    "aria-pressed": selected === key,
    onClick: () => setSelected(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setSelected(key);
      }
    },
    className: "cursor-pointer outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
  });

  return (
    <div className="space-y-4">
      <CodepositionWorkbench selected={selected} hotspot={hotspot} />

      {/* Selected component detail */}
      {detail ? (
        <div key={selected} className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
          <p className="font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {detail.name}
          </p>
          <p className="mt-1 text-sm text-[var(--on-surface)] leading-relaxed">
            <ChemText>{detail.description}</ChemText>
          </p>

          {detail.halfReactions && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                Setengah-reaksi yang mungkin
              </p>
              {detail.halfReactions.map((hr, i) => (
                <div key={i} className="rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface)] p-3">
                  <Equation tex={hr.tex} compact />
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="rounded-full bg-[var(--surface-variant)] px-2 py-0.5 text-xs font-bold text-[var(--on-surface)]">
                      {hr.potential}
                    </span>
                    <span className="text-xs text-[var(--on-surface-variant)]">{hr.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detail.note && (
            <p className="mt-3 border-l-2 border-[var(--secondary)] pl-3 text-xs text-[var(--on-surface-variant)] leading-relaxed">
              <ChemText>{detail.note}</ChemText>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
