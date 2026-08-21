import Link from "next/link";

export default function AnalisisPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold">Analisis Data</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Workspace analisis data XRD dan TGA. Mulai dari Modul 5 atau 6.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/modules/m5-xrd"
          className="rounded-xl border-2 border-[var(--border)] p-6 hover:border-[#8b5cf6] hover:shadow-md"
        >
          <div aria-hidden="true" className="text-4xl">📐</div>
          <h2 className="mt-2 text-lg font-bold">XRD Interpretasi</h2>
          <p className="text-sm text-[var(--muted)]">Modul 5</p>
          <p className="mt-2 text-sm text-slate-600">
            Sandbox Bragg, difraktogram interaktif, kalkulator FWHM/Scherrer, kristalinitas.
          </p>
          <p className="mt-3 text-sm text-[#8b5cf6] font-medium">Buka workspace XRD →</p>
        </Link>

        <Link
          href="/modules/m6-tga"
          className="rounded-xl border-2 border-[var(--border)] p-6 hover:border-[#dc2626] hover:shadow-md"
        >
          <div aria-hidden="true" className="text-4xl">🔥</div>
          <h2 className="mt-2 text-lg font-bold">TGA / DTG Interpretasi</h2>
          <p className="text-sm text-[var(--muted)]">Modul 6</p>
          <p className="mt-2 text-sm text-slate-600">
            Termogram/DTG, anotasi kehilangan massa, worksheet teoretis vs eksperimental.
          </p>
          <p className="mt-3 text-sm text-[#dc2626] font-medium">Buka workspace TGA →</p>
        </Link>
      </div>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Prinsip Ilmiah</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          <li>• Setiap kalkulasi menampilkan persamaan, asumsi, satuan, dan nilai antara.</li>
          <li>• Backend memvalidasi rentang dan satuan tetapi tidak mengubah data mentah.</li>
          <li>• Jawaban interpretatif berbasis rubrik dan dapat diulas instruktur.</li>
          <li>• Data mentah dan data turunan (derived) harus terpisah dan auditable.</li>
        </ul>
      </section>
    </div>
  );
}
