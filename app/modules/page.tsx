import { TransitionLink } from "@/components/layout/TransitionLink";
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
          <TransitionLink
            key={m.id}
            href={m.route}
            direction="nav-forward"
            className="surface-panel group block p-5 border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] hover:bg-[var(--surface-container-lowest)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-2xl text-[var(--primary-container)] group-hover:scale-105 group-hover:bg-[var(--primary-container)] group-hover:text-white transition-all duration-300 shadow-xs">
                <span aria-hidden="true" className="material-symbols-outlined">{m.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold">M{m.number} — <ChemText>{m.titleShort}</ChemText></h2>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5"><ChemText>{m.title}</ChemText></p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">Tujuan Pembelajaran:</p>
                    <ul className="mt-1 text-xs text-[var(--text-secondary)] space-y-0.5">
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
                    <ul className="mt-1 text-xs text-[var(--text-secondary)] space-y-0.5">
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
                  <span className="text-[var(--text-secondary)]"><ChemText>{m.sampleLineage}</ChemText></span>
                </div>
              </div>
            </div>
          </TransitionLink>
        ))}
      </div>
      </div>
  );
}