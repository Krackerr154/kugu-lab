"use client";

import { pegGrowthFrame, type PegGrowthFrame } from "@/lib/m3-peg-growth";
import type { CellFrame } from "@/lib/m3-simulation";

function SurfacePlot({ frame, peg }: { frame: PegGrowthFrame; peg: boolean }) {
  return (
    <svg viewBox="0 0 300 150" className="mx-auto w-full max-w-[440px]" role="img"
      aria-label={peg ? "Pertumbuhan dengan adsorpsi PEG400" : "Pertumbuhan tanpa PEG400"} data-morphology={peg ? "with-peg" : "without-peg"}>
      <rect x="10" y="10" width="230" height="130" rx="4" fill="var(--surface-container)" />
      <rect x="240" y="10" width="48" height="130" fill="var(--surface-variant)" stroke="var(--outline)" />
      <text x="264" y="77" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--primary-container)">Cu</text>
      <g fill="var(--primary-container)" stroke="var(--primary-container)" strokeWidth="12" strokeLinecap="round">
        {frame.deposited.map((atom) => {
          const parent = frame.deposited.find((entry) => entry.id === atom.parent);
          return <line key={atom.id} x1={parent?.x ?? 240} y1={parent?.y ?? atom.y} x2={atom.x} y2={atom.y} />;
        })}
      </g>
      {frame.deposited.map((atom) => <circle key={atom.id} data-growth-node={atom.id} data-parent={atom.parent} cx={atom.x} cy={atom.y} r="8" fill="var(--primary-container)" />)}
      {frame.incoming.map((ion) => <circle key={ion.id} data-morphology-incoming={ion.id} cx={ion.incomingX} cy={ion.incomingY} r="5" fill="var(--surface-control)" stroke="var(--primary-container)" strokeWidth="1.3" strokeDasharray="2 2" />)}
      {frame.adsorbates.map((chain) => (
        <g key={chain.row} data-peg-site={chain.row} data-phase={chain.phase} data-surface-x={chain.surfaceX}
          transform={`translate(${chain.x} ${chain.y})`}>
          <path d="M0 -11 C-7 -8 7 -5 0 -2 S-7 4 0 7 S7 10 0 12" fill="none" stroke="var(--secondary)" strokeWidth="2.6" />
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  { label: "1. Adsorpsi", time: 1.6, text: "Pada model ini, rantai PEG mendekati lalu teradsorpsi pada permukaan katoda. Ini penutupan sebagian situs, bukan dinding yang menghentikan semua deposisi." },
  { label: "2. Situs terhambat", time: 6, text: "Pada skema ini, PEG menutup sebagian situs pertumbuhan sehingga penambahan logam di sana diperlambat. Tanpa penghambatan, pertumbuhan dapat terkonsentrasi pada tonjolan." },
  { label: "3. Pertumbuhan tersebar", time: 12, text: "Contoh ini menyebarkan pertumbuhan ke situs lain sehingga percabangan lebih kecil. PEG tidak mengikis dendrit yang sudah terbentuk, dan tidak menjamin permukaan selalu rata." },
] as const;

export function PegDendriteComparison({ frame, onSeek, id }: { frame: CellFrame; onSeek: (time: number) => void; id: string }) {
  const untreated = pegGrowthFrame(frame, false);
  const protectedSurface = pegGrowthFrame(frame, true);
  return (
    <section id={id} tabIndex={-1} aria-label="PEG400 dan pertumbuhan dendrit" data-time={untreated.elapsed.toFixed(3)}
      className="min-w-0 scroll-mt-48 space-y-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-container)]">
      <p className="text-xs leading-5 text-[var(--text-secondary)]"><strong>Model adsorpsi.</strong> Contoh cara penutupan situs dapat mengurangi percabangan; bukan peta adsorpsi terukur pada Sn–Bi.</p>
      <div role="group" aria-label="Tahap kerja PEG400" className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => <button key={step.label} type="button" aria-pressed={protectedSurface.phase === index} onClick={() => onSeek(step.time)}
          className="min-h-11 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 text-xs font-semibold text-[var(--primary-container)] aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]">{step.label}</button>)}
      </div>
      <p role="status" aria-live="polite" className="text-sm leading-6 text-[var(--text-secondary)]">{STEPS[protectedSurface.phase].text}</p>
      <div>
        <h5 className="text-sm font-semibold text-[var(--primary)]">Tanpa PEG400 · contoh pertumbuhan bercabang</h5>
        <SurfacePlot frame={untreated} peg={false} />
      </div>
      <div>
        <h5 className="text-sm font-semibold text-[var(--primary)]">Dengan PEG400 · contoh pertumbuhan tersebar</h5>
        <SurfacePlot frame={protectedSurface} peg />
      </div>
      <p className="text-xs leading-5 text-[var(--text-secondary)]">Bentuk padat: deposit logam. Garis bergelombang: PEG teradsorpsi. Keduanya mengikuti penggeser yang sama.</p>
      <p className="text-xs leading-5 text-[var(--text-secondary)]">Perbandingan konseptual, bukan jaminan bebas dendrit atau prediksi morfologi Sn–Bi. Jumlah bagian logam disamakan hanya untuk membandingkan bentuk; bukan massa atau efisiensi terukur.</p>
      <details className="border-t border-[var(--outline-variant)] text-xs leading-5 text-[var(--text-secondary)]">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-[var(--primary-container)] focus-visible:outline-2 focus-visible:outline-offset-2">Dasar dan batas penjelasan</summary>
        <div className="space-y-3 pb-2">
          <p>Studi Sn–Bi melaporkan penghambatan dendrit oleh kombinasi asam sitrat, EDTA, dan PEG: bukan hasil uji PEG400 saja. Mengubah aditif juga dapat mengubah komposisi deposit, bukan hanya bentuknya.[3]</p>
          <p>Peran PEG sebagai aditif perata melalui adsorpsi dilaporkan untuk deposit Bi.[7] Gambar ini mengadaptasi konsep tersebut, bukan menetapkan mekanisme lengkap Sn–Bi atau membuktikan PEG selalu memilih ujung dendrit.</p>
          <p>Resep M3 menggunakan PEG400 0,20 M (penuntun hlm. 22). Rujukan wajib tugas pendahuluan #3 membahas Zn–Cr, bukan bukti langsung pencegahan dendrit Sn–Bi.[2] Hasil nyata bergantung pada komposisi larutan, kondisi listrik, dan transpor massa.</p>
          <ul className="space-y-1">
            <li><a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://www.sciencedirect.com/science/article/pii/S0013468607010997" target="_blank" rel="noreferrer">[3] Sn–Bi · Tsai, Hu &amp; Lin (2007)</a></li>
            <li><a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://doi.org/10.1016/j.electacta.2011.06.077" target="_blank" rel="noreferrer">[7] Deposit Bi · studi PEG dan gelatin (2011)</a></li>
            <li><a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://iopscience.iop.org/article/10.1149/1.3276678/meta" target="_blank" rel="noreferrer">[2] PEG400 pada Zn–Cr · Boiadjieva dkk. (2010)</a></li>
          </ul>
        </div>
      </details>
    </section>
  );
}
