import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { XRDWorkspace } from "@/components/interactives/XRDWorkspace";
import {
  BraggDiagram,
  CrystalOrderContinuum,
  DiffractogramAnatomy,
} from "@/components/interactives/XRDTheoryVisuals";
import { getModule } from "@/lib/modules";
import {
  ALFUM_SAMPLES,
  ALFUM_STANDARD_REFLECTIONS,
  scherrerD,
} from "@/lib/m5-xrd";

const CARD = "mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5";

export default function M5Page() {
  const module = getModule("m5-xrd")!;
  const sample = ALFUM_SAMPLES[0];

  return (
    <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p>
            <strong>XRD — "Sidik Jari" Material:</strong> Setiap material kristal
            punya susunan atom yang berulang dan khas. Saat ditembak sinar-X,
            berkas sinar dihamburkan dan menghasilkan pola pantulan
            (<em>difraktogram</em>) yang unik — cukup untuk membuktikan identitas
            dan kemurnian fasa sampel.
          </p>
          <p>
            <strong>Kristalin vs Amorf:</strong> Sampel yang atomnya tersusun
            rapi (kristalin) menghasilkan puncak lancip dan tinggi. Kalau susunan
            atomnya berantakan (amorf), grafiknya hanya berupa bukit tumpul yang
            melebar (<em>halo/hump</em>). Keduanya bisa hadir bersamaan:
            semikristalin = puncak tajam di atas gundukan lebar.
          </p>
          <p>
            <strong>Hukum Bragg:</strong> nλ = 2d sinθ. Menghubungkan sudut
            pantul sinar-X (θ) dengan jarak antarbidang atom (d). Dari letak
            puncak 2θ, kita bisa menentukan geometri kisi dan memilah fasa.
          </p>
          <p>
            <strong>Persamaan Scherrer:</strong> D = Kλ/(β cosθ). Makin ramping
            puncak (FWHM β kecil), makin besar ukuran kristalit. Puncak yang
            melebar menandakan kristalit sangat halus (skala nanometer).
          </p>
        </div>
      </section>

      <div className="mt-4 space-y-4">
        <CrystalOrderContinuum />
        <DiffractogramAnatomy />
        <BraggDiagram />
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 5</h2>
        <XRDWorkspace />
      </div>

      <div className="mt-4">
        <section aria-labelledby="m5-al-fum" className={CARD}>
          <h2 id="m5-al-fum" className="text-lg font-bold text-[var(--foreground)]">
            Modul 5 di praktikum: Al-Fum vs Standar (CCDC 1051975)
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Data XRD yang diolah di praktikum berasal dari satu dari tiga sampel
            <strong> Al-Fum </strong> (aluminium fumarat, rasio prekursor 1:2,
            1:3, atau 1:4), dibandingkan dengan pola standar Al-Fum dari CIF
            CCDC 1051975. Rentang scan 2θ = 5°–80°, langkah 0,05° (1501 titik).
            Posisi puncak sampel bergeser sedikit ke kiri dari standar (sampai
            ±0,1°, jauh di bawah toleransi ±0,5°) — kemungkinan karena
            pergeseran tinggi sampel di holder. Tidak ada puncak fasa pengotor.
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left">
                  <th className="py-1.5 pl-2 pr-3">hkl</th>
                  <th className="py-1.5 pr-3">2θ standar (°)</th>
                  <th className="py-1.5 pr-3">2θ 1:2 (°)</th>
                  <th className="py-1.5 pr-3">2θ 1:3 (°)</th>
                  <th className="py-1.5 pr-2">2θ 1:4 (°)</th>
                </tr>
              </thead>
              <tbody>
                {ALFUM_STANDARD_REFLECTIONS.map((r, i) => (
                  <tr key={r.hkl} className="border-b border-[var(--outline-variant)] last:border-0">
                    <td className="py-1.5 pl-2 pr-3 font-mono">{r.hkl}</td>
                    <td className="py-1.5 pr-3 font-mono">{r.twoThetaStd.toFixed(2)}</td>
                    {ALFUM_SAMPLES.map((s) => (
                      <td key={s.id} className="py-1.5 pr-3 font-mono">
                        {(r.twoThetaStd + s.shift[i]).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Tabel posisi puncak dari panduan (slide 31). Nilai sampel dari
            pengolahan dosen (fitting); hasil Origin bisa berbeda sedikit.
          </p>
        </section>
      </div>

      <div className="mt-4">
        <section aria-labelledby="m5-kuantitatif" className={CARD}>
          <h2 id="m5-kuantitatif" className="text-lg font-bold text-[var(--foreground)]">
            Ukuran kristalit & kristalinitas
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            D(hkl) = Kλ/(β cosθ), K = 0,9; λ = 0,154059 nm (Cu Kα1); β = FWHM
            dalam radian; θ = 2θ/2. Hasil panduan untuk puncak 011:
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left">
                  <th className="py-1.5 pl-2 pr-3">Sampel</th>
                  <th className="py-1.5 pr-3">FWHM 011 (°)</th>
                  <th className="py-1.5 pr-3">D Scherrer 011 (nm)</th>
                  <th className="py-1.5 pr-2">Kristalinitas relatif (%)</th>
                </tr>
              </thead>
              <tbody>
                {ALFUM_SAMPLES.map((s) => {
                  const twoTheta011 = ALFUM_STANDARD_REFLECTIONS[0].twoThetaStd + s.shift[0];
                  const D = scherrerD(twoTheta011, s.fwhm011Deg);
                  return (
                    <tr key={s.id} className="border-b border-[var(--outline-variant)] last:border-0">
                      <td className="py-1.5 pl-2 pr-3 font-mono">Al-Fum {s.id}</td>
                      <td className="py-1.5 pr-3 font-mono">{s.fwhm011Deg.toFixed(3)}</td>
                      <td className="py-1.5 pr-3 font-mono">{D.toFixed(1)}</td>
                      <td className="py-1.5 pr-2 font-mono">{s.crystallinityRelPct.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Tabel dari panduan (slide 32). Kristalinitas relatif terhadap 1:2
            hanya sahih bila massa sampel di holder dan kondisi ukur sama.
            Ukuran D belum dikoreksi pelebaran instrumen — jadi batas bawah.
          </p>
        </section>
      </div>

      <div className="mt-4">
        <SafetyCallout variant="warning" title="Keselamatan XRD">
          <p>
            Interlock XRD tidak boleh dilewati. Hanya personel yang berwenang
            yang mengoperasikan instrumen. Penanganan bubuk dan integritas data
            mentah memerlukan otorisasi lokal.
          </p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <LabNotebook title="Catatan XRD M5" storageKey="m5-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "radiation", label: "Sumber radiasi", type: "text", placeholder: "mis. Cu Kα" },
          { id: "wavelength", label: "Panjang gelombang (Å)", type: "number", unit: "Å" },
          { id: "scan_range", label: "Rentang scan 2θ", type: "text", placeholder: "mis. 5-80°" },
          { id: "peaks", label: "Daftar puncak (2θ, intensitas)", type: "textarea", placeholder: "mis. 10.3°(100), 14.6°(40)..." },
          { id: "d_spacings", label: "d-spacing terhitung", type: "textarea" },
          { id: "crystallinity", label: "Kristalinitas (%)", type: "number", unit: "%" },
          { id: "crystallite", label: "Ukuran kristalit (nm)", type: "number", unit: "nm" },
          { id: "phase", label: "Fasa hasil identifikasi", type: "text", placeholder: "mis. Al-Fum (CCDC 1051975)" },
          { id: "interpretation", label: "Interpretasi", type: "textarea" },
        ]} />
      </div>

      <div className="mt-4">
        <ClaimEvidenceReasoning
          prompt="Berdasarkan data XRD Anda, buat klaim tentang fasa/kristalinitas produk sintesis, dukung dengan puncak yang diidentifikasi (2θ, d-spacing, hkl), dan berikan penalaran dengan referensi."
        />
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M5"
          items={[
            { label: "Grafik stacking sampel vs standar (ternormalisasi, standar di bawah)" },
            { label: "Tabel puncak (2θ, intensitas, FWHM, d-spacing, hkl)" },
            { label: "Kesimpulan fasa/kristalinitas/ukuran kristalit" },
            { label: "Sumber referensi (pola/CIF CCDC 1051975)" },
            { label: "Diskusi pergeseran posisi puncak dan limit/error" },
          ]}
        />
      </div>
    </ModuleLayout>
  );
}
