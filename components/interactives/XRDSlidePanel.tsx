"use client";

import { useMemo } from "react";
import {
  CrystalOrderContinuum,
  BraggDiagram,
  DiffractogramAnatomy,
} from "@/components/interactives/XRDTheoryVisuals";
import {
  ALFUM_STANDARD_REFLECTIONS,
  ALFUM_SAMPLES,
  GUIDE_SCHERRER_D011_NM,
  M5_COMMON_TRAPS,
  M5_REPORT_GRID,
  XRD_CONSTANTS,
  dSpacing,
  scherrerD,
} from "@/lib/m5-xrd";
import type { M5EmbeddedComponentType } from "@/lib/m5-review-deck-data";

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[11px] leading-snug text-[var(--muted)]">{children}</p>;
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-panel rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3 sm:p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-container)]">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ── Panel: Tabel Refleksi Standar CCDC 1051975 ────────────────────────── */

function ReflectionsPanel() {
  return (
    <PanelShell title="Refleksi Acuan Al-Fum MOF (CCDC 1051975)">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--outline-variant)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="sticky left-0 z-10 bg-[var(--surface)] py-2 pr-3">Indeks (hkl)</th>
              <th className="py-2 px-3 text-right">2θ Acuan (°)</th>
              <th className="py-2 px-3 text-right">d-spacing (Å)</th>
              <th className="py-2 pl-3 text-right">Intensitas Relatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)]">
            {ALFUM_STANDARD_REFLECTIONS.map((r) => (
              <tr key={r.hkl} className="hover:bg-[var(--surface-container-highest)]/40 transition-colors">
                <td className="sticky left-0 z-10 bg-[var(--surface)] py-2 pr-3 font-mono font-bold text-[var(--primary)]">({r.hkl})</td>
                <td className="py-2 px-3 text-right font-mono">{r.twoThetaStd.toFixed(2)}°</td>
                <td className="py-2 px-3 text-right font-mono">{dSpacing(r.twoThetaStd).toFixed(2)} Å</td>
                <td className="py-2 pl-3 text-right">
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    <span className="font-mono font-semibold">{r.relIntensity}%</span>
                    <span
                      className="inline-block h-1.5 rounded-full bg-[var(--primary-container)]"
                      style={{ width: `${Math.max(8, (r.relIntensity / 100) * 40)}px` }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>
        Panjang gelombang radiasi Cu Kα1: λ = {XRD_CONSTANTS.lambdaA} Å. Jarak antarbidang d dihitung dari Hukum Bragg:
        d = λ / (2 sin θ). Puncak (011) di 10,39° adalah refleksi diagnostik utama.
      </Caption>
      <p className="mt-1.5 text-[10px] leading-snug text-[var(--muted)] lg:hidden">
        Geser tabel ke samping untuk melihat semua kolom.
      </p>
    </PanelShell>
  );
}

/* ── Panel: Benchmark Sampel Praktikum 1:2, 1:3, 1:4 ─────────────────────── */

function SamplesPanel() {
  return (
    <PanelShell title="Benchmark Hasil Panduan: Rasio 1:2, 1:3, 1:4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--outline-variant)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="sticky left-0 z-10 bg-[var(--surface)] py-2 pr-2">Sampel</th>
              <th className="py-2 px-2 text-right">2θ (011)</th>
              <th className="py-2 px-2 text-right">FWHM (°)</th>
              <th className="py-2 px-2 text-right">D (nm)</th>
              <th className="py-2 pl-2 text-right">Kristalinitas Relatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)]">
            {ALFUM_SAMPLES.map((s) => {
              const peak2Theta = ALFUM_STANDARD_REFLECTIONS[0].twoThetaStd + s.shift[0];
              const crystalliteD = GUIDE_SCHERRER_D011_NM[s.id];
              return (
                <tr key={s.id} className="hover:bg-[var(--surface-container-highest)]/40 transition-colors">
                  <td className="sticky left-0 z-10 bg-[var(--surface)] py-2 pr-2 font-semibold text-[var(--foreground)]">Al-Fum {s.id}</td>
                  <td className="py-2 px-2 text-right font-mono">{peak2Theta.toFixed(2)}°</td>
                  <td className="py-2 px-2 text-right font-mono">{s.fwhm011Deg.toFixed(3)}°</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-[var(--primary)]">
                    {crystalliteD.toFixed(1)} nm
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        s.crystallinityRelPct >= 90
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {s.crystallinityRelPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Caption>
        Sampel rasio 1:2 memiliki profil paling teratur dengan kristalinitas 100% dan ukuran kristalit 24,4 nm. Rasio
        1:4 mengalami penurunan tajam menjadi 43,5% akibat kelebihan ligan fumarat yang tidak terkoordinasi sempurna.
      </Caption>
      <p className="mt-1.5 text-[10px] leading-snug text-[var(--muted)] lg:hidden">
        Geser tabel ke samping untuk melihat semua kolom.
      </p>
    </PanelShell>
  );
}

/* ── Panel: Panduan Persamaan Scherrer & Contoh Hitung ─────────────────── */

function ScherrerPanel() {
  const exampleD = useMemo(() => {
    // Rasio 1:2: 2theta = 10.39, fwhm = 0.327
    return scherrerD(0.327, 10.39 / 2);
  }, []);

  return (
    <PanelShell title="Penentuan Ukuran Kristalit: Persamaan Scherrer">
      <div className="space-y-3">
        <div className="rounded-lg bg-[var(--surface-container)] p-3 text-center border border-[var(--outline-variant)]">
          <p className="font-mono text-base font-bold text-[var(--primary)]">
            D = (K · λ) / (β · cos θ)
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1">
            K = 0,9 · λ = 0,154059 nm (Cu Kα1) · β dalam radian · θ = 2θ / 2
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-highest)]/30 p-2.5">
            <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Konversi Sudut</span>
            <p className="mt-1 font-mono text-[11px]">θ = 2θ / 2</p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">Excel: =RADIANS(2θ/2)</p>
          </div>
          <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-highest)]/30 p-2.5">
            <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Konversi FWHM</span>
            <p className="mt-1 font-mono text-[11px]">β_rad = β_deg × π / 180</p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">Excel: =RADIANS(FWHM)</p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs">
          <span className="block text-[10px] font-bold uppercase text-[var(--primary)]">Contoh: Sampel 1:2 Puncak (011)</span>
          <div className="mt-1 space-y-0.5 font-mono text-[11px] text-[var(--foreground)]">
            <p>2θ = 10,39° → θ = 5,195° (0,09067 rad) → cos θ = 0,9959</p>
            <p>FWHM = 0,327° → β = 0,005707 rad</p>
            <p className="font-bold text-[var(--primary)]">
              D = (0,9 × 0,154059) / (0,005707 × 0,9959) = {exampleD.toFixed(1)} nm
            </p>
          </div>
        </div>
      </div>
      <Caption>
        Persamaan Scherrer mengasumsikan pelebaran instrumen dapat diabaikan dan kristalit berbentuk mendekati kubus.
        Rumus hanya valid untuk ukuran kristalit skala nano (1–100 nm).
      </Caption>
    </PanelShell>
  );
}

/* ── Panel: Jebakan Umum Analisis Data XRD ───────────────────────────────── */

function TrapsPanel() {
  return (
    <PanelShell title="Hal Penting & Kesalahan Umum Analisis XRD">
      <div className="space-y-2">
        {M5_COMMON_TRAPS.map((trap, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {idx + 1}
            </span>
            <p className="text-[11px] leading-relaxed text-[var(--foreground)]">{trap}</p>
          </div>
        ))}
      </div>
      <Caption>
        Periksa seluruh lembar kerja Excel dan grafik OriginPro kalian terhadap 5 poin di atas sebelum mengumpulkan draf
        laporan akhir praktikum.
      </Caption>
    </PanelShell>
  );
}

/* ── Panel: Format Laporan & Kisi-Kisi Rubrik ────────────────────────────── */

function ReportPanel() {
  return (
    <PanelShell title="Kisi-Kisi Komponen Laporan Akhir Modul 5 XRD">
      <div className="space-y-2">
        {M5_REPORT_GRID.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-highest)]/30 p-2.5 text-xs"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/20 font-mono text-[10px] font-bold text-[var(--primary)]">
              {idx + 1}
            </span>
            <p className="text-[11px] leading-relaxed text-[var(--foreground)]">{item}</p>
          </div>
        ))}
      </div>
      <Caption>
        Pastikan seluruh grafik menyertakan legenda, sumbu dengan satuan lengkap (2θ dalam ° dan intensitas dalam a.u.),
        serta tabel perbandingan nilai eksperimen terhadap literatur acuan CCDC 1051975.
      </Caption>
    </PanelShell>
  );
}

