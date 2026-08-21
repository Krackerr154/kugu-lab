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
    <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-light)] p-4">
      <p className="font-semibold text-indigo-900"><span aria-hidden="true">🔮</span> Pertanyaan Prediksi</p>
      <p className="mt-1 text-sm text-indigo-800"><ChemText>{question}</ChemText></p>
      <label htmlFor={predictionId} className="sr-only">Prediksi Anda</label>
      <textarea
        id={predictionId}
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        placeholder={predictionHint || "Tuliskan prediksi Anda sebelum melihat jawaban..."}
        className="mt-2 w-full rounded-md border border-indigo-300 bg-white p-2 text-sm text-slate-900"
        rows={2}
        disabled={revealed}
      />
      <div className="mt-2 flex gap-2">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={!prediction.trim()}
            className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Tampilkan Penjelasan
          </button>
        ) : (
          <span className="inline-block rounded-md bg-[var(--success)] px-3 py-1 text-sm font-medium text-white">
            ✓ Dibuka
          </span>
        )}
      </div>
      {revealed && (
        <div className="mt-3 rounded-md bg-white p-3 text-sm">
          <p className="font-semibold text-[var(--primary-dark)]"><ChemText>{revealText}</ChemText></p>
          <p className="mt-1 text-slate-700"><ChemText>{explanation}</ChemText></p>
        </div>
      )}
    </div>
  );
}
