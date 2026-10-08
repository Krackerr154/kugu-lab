import { ChemText } from "@/components/shared/ChemText";

export function SnBiPotentialGapDiagram() {
  return (
    <div
      data-potential-gap-diagram
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2.5 sm:p-3 text-xs flex flex-col justify-between h-full"
    >
      {/* Top Row: Reference + Gap Highlight */}
      <div className="flex items-center justify-between px-1 mb-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Peta Potensial Reduksi Standar
          </span>
          <span className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-secondary)]">
            E° vs SHE · 25 °C
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[10px] text-[var(--secondary)]">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[var(--secondary)]" />
          <span>Gap Standar: ΔE° ≈ 0,45 V</span>
        </div>
      </div>

      {/* Center: Deterministic SVG Potential Axis Box */}
      <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-1.5 flex-1 flex flex-col justify-center min-h-0">
        <svg
          viewBox="0 0 600 100"
          className="w-full h-auto max-h-[96px] select-none"
          aria-hidden="true"
        >
          {/* Main axis horizontal line */}
          <line
            x1="50"
            y1="52"
            x2="550"
            y2="52"
            stroke="var(--outline-variant)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Ticks */}
          {/* -0.30 V at x=60 */}
          <line x1="60" y1="46" x2="60" y2="58" stroke="var(--outline)" strokeWidth="1.5" />
          <text x="60" y="70" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--text-secondary)">
            −0,30 V
          </text>

          {/* 0.00 V (SHE) at x=240 */}
          <line x1="240" y1="44" x2="240" y2="60" stroke="var(--outline)" strokeWidth="2" />
          <text x="240" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            0,00 V (SHE)
          </text>

          {/* +0.50 V at x=540 */}
          <line x1="540" y1="46" x2="540" y2="58" stroke="var(--outline)" strokeWidth="1.5" />
          <text x="540" y="70" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--text-secondary)">
            +0,50 V
          </text>

          {/* Sn2+/Sn marker at x=156 (-0.14 V) */}
          <line x1="156" y1="28" x2="156" y2="52" stroke="var(--chart-navy)" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="156" cy="52" r="5" fill="var(--chart-navy)" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="156" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--chart-navy)">
            Sn²⁺/Sn
          </text>
          <text x="156" y="27" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            −0,14 V
          </text>

          {/* Bi3+/Bi marker at x=426 (+0.31 V) */}
          <line x1="426" y1="28" x2="426" y2="52" stroke="var(--chart-gold)" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="426" cy="52" r="5" fill="var(--chart-gold)" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="426" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--chart-gold)">
            Bi³⁺/Bi
          </text>
          <text x="426" y="27" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace" fill="var(--foreground)">
            +0,31 V
          </text>

          {/* Bracket between Sn and Bi (from x=156 to x=426) */}
          <path d="M 156 78 L 156 84 L 426 84 L 426 78" fill="none" stroke="var(--secondary)" strokeWidth="1.5" />
          <rect x="235" y="76" width="112" height="16" rx="3" fill="var(--secondary-container)" stroke="var(--secondary)" strokeWidth="1" />
          <text x="291" y="88" textAnchor="middle" fontSize="9.5" fontWeight="bold" fontFamily="monospace" fill="var(--on-secondary-container)">
            ΔE° ≈ 0,45 V (GAP)
          </text>

          {/* Qualitative directional arrows at bottom */}
          <text x="60" y="94" textAnchor="start" fontSize="9" fill="var(--text-secondary)">
            ← Lebih sulit direduksi
          </text>
          <text x="540" y="94" textAnchor="end" fontSize="9" fill="var(--text-secondary)">
            Lebih mudah direduksi →
          </text>
        </svg>
      </div>

      {/* Bottom: 2 Comparative Takeaway Cards */}
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] shrink-0">
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error-container)]/10 px-2.5 py-1.5 flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--error)] shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-[var(--error)] truncate">Tanpa Pengompleks (Garam Murni)</p>
            <p className="text-[9px] text-[var(--text-secondary)] truncate">
              Bi³⁺ jauh lebih mulia, tereduksi duluan; deposit tidak terbentuk paduan.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--secondary)]/40 bg-[var(--secondary-container)]/20 px-2.5 py-1.5 flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--secondary)] shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-[var(--secondary)] truncate">Dengan Pengompleks (EDTA + Sitrat)</p>
            <p className="text-[9px] text-[var(--text-secondary)] truncate">
              Potensial efektif digeser berdekatan; kodeposisi Sn–Bi terjadi serentak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
