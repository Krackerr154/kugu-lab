// SafetyCallout — approved hazard/PPE/waste/stop condition info
// NEVER generic generated advice — must show approved SOP wording
interface SafetyCalloutProps {
  variant?: "warning" | "danger" | "info";
  title?: string;
  children: React.ReactNode;
  sopLink?: string;
}

export function SafetyCallout({
  variant = "warning",
  title = "Peringatan Keselamatan",
  children,
  sopLink,
}: SafetyCalloutProps) {
  const styles = {
    warning: "border-[var(--secondary)] bg-[var(--secondary-container)]/25 text-[var(--warning-ink)]",
    danger: "border-[var(--danger)] bg-[var(--danger-light)] text-[var(--danger)]",
    info: "border-[var(--primary-container)] bg-[var(--primary-fixed)] text-[var(--info-ink)]",
  };

  const icons = { warning: "warning", danger: "report", info: "info" };

  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-xl">{icons[variant]}</span>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <div className="mt-1 text-sm">{children}</div>
          {sopLink && (
            <a
              href={sopLink}
              className="mt-2 inline-block text-sm font-medium underline hover:no-underline"
            >
              Lihat SOP/SDS →
            </a>
          )}
          <p className="mt-2 text-xs italic opacity-80">
            Pemeriksaan keselamatan online tidak menggantikan persetujuan asisten secara langsung.
          </p>
        </div>
      </div>
    </div>
  );
}
