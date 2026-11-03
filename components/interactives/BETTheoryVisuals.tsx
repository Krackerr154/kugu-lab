"use client";

/**
 * Visual untuk teori BET (Modul 7).
 *
 * BETPoreFilling — potongan pori yang terisi seiring P/P0, digabung dengan
 * kurva isoterm yang bergerak pada sumbu yang sama. Keduanya dihitung dari
 * model situs yang sama (lib/m7-bet.ts), jadi gambar dan kurva tidak mungkin
 * bercerita berbeda.
 *
 * IUPACGallery — enam tipe isoterm IUPAC, dipilih untuk dibaca cirinya.
 */

import { useId, useMemo, useState } from "react";

import {
  ISOTHERM_TYPES,
  type IsothermTypeId,
  filledSites,
  iupacCurve,
  poreCurve,
  poreVolume,
} from "@/lib/m7-bet";

const ACID_COLOR = "var(--chart-navy)";
const ALFUM_COLOR = "var(--chart-gold)";
const DIM = "var(--text-secondary)";

/* ── 1. Pengisian pori + isoterm ──────────────────────────────────────── */

const LAYER_COLOR: Record<string, string> = {
  mono: ACID_COLOR,
  multi: ALFUM_COLOR,
  capillary: "var(--chart-green, var(--secondary))",
};