/* ── Main Router: XRDSlidePanel ─────────────────────────────────────────── */

export function XRDSlidePanel({ variant }: { variant?: M5EmbeddedComponentType }) {
  if (!variant) return null;

  switch (variant) {
    case "xrd-lattice":
      return (
        <div className="space-y-2">
          <CrystalOrderContinuum />
          <Caption>
            Geser slider atau klik tombol &apos;Putar&apos; untuk melihat transisi periodisitas kisi atom dari kristal
            teratur (puncak tajam) hingga amorf murni (halo difus lebar).
          </Caption>
        </div>
      );

    case "xrd-bragg":
      return (
        <div className="space-y-2">
          <BraggDiagram />
          <Caption>
            Visualisasi berkas datang dan pantulan spekular dari bidang kristal. Puncak difraksi tajam muncul saat sudut
            memenuhi syarat interferensi konstruktif Bragg: nλ = 2d sin θ.
          </Caption>
        </div>
      );

    case "xrd-anatomy":
      return (
        <div className="space-y-2">
          <DiffractogramAnatomy />
          <Caption>
            Empat informasi utama: posisi 2θ (d-spacing), lebar FWHM β (ukuran kristalit), luas puncak (kristalinitas),
            dan halo amorf (hamburan difus tak beraturan).
          </Caption>
        </div>
      );

    case "xrd-reflections":
      return <ReflectionsPanel />;

    case "xrd-samples":
      return <SamplesPanel />;

    case "xrd-scherrer":
      return <ScherrerPanel />;

    case "xrd-traps":
      return <TrapsPanel />;

    case "xrd-report":
      return <ReportPanel />;

    default:
      return null;
  }
}
