// ClaimEvidenceReasoning — structured CER prompt
"use client";

import { useId, useState } from "react";

interface CERProps {
  prompt: string;
  claimPlaceholder?: string;
  evidencePlaceholder?: string;
  reasoningPlaceholder?: string;
}

export function ClaimEvidenceReasoning({
  prompt,
  claimPlaceholder = "Klaim Anda...",
  evidencePlaceholder = "Bukti dari data/pengamatan...",
  reasoningPlaceholder = "Penalaran ilmiah yang menghubungkan bukti dengan klaim...",
}: CERProps) {
  const [fields, setFields] = useState({ claim: "", evidence: "", reasoning: "" });
  const fieldPrefix = useId();
  const claimId = `${fieldPrefix}-claim`;
  const evidenceId = `${fieldPrefix}-evidence`;
  const reasoningId = `${fieldPrefix}-reasoning`;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold"><span aria-hidden="true">🔍</span> Claim · Evidence · Reasoning</h3>
      <p className="mb-3 text-sm text-[var(--muted)]">{prompt}</p>
      <div className="space-y-3">
        <div>
          <label htmlFor={claimId} className="text-sm font-semibold text-[var(--primary-dark)]">Claim (Klaim)</label>
          <textarea
            id={claimId}
            value={fields.claim}
            onChange={(e) => setFields({ ...fields, claim: e.target.value })}
            placeholder={claimPlaceholder}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            rows={2}
          />
        </div>
        <div>
          <label htmlFor={evidenceId} className="text-sm font-semibold text-[var(--primary-dark)]">Evidence (Bukti)</label>
          <textarea
            id={evidenceId}
            value={fields.evidence}
            onChange={(e) => setFields({ ...fields, evidence: e.target.value })}
            placeholder={evidencePlaceholder}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor={reasoningId} className="text-sm font-semibold text-[var(--primary-dark)]">Reasoning (Penalaran)</label>
          <textarea
            id={reasoningId}
            value={fields.reasoning}
            onChange={(e) => setFields({ ...fields, reasoning: e.target.value })}
            placeholder={reasoningPlaceholder}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            rows={3}
          />
        </div>
      </div>
      <p className="mt-2 text-xs italic text-[var(--muted)]">
        Sertakan keterbatasan dan sumber error bila ada.
      </p>
    </section>
  );
}
