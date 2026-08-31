// SourceBadge — shows module reference, revision, reviewer info
interface SourceBadgeProps {
  pages?: string;
  revision?: string;
  reviewer?: string | null;
  lastReviewed?: string | null;
}

export function SourceBadge({
  pages,
  revision = "2025/2026",
  reviewer = null,
  lastReviewed = null,
}: SourceBadgeProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--muted)]">
      <span className="font-medium">Panduan {revision}</span>
      {pages && (
        <>
          <span>·</span>
          <span>Hal. {pages}</span>
        </>
      )}
      {reviewer && (
        <>
          <span>·</span>
          <span>Review: {reviewer}</span>
        </>
      )}
      {lastReviewed && (
        <>
          <span>·</span>
          <span>Review ilmiah: {lastReviewed}</span>
        </>
      )}
    </div>
  );
}