function pathOf(pts: readonly { x: number; v: number }[], w: number, h: number): string {
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${(p.x * w).toFixed(2)},${(h - p.v * h).toFixed(2)}`)
    .join(" ");
}

export function BETPoreFilling() {
  const [pp, setPp] = useState(0);
  const [branch, setBranch] = useState<"ads" | "des">("ads");
  const describedBy = useId();

  const sites = useMemo(() => filledSites(pp, branch), [pp, branch]);
  const ads = useMemo(() => poreCurve("ads"), []);
  const des = useMemo(() => poreCurve("des"), []);
  const vol = poreVolume(pp, branch);

  const stage =
    pp <= 0
      ? "Pori masih kosong"
      : pp < 0.15
      ? "Monolayer terbentuk di dinding pori"
      : pp < 0.5
        ? "Lapisan berganda mulai menumpuk"
        : pp < 0.9
          ? "Kondensasi kapiler mengisi bagian tengah pori"
          : "Pori terisi penuh";

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* potongan pori */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2">
          <svg viewBox="0 0 100 100" className="h-[190px] w-full" role="img" aria-label={`Potongan pori pada P/P0 ${pp.toFixed(2)}: ${stage}`}>
            {/* dinding pori */}
            <rect x={18} y={6} width={8} height={88} fill="var(--surface-container)" stroke="var(--outline-variant)" />
            <rect x={74} y={6} width={8} height={88} fill="var(--surface-container)" stroke="var(--outline-variant)" />

            {/* molekul N2 yang sudah teradsorpsi */}
            {sites.map((s, i) => (
              <circle
                key={`${s.x}-${s.y}-${i}`}
                cx={s.x}
                cy={s.y}
                r={2.4}
                fill={LAYER_COLOR[s.layer] ?? ACID_COLOR}
                opacity={0.9}
              />
            ))}

            {/* gas bebas di luar pori */}
            <text x={50} y={99} textAnchor="middle" fontSize={5} fill={DIM}>
              V = {(vol * 100).toFixed(0)}% kapasitas
            </text>
          </svg>
        </div>

        {/* isoterm */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2">
          <svg viewBox="0 0 100 100" className="h-[190px] w-full" role="img" aria-label={`Isoterm pada cabang ${branch === "ads" ? "adsorpsi" : "desorpsi"}, P/P0 ${pp.toFixed(2)}`}>
            <line x1={0} y1={100} x2={100} y2={100} stroke="var(--outline-variant)" />
            <line x1={0} y1={0} x2={0} y2={100} stroke="var(--outline-variant)" />

            {/* loop histeresis: kedua cabang selalu tampak */}
            <path d={pathOf(ads, 100, 100)} fill="none" stroke={ACID_COLOR} strokeWidth={1.6} strokeLinejoin="round" />
            <path d={pathOf(des, 100, 100)} fill="none" stroke={ALFUM_COLOR} strokeWidth={1.6} strokeDasharray="3 2" strokeLinejoin="round" />

            {/* titik berjalan */}
            <circle cx={pp * 100} cy={100 - vol * 100} r={2.6} fill={branch === "ads" ? ACID_COLOR : ALFUM_COLOR} stroke="var(--surface-container-lowest)" strokeWidth={1} />
          </svg>
          <div className="mt-1 flex items-center justify-between text-[9px] text-[var(--text-secondary)]">
            <span>P/P₀ 0</span>
            <span>1</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold text-[var(--foreground)]">P/P₀</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pp * 100)}
          onChange={(e) => setPp(Number(e.target.value) / 100)}
          aria-label="Tekanan relatif P/P0"
          aria-valuetext={`P/P0 ${pp.toFixed(2)} — ${stage}`}
          className="h-8 min-w-[8rem] flex-1 accent-[var(--secondary)]"
        />
        <span className="w-9 text-right font-mono text-[11px] text-[var(--foreground)]">{pp.toFixed(2)}</span>

        <div className="flex overflow-hidden rounded-full border border-[var(--outline-variant)]">
          {(["ads", "des"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBranch(b)}
              aria-pressed={branch === b}
              className={`px-2 py-1 text-[10px] font-semibold ${
                branch === b
                  ? "bg-[var(--secondary)] text-[var(--surface-container-lowest)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-selected)]"
              }`}
            >
              {b === "ads" ? "Adsorpsi" : "Desorpsi"}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]" aria-live="polite" id={describedBy}>
        {stage}
      </p>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--text-secondary)]">
        {[
          ["mono", "Monolayer"],
          ["multi", "Multilayer"],
          ["capillary", "Kapiler"],
        ].map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: LAYER_COLOR[k] }} />
            {label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: ALFUM_COLOR }} />
          Cabang desorpsi
        </span>
      </div>
    </div>
  );
}

/* ── 2. Galeri tipe isoterm IUPAC ─────────────────────────────────────── */

/**
 * Kurva digambar di dalam kotak 100×100 dengan margin dalam, supaya garis
 * tidak terpotong di tepi dan bentuknya memakai seluruh tinggi kartu.
 * Garis memakai `non-scaling-stroke` agar ketebalannya tetap sama di kartu
 * kecil (ponsel) maupun besar (proyektor).
 */
const TILE = 100;
const TILE_PAD_X = 8;
const TILE_PAD_TOP = 9;
const TILE_PAD_BOTTOM = 11;

function tileGeometry(type: IsothermTypeId) {
  const pts = iupacCurve(type, "ads", 80);
  const w = TILE - TILE_PAD_X * 2;
  const h = TILE - TILE_PAD_TOP - TILE_PAD_BOTTOM;
  const baseY = TILE_PAD_TOP + h;
  const d = pts
    .map((p, i) => {
      const x = TILE_PAD_X + p.x * w;
      const y = baseY - p.v * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return { d, baseY, x0: TILE_PAD_X, x1: TILE_PAD_X + w };
}

export function IUPACGallery() {
  const [selected, setSelected] = useState<IsothermTypeId>("I");
  const active = ISOTHERM_TYPES.find((t) => t.id === selected)!;

  return (
    <div>
      {/* auto-fit: kartu melebar mengikuti lebar wadah sebenarnya, bukan lebar
          viewport. Ambang 104px menghasilkan 6 kolom bila ada ruang (689px)
          dan turun mulus ke 3 kolom (dua baris rapi) di dalam dek yang sempit
          — tidak pernah menyisakan satu kartu yatim di baris terakhir.
          Di bawah 900px dipaksa 3 kolom agar barisnya selalu penuh. */}
      <div className="iupac-grid grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(104px,1fr))]">
        {ISOTHERM_TYPES.map((t) => {
          const isActive = t.id === selected;
          const { d, baseY, x0, x1 } = tileGeometry(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              aria-pressed={isActive}
              aria-label={`Tipe ${t.id}: ${t.shape}. ${t.material}`}
              className={`group rounded-xl border-2 p-1.5 text-left transition-colors ${
                isActive
                  ? "border-[var(--secondary)] bg-[var(--surface-selected)]"
                  : "border-[var(--border)] bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container)]"
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-[104px] w-full sm:h-[124px] lg:h-[140px]"
                aria-hidden="true"
              >
                <line
                  x1={x0}
                  y1={baseY}
                  x2={x1}
                  y2={baseY}
                  stroke="var(--outline-variant)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={isActive ? ALFUM_COLOR : ACID_COLOR}
                  strokeWidth={isActive ? 4 : 3.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span
                className={`mt-1 block text-center text-[13px] font-bold ${
                  isActive ? "text-[var(--secondary)]" : "text-[var(--foreground)]"
                }`}
              >
                {t.id}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 min-h-[62px] rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">
          Tipe {active.id} · {active.material}
          {active.hysteresis && (
            <span className="ml-2 rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              histeresis
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-secondary)]">{active.shape}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-secondary)]">{active.note}</p>
      </div>
    </div>
  );
}