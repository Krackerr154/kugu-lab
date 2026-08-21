import Link from "next/link";
import { modules } from "@/lib/modules";
import { ChemText } from "@/components/shared/ChemText";

export default function ModulesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold">Modul Praktikum</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Enam unit pembelajaran dengan alur: tujuan → peta konsep → keselamatan → pre-lab → prosedur → observasi → analisis → laporan.
      </p>

      <div className="mt-6 space-y-4">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={m.route}
            className="block rounded-xl border border-[var(--border)] bg-white p-5 transition-all hover:shadow-md hover:border-[var(--primary)]"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${m.color}15` }}
              >
                <span aria-hidden="true">{m.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold">M{m.number} — <ChemText>{m.titleShort}</ChemText></h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${m.color}15`, color: m.color }}
                  >
                    Hal. {m.manualPages}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5"><ChemText>{m.title}</ChemText></p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">Tujuan Pembelajaran:</p>
                    <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
                      {m.learningOutcomes.slice(0, 3).map((o, i) => (
                        <li key={i}>• <ChemText>{o}</ChemText></li>
                      ))}
                      {m.learningOutcomes.length > 3 && (
                        <li className="text-[var(--primary)]">+ {m.learningOutcomes.length - 3} lainnya</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">Interaktif:</p>
                    <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
                      {m.keyInteractives.slice(0, 3).map((k, i) => (
                        <li key={i}>• <ChemText>{k}</ChemText></li>
                      ))}
                      {m.keyInteractives.length > 3 && (
                        <li className="text-[var(--primary)]">+ {m.keyInteractives.length - 3} lainnya</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-[var(--muted)]">Alur sampel:</span>
                  <span className="text-slate-600"><ChemText>{m.sampleLineage}</ChemText></span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
