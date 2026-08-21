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
    warning: "border-[var(--warning)] bg-[var(--warning-light)] text-amber-900",
    danger: "border-[var(--danger)] bg-[var(--danger-light)] text-red-900",
    info: "border-[var(--accent)] bg-[var(--accent-light)] text-indigo-900",
  };

  const icons = { warning: "⚠️", danger: "🛑", info: "ℹ️" };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${styles[variant]}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl" aria-hidden>{icons[variant]}</span>
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
