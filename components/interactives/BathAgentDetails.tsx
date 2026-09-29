"use client";

import { ChemText } from "@/components/shared/ChemText";
import { COMPLEXING_AGENTS } from "@/lib/m3-complexing-agents";
import type { BathAgent } from "@/lib/m3-ligands";

const EXPLANATIONS: Record<BathAgent, string> = {
  edta: "EDTA mengikat spesi logam di larutan. Kompleksasi mengubah aktivitas ion logam bebas dan dapat menggeser potensial deposisi efektif. Penanda bercabang mengikuti contoh Sn maupun Bi; bukan berarti EDTA hanya mengikat salah satu logam.",
  citrate: "Sitrat adalah pengompleks pendamping EDTA dalam elektrolit. Penanda bertiga menunjukkan asosiasi dengan contoh spesi Sn/Bi. Bentuk, protonasi, dan proporsi kompleks sebenarnya bergantung pada kondisi larutan; tidak dihitung dari animasi ini.",
  peg400: "PEG400 ditampilkan melalui model adsorpsi permukaan: sebagian situs pertumbuhan tertutup, sehingga penambahan logam dapat lebih tersebar. Pembesaran membandingkan contoh percabangan dan pertumbuhan yang lebih kompak, bukan menghitung morfologi nyata. Interaksi PEG dengan spesi larutan tidak dimodelkan; konsentrasinya memakai massa molar nominal rata-rata.",
};

export function BathAgentDetails({ agentId, complexed, id }: { agentId: BathAgent; complexed: boolean; id: string }) {
  const agent = COMPLEXING_AGENTS.find((entry) => entry.id === agentId)!;
  // The comparison bath ("tanpa pengompleks") is now a bare metal-salt bath:
  // every recipe additive is omitted, PEG400 included.
  const absent = !complexed;
  return (
    <section id={id} aria-label="Agen dalam beaker" data-agent={agentId}
      className="min-w-0 border-y border-[var(--outline-variant)] py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h5 className="text-base font-bold text-[var(--primary)]">{agent.name}</h5>
        <p className="text-sm text-[var(--text-secondary)]">
          {agentId === "peg400" ? "Aditif permukaan, bukan pengompleks pada skema ini" : "Pengompleks di dalam larutan"}
        </p>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div><dt className="text-xs text-[var(--text-secondary)]">Bahan penuntun</dt><dd className="mt-0.5"><ChemText>{agent.formulaLabel}</ChemText></dd></div>
        <div><dt className="text-xs text-[var(--text-secondary)]">Asal bahan</dt><dd className="mt-0.5">{agent.solution}</dd></div>
        <div><dt className="text-xs text-[var(--text-secondary)]">Konsentrasi akhir</dt><dd className="mt-0.5 font-medium tabular-nums">{agent.concentration}</dd></div>
      </dl>
      <p className="mt-3 max-w-[80ch] text-sm leading-6 text-[var(--text-secondary)]">{EXPLANATIONS[agentId]}</p>
      {absent && <p role="status" className="mt-2 text-sm font-medium text-[var(--warning-ink)]">Tidak hadir pada skenario pembanding tanpa pengompleks. Label tetap dapat dipilih untuk membaca perannya; penandanya tidak digambar di beaker.</p>}
      <p className="mt-2 max-w-[85ch] text-xs leading-5 text-[var(--text-secondary)]">
        {agentId === "peg400"
          ? "Skenario tanpa pengompleks digambarkan sebagai bath garam logam polos, sehingga PEG400 pun tidak diperlihatkan di sana. Ini pilihan ilustrasi untuk membandingkan bath dengan seluruh aditif resep melawan tanpa aditif."
          : "Saat logam terdeposit, penanda ligan kembali terlihat di larutan. Ini ilustrasi konseptual, bukan penetapan jalur elementer pelepasan ligan."}
      </p>
      <p className="mt-2 max-w-[85ch] text-xs leading-5 text-[var(--text-secondary)]">Komposisi: penuntun hlm. 22. Bacaan mekanisme: {agent.reference}.</p>
    </section>
  );
}
