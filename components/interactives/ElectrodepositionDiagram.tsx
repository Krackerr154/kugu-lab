import { ChemText } from "@/components/shared/ChemText";

export function ElectrodepositionDiagram() {
  return (
    <div
      data-electrodeposition-diagram
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2 sm:p-2.5 text-xs flex flex-col justify-between h-full"
    >
      <div
        role="img"
        aria-label="Diagram skematik sel elektrodeposisi: Catu daya arus searah DC mengalirkan elektron dari anoda karbon inert ke katoda plat tembaga. Di dalam larutan elektrolit asam ber-pH 2, kation Sn²⁺ dan Bi³⁺ bermigrasi ke permukaan katoda dan menerima elektron untuk membentuk lapisan deposit paduan padat Sn-Bi."
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-1 flex-1 flex items-center justify-center min-h-0"
      >
        <svg
          viewBox="0 0 380 152"
          className="w-full h-auto max-h-[135px] select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="electrolyte-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface-container-high)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--surface-container)" stopOpacity="0.8" />
            </linearGradient>
            <marker
              id="arrow-e"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--primary)" />
            </marker>
            <marker
              id="arrow-ion"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--secondary)" />
            </marker>
          </defs>

          {/* ── POWER SUPPLY (TOP CENTER) ── */}
          <rect
            x="136"
            y="2"
            width="108"
            height="23"
            rx="4"
            fill="var(--surface-container)"
            stroke="var(--outline)"
            strokeWidth="1.1"
          />
          <text
            x="190"
            y="12"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="var(--foreground)"
            letterSpacing="0.04em"
          >
            POWER SUPPLY DC
          </text>
          <text
            x="190"
            y="20.5"
            textAnchor="middle"
            fontSize="6.5"
            fill="var(--text-secondary)"
          >
            Arus Konstan (CC)
          </text>

          {/* Polarity markers on DC source */}
          <circle cx="147" cy="17" r="4.5" fill="var(--error-container)" opacity="0.25" />
          <text x="147" y="20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--error)">
            +
          </text>
          <circle cx="233" cy="17" r="4.5" fill="var(--primary-container)" opacity="0.25" />
          <text x="233" y="20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--primary)">
            −
          </text>

          {/* ── EXTERNAL CIRCUIT WIRES ── */}
          {/* Wire: Anode (+) to DC (+) */}
          <path
            d="M 68 50 L 68 17 L 142 17"
            fill="none"
            stroke="var(--outline)"
            strokeWidth="1.5"
          />
          {/* Wire: DC (-) to Cathode (-) */}
          <path
            d="M 238 17 L 312 17 L 312 50"
            fill="none"
            stroke="var(--outline)"
            strokeWidth="1.5"
          />

          {/* Electron flow arrows */}
          <path d="M 95 17 L 120 17" fill="none" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow-e)" />
          <text x="108" y="12" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--primary)">
            e⁻
          </text>
          <path d="M 255 17 L 285 17" fill="none" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow-e)" />
          <text x="270" y="12" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--primary)">
            e⁻
          </text>

          {/* ── BEAKER CONTAINER ── */}
          <rect
            x="32"
            y="48"
            width="316"
            height="114"
            rx="8"
            fill="none"
            stroke="var(--outline-variant)"
            strokeWidth="1.5"
          />
          {/* Solution Liquid */}
          <rect
            x="34"
            y="64"
            width="312"
            height="96"
            rx="6"
            fill="url(#electrolyte-grad)"
          />
          {/* Meniscus / Liquid surface */}
          <line
            x1="34"
            y1="64"
            x2="346"
            y2="64"
            stroke="var(--outline-variant)"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text
            x="190"
            y="73"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="var(--text-secondary)"
          >
            Elektrolit Asam (pH ~2) · Kompleks Sn &amp; Bi
          </text>

          {/* ── ANODE (C KARBON, LEFT) ── */}
          <rect
            x="58"
            y="42"
            width="20"
            height="96"
            rx="3"
            fill="#334155"
            stroke="var(--outline)"
            strokeWidth="1"
          />
          <text x="68" y="38" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="var(--foreground)">
            Anoda (+)
          </text>
          <text x="68" y="90" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#F8FAFC" transform="rotate(-90 68 90)">
            Karbon (C)
          </text>
          <text x="68" y="146" textAnchor="middle" fontSize="7.5" fill="var(--text-secondary)">
            Inert
          </text>

          {/* ── CATHODE (CU PLAT, RIGHT) ── */}
          {/* Base Copper Plate */}
          <rect
            x="302"
            y="42"
            width="20"
            height="96"
            rx="2"
            fill="#D97706"
            stroke="var(--outline)"
            strokeWidth="1"
          />
          {/* Growing Sn-Bi Deposit Film along immersed surface */}
          <rect
            x="298"
            y="65"
            width="5"
            height="72"
            rx="1.5"
            fill="var(--chart-navy)"
            stroke="var(--primary)"
            strokeWidth="0.8"
          />
          <text x="312" y="38" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="var(--foreground)">
            Katoda (−)
          </text>
          <text x="312" y="90" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FEF3C7" transform="rotate(90 312 90)">
            Plat Cu
          </text>
          <text x="312" y="146" textAnchor="middle" fontSize="7.5" fill="var(--primary)" fontWeight="bold">
            Deposit Sn–Bi
          </text>

          {/* Callout line to deposit */}
          <path d="M 268 126 L 296 116" fill="none" stroke="var(--primary)" strokeWidth="0.9" markerEnd="url(#arrow-e)" />
          <text x="250" y="130" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--primary)">
            Lapisan Paduan
          </text>

          {/* ── SOLUTION MIGRATING CATIONS ── */}
          {/* Sn2+ cation */}
          <g transform="translate(130, 94)">
            <circle cx="0" cy="0" r="8" fill="var(--surface)" stroke="var(--chart-navy)" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--chart-navy)">
              Sn²⁺
            </text>
            <path d="M 12 0 L 26 0" fill="none" stroke="var(--secondary)" strokeWidth="1.2" markerEnd="url(#arrow-ion)" />
          </g>

          {/* Bi3+ cation */}
          <g transform="translate(195, 112)">
            <circle cx="0" cy="0" r="8" fill="var(--surface)" stroke="var(--chart-gold)" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--chart-gold)">
              Bi³⁺
            </text>
            <path d="M 12 0 L 26 0" fill="none" stroke="var(--secondary)" strokeWidth="1.2" markerEnd="url(#arrow-ion)" />
          </g>

          {/* Direction indicator label */}
          <text x="175" y="142" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--secondary)">
            Migrasi Kation Menuju Katoda →
          </text>
        </svg>
      </div>

      {/* ── COMPACT FOOTER REACTION STRIP ── */}
      <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[10px]">
        <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-2 py-0.5 flex-1 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#334155] shrink-0" />
          <span className="font-semibold text-[var(--foreground)]">Anoda:</span>
          <span className="text-[var(--text-secondary)] truncate">Oksidasi (C inert)</span>
        </div>

        <div className="rounded border border-[var(--primary)]/30 bg-[var(--primary-container)]/10 px-2 py-0.5 flex-1 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--chart-navy)] shrink-0" />
          <span className="font-semibold text-[var(--primary)]">Katoda:</span>
          <span className="font-mono text-[9px] text-[var(--foreground)] font-bold truncate">
            <ChemText>{"M^{n+} + ne^{-} → M^{0}"}</ChemText>
          </span>
        </div>
      </div>
    </div>
  );
}
