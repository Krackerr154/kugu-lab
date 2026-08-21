import { glossaryTerms } from "@/lib/glossary";
import { contentConflicts } from "@/lib/conflicts";

export default function ReferensiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold">Referensi & Keselamatan</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Glosarium, sumber tercantum, panduan keselamatan, dan register konflik konten.
      </p>

      {/* Safety */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold"><span aria-hidden="true">🛡️</span> Keselamatan Umum</h2>
        <p className="text-xs text-[var(--muted)]">Manual hal. 6 — harus diganti dengan SOP lokal jika berbeda.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-semibold">APD Wajib</p>
            <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
              <li>• Mantel panjang lengan</li>
              <li>• Masker</li>
              <li>• Sepatu tertutup + kaus kaki</li>
              <li>• Goggles pelindung mata</li>
              <li>• Sarung tangan sesuai</li>
              <li>• Rambut panjang terikat</li>
            </ul>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-semibold">Perilaku di Lab</p>
            <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
              <li>• Izin/briefing sebelum bekerja</li>
              <li>• Eskalasi ke asisten untuk masalah</li>
              <li>• Kategorisasi limbah per modul</li>
              <li>• Pemeriksaan keselamatan online ≠ persetujuan asisten</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-[var(--danger-light)] p-3 text-sm text-red-800">
          <p className="font-semibold"><span aria-hidden="true">⚠️</span> Penting</p>
          <p>Aplikasi ini tidak menyediakan instruksi keselamatan yang dibuat-buat. Selalu rujuk SOP/SDS lokal yang disetujui. Konsultasi instruktur sebelum bekerja di bench.</p>
        </div>
      </section>

      {/* Glossary */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold"><span aria-hidden="true">📖</span> Glosarium</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {glossaryTerms.map((term, i) => (
            <div key={i} className="rounded-lg border border-slate-100 p-2">
              <p className="text-sm font-semibold">
                {term.term}
                {term.english && <span className="ml-1 text-xs text-[var(--muted)]">({term.english})</span>}
                {term.module && <span className="ml-1 rounded bg-slate-100 px-1 text-[10px]">{term.module}</span>}
              </p>
              <p className="text-xs text-slate-600">{term.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content conflicts */}
      <section className="mt-6 rounded-xl border border-[var(--warning)] bg-[var(--warning-light)] p-5">
        <h2 className="text-lg font-bold text-amber-900"><span aria-hidden="true">⚠️</span> Register Konflik Konten</h2>
        <p className="text-xs text-amber-800">Hal. ini memetakan konflik manual — harus diselesaikan oleh tim pengajar.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-amber-300 text-left">
                <th className="py-1 pr-3">ID</th>
                <th className="py-1 pr-3">Modul</th>
                <th className="py-1 pr-3">Konflik</th>
                <th className="py-1 pr-3">Keputusan Diperlukan</th>
              </tr>
            </thead>
            <tbody>
              {contentConflicts.map((c) => (
                <tr key={c.id} className="border-b border-amber-200">
                  <td className="py-1.5 pr-3 font-mono font-bold">{c.id}</td>
                  <td className="py-1.5 pr-3">{c.module}</td>
                  <td className="py-1.5 pr-3">{c.conflict}</td>
                  <td className="py-1.5 pr-3">{c.requiredDecision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* References */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold"><span aria-hidden="true">📚</span> Referensi</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>• Penuntun Praktikum Anorganik KI3131, FMIPA ITB, Semester 1 2025/2026</li>
          <li>• Freeman et al. (2014), Active learning increases student performance in STEM, PNAS</li>
          <li>• PhET Interactive Simulations design principles</li>
          <li>• W3C WCAG 2.2 Accessibility Guidelines</li>
          <li>• Next.js Documentation (deploying, self-hosting)</li>
        </ul>
      </section>
    </div>
  );
}
