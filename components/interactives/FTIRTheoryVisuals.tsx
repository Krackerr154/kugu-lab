"use client";

/**
 * Visual demos for the Module 6 FTIR theory section.
 *
 * Four small pieces, each replacing prose rather than decorating it:
 *   FTIRDipoleDemo      — why only some vibrations absorb IR
 *   FTIRModeGallery     — the six vibration modes at a glance
 *   FTIRBandMap         — the four IR regions on one axis, every band drawn at
 *                         its true width and depth, colour-coded by sample
 *   FTIRMorphSpectrum   — free fumaric acid morphing into coordinated Al-Fum
 *
 * Animation is pure CSS (see `ftir-a-*` in app/globals.css) so nothing here
 * re-renders React at frame rate, and every motion stops under
 * prefers-reduced-motion, leaving a readable end-frame.
 */

import { useCallback, useEffect, useId, useMemo, useState, type CSSProperties } from "react";

import {
  ALFUM_OFFSET,
  FTIR_BANDS,
  FTIR_BAND_REGION_LABEL,
  FTIR_THEORY_BANDS,
  buildSpectrum,
  type FtirBandRegion,
} from "@/lib/m6-ftir-bands";
import { useMeasuredWidth } from "@/components/shared/useMeasuredWidth";

const ACID_COLOR = "var(--chart-navy)";
const ALFUM_COLOR = "var(--chart-gold)";
const INK = "var(--foreground)";
const DIM = "var(--text-secondary)";
/* ── 1. Dipole demo ───────────────────────────────────────────────────── */

/**
 * Motion for one half-bond. `group` moves the bond + atom; `shield` applies the
 * reciprocal X-scale to the atom so a stretched bond does not turn the atom
 * into an ellipse.
 */
type ArmMotion = { group?: string; shield?: string };

/** Dashed rest position, so displacement is measurable rather than implied. */
function GhostMolecule() {
  return (
    <g opacity={0.18} aria-hidden="true">
      <line x1={36} y1={27} x2={18} y2={27} stroke={DIM} strokeWidth={1.4} strokeDasharray="2 2" />
      <line x1={36} y1={27} x2={54} y2={27} stroke={DIM} strokeWidth={1.4} strokeDasharray="2 2" />
      <circle cx={16} cy={27} r={5.5} fill="none" stroke={DIM} strokeWidth={1.1} />
      <circle cx={36} cy={27} r={6.5} fill="none" stroke={DIM} strokeWidth={1.1} />
      <circle cx={56} cy={27} r={5.5} fill="none" stroke={DIM} strokeWidth={1.1} />
    </g>
  );
}

function Arm({
  side,
  motion,
  stroke,
}: {
  side: "l" | "r";
  motion: ArmMotion;
  stroke: string;
}) {
  const x2 = side === "l" ? 18 : 54;
  const cx = side === "l" ? 16 : 56;
  return (
    <g className={`ftir-anim-${side} ${motion.group ?? ""}`}>
      <line x1={36} y1={27} x2={x2} y2={27} stroke={stroke} strokeWidth={2.5} />
      <circle className={motion.shield ?? ""} cx={cx} cy={27} r={5.5} fill={stroke} />
    </g>
  );
}

function Molecule({
  left,
  right,
  stroke = ACID_COLOR,
  ghost = false,
}: {
  left: ArmMotion;
  right: ArmMotion;
  stroke?: string;
  ghost?: boolean;
}) {
  return (
    <>
      {ghost && <GhostMolecule />}
      <Arm side="l" motion={left} stroke={stroke} />
      <Arm side="r" motion={right} stroke={stroke} />
      <circle cx={36} cy={27} r={6.5} fill={INK} />
    </>
  );
}

const STRETCH: ArmMotion = { group: "ftir-a-stretch", shield: "ftir-shield-stretch" };
const COMPRESS: ArmMotion = { group: "ftir-a-compress", shield: "ftir-shield-compress" };

