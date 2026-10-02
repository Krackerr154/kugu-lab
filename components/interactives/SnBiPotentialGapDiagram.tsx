import { ChemText } from "@/components/shared/ChemText";

export function SnBiPotentialGapDiagram() {
  return (
    <section
      aria-labelledby="sn-bi-potential-gap-title"
      data-potential-gap-diagram
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Peta potensial</p>
          <h4
            id="sn-bi-potential-gap-title"
            className="mt-1 text-base font-bold text-[var(--primary)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Selisih Potensial Menghambat Kodeposisi
          </h4>
        </div>
        <span className="text-xs font-semibold text-[var(--text-secondary)]">E° vs SHE · 25 °C</span>
      </div>

      <div
        role="img"
        aria-label="Diagram potensial reduksi standar: Bi tiga plus per Bi pada plus 0,31 volt dan Sn dua plus per Sn pada minus 0,14 volt, berjarak sekitar 0,45 volt. EDTA dan sitrat menggeser potensial deposisi efektif ke rentang yang lebih berdekatan secara ilustratif sehingga kodeposisi lebih mungkin."
        className="mt-4 rounded-lg bg-[var(--surface-container-low)] p-3 sm:p-4"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
          Potensial reduksi standar
        </p>
        <div className="relative mt-2 h-32" aria-hidden="true">
          <div className="absolute left-[8%] right-[8%] top-12 h-1 rounded-full bg-[var(--outline-variant)]" />

          <div className="absolute left-[8%] top-10 h-5 w-px bg-[var(--outline)]" />
          <div className="absolute left-[8%] top-[4.15rem] -translate-x-1/2 text-[10px] text-[var(--on-surface-variant)]">−0,30</div>
          <div className="absolute left-1/2 top-10 h-5 w-px bg-[var(--outline)]" />
          <div className="absolute left-1/2 top-[4.15rem] -translate-x-1/2 text-[10px] font-semibold text-[var(--on-surface-variant)]">0,00</div>
          <div className="absolute right-[8%] top-10 h-5 w-px bg-[var(--outline)]" />
          <div className="absolute right-[8%] top-[4.15rem] translate-x-1/2 text-[10px] text-[var(--on-surface-variant)]">+0,50 V</div>

          <div className="absolute left-[25%] top-1 -translate-x-1/2 text-center">
            <p className="text-xs font-bold text-[var(--chart-navy)]">Sn²⁺/Sn</p>
            <p className="font-mono text-[11px] font-bold text-[var(--on-surface)]">−0,14 V</p>
            <span className="mx-auto mt-1 block h-4 w-4 rounded-full border-2 border-[var(--on-surface)] bg-[var(--chart-navy)]" />
          </div>
          <div className="absolute left-[72%] top-1 -translate-x-1/2 text-center">
            <p className="text-xs font-bold text-[var(--chart-gold)]">Bi³⁺/Bi</p>
            <p className="font-mono text-[11px] font-bold text-[var(--on-surface)]">+0,31 V</p>
            <span className="mx-auto mt-1 block h-4 w-4 rounded-full border-2 border-[var(--on-surface)] bg-[var(--chart-gold)]" />
          </div>

          {/* Potential gap bracket and label positioned cleanly below the ticks */}
          <div className="absolute left-[25%] right-[28%] top-[5.6rem] border-t-2 border-[var(--secondary)]">
            <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-[var(--secondary)]">
              ΔE° ≈ 0,45 V
            </span>
          </div>
        </div>
        <div className="flex justify-between px-[8%] text-[10px] text-[var(--on-surface-variant)] mt-1">
          <span>lebih sulit direduksi</span>
          <span>lebih mudah direduksi</span>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--secondary)]/40 bg-[var(--secondary-container)]/40 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--on-secondary-container)]">
            Dengan pengompleks · arah pergeseran efektif
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--on-surface)]">
            <span className="font-semibold">Sn dan Bi</span>
            <span aria-hidden="true" className="material-symbols-outlined text-lg text-[var(--primary-container)]">east</span>
            <span className="rounded-md border border-[var(--secondary)]/60 bg-[var(--surface)] px-2 py-1 text-center font-semibold leading-tight">
              rentang deposisi<br />lebih berdekatan
            </span>
            <span aria-hidden="true" className="material-symbols-outlined text-lg text-[var(--primary-container)]">east</span>
            <span className="font-semibold text-right">kodeposisi<br />dapat terjadi</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
        <strong className="text-[var(--foreground)]">Inti:</strong> tanpa pengompleks, <ChemText>{"Bi^{3+}"}</ChemText> lebih mudah direduksi daripada <ChemText>{"Sn^{2+}"}</ChemText> sehingga lapisan awal cenderung kaya bismut. Nilai <em>0,31 V</em> dan <em>−0,14 V</em> adalah potensial reduksi standar; arah pergeseran dengan EDTA + sitrat bersifat konseptual, bukan angka efektif baru.
      </p>
    </section>
  );
}
