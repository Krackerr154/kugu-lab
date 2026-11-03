"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ALFUM_OFFSET,
  ASSIGNMENT_OPTIONS,
  FTIR_REGIONS,
  assignmentLabel,
  bandById,
  buildSpectrum,
  checkAssignment,
  markedBands,
  progressOf,
  sampleLabel,
  spectrumDomain,
  type AssignmentKey,
  type FtirBand,
  type FtirRegionId,
} from "@/lib/m6-ftir-bands";

const PAD = { top: 26, right: 14, bottom: 42, left: 48 };
const ACID_COLOR = "var(--chart-navy)";
const ALFUM_COLOR = "var(--chart-gold)";

/** Steps a human reads easily: 1, 2, 2.5, 5, 10 x a power of ten. */
function niceStep(raw: number): number {
  const exp = Math.floor(Math.log10(raw));
  const base = 10 ** exp;
  const n = raw / base;
  const mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return mult * base;
}

function ticksBetween(min: number, max: number, target: number): number[] {
  const step = niceStep((max - min) / target);
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

const DOMAIN = spectrumDomain();

/**
 * The plot is measured in CSS pixels rather than a scaled viewBox: a viewBox
 * shrinks axis text with the container, which made labels unreadable on a
 * phone. One unit is one pixel at every width.
 */
function useMeasuredWidth(fallback: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number) => {
      if (w > 0) setWidth(Math.round(w));
    };
    apply(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

export function FTIRWorkspace() {
  const [regionId, setRegionId] = useState<FtirRegionId>("fingerprint");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AssignmentKey>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const { ref: plotRef, width: plotWidth } = useMeasuredWidth(760);

  const region = FTIR_REGIONS.find((r) => r.id === regionId) ?? FTIR_REGIONS[0];
  const points = useMemo(() => buildSpectrum(regionId, 520), [regionId]);
  const progress = progressOf(answers);

  const selected = selectedId ? bandById(selectedId) : undefined;
  const given = selected ? answers[selected.id] : undefined;
  // Only a band the student has actually answered has a verdict; an untouched
  // band must not read as a wrong attempt.
  const verdict = selected && given !== undefined ? checkAssignment(selected.id, given) : null;
  const isCorrect = Boolean(verdict?.correct);
  const isWrong = Boolean(verdict && !verdict.correct);
  const isRevealed = Boolean(selected && revealed[selected.id]);

  // The plot sits in a 475px column at desktop and ~334px on a phone; the
  // threshold has to match the container, not the viewport.
  const plotH = plotWidth < 400 ? 250 : 390;
  const plotW = Math.max(plotWidth, 280);
  const innerW = Math.max(plotW - PAD.left - PAD.right, 120);
  const innerH = plotH - PAD.top - PAD.bottom;

  const xOf = (w: number) => PAD.left + ((region.max - w) / (region.max - region.min)) * innerW;
  const yOf = (t: number) => PAD.top + ((DOMAIN.max - t) / (DOMAIN.max - DOMAIN.min)) * innerH;

  const linePath = (key: "acid" | "alfum") =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.x).toFixed(1)} ${yOf(p[key]).toFixed(1)}`)
      .join(" ");

  const visibleBands = markedBands().filter(
    (b) => b.center >= region.min && b.center <= region.max
  );

  const nearestPoint = (band: FtirBand) =>
    points.reduce(
      (best, p) => (Math.abs(p.x - band.center) < Math.abs(best.x - band.center) ? p : best),
      points[0]
    );

  /** Selecting a band outside the current window jumps to the window that holds it. */
  const selectBand = (band: FtirBand) => {
    setSelectedId(band.id);
    if (band.center < region.min || band.center > region.max) {
      const target = FTIR_REGIONS.find((r) => band.center >= r.min && band.center <= r.max);
      if (target) setRegionId(target.id);
    }
  };

  const answer = (band: FtirBand, key: AssignmentKey) => {
    setAnswers((prev) => ({ ...prev, [band.id]: key }));
  };

  const reset = () => {
    setAnswers({});
    setRevealed({});
    setSelectedId(null);
  };

  // Reading order follows the plot (high wavenumber on the left).
  const listedBands = [...markedBands()].sort((a, b) => b.center - a.center);

  return (
    <div className="space-y-4">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[var(--foreground)]">Penetapan pita FTIR</h3>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Pilih pita pada spektrum, lalu tetapkan gugus fungsinya.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-[var(--text-secondary)] tabular-nums">
            <span className="font-bold text-[var(--foreground)]">{progress.correct}</span>
            <span> tepat · </span>
            <span className="font-bold text-[var(--foreground)]">{progress.answered}</span>
            <span> / {progress.total} pita dijawab</span>
          </p>
          <button
            type="button"
            onClick={reset}
            className="m4-motion-control inline-flex min-h-11 lg:min-h-8 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            <span>Ulangi</span>
          </button>
        </div>
      </div>

      {/* ── Region switch ──────────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Rentang bilangan gelombang"
        className="inline-flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1"
      >
        {FTIR_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegionId(r.id)}
            aria-pressed={regionId === r.id}
            className={`min-h-11 lg:min-h-8 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              regionId === r.id
                ? "bg-[var(--surface-container-lowest)] text-[var(--primary-container)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            {r.label}
            <span className="ml-1.5 font-normal text-[var(--muted)]">{r.range}</span>
          </button>
        ))}
      </div>

      {/* ── Plot + assignment panel ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section
          aria-label="Spektrum FTIR asam fumarat dan Al-Fum"
          className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: ACID_COLOR }}
                />
                Asam fumarat
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: ALFUM_COLOR }}
                />
                Al-Fum
              </span>
            </div>
            <span className="text-xs text-[var(--muted)]">% transmitansi</span>
          </div>

          <div ref={plotRef}>
            <svg
              width={plotW}
              height={plotH}
              viewBox={`0 0 ${plotW} ${plotH}`}
              className="block w-full select-none"
              role="img"
              aria-label={`Spektrum FTIR ilustratif dari ${region.min} sampai ${region.max} per sentimeter, menampilkan ${visibleBands.length} pita bertanda. Gunakan daftar pita di bawah untuk menetapkan gugus fungsi.`}
            >
              {/* Gridlines */}
              {ticksBetween(DOMAIN.min, DOMAIN.max, 5).map((v) => (
                <line
                  key={`gy-${v}`}
                  x1={PAD.left}
                  y1={yOf(v)}
                  x2={PAD.left + innerW}
                  y2={yOf(v)}
                  stroke="var(--surface-container-high)"
                  strokeWidth="1"
                />
              ))}

              {/* Y axis labels */}
              {ticksBetween(DOMAIN.min, DOMAIN.max, 5).map((v) => (
                <text
                  key={`ly-${v}`}
                  x={PAD.left - 8}
                  y={yOf(v) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--text-secondary)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {v}
                </text>
              ))}

              {/* Traces */}
              <path d={linePath("acid")} fill="none" stroke={ACID_COLOR} strokeWidth="1.8" />
              <path d={linePath("alfum")} fill="none" stroke={ALFUM_COLOR} strokeWidth="1.8" />

              {/* Baseline */}
              <line
                x1={PAD.left}
                y1={PAD.top + innerH}
                x2={PAD.left + innerW}
                y2={PAD.top + innerH}
                stroke="var(--outline-variant)"
                strokeWidth="1"
              />

              {/* X axis labels */}
              {ticksBetween(region.min, region.max, 8).map((v) => (
                <text
                  key={`lx-${v}`}
                  x={xOf(v)}
                  y={PAD.top + innerH + 17}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-secondary)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {v}
                </text>
              ))}
              <text
                x={PAD.left + innerW / 2}
                y={plotH - 4}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-secondary)"
              >
                Bilangan gelombang (cm⁻¹)
              </text>

              {/* Band markers */}
              {visibleBands.map((band) => {
                const near = nearestPoint(band);
                const t = band.sample === "asam-fumarat" ? near.acid : near.alfum;
                const cx = xOf(band.center);
                const cy = yOf(t);
                const active = selectedId === band.id;
                const done = answers[band.id] === band.assignment;

                return (
                  <g key={band.id} aria-hidden="true">
                    {active && (
                      <>
                        <line
                          x1={cx}
                          y1={PAD.top}
                          x2={cx}
                          y2={cy}
                          stroke="var(--primary-container)"
                          strokeWidth="1"
                          strokeDasharray="2 3"
                          opacity="0.5"
                        />
                        <text
                          x={Math.min(Math.max(cx, PAD.left + 30), PAD.left + innerW - 30)}
                          y={PAD.top - 9}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill="var(--primary-container)"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {band.center} cm⁻¹
                        </text>
                      </>
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={active ? 7 : 5}
                      fill={done ? "var(--chart-green)" : "var(--surface-container-lowest)"}
                      stroke={
                        active
                          ? "var(--primary-container)"
                          : done
                          ? "var(--chart-green)"
                          : "var(--text-secondary)"
                      }
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {/* Generous pointer target; the band list below is the
                        keyboard-accessible equivalent. */}
                    <rect
                      x={cx - 26}
                      y={cy - 26}
                      width="52"
                      height="52"
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectBand(band)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="mt-2 text-xs leading-snug text-[var(--muted)]">
            Spektrum ilustratif yang disusun dari pita teoretis penuntun, bukan data pengukuran
            sampel. Pita Al-Fum digeser {ALFUM_OFFSET} satuan ke atas agar kedua kurva terbaca;
            panduan memakai offset 140.
          </p>
        </section>

        {/* ── Assignment panel ─────────────────────────────────────────── */}
        <section
          aria-label="Penetapan gugus fungsi"
          className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3.5"
        >
          {!selected ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[var(--foreground)]">Cara pakai</p>
              <ol className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--primary-container)]">1</span>
                  <span>Pilih satu pita — bulatan pada spektrum, atau kartu di daftar pita.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--primary-container)]">2</span>
                  <span>Tetapkan gugus fungsi yang menghasilkan pita itu.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--primary-container)]">3</span>
                  <span>
                    Empat pita bertanda <strong>diagnostik</strong> yang membedakan asam fumarat
                    bebas dari Al-Fum: 2950, 1675, 1610, dan 1430 cm⁻¹.
                  </span>
                </li>
              </ol>
              <p className="border-t border-[var(--border)] pt-2.5 text-xs leading-relaxed text-[var(--muted)]">
                Pita 2350 cm⁻¹ sengaja disertakan sebagai jebakan: ia berasal dari CO₂ di udara.
              </p>
              <div className="border-t border-[var(--border)] pt-2.5">
                <p className="text-[11px] font-bold text-[var(--foreground)]">Pita penentu</p>
                <dl className="mt-1.5 space-y-1">
                  {[
                    { w: "2950", t: "O–H asam — hilang setelah koordinasi" },
                    { w: "1675", t: "C=O asam — penanda asam fumarat bebas" },
                    { w: "1610", t: "COO⁻ asimetri — muncul pada Al-Fum" },
                    { w: "1430", t: "COO⁻ simetri — muncul pada Al-Fum" },
                  ].map((row) => (
                    <div key={row.w} className="flex gap-2">
                      <dt className="w-10 shrink-0 text-[11px] font-bold tabular-nums text-[var(--primary-container)]">
                        {row.w}
                      </dt>
                      <dd className="min-w-0 text-[11px] leading-snug text-[var(--text-secondary)]">
                        {row.t}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums leading-none text-[var(--foreground)]">
                    {selected.center}
                    <span className="ml-1 text-xs font-medium text-[var(--muted)]">cm⁻¹</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                    {sampleLabel(selected.sample)}
                    {selected.diagnostic && (
                      <span className="ml-1.5 rounded bg-[var(--surface-selected)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--secondary)]">
                        diagnostik
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Tutup pita terpilih"
                  className="m4-motion-control -mr-1 -mt-1 inline-flex h-11 w-11 lg:h-7 lg:w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-container)]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>

              {isCorrect && (
                <div className="rounded-lg border border-[var(--chart-green)]/35 bg-[var(--chart-green)]/8 px-2.5 py-2">
                  <p className="text-xs font-bold text-[var(--chart-green)]">Tepat</p>
                  <p className="mt-0.5 text-xs leading-snug text-[var(--text-secondary)]">
                    {selected.note}
                  </p>
                </div>
              )}

              {isWrong && !isRevealed && (
                <p className="rounded-lg border border-[var(--chart-red)]/35 bg-[var(--chart-red)]/8 px-2.5 py-2 text-xs font-semibold text-[var(--chart-red)]">
                  Belum tepat. Coba lagi — perhatikan apakah pitanya berasal dari COOH bebas atau
                  COO⁻ terkoordinasi.
                </p>
              )}

              {isRevealed && !isCorrect && (
                <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-2.5 py-2">
                  <p className="text-xs font-bold text-[var(--foreground)]">
                    Kunci: {assignmentLabel(selected.assignment)}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-[var(--text-secondary)]">
                    {selected.note}
                  </p>
                </div>
              )}

              <div className="grid gap-1.5" role="group" aria-label="Pilihan gugus fungsi">
                {ASSIGNMENT_OPTIONS.map((option) => {
                  const chosen = answers[selected.id] === option.key;
                  const showKey = isRevealed || isCorrect;
                  const isAnswer = option.key === selected.assignment;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={isCorrect}
                      onClick={() => answer(selected, option.key)}
                      aria-pressed={chosen}
                      className={[
                        "m4-motion-control min-h-11 lg:min-h-8 rounded-lg border px-2.5 py-1 text-left text-xs font-semibold leading-snug transition-colors",
                        showKey && isAnswer
                          ? "border-[var(--chart-green)] bg-[var(--chart-green)]/10 text-[var(--chart-green)]"
                          : chosen
                          ? "border-[var(--chart-red)] bg-[var(--chart-red)]/8 text-[var(--chart-red)]"
                          : "border-[var(--outline-variant)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)]",
                        isCorrect ? "cursor-default" : "",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {!isCorrect && !isRevealed && (
                <button
                  type="button"
                  onClick={() => setRevealed((prev) => ({ ...prev, [selected.id]: true }))}
                  className="m4-motion-control inline-flex min-h-11 lg:min-h-8 items-center text-xs font-semibold text-[var(--primary-container)] underline underline-offset-2 hover:no-underline"
                >
                  Buka penjelasan pita ini
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── Band map ───────────────────────────────────────────────────── */}
      <section aria-label="Daftar pita pada spektrum" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-[var(--foreground)]">Daftar pita</h4>
          <p className="text-[11px] text-[var(--muted)]">
            Belum dijawab <span aria-hidden="true">—</span> · Tepat ✓ · Belum tepat ✗
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-5">
          {listedBands.map((band) => {
            const answerGiven = answers[band.id];
            const done = answerGiven === band.assignment;
            const attempted = answerGiven !== undefined;
            const active = selectedId === band.id;

            return (
              <button
                key={band.id}
                type="button"
                onClick={() => selectBand(band)}
                aria-current={active ? "true" : undefined}
                aria-label={`${band.center} cm⁻¹, ${sampleLabel(band.sample)}, ${
                  done ? "sudah tepat" : attempted ? "belum tepat" : "belum dijawab"
                }`}
                className={[
                  "m4-motion-control flex min-h-11 flex-col justify-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                  active
                    ? "border-[var(--primary-container)] bg-[var(--surface-container-low)]"
                    : "border-[var(--outline-variant)] hover:bg-[var(--surface-container)]",
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold tabular-nums text-[var(--foreground)]">
                    {band.center}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`material-symbols-outlined text-sm ${
                      done
                        ? "text-[var(--chart-green)]"
                        : attempted
                        ? "text-[var(--chart-red)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {done ? "check_circle" : attempted ? "cancel" : "remove"}
                  </span>
                </span>
                <span className="truncate text-[11px] text-[var(--text-secondary)]">
                  {sampleLabel(band.sample)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
