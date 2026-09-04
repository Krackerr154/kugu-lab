// M3 Electrochemical Cell Explorer — cell anatomy, half-reactions, and the
// reduction-potential gap that makes Sn-Bi codeposition non-trivial.
//
// Standard reduction potentials (vs SHE, 25 °C) are textbook values included so
// students can answer tugas pendahuluan #2 ("tuliskan reaksi-reaksi yang mungkin
// terjadi di anoda dan katoda ... lengkapi dengan potensial reduksi"). They are
// STANDARD potentials: the actual deposition potentials in this electrolyte are
// shifted by complexation and concentration, which is the point the explorer makes.
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ChemText } from "@/components/shared/ChemText";
import { PredictionPrompt } from "@/components/shared/PredictionPrompt";

type ComponentKey = "dcSource" | "anode" | "cathode" | "electrolyte" | "leads";

interface HalfReaction {
  tex: string;
  potential: string;
  role: string;
}

interface CellComponent {
  name: string;
  description: string;
  halfReactions?: HalfReaction[];
  note?: string;
}

const CELL_COMPONENTS: Record<ComponentKey, CellComponent> = {
  dcSource: {
    name: "Sumber DC (0-10 V, 0-10 A)",
    description:
      "Catu daya arus searah yang memaksa reaksi berlangsung ke arah non-spontan. Terminal positif menarik elektron dari anoda; terminal negatif mendorong elektron ke katoda. Rapat arus diatur sesuai protokol (14,5 mA/cm²) — jangan melebihi arus yang disetujui.",
    note:
      "Sel ini elektrolitik, bukan galvanik: energi listrik dipasok dari luar, sehingga tanda potensial sel keseluruhan negatif secara termodinamika.",
  },
  anode: {
    name: "Anoda (+) — grafit",
    description:
      "Elektroda tempat oksidasi berlangsung. Modul ini memakai grafit, yaitu elektroda yang relatif inert, sehingga yang teroksidasi adalah spesi dalam larutan, bukan elektrodanya sendiri.",
    halfReactions: [
      {
        tex: "2\\text{H}_2\\text{O}(l) \\rightarrow \\text{O}_2(g) + 4\\text{H}^+(aq) + 4e^-",
        potential: "E° = +1,23 V (sebagai reduksi O₂/H₂O)",
        role: "Oksidasi air — reaksi anoda yang umum pada elektroda inert dalam larutan berair",
      },
    ],
    note:
      "Elektrolit ini mengandung klorida (dari HCl dan SnCl₂), sehingga oksidasi klorida juga mungkin bersaing. Reaksi anoda yang berlaku dan implikasi keselamatannya harus dikonfirmasi dengan asisten — jangan diasumsikan dari halaman ini.",
  },
  cathode: {
    name: "Katoda (−) — plat tembaga",
    description:
      "Elektroda tempat reduksi berlangsung. Ion Sn²⁺ dan Bi³⁺ menerima elektron dan mengendap sebagai logam, sehingga massa katoda bertambah. Substrat tembaga tidak ikut terdeposisi — ia hanya permukaan tempat paduan menempel.",
    halfReactions: [
      {
        tex: "\\text{Bi}^{3+}(aq) + 3e^- \\rightarrow \\text{Bi}(s)",
        potential: "E° = +0,31 V",
        role: "Reduksi bismut — potensial paling positif, jadi paling mudah tereduksi",
      },
      {
        tex: "\\text{Sn}^{2+}(aq) + 2e^- \\rightarrow \\text{Sn}(s)",
        potential: "E° = −0,14 V",
        role: "Reduksi timah — butuh potensial lebih negatif daripada bismut",
      },
      {
        tex: "2\\text{H}^+(aq) + 2e^- \\rightarrow \\text{H}_2(g)",
        potential: "E° = 0,00 V",
        role: "Reaksi samping: evolusi hidrogen. Elektrolit ber-pH ~2, jadi H⁺ berlimpah",
      },
    ],
    note:
      "Evolusi H₂ memakai sebagian arus tanpa menambah massa deposit. Inilah salah satu penyebab utama efisiensi arus < 100% pada kalkulator di bawah.",
  },
  electrolyte: {
    name: "Elektrolit (Larutan A + B + C, pH ~2)",
    description:
      "Larutan pembawa ion logam beserta agen pengompleks. Larutan A menyumbang EDTA dalam NH₃, Larutan B menyumbang SnCl₂ dan Bi(NO₃)₃ dalam HCl, Larutan C menyumbang asam sitrat, lalu PEG400 dan NH₃ ditambahkan sebelum diencerkan ke 100 mL.",
    note:
      "EDTA dan asam sitrat mengompleks ion logam sehingga potensial deposisi efektifnya bergeser; PEG400 bekerja pada permukaan deposit. Fungsi rinci tiap komponen adalah bahan tugas pendahuluan #3.",
  },
  leads: {
    name: "Kabel Penghubung",
    description:
      "Penghantar dari sumber DC ke elektroda. Verifikasi polaritas dan kontak (gunakan amperemeter) sebelum menyalakan catu daya.",
    note:
      "Polaritas terbalik akan melarutkan deposit dan merusak percobaan; massa katoda akan turun, bukan naik.",
  },
};

