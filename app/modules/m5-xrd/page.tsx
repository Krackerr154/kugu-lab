import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { Equation } from "@/components/shared/Equation";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { XRDWorkspace } from "@/components/interactives/XRDWorkspace";
import { getModule } from "@/lib/modules";

export default function M5Page() {
  const module = getModule("m5-xrd")!;

  return (
    <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Teori</h2>
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <p><strong>Difraksi sinar-X (XRD)</strong> mengukur pola difraksi sinar-X oleh material kristalin untuk menentukan struktur kristal.</p>
          <p><strong>Kristalin vs amorf:</strong> material kristalin menghasilkan puncak difraksi tajam; material amorf menghasilkan hump (bump) lebar.</p>
          <p><strong>Hukum Bragg:</strong> nλ = 2d sin θ — menghubungkan panjang gelombang, jarak bidang kristal, dan sudut difraksi.</p>
          <p><strong>Persamaan Scherrer:</strong> D = Kλ/(β cos θ) — mengestimasi ukuran kristalit dari pelebaran puncak (K = 0.9).</p>
        </div>
        <div className="mt-2"><SourceBadge pages="29-33" /></div>
      </section>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 5</h2>
        <XRDWorkspace />
      </div>

      <div className="mt-4">
        <Equation
          tex="n\\lambda = 2d \\sin\\theta"
          label="Hukum Bragg"
          description="n = orde refleksi, λ = panjang gelombang sinar-X (Å), d = jarak bidang kristal (Å), θ = sudut Bragg"
        />
        <div className="mt-2">
          <Equation
            tex="D = \\frac{K\\lambda}{\\beta \\cos\\theta}"
            label="Persamaan Scherrer"
            description="D = ukuran kristalit, K = 0.9 (faktor bentuk), λ = panjang gelombang, β = FWHM (radian), θ = sudut Bragg"
          />
        </div>
      </div>

      <div className="mt-4">
        <SafetyCallout variant="warning" title="Keselamatan XRD">
          <p>Interlock XRD tidak boleh dilewati. Hanya personel yang berwenang yang mengoperasikan instrumen. Penanganan bubuk dan integritas data mentah memerlukan otorisasi lokal.</p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <LabNotebook title="Catatan XRD M5" storageKey="m5-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "radiation", label: "Sumber radiasi", type: "text", placeholder: "mis. Cu Kα" },
          { id: "wavelength", label: "Panjang gelombang (Å)", type: "number", unit: "Å" },
          { id: "scan_range", label: "Rentang scan 2θ", type: "text", placeholder: "mis. 5-40°" },
          { id: "peaks", label: "Daftar puncak (2θ, intensitas)", type: "textarea", placeholder: "mis. 6.2°(100), 10.1°(40)..." },
          { id: "d_spacings", label: "d-spacing terhitung", type: "textarea" },
          { id: "crystallinity", label: "Kristalinitas (%)", type: "number", unit: "%" },
          { id: "crystallite", label: "Ukuran kristalit (nm)", type: "number", unit: "nm" },
          { id: "phase", label: "Fasa hasil identifikasi", type: "text", placeholder: "mis. FAU zeolit" },
          { id: "interpretation", label: "Interpretasi", type: "textarea" },
        ]} />
      </div>

      <div className="mt-4">
        <ClaimEvidenceReasoning
          prompt="Berdasarkan data XRD Anda, buat klaim tentang fasa/kristalinitas produk sintesis, dukung dengan puncak yang diidentifikasi (2θ, d-spacing), dan berikan penalaran dengan referensi."
        />
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M5"
          items={[
            { label: "Grafik difraktogram dengan label puncak" },
            { label: "Tabel puncak (2θ, intensitas, FWHM, d-spacing)" },
            { label: "Kesimpulan fasa/kristalinitas/ukuran kristalit" },
            { label: "Sumber referensi (pola/CIF)" },
            { label: "Diskusi limit dan error" },
          ]}
        />
      </div>
    </ModuleLayout>
  );
}
