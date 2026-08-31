// ReportChecklist — manual-specific kisi-kisi, rubric, completion state
interface ChecklistItem {
  label: string;
  points?: number;
}

interface ReportChecklistProps {
  title: string;
  items: ChecklistItem[];
  rubric?: { element: string; points: number }[];
}

export function ReportChecklist({ title, items, rubric }: ReportChecklistProps) {
  return (
    <section className="surface-panel p-4">
      <h3 className="text-lg font-bold"><span aria-hidden="true" className="material-symbols-outlined align-middle text-base">fact_check</span> {title}</h3>
      {rubric && (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-2 pr-4">Elemen Laporan</th>
                <th className="py-2 text-right">Poin</th>
              </tr>
            </thead>
            <tbody>
              {rubric.map((item) => (
                <tr key={item.element} className="border-b border-[var(--outline-variant)]">
                  <td className="py-1.5 pr-4">{item.element}</td>
                  <td className="py-1.5 text-right font-medium">{item.points}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 pr-4">Total</td>
                <td className="py-2 text-right">{rubric.reduce((s, i) => s + i.points, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary-container)]" id={`check-${i}`} />
            <label htmlFor={`check-${i}`} className="cursor-pointer">
              {item.label}
              {item.points && <span className="ml-1 text-xs text-[var(--muted)]">({item.points} poin)</span>}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
