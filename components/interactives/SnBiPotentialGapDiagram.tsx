import { ChemText } from "@/components/shared/ChemText";

export function SnBiPotentialGapDiagram() {
  return (
    <div
      data-potential-gap-diagram
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-1.5 sm:p-2 text-xs flex flex-col justify-between h-full"
    >
      {/* Top Row: Reference + Gap Highlight */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 mb-0.5 sm:mb-1 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Peta Potensial Reduksi Standar
          </span>
          <span className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[var(--text-secondary)]">
            E° vs SHE · 25 °C
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-xs text-[var(--secondary)]">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[var(--secondary)]" />
          <span>Gap Standar: ΔE° ≈ 0,45 V</span>
        </div>
      </div>

      {/* Center: Deterministic SVG Potential Axis Box */}
      <div
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-1 sm:p-2 flex-1 flex flex-col justify-center items-center min-h-0"
        style={{ maxHeight: "130px" }}
      >
        <svg
          viewBox="38 0 524 118"
          className="w-full h-full select-none"
          aria-hidden="true"
        >
          {/* Main axis horizontal line */}
          <line
            x1="50"
            y1="54"
            x2="550"
            y2="54"
            stroke="var(--outline-variant)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Ticks */}
          {/* -0.30 V at x=60 */}
          <line x1="60" y1="46" x2="60" y2="62" stroke="var(--outline)" strokeWidth="1.5" />
          <text x="60" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--text-secondary)">
            −0,30 V
          </text>

          {/* 0.00 V (SHE) at x=240 */}
          <line x1="240" y1="43" x2="240" y2="65" stroke="var(--outline)" strokeWidth="2.5" />
          <text x="240" y="74" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            0,00 V (SHE)
          </text>

          {/* +0.50 V at x=540 */}
          <line x1="540" y1="46" x2="540" y2="62" stroke="var(--outline)" strokeWidth="1.5" />
          <text x="540" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--text-secondary)">
            +0,50 V
          </text>

          {/* Sn2+/Sn marker at x=156 (-0.14 V) */}
          <line x1="156" y1="28" x2="156" y2="54" stroke="var(--chart-navy)" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="156" cy="54" r="6" fill="var(--chart-navy)" stroke="#FFFFFF" strokeWidth="2" />
          <text x="156" y="14" textAnchor="middle" fontSize="13" fontWeight="bold" fill="var(--chart-navy)">
            Sn²⁺/Sn
          </text>
          <text x="156" y="27" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            −0,14 V
          </text>

          {/* Bi3+/Bi marker at x=426 (+0.31 V) */}
          <line x1="426" y1="28" x2="426" y2="54" stroke="var(--chart-gold)" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="426" cy="54" r="6" fill="var(--chart-gold)" stroke="#FFFFFF" strokeWidth="2" />
          <text x="426" y="14" textAnchor="middle" fontSize="13" fontWeight="bold" fill="var(--chart-gold)">
            Bi³⁺/Bi
          </text>
          <text x="426" y="27" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            +0,31 V
          </text>

          {/* Bracket between Sn and Bi (from x=156 to x=426) */}
          <path d="M 156 83 L 156 91 L 426 91 L 426 83" fill="none" stroke="var(--secondary)" strokeWidth="1.8" />
          <rect x="228" y="81" width="126" height="20" rx="4" fill="var(--secondary-container)" stroke="var(--secondary)" strokeWidth="1.2" />
          <text x="291" y="95" textAnchor="middle" fontSize="10.5" fontWeight="bold" fontFamily="monospace" fill="var(--on-secondary-container)">
            ΔE° ≈ 0,45 V (GAP)
          </text>

          {/* Qualitative directional arrows at bottom */}
          <text x="60" y="112" textAnchor="start" fontSize="10" fontWeight="500" fill="var(--text-secondary)">
            ← Lebih sulit direduksi
          </text>
          <text x="540" y="112" textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-secondary)">
            Lebih mudah direduksi →
          </text>
        </svg>
      </div>

      {/* Bottom: 2 Comparative Takeaway Cards */}
      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 shrink-0">
        <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error-container)]/10 p-2 sm:p-2.5 flex items-start gap-2 shadow-2xs min-w-0">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--error)] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[11.5px] sm:text-xs text-[var(--error)] truncate">Tanpa Pengompleks (Garam Murni)</p>
            <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5">
              Bi³⁺ tereduksi duluan; deposit tidak membentuk paduan.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--secondary)]/40 bg-[var(--secondary-container)]/20 p-2 sm:p-2.5 flex items-start gap-2 shadow-2xs min-w-0">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--secondary)] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[11.5px] sm:text-xs text-[var(--secondary)] truncate">Dengan Pengompleks (EDTA + Sitrat)</p>
            <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5">
              Potensial digeser berdekatan; kodeposisi Sn–Bi serentak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