// Potentials plotted on a shared axis so the ~0,45 V gap is visible, not just stated.
const POTENTIAL_SCALE = { min: -0.3, max: 0.5 };
const POTENTIAL_ROWS = [
  { label: "Bi³⁺/Bi", value: 0.31, tone: "var(--chart-gold)", caption: "Paling mudah tereduksi — mengendap lebih dulu" },
  { label: "H⁺/H₂", value: 0.0, tone: "var(--outline)", caption: "Reaksi samping yang menggerus efisiensi arus" },
  { label: "Sn²⁺/Sn", value: -0.14, tone: "var(--chart-navy)", caption: "Perlu potensial lebih negatif" },
];

const potentialToPercent = (v: number) =>
  ((v - POTENTIAL_SCALE.min) / (POTENTIAL_SCALE.max - POTENTIAL_SCALE.min)) * 100;

export function ElectrochemicalCellExplorer() {
  const [selected, setSelected] = useState<ComponentKey | null>(null);
  const detail = selected ? CELL_COMPONENTS[selected] : null;

  // SVG shapes are not focusable by default. Each hotspot gets role="button",
  // tabIndex, an aria-label and Enter/Space handling so the diagram is fully
  // operable by keyboard and announced by screen readers.
  const hotspot = (key: ComponentKey, label: string) => ({
    role: "button" as const,
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
      {/* Cell anatomy diagram */}
      <div className="relative mx-auto max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <svg
          viewBox="0 0 300 200"
          className="w-full"
          aria-label="Diagram sel elektrodeposisi: sumber DC dengan terminal positif ke anoda grafit dan terminal negatif ke katoda tembaga; elektron mengalir dari anoda melalui sumber DC menuju katoda. Setiap komponen dapat dipilih untuk penjelasan."
        >
          {/* DC Source */}
          <rect
            x="120" y="10" width="60" height="30" rx="4"
            fill={selected === "dcSource" ? "var(--secondary-container)" : "var(--surface-variant)"}
            stroke="var(--outline)" strokeWidth="2"
            {...hotspot("dcSource", "Sumber DC")}
          />
          <text x="150" y="30" textAnchor="middle" fontSize="10" fill="var(--on-surface)" pointerEvents="none">DC</text>
          <text x="126" y="30" textAnchor="middle" fontSize="11" fill="var(--error)" fontWeight="bold" pointerEvents="none">+</text>
          <text x="174" y="30" textAnchor="middle" fontSize="12" fill="var(--success)" fontWeight="bold" pointerEvents="none">−</text>

          {/* Wires */}
          <line x1="120" y1="25" x2="60" y2="25" stroke="var(--outline)" strokeWidth="2" />
          <line x1="60" y1="25" x2="60" y2="70" stroke="var(--outline)" strokeWidth="2" />
          <line x1="180" y1="25" x2="240" y2="25" stroke="var(--outline)" strokeWidth="2" />
          <line x1="240" y1="25" x2="240" y2="70" stroke="var(--outline)" strokeWidth="2" />

          {/* Anode (left) */}
          <rect
            x="50" y="70" width="20" height="60" rx="2"
            fill={selected === "anode" ? "var(--error)" : "var(--outline)"}
            stroke="var(--outline)" strokeWidth="2"
            {...hotspot("anode", "Anoda positif, elektroda grafit")}
          />
          <text x="60" y="145" textAnchor="middle" fontSize="9" fill="var(--error)" fontWeight="bold" pointerEvents="none">
            Anoda (+)
          </text>

          {/* Cathode (right) */}
          <rect
            x="230" y="70" width="20" height="60" rx="2"
            fill={selected === "cathode" ? "var(--success)" : "var(--outline)"}
            stroke="var(--outline)" strokeWidth="2"
            {...hotspot("cathode", "Katoda negatif, plat tembaga tempat paduan mengendap")}
          />
          <text x="240" y="145" textAnchor="middle" fontSize="9" fill="var(--success)" fontWeight="bold" pointerEvents="none">
            Katoda (−)
          </text>

          {/* Electrolyte vessel */}
          <rect x="40" y="70" width="220" height="80" rx="4" fill="none" stroke="var(--outline)" strokeWidth="2" />
          <rect
            x="70" y="75" width="160" height="70"
            fill={selected === "electrolyte" ? "var(--primary)" : "var(--primary-fixed-dim)"}
            fillOpacity="0.35"
            {...hotspot("electrolyte", "Elektrolit, larutan A B C dengan pH sekitar 2")}
          />
          <text x="150" y="115" textAnchor="middle" fontSize="9" fill="var(--primary)" pointerEvents="none">Elektrolit</text>

          {/* Leads */}
          <text x="90" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>
            kabel
          </text>
          <text x="210" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>
            kabel
          </text>

          {/* Electron flow: the supply pulls electrons OUT of the anode and pushes
              them INTO the cathode, so both labels advance the same way round. */}
          <text x="78" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
          <text x="196" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
        </svg>
      </div>

      <p className="text-center text-xs text-[var(--on-surface-variant)]">
        Elektron mengalir dari anoda → sumber DC → katoda. Arus konvensional berlawanan arah dengan aliran
        elektron. Gunakan Tab lalu Enter untuk memilih komponen tanpa mouse.
      </p>

      {/* Selected component detail */}
      {detail ? (
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
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
      ) : (
        <p className="text-center text-sm text-[var(--on-surface-variant)]">
          Pilih komponen pada diagram untuk melihat penjelasan dan setengah-reaksinya.
        </p>
      )}

      {/* Reduction potential comparison — the core concept of this module */}
      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
        <h4 className="font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Mengapa Kodeposisi Sn-Bi Sulit
        </h4>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Bandingkan potensial reduksi standar ketiga reaksi katoda pada satu sumbu yang sama.
        </p>

        <div className="mt-4 space-y-3">
          {POTENTIAL_ROWS.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-[var(--on-surface)]">{row.label}</span>
                <span className="font-mono font-bold text-[var(--on-surface)]">
                  {row.value > 0 ? "+" : ""}{row.value.toFixed(2)} V
                </span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-[var(--surface-container-high)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${potentialToPercent(row.value)}%`, background: row.tone }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--on-surface-variant)]">{row.caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-[var(--surface-container-low)] p-3">
          <p className="text-sm text-[var(--on-surface)]">
            Selisih <strong>≈ 0,45 V</strong> antara Bi³⁺/Bi dan Sn²⁺/Sn berarti bismut tereduksi jauh lebih dulu.
            Tanpa intervensi, hasilnya lapisan kaya bismut yang tidak seragam — bukan paduan.
          </p>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Karena itu elektrolit memakai agen pengompleks: EDTA dan asam sitrat mengikat ion logam sehingga
            potensial deposisi efektifnya bergeser dan kedua logam dapat mengendap bersamaan (kodeposisi).
            PEG400 bekerja pada morfologi permukaan deposit.
          </p>
          <p className="mt-2 text-xs italic text-[var(--on-surface-variant)]">
            Nilai di atas adalah potensial <em>standar</em> (1 M, 25 °C, vs SHE). Potensial deposisi sebenarnya di
            elektrolit ini bergeser karena kompleksasi dan konsentrasi — justru itulah mekanisme yang dimanfaatkan.
          </p>
        </div>
      </section>

      {/* Predict before reveal */}
      <PredictionPrompt
        question="Berdasarkan potensial reduksi standar, logam mana yang akan mengendap lebih dulu di katoda, dan mengapa hal itu menjadi masalah untuk membuat paduan Sn-Bi?"
        predictionHint="Bandingkan E° Bi^{3+}/Bi dengan E° Sn^{2+}/Sn, lalu pikirkan komposisi lapisan yang terbentuk..."
        revealText="Bismut mengendap lebih dulu, karena E° Bi^{3+}/Bi = +0,31 V jauh lebih positif daripada E° Sn^{2+}/Sn = −0,14 V."
        explanation="Spesi dengan potensial reduksi lebih positif lebih mudah menerima elektron. Pada potensial katoda yang cukup untuk mereduksi Bi^{3+}, timah belum tereduksi sama sekali, sehingga deposit awal hampir seluruhnya bismut dan komposisi paduan tidak seragam sepanjang ketebalan lapisan. Agen pengompleks (EDTA, asam sitrat) mengikat ion logam dan menggeser potensial deposisi efektifnya sehingga kedua logam dapat mengendap pada rentang potensial yang berdekatan — inilah yang disebut kodeposisi. Sebagai reaksi samping, H^{+} pada pH ~2 juga dapat tereduksi menjadi gas H_{2}, memakai arus tanpa menambah massa deposit dan menurunkan efisiensi arus."
      />
    </div>
  );
}