export function FTIRDipoleDemo() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2.5">
        <svg
          viewBox="0 0 72 62"
          className="mx-auto h-[62px] w-[72px]"
          role="img"
          aria-label="Ulur simetri: kedua ikatan memanjang dan memendek bersamaan, momen dipol tidak berubah sehingga tidak aktif inframerah."
        >
          <Molecule left={STRETCH} right={STRETCH} ghost />
          <line x1={26} y1={48} x2={46} y2={48} stroke={DIM} strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={36} y={59} textAnchor="middle" fontSize={8} fill={DIM}>
            μ = 0
          </text>
        </svg>
        <p className="mt-1 text-center text-[11px] font-semibold text-[var(--foreground)]">
          Ulur simetri
        </p>
        <p className="text-center text-[10px] text-[var(--text-secondary)]">
          dipol tetap → tidak aktif IR
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2.5">
        <svg
          viewBox="0 0 72 62"
          className="mx-auto h-[62px] w-[72px]"
          role="img"
          aria-label="Ulur asimetri: satu ikatan memanjang saat yang lain memendek, momen dipol berayun sehingga aktif inframerah."
        >
          <Molecule left={COMPRESS} right={STRETCH} ghost />
          <g className="ftir-anim-origin-left ftir-a-dipole">
            <line x1={36} y1={48} x2={62} y2={48} stroke={ALFUM_COLOR} strokeWidth={2} />
            <polygon points="62,44.5 68,48 62,51.5" fill={ALFUM_COLOR} />
          </g>
          <text x={36} y={59} textAnchor="middle" fontSize={8} fill={DIM}>
            μ berubah
          </text>
        </svg>
        <p className="mt-1 text-center text-[11px] font-semibold text-[var(--foreground)]">
          Ulur asimetri
        </p>
        <p className="text-center text-[10px] text-[var(--text-secondary)]">
          dipol berayun → aktif IR
        </p>
      </div>
    </div>
  );
}

/* ── 2. Mode gallery ──────────────────────────────────────────────────── */

/**
 * Periode mengikuti fisika: ulur berada di frekuensi lebih tinggi daripada
 * tekuk, jadi ulur berayun lebih cepat (1.5 s) dan tekuk lebih lambat (2.2 s).
 * Semua amplitudo dinormalisasi ke ~4 px simpangan ujung.
 */
const MODES = [
  {
    label: "Ulur simetri",
    hint: "kedua ikatan memanjang bersamaan",
    plane: "in" as const,
    dur: "1.5s",
    left: STRETCH,
    right: STRETCH,
  },
  {
    label: "Ulur asimetri",
    hint: "satu memanjang, satu memendek",
    plane: "in" as const,
    dur: "1.5s",
    left: COMPRESS,
    right: STRETCH,
  },
  {
    label: "Gunting",
    hint: "sudut ikatan menutup",
    plane: "in" as const,
    dur: "2.2s",
    left: { group: "ftir-a-scissor-l" },
    right: { group: "ftir-a-scissor-r" },
  },
  {
    // Rocking: both terminals travel the same way, still in the plane.
    label: "Goyang",
    hint: "kedua ujung bergeser searah",
    plane: "in" as const,
    dur: "2.2s",
    left: { group: "ftir-a-slide-x" },
    right: { group: "ftir-a-slide-x" },
  },
  {
    // Wagging: both terminals rise and fall together, out of the plane.
    label: "Kipas",
    hint: "kedua ujung naik-turun bersama",
    plane: "out" as const,
    dur: "2.2s",
    left: { group: "ftir-a-slide-y" },
    right: { group: "ftir-a-slide-y" },
  },
  {
    // Twisting: terminals move in opposite directions, out of the plane.
    // No body squeeze — that squashed the central atom and read as contraction.
    label: "Puntir",
    hint: "kedua ujung berlawanan arah",
    plane: "out" as const,
    dur: "2.2s",
    left: { group: "ftir-a-twist-up" },
    right: { group: "ftir-a-twist-down" },
  },
] as const;

