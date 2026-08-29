// PredictionPrompt — prediction before approved reveal; feedback with reasoning
"use client";

import { useId, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";

interface PredictionPromptProps {
  question: string;
  predictionHint?: string;
  revealText: string;
  explanation: string;
}

export function PredictionPrompt({
  question,
  predictionHint,
  revealText,
  explanation,
}: PredictionPromptProps) {
  const [prediction, setPrediction] = useState("");
  const [revealed, setRevealed] = useState(false);
  const predictionId = useId();

  return (
    <div className="rounded-lg border border-[var(--primary-container)] bg-[var(--primary-fixed)]/45 p-4">
      <p className="font-semibold text-[var(--primary-container)]"><span aria-hidden="true" className="material-symbols-outlined align-middle text-base">science</span> Pertanyaan Prediksi</p>
      <p className="mt-1 text-sm text-[var(--text-primary)]"><ChemText>{question}</ChemText></p>
      <label htmlFor={predictionId} className="sr-only">Prediksi Anda</label>
      <textarea
        id={predictionId}
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        placeholder={predictionHint || "Tuliskan prediksi Anda sebelum melihat jawaban..."}
        className="control-field mt-2 w-full p-2 text-sm"
        rows={2}
        disabled={revealed}
      />
      <div className="mt-2 flex gap-2">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={!prediction.trim()}
            className="rounded-lg bg-[var(--primary-container)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tampilkan Penjelasan
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--success-light)] px-3 py-2 text-sm font-medium text-[var(--verification-ink)]">
            <span aria-hidden="true" className="material-symbols-outlined text-base">check_circle</span> Dibuka
          </span>
        )}
      </div>
      {revealed && (
        <div className="mt-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] p-3 text-sm">
          <p className="font-semibold text-[var(--primary-dark)]"><ChemText>{revealText}</ChemText></p>
          <p className="mt-1 text-[var(--text-secondary)]"><ChemText>{explanation}</ChemText></p>
        </div>
      )}
    </div>
  );
}