export function FTIRModeGallery() {
  // Many Windows machines (and every RDP session on some builds) report
  // `prefers-reduced-motion: reduce`, which the app-wide rule in globals.css
  // turns into a frozen frame. Respect it by default, but let the reader opt in
  // rather than leaving them with something that looks broken.
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = useCallback(() => {
    const next = !playing;
    setPlaying(next);
    // The theory section wraps both this gallery and the dipole demo, so the
    // attribute here re-enables every FTIR demo in one place.
    document.getElementById("m6-ftir-teori")?.setAttribute(
      "data-ftir-anim",
      next ? "on" : "off",
    );
  }, [playing]);

  return (
    <div>
      {reduced && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-2.5 py-1.5">
          <p className="text-[11px] leading-snug text-[var(--text-secondary)]">
            Animasi dimatikan oleh pengaturan sistem Anda.
          </p>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            className="shrink-0 rounded-full border border-[var(--outline-variant)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-selected)]"
          >
            {playing ? "Jeda animasi" : "Putar animasi"}
          </button>
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MODES.map((mode) => (
          <li
            key={mode.label}
            style={{ "--ftir-dur": mode.dur } as CSSProperties}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] px-1 py-2"
          >
            <svg
              viewBox="0 0 72 54"
              className="mx-auto h-[46px] w-[62px]"
              role="img"
              aria-label={`${mode.label}: ${mode.hint}`}
            >
              <Molecule left={mode.left} right={mode.right} ghost />
            </svg>
            <p className="mt-1 text-center text-[11px] font-semibold leading-tight text-[var(--foreground)]">
              {mode.label}
            </p>
            <p className="mt-0.5 min-h-[3.6em] text-center text-[10px] leading-tight text-[var(--text-secondary)]">
              {mode.hint}
            </p>
            <p
              className={`mx-auto mt-1 w-fit rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
                mode.plane === "in"
                  ? "bg-[var(--surface-selected)] text-[var(--foreground)]"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
              }`}
            >
              {mode.plane === "in" ? "dalam bidang" : "luar bidang"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 3. Region locator + identification table ─────────────────────────── */

const AXIS_MIN = 400;
const AXIS_MAX = 4000;

const INTENSITY_CLASS: Record<string, string> = {
  Kuat: "bg-[var(--secondary)] text-[var(--surface-container-lowest)]",
  Sedang: "border border-[var(--outline-variant)] bg-[var(--surface-muted)] text-[var(--foreground)]",
  Lemah: "border border-[var(--outline-variant)] text-[var(--text-secondary)]",
};

function sampleDot(appearsOn: string): string {
  if (appearsOn === "Al-Fum") return ALFUM_COLOR;
  if (appearsOn === "Asam fumarat") return ACID_COLOR;
  return DIM;
}
/**
 * Annotated band map: the four standard IR regions on one wavenumber axis, with
 * every band drawn at its true width and depth.
 *
 * Nothing about "shape" is encoded here — a broad band is drawn broad and a
 * strong band is drawn tall, because `width` and `depth` are the same numbers
 * that plot the spectrum elsewhere. Colour carries which sample shows the band,
 * so four of the table's five columns are readable from the axis alone.
 */
const MAP_ZONES: { from: number; to: number; lines: string[] }[] = [
  { from: 4000, to: 2500, lines: ["Ikatan", "tunggal"] },
  { from: 2500, to: 2000, lines: ["Rangkap", "tiga"] },
  { from: 2000, to: 1500, lines: ["Rangkap", "dua"] },
  { from: 1500, to: 400, lines: ["Sidik jari"] },
];

const MAX_DEPTH = Math.max(...FTIR_BANDS.map((b) => b.depth));

export function FTIRBandMap({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (center: number) => void;
}) {
  const { ref, width } = useMeasuredWidth(640);
  const compact = width < 480;
  const h = compact ? 186 : 220;
  // three staggered label rows need real headroom: at 30px the top row sat at
  // y = -6 and was clipped by the viewport edge.
  const pad = { top: compact ? 18 : 46, right: 6, bottom: compact ? 34 : 30, left: 6 };
  const plotW = Math.max(120, width - pad.left - pad.right);
  // Conventional transmittance presentation: the 100%T baseline runs along the
  // top and absorption bands dip below it.
  const baseY = pad.top;
  const plotBottom = h - pad.bottom;
  const plotH = plotBottom - pad.top;

  const xOf = (v: number) => pad.left + ((AXIS_MAX - v) / (AXIS_MAX - AXIS_MIN)) * plotW;
  const yOf = (depth: number) => baseY + (depth / MAX_DEPTH) * plotH * 0.82;

  // Peak outline: a Gaussian whose sigma comes from the band's own half-width,
  // so two bands of different shape cannot be drawn identically.
  const peakPath = (center: number, halfWidth: number) => {
    const sigma = Math.max(halfWidth / 2, 6);
    const from = center + sigma * 3;
    const to = center - sigma * 3;
    const steps = 22;
    const band = FTIR_BANDS.find((b) => b.center === center);
    if (!band) return "";
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const v = from + ((to - from) * i) / steps;
      const y = yOf(band.depth * Math.exp(-((v - center) ** 2) / (2 * sigma * sigma)));
      pts.push(`${i === 0 ? "M" : "L"}${xOf(v).toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  // Stagger labels so neighbours (1675 vs 1610) never share a row.
  const labelRow = new Map<number, number>();
  if (!compact) {
    const placed: number[][] = [];
    for (const row of FTIR_THEORY_BANDS) {
      const x = xOf(row.anchor);
      let r = 0;
      while ((placed[r] ?? []).some((px) => Math.abs(px - x) < 54)) r++;
      (placed[r] ??= []).push(x);
      labelRow.set(row.anchor, r);
    }
  }

  return (
    <div ref={ref}>
      <svg
        width={width}
        height={h}
        role="img"
        aria-label="Peta pita FTIR: empat daerah spektrum dengan pita digambar sesuai lebar dan kedalamannya. Tabel di bawah memuat rincian tiap pita."
      >
        {/* region zones */}
        {MAP_ZONES.map((z, i) => {
          const x0 = xOf(z.from);
          const x1 = xOf(z.to);
          return (
            <g key={z.lines.join()}>
              <rect
                x={x0}
                y={pad.top}
                width={Math.max(0, x1 - x0)}
                height={plotH}
                fill={i % 2 === 0 ? "var(--surface-container)" : "var(--surface-control)"}
                opacity={0.55}
              />
              <line
                x1={x1}
                y1={pad.top}
                x2={x1}
                y2={baseY}
                stroke="var(--outline-variant)"
                strokeDasharray="2 3"
              />
              {z.lines.map((line, li) => (
                <text
                  key={line}
                  x={(x0 + x1) / 2}
                  y={plotBottom + 12 + li * (compact ? 8 : 10)}
                  fontSize={compact ? 7.5 : 9}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontWeight={600}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* selection band, drawn under the peaks so it reads at any width */}
        {selected !== null && (
          <rect
            x={xOf(selected) - 11}
            y={pad.top}
            width={22}
            height={plotH}
            rx={4}
            fill="var(--secondary)"
            opacity={0.16}
          />
        )}

        {/* baseline */}
        <line
          x1={pad.left}
          y1={baseY}
          x2={pad.left + plotW}
          y2={baseY}
          stroke="var(--outline-variant)"
          strokeDasharray="4 3"
        />
        <text x={pad.left + 2} y={baseY + 10} fontSize={7.5} fill="var(--text-secondary)">
          100%T
        </text>

        {/* peaks */}
        {FTIR_THEORY_BANDS.map((row) => {
          const band = FTIR_BANDS.find((b) => b.center === row.anchor);
          if (!band) return null;
          const isActive = row.anchor === selected;
          const color =
            row.region === "artefact"
              ? DIM
              : band.sample === "al-fum"
                ? ALFUM_COLOR
                : ACID_COLOR;
          return (
            <g
              key={row.anchor}
              onClick={() => onSelect(row.anchor)}
              style={{ cursor: "pointer" }}
            >
              <title>{`${row.position} cm⁻¹ — ${row.group} (${row.intensity}, ${row.shape})`}</title>
              <path
                d={peakPath(band.center, band.width)}
                fill={isActive ? color : "none"}
                fillOpacity={isActive ? 0.22 : 0}
                stroke={color}
                strokeWidth={isActive ? 2 : 1.5}
                strokeLinejoin="round"
              />
              {/* generous invisible hit area: a 1.5px stroke is untappable */}
              <rect
                x={xOf(row.anchor) - 11}
                y={pad.top}
                width={22}
                height={plotH + 6}
                fill="transparent"
              />
              {(!compact || isActive) && (
                <text
                  x={xOf(row.anchor)}
                  y={pad.top - 6 - (compact ? 0 : (labelRow.get(row.anchor) ?? 0) * 11)}
                  fontSize={8.5}
                  textAnchor="middle"
                  fill={isActive ? "var(--foreground)" : "var(--text-secondary)"}
                  fontWeight={isActive ? 700 : 500}
                >
                  {row.anchor}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: ACID_COLOR }} />
          Asam fumarat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: ALFUM_COLOR }} />
          Al-Fum
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: DIM }} />
          Artefak
        </span>
        <span className="text-[var(--text-secondary)]">
          garis atas = 100%T · kedalaman = intensitas · lebar = bentuk pita
        </span>
      </div>
    </div>
  );
}

/**
 * Identification table. Rows are grouped by spectrum region and every value is
 * derived in lib/m6-ftir-bands.ts from the band that the workspace also plots,
 * so the table cannot drift from the spectrum.
 */
export function FTIRBandTable({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (center: number) => void;
}) {
  const regions: FtirBandRegion[] = ["functional", "fingerprint", "artefact"];

  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] lg:hidden">
        <span aria-hidden="true">→</span>
        Geser tabel untuk kolom lain, atau ketuk baris untuk rinciannya.
      </p>
      <div className="relative">
        <div className="overflow-x-auto rounded-lg border border-[var(--outline-variant)]">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <caption className="sr-only">
          Tabel identifikasi pita FTIR Modul 6: posisi, gugus fungsi, intensitas, bentuk pita,
          dan sampel yang memunculkannya.
        </caption>
        <thead>
          <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
            <th
              scope="col"
              className="sticky left-0 z-20 bg-[var(--surface-control)] px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]"
            >
              Posisi (cm⁻¹)
            </th>
            <th scope="col" className="px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">
              Gugus / mode
            </th>
            <th scope="col" className="px-2 py-2 text-center text-[11px] font-semibold text-[var(--text-secondary)]">
              Intensitas
            </th>
            <th scope="col" className="px-2 py-2 text-center text-[11px] font-semibold text-[var(--text-secondary)]">
              Bentuk
            </th>
            <th scope="col" className="px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">
              Muncul pada
            </th>
          </tr>
        </thead>

        {regions.map((region) => {
          const rows = FTIR_THEORY_BANDS.filter((r) => r.region === region);
          if (rows.length === 0) return null;
          const label = FTIR_BAND_REGION_LABEL[region];
          return (
            <tbody key={region}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="border-y border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  {label.title}
                  <span className="ml-1.5 font-medium normal-case tracking-normal">
                    · {label.range}
                  </span>
                </th>
              </tr>
              {rows.map((row) => {
                const isActive = row.anchor === selected;
                const rowBg = isActive ? "bg-[var(--surface-selected)]" : "";
                return (
                  <tr
                    key={row.anchor}
                    onClick={() => onSelect(row.anchor)}
                    className={`cursor-pointer border-b border-[var(--border)] last:border-0 ${rowBg}`}
                  >
                    <td
                      className={`sticky left-0 z-10 px-1 py-0 align-middle ${rowBg || "bg-[var(--surface-container-lowest)]"}`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(row.anchor);
                        }}
                        aria-pressed={isActive}
                        className="flex min-h-10 w-full items-center whitespace-nowrap rounded px-1.5 py-2 text-left font-mono text-[12.5px] font-semibold lg:min-h-0 text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--secondary)]"
                      >
                        {row.position}
                      </button>
                    </td>
                    <td className="px-2.5 py-2 text-[12.5px] leading-snug text-[var(--foreground)]">
                      {row.group}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${INTENSITY_CLASS[row.intensity]}`}
                      >
                        {row.intensity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-center text-[11px] text-[var(--text-secondary)]">
                      {row.shape}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2 text-[11px] text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: sampleDot(row.appearsOn) }}
                        />
                        {row.appearsOn}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
        </div>
      </div>
    </div>
  );
}

/** Strip + table + detail for one selected band. */
export function FTIRBandExplorer() {
  const [selected, setSelected] = useState<number | null>(1675);
  const active = FTIR_THEORY_BANDS.find((row) => row.anchor === selected) ?? null;

  return (
    <div className="space-y-2">
      <FTIRBandMap selected={selected} onSelect={setSelected} />
      <FTIRBandTable selected={selected} onSelect={setSelected} />
      <div
        aria-live="polite"
        className="min-h-[54px] rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2"
      >
        {active ? (
          <>
            <p className="text-[12px] font-semibold text-[var(--foreground)]">
              {active.position} cm⁻¹ · {active.group}
              <span className="ml-2 font-normal text-[var(--text-secondary)]">
                {active.intensity} · {active.shape} · {active.appearsOn}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-secondary)]">
              {active.note}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-[var(--text-secondary)]">
            Pilih baris tabel atau penanda pada sumbu untuk melihat keterangannya.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 4. Morph spectrum ────────────────────────────────────────────────── */

const MORPH_MARKERS = [
  { center: 1675, label: "C=O", kind: "acid" as const, row: 0 },
  { center: 3480, label: "O–H air", kind: "alfum" as const, row: 0 },
  // 1610 and 1430 are only ~25 px apart on a phone: stagger their labels or
  // they overlap exactly when both are on screen mid-morph.
  { center: 1610, label: "COO⁻ asim", kind: "alfum" as const, row: 1 },
  { center: 1430, label: "COO⁻ sim", kind: "alfum" as const, row: 2 },
];

export function FTIRMorphSpectrum() {
  const { ref, width } = useMeasuredWidth(520);
  const [t, setT] = useState(0);

  const compact = width < 420;
  const h = compact ? 180 : 210;
  const pad = { top: 16, right: 10, bottom: 24, left: 34 };
  const plotW = Math.max(80, width - pad.left - pad.right);
  const plotH = h - pad.top - pad.bottom;

  const { path, min, max } = useMemo(() => {
    const points = buildSpectrum("full", 320);
    // Both traces are drawn on one baseline: the stacking offset belongs to the
    // side-by-side view, not to a morph between the two forms.
    const ys = points.flatMap((p) => [p.acid, p.alfum - ALFUM_OFFSET]);
    const lo = Math.floor((Math.min(...ys) - 3) / 5) * 5;
    // Transmittance cannot exceed 100%: without this clamp the padded top end
    // rounds up to 105%, which is meaningless on a T axis.
    const hi = Math.min(100, Math.ceil((Math.max(...ys) + 3) / 5) * 5);

    const xOf = (v: number) => pad.left + ((AXIS_MAX - v) / (AXIS_MAX - AXIS_MIN)) * plotW;
    const yOf = (v: number) => pad.top + ((hi - v) / (hi - lo)) * plotH;

    const d = points
      .map((p, i) => {
        const blended = p.acid * (1 - t) + (p.alfum - ALFUM_OFFSET) * t;
        const cmd = i === 0 ? "M" : "L";
        return `${cmd}${xOf(p.x).toFixed(1)},${yOf(blended).toFixed(1)}`;
      })
      .join(" ");

    return { path: d, min: lo, max: hi };
  }, [t, plotW, plotH, pad.left, pad.top]);

  const xOf = (v: number) =>
    pad.left + ((AXIS_MAX - v) / (AXIS_MAX - AXIS_MIN)) * plotW;

  // Bracket between the two carboxylate bands, fading in with coordination.
  const bracketFrom = xOf(1610);
  const bracketTo = xOf(1430);
  // Sits low in the plot so it never competes with the band labels along the
  // top edge.
  const bracketY = pad.top + plotH * 0.62;

  return (
    <div>
      <div ref={ref}>
        <svg
          width={width}
          height={h}
          role="img"
          aria-label="Spektrum disintesis: saat penggeser bergerak dari asam fumarat ke Al-Fum, pita C=O 1675 memudar dan pita COO⁻ 1610 serta 1430 muncul."
        >
          {/* y axis */}
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={pad.top + plotH}
            stroke="var(--outline-variant)"
          />
          <text x={4} y={pad.top + 7} fontSize={9} fill={DIM}>
            {max}%
          </text>
          <text x={4} y={pad.top + plotH} fontSize={9} fill={DIM}>
            {min}%
          </text>
          <text x={4} y={pad.top + plotH / 2} fontSize={9} fill={DIM}>
            T
          </text>

          {/* x axis */}
          <line
            x1={pad.left}
            y1={pad.top + plotH}
            x2={pad.left + plotW}
            y2={pad.top + plotH}
            stroke="var(--outline-variant)"
          />
          {[4000, 3000, 2000, 1500, 1000, 600].map((v) => (
            <g key={v}>
              <line
                x1={xOf(v)}
                y1={pad.top + plotH}
                x2={xOf(v)}
                y2={pad.top + plotH + 3}
                stroke="var(--outline-variant)"
              />
              <text
                x={xOf(v)}
                y={pad.top + plotH + 14}
                fontSize={8.5}
                textAnchor="middle"
                fill={DIM}
              >
                {v}
              </text>
            </g>
          ))}

          {/* the morphing trace */}
          <path
            d={path}
            fill="none"
            stroke={t < 0.5 ? ACID_COLOR : ALFUM_COLOR}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />

          {/* markers */}
          {MORPH_MARKERS.map((m) => {
            const opacity =
              m.kind === "acid" ? Math.max(0, 1 - t * 1.6) : Math.max(0, (t - 0.2) * 1.6);
            if (opacity <= 0.02) return null;
            const x = xOf(m.center);
            return (
              <g key={m.center} opacity={Math.min(1, opacity)}>
                <line
                  x1={x}
                  y1={pad.top}
                  x2={x}
                  y2={pad.top + plotH}
                  stroke={m.kind === "acid" ? ACID_COLOR : ALFUM_COLOR}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={0.5}
                />
                <text
                  x={x}
                  y={pad.top - 3 + m.row * 11}
                  fontSize={compact ? 8 : 9}
                  textAnchor="middle"
                  fill={m.kind === "acid" ? ACID_COLOR : ALFUM_COLOR}
                  fontWeight={600}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Δν bracket */}
          <g opacity={Math.max(0, (t - 0.55) * 2.2)}>
            <line
              x1={bracketFrom}
              y1={bracketY}
              x2={bracketTo}
              y2={bracketY}
              stroke={ALFUM_COLOR}
              strokeWidth={1}
            />
            <line x1={bracketFrom} y1={bracketY - 3} x2={bracketFrom} y2={bracketY + 3} stroke={ALFUM_COLOR} strokeWidth={1} />
            <line x1={bracketTo} y1={bracketY - 3} x2={bracketTo} y2={bracketY + 3} stroke={ALFUM_COLOR} strokeWidth={1} />
            <text
              x={(bracketFrom + bracketTo) / 2}
              y={bracketY - 5}
              fontSize={8.5}
              textAnchor="middle"
              fill={ALFUM_COLOR}
              fontWeight={700}
            >
              Δν 180
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span
          className={`shrink-0 text-[10px] font-semibold ${t < 0.5 ? "text-[var(--foreground)]" : "text-[var(--text-secondary)]"}`}
        >
          Asam fumarat
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(t * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-label="Geser dari asam fumarat bebas ke Al-Fum terkoordinasi"
          aria-valuetext={
            t < 0.02
              ? "asam fumarat bebas"
              : t > 0.98
                ? "Al-Fum terkoordinasi"
                : `${Math.round(t * 100)} persen menuju Al-Fum`
          }
          className="h-8 w-full accent-[var(--secondary)]"
        />
        <span
          className={`shrink-0 text-[10px] font-semibold ${t >= 0.5 ? "text-[var(--foreground)]" : "text-[var(--text-secondary)]"}`}
        >
          Al-Fum
        </span>
      </div>

      <p className="mt-1 text-[10px] leading-snug text-[var(--text-secondary)]">
        Spektrum disintesis dari posisi pita modul ini — ilustrasi, bukan data terukur.
      </p>
    </div>
  );
}