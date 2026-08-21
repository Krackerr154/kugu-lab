"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";

type StageKey = "setup" | "add" | "observe" | "confirm" | "conclude" | "cleanup";

interface RehearsalStage {
  key: StageKey;
  label: string;
  shortLabel: string;
  action: string;
  cue: string;
}

const stages: RehearsalStage[] = [
  {
    key: "setup",
    label: "Siapkan meja",
    shortLabel: "Setup",
    action: "Siapkan perlindungan diri, tabung berlabel, fume hood, dan wadah limbah.",
    cue: "Sebelum menyentuh pereaksi, pastikan jalur kerja dan limbah sudah jelas.",
  },
  {
    key: "add",
    label: "Tambahkan HCl",
    shortLabel: "Tambah",
    action: "Tambahkan beberapa tetes HCl encer ke Cuplikan X dengan pipet tetes.",
    cue: "Tambahkan perlahan, arahkan tabung menjauh dari wajah, lalu homogenkan dengan lembut.",
  },
  {
    key: "observe",
    label: "Amati hasil",
    shortLabel: "Amati",
    action: "Pisahkan pengamatan dari interpretasi: catat perubahan yang benar-benar terlihat.",
    cue: "Warna, tekstur, waktu muncul, dan kelarutan adalah bukti—bukan tebakan ion.",
  },
  {
    key: "confirm",
    label: "Uji air panas",
    shortLabel: "Konfirmasi",
    action: "Pindahkan tabung ke penangas air panas untuk menguji kelarutan endapan.",
    cue: "Pemanasan adalah uji konfirmasi; jangan memanaskan tabung tertutup atau memegangnya langsung.",
  },
  {
    key: "conclude",
    label: "Tarik kesimpulan",
    shortLabel: "Simpulkan",
    action: "Hubungkan bukti dengan ion yang mungkin, lalu tulis persamaan ion netto.",
    cue: "Kesimpulan harus mengikuti bukti observasi, bukan mendahuluinya.",
  },
  {
    key: "cleanup",
    label: "Kelola limbah",
    shortLabel: "Limbah",
    action: "Masukkan residu yang mengandung logam berat ke wadah limbah yang ditentukan.",
    cue: "Jangan membuang residu Ag, Pb, Hg, atau Cr ke saluran umum.",
  },
];

const safetyItems = [
  { id: "ppe", label: "APD dipakai: jas lab, sarung tangan, dan kacamata" },
  { id: "hood", label: "Fume hood dan ventilasi siap sebelum pereaksi berisiko digunakan" },
  { id: "waste", label: "Wadah limbah logam berat sudah diberi label" },
];

const observationOptions = [
  { value: "clear", label: "Larutan tetap jernih" },
  { value: "white", label: "Endapan putih terbentuk" },
  { value: "colored", label: "Endapan berwarna terbentuk" },
];

const hotWaterOptions = [
  { value: "dissolves", label: "Endapan larut dalam air panas" },
  { value: "stays", label: "Endapan tetap tidak larut" },
];

const ionOptions = [
  { value: "ag", label: "Ag^{+}" },
  { value: "pb", label: "Pb^{2+}" },
  { value: "hg", label: "Hg_{2}^{2+}" },
];

// Kept in sync with the keyframe timings in app/globals.css so the "playing"
// state clears exactly when the last delayed element finishes.
const ANIMATION_MS: Partial<Record<StageKey, number>> = {
  // drops: 0.4s delay + 0.8s run; ripple: 0.75s delay + 0.9s run
  add: 1700,
  // steam: 0.56s delay + 1.6s run
  confirm: 2200,
};

export function M1LabRehearsal() {
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [safety, setSafety] = useState<Record<string, boolean>>({});
  const [playedStages, setPlayedStages] = useState<Record<number, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [observation, setObservation] = useState<string | null>(null);
  const [observationRevealed, setObservationRevealed] = useState(false);
  const [hotWaterResult, setHotWaterResult] = useState<string | null>(null);
  const [hotWaterRevealed, setHotWaterRevealed] = useState(false);
  const [selectedIon, setSelectedIon] = useState<string | null>(null);
  const [decisionConfirmed, setDecisionConfirmed] = useState(false);
  const [wasteChecked, setWasteChecked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Resolved after mount so server and client markup match on first paint.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const currentStage = stages[activeStage];
  const allSafetyChecked = safetyItems.every((item) => safety[item.id]);
  const highestUnlocked = useMemo(() => {
    if (completedStages.size === 0) return 0;
    return Math.min(stages.length - 1, Math.max(...completedStages) + 1);
  }, [completedStages]);

  const isCurrentStageComplete = (() => {
    switch (currentStage.key) {
      case "setup":
        return allSafetyChecked;
      case "add":
        return Boolean(playedStages[activeStage]);
      case "observe":
        return observationRevealed;
      case "confirm":
        return Boolean(playedStages[activeStage]) && hotWaterRevealed;
      case "conclude":
        return decisionConfirmed;
      case "cleanup":
        return wasteChecked;
      default:
        return false;
    }
  })();

  const playStageAnimation = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setPlayedStages((previous) => ({ ...previous, [activeStage]: true }));

    // With reduced motion the visuals are hidden, so skip the transient state
    // entirely and go straight to the persistent status cue.
    if (reducedMotion) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    timerRef.current = window.setTimeout(
      () => setIsPlaying(false),
      ANIMATION_MS[currentStage.key] ?? 1300,
    );
  };

  const advanceStage = () => {
    if (!isCurrentStageComplete) return;
    setCompletedStages((previous) => {
      const next = new Set(previous);
      next.add(activeStage);
      return next;
    });
    if (activeStage < stages.length - 1) goToStage(activeStage + 1);
  };

  // Any stage change cancels an in-flight animation, otherwise a pending
  // timer would leak the "playing" state onto the stage you just moved to.
  const goToStage = (index: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setIsPlaying(false);
    setActiveStage(index);
  };

  const selectStage = (index: number) => {
    if (index <= highestUnlocked) goToStage(index);
  };

  const revealObservation = () => {
    if (observation) setObservationRevealed(true);
  };

  const revealHotWater = () => {
    if (hotWaterResult && playedStages[activeStage]) {
      setHotWaterRevealed(true);
    }
  };

  const confirmDecision = () => {
    if (selectedIon) setDecisionConfirmed(true);
  };

  // Keep the outcome hidden until the learner has made an observation prediction.
  const visiblePrecipitate = observationRevealed;
  const dissolvedPrecipitate = playedStages[3] && hotWaterRevealed && hotWaterResult === "dissolves";
  const selectedIonIsCorrect = selectedIon === "pb";
  const observationIsCorrect = observation === "white";
  const hotWaterIsCorrect = hotWaterResult === "dissolves";

  return (
    <section
      aria-labelledby="m1-rehearsal-title"
      className="overflow-hidden rounded-2xl border border-[var(--outline-variant)]/50 bg-[var(--surface)] shadow-ambient"
    >
      <div className="border-b border-[var(--outline-variant)]/40 bg-[var(--primary-container)] p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-container)]">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">animation</span>
              Rehearsal laboratorium
            </div>
            <h2 id="m1-rehearsal-title" className="text-2xl font-bold sm:text-3xl">
              M1 Guided Evidence Trail
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Latih urutan kerja sebelum masuk lab: pilih tindakan, prediksi hasil, amati perubahan, lalu gunakan bukti untuk mengambil keputusan.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/80">
            <p className="font-semibold text-white">Skenario latihan</p>
            <p className="mt-0.5">Cuplikan X · jalur konfirmasi klorida</p>
          </div>
        </div>

        <nav className="mt-6 grid gap-2 sm:grid-cols-6" aria-label="Tahapan rehearsal">
          {stages.map((stage, index) => {
            const unlocked = index <= highestUnlocked;
            const complete = completedStages.has(index);
            const active = index === activeStage;
            return (
              <button
                key={stage.key}
                type="button"
                disabled={!unlocked}
                onClick={() => selectStage(index)}
                aria-current={active ? "step" : undefined}
                aria-label={`${stage.label}${complete ? " — selesai" : ""}`}
                className={`group rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-container)] ${
                  active
                    ? "border-[var(--secondary-container)] bg-[var(--secondary-container)] text-[var(--primary)]"
                    : complete
                    ? "border-white/30 bg-white/10 text-white"
                    : unlocked
                    ? "border-white/15 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "bg-[var(--primary)] text-white" : complete ? "bg-[var(--secondary-container)] text-[var(--primary)]" : "bg-white/10"
                  }`}>
                    {complete ? "✓" : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold uppercase tracking-wide">{stage.shortLabel}</span>
                    <span className="hidden truncate text-[10px] opacity-70 sm:block">{stage.label}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="border-b border-[var(--outline-variant)]/40 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">Visualisasi meja</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--on-surface)]">{currentStage.label}</h3>
            </div>
            <span className="rounded-full bg-[var(--surface-container)] px-2.5 py-1 text-xs font-semibold text-[var(--on-surface-variant)]">
              Langkah {activeStage + 1}/{stages.length}
            </span>
          </div>

          <div className="rehearsal-bench relative min-h-[310px] overflow-hidden rounded-2xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4 sm:min-h-[340px]">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/75 to-transparent" />
            <div className="relative z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
              <span>Bench view</span>
              <span className="rounded-full bg-white/70 px-2 py-1">Cuplikan X</span>
            </div>

            <div className="absolute left-5 top-16 rounded-lg border border-[var(--outline-variant)]/60 bg-white/75 px-2.5 py-2 text-[10px] font-semibold text-[var(--on-surface-variant)] shadow-sm sm:left-8">
              <span aria-hidden="true" className="material-symbols-outlined mr-1 align-middle text-[15px]">air</span>
              Fume hood siap
            </div>

            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-end gap-5 sm:gap-8">
              <div className="relative flex h-44 w-20 items-end justify-center rounded-b-[28px] rounded-t-lg border-2 border-slate-400/80 bg-white/65 p-1.5 shadow-sm sm:h-52 sm:w-24">
                <div className={`rehearsal-liquid absolute bottom-2 left-2 right-2 rounded-b-[20px] bg-gradient-to-b from-sky-200/80 to-sky-400/80 transition-all duration-700 ${visiblePrecipitate ? "h-28 sm:h-36" : "h-24 sm:h-32"}`}>
                  <div className={`rehearsal-precipitate absolute bottom-1 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-white/95 shadow-inner transition-all duration-700 sm:w-16 ${visiblePrecipitate && !dissolvedPrecipitate ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} />
                  {activeStage === 1 && isPlaying && (
                    <span
                      className="rehearsal-ripple absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-full border-t-2 border-white/70"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {/* Motion layer above the tube mouth: pipette, falling drops, steam.
                    Fixed height so the badge below never shifts between states. */}
                {(activeStage === 1 || activeStage === 3) && (
                  <div className="pointer-events-none absolute -top-16 left-1/2 h-16 w-24 -translate-x-1/2" aria-hidden="true">
                    {activeStage === 1 && (
                      <>
                        <span
                          className={`absolute left-1/2 top-0 h-6 w-2.5 -translate-x-1/2 rounded-t-sm rounded-b-full border border-slate-400/70 bg-white/80 transition-opacity duration-300 ${
                            isPlaying ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {isPlaying && (
                          <>
                            <span className="rehearsal-drop absolute left-1/2 top-6 h-2.5 w-2 -translate-x-1/2 rounded-full bg-sky-500/90" />
                            <span className="rehearsal-drop rehearsal-drop-delay absolute left-1/2 top-6 h-2.5 w-2 -translate-x-1/2 rounded-full bg-sky-500/90" />
                            <span className="rehearsal-drop rehearsal-drop-delay-2 absolute left-1/2 top-6 h-2.5 w-2 -translate-x-1/2 rounded-full bg-sky-500/90" />
                          </>
                        )}
                      </>
                    )}
                    {activeStage === 3 && isPlaying && (
                      <>
                        <span className="rehearsal-steam absolute bottom-1 left-1/2 -ml-4 text-base text-slate-400">♨</span>
                        <span className="rehearsal-steam rehearsal-steam-delay absolute bottom-1 left-1/2 -ml-1.5 text-lg text-slate-500">♨</span>
                        <span className="rehearsal-steam rehearsal-steam-delay-2 absolute bottom-1 left-1/2 ml-1.5 text-base text-slate-400">♨</span>
                      </>
                    )}
                  </div>
                )}

                {/* Persistent status badge. Reserves its slot in both stages so
                    the tube never jumps when the animation ends. */}
                {((activeStage === 1 && playedStages[1]) || (activeStage === 3 && playedStages[3])) && !isPlaying && (
                  <div
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold shadow-sm ${
                      activeStage === 1
                        ? "border-sky-300 bg-sky-50 text-sky-700"
                        : "border-orange-300 bg-orange-50 text-orange-700"
                    }`}
                  >
                    {activeStage === 1 ? "HCl ditambahkan" : "Penangas aktif"}
                  </div>
                )}
                <span className="relative z-10 mb-1 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">X</span>
              </div>

              <div className="flex h-36 w-28 items-end justify-center rounded-xl border-b-4 border-slate-500 bg-slate-300/50 p-2 shadow-inner sm:h-40 sm:w-32">
                <div className="grid grid-cols-3 gap-2 opacity-70">
                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                    <span key={slot} className="h-9 w-5 rounded-b-full border border-slate-500/70 bg-slate-100/80 sm:h-11 sm:w-6" />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-medium text-[var(--on-surface-variant)]">
              <span>Tabung reaksi · rak · pipet tetes</span>
              <span className={`rounded-full px-2 py-1 ${visiblePrecipitate && !dissolvedPrecipitate ? "bg-white text-slate-700" : "bg-white/60"}`}>
                {dissolvedPrecipitate ? "Endapan larut" : visiblePrecipitate ? "Endapan putih" : "Belum ada hasil"}
              </span>
            </div>
            {activeStage === 0 && !allSafetyChecked && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full border border-[var(--secondary)]/40 bg-white/90 px-3 py-1.5 text-center text-[10px] font-semibold text-[var(--on-surface-variant)] shadow-sm">
                Lengkapi checklist untuk membuka animasi
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] p-4">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[var(--secondary)]">visibility</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">Apa yang perlu diperhatikan</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--on-surface)]">{currentStage.cue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">Tindakan Anda</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)]"><ChemText>{currentStage.action}</ChemText></p>

          {currentStage.key === "setup" && (
            <fieldset className="mt-5 space-y-2">
              <legend className="mb-2 text-sm font-bold text-[var(--on-surface)]">Checklist sebelum mulai</legend>
              {safetyItems.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface)] transition-colors hover:border-[var(--secondary)]">
                  <input
                    type="checkbox"
                    checked={Boolean(safety[item.id])}
                    onChange={(event) => setSafety((previous) => ({ ...previous, [item.id]: event.target.checked }))}
                    className="mt-0.5 h-4 w-4 accent-[var(--secondary)]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>
          )}

          {currentStage.key === "add" && (
            <div className="mt-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
              <p className="text-sm font-semibold text-[var(--on-surface)]">Simulasikan penambahan</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)]">Perhatikan bahwa pereaksi ditambahkan sedikit demi sedikit, bukan dituangkan sekaligus.</p>
              <button
                type="button"
                onClick={playStageAnimation}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{isPlaying ? "play_arrow" : "science"}</span>
                {isPlaying ? "Menambahkan..." : playedStages[activeStage] ? "Putar ulang penambahan" : "Putar penambahan HCl"}
              </button>
              {playedStages[activeStage] && <p className="mt-3 text-xs font-semibold text-[var(--success)]" role="status">✓ HCl sudah ditambahkan secara terkendali.</p>}
              <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
                {reducedMotion
                  ? "Perangkat Anda mengurangi gerakan, jadi animasi diganti indikator status di atas."
                  : "Animasi singkat akan digantikan indikator status jika perangkat Anda mengurangi gerakan."}
              </p>
            </div>
          )}

          {currentStage.key === "observe" && (
            <div className="mt-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
              <fieldset>
                <legend className="text-sm font-bold text-[var(--on-surface)]">Prediksi pengamatan sebelum melihat hasil</legend>
                <div className="mt-3 space-y-2">
                  {observationOptions.map((option) => (
                    <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${observation === option.value ? "border-[var(--secondary)] bg-[var(--secondary-container)]/15" : "border-[var(--outline-variant)]/50 bg-white hover:border-[var(--secondary)]"}`}>
                      <input type="radio" name="m1-observation" value={option.value} checked={observation === option.value} onChange={() => { setObservation(option.value); setObservationRevealed(false); }} className="h-4 w-4 accent-[var(--secondary)]" />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                onClick={revealObservation}
                disabled={!observation}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">visibility</span>
                Tampilkan hasil observasi
              </button>
              {observationRevealed && (
                <div className={`mt-4 rounded-lg border p-3 ${observationIsCorrect ? "border-[var(--success)]/40 bg-[var(--success-light)]" : "border-[var(--error)]/40 bg-[var(--error-container)]/35"}`} aria-live="polite">
                  <p className="text-sm font-bold">{observationIsCorrect ? "Observasi cocok dengan skenario latihan" : "Bandingkan kembali prediksi Anda"}</p>
                  <p className="mt-1 text-sm"><ChemText>Cuplikan X menunjukkan endapan putih yang muncul setelah HCl ditambahkan.</ChemText></p>
                  <p className="mt-2 text-xs text-[var(--on-surface-variant)]">Catat dahulu: “endapan putih terbentuk”. Interpretasi ion dilakukan pada tahap berikutnya.</p>
                </div>
              )}
            </div>
          )}

          {currentStage.key === "confirm" && (
            <div className="mt-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
              <p className="text-sm font-bold text-[var(--on-surface)]">Uji konfirmasi dengan penangas air</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)]">Prediksikan kelarutan sebelum menjalankan animasi penangas air.</p>
              <div className="mt-3 space-y-2">
                {hotWaterOptions.map((option) => (
                  <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${hotWaterResult === option.value ? "border-[var(--secondary)] bg-[var(--secondary-container)]/15" : "border-[var(--outline-variant)]/50 bg-white hover:border-[var(--secondary)]"}`}>
                    <input type="radio" name="m1-hot-water" value={option.value} checked={hotWaterResult === option.value} onChange={() => { setHotWaterResult(option.value); setHotWaterRevealed(false); }} className="h-4 w-4 accent-[var(--secondary)]" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={playStageAnimation}
                  disabled={!hotWaterResult}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-[var(--primary-container)] transition-colors hover:bg-[var(--primary-container)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  {isPlaying ? "Memanaskan..." : "Putar penangas air"}
                </button>
                <button
                  type="button"
                  onClick={revealHotWater}
                  disabled={!hotWaterResult || !playedStages[activeStage]}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">visibility</span>
                  Tampilkan hasil
                </button>
              </div>
              {hotWaterRevealed && (
                <div className={`mt-4 rounded-lg border p-3 ${hotWaterIsCorrect ? "border-[var(--success)]/40 bg-[var(--success-light)]" : "border-[var(--error)]/40 bg-[var(--error-container)]/35"}`} aria-live="polite">
                  <p className="text-sm font-bold">{hotWaterIsCorrect ? "Uji konfirmasi cocok" : "Hasil perlu dibandingkan"}</p>
                  <p className="mt-1 text-sm"><ChemText>{"Endapan putih larut dalam air panas pada skenario ini. Bukti ini mendukung PbCl_{2}."}</ChemText></p>
                </div>
              )}
              {playedStages[activeStage] && <p className="mt-3 text-xs font-semibold text-[var(--success)]" role="status">✓ Penangas air sudah dijalankan secara terkendali.</p>}
              <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
                {reducedMotion
                  ? "Perangkat Anda mengurangi gerakan, jadi animasi uap diganti indikator status di atas."
                  : "Animasi uap singkat akan digantikan indikator status jika perangkat Anda mengurangi gerakan."}
              </p>
            </div>
          )}

          {currentStage.key === "conclude" && (
            <div className="mt-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
              <fieldset>
                <legend className="text-sm font-bold text-[var(--on-surface)]">Ion mana yang paling didukung oleh bukti?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Pilihan ion">
                  {ionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selectedIon === option.value}
                      onClick={() => { setSelectedIon(option.value); setDecisionConfirmed(false); }}
                      className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${selectedIon === option.value ? "border-[var(--secondary)] bg-[var(--secondary-container)]/20 text-[var(--on-surface)]" : "border-[var(--outline-variant)]/50 bg-white text-[var(--on-surface-variant)] hover:border-[var(--secondary)]"}`}
                    >
                      <ChemText>{option.label}</ChemText>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                onClick={confirmDecision}
                disabled={!selectedIon}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">fact_check</span>
                Rekam kesimpulan
              </button>
              {decisionConfirmed && (
                <div className={`mt-4 rounded-lg border p-3 ${selectedIonIsCorrect ? "border-[var(--success)]/40 bg-[var(--success-light)]" : "border-[var(--error)]/40 bg-[var(--error-container)]/35"}`} aria-live="polite">
                  <p className="text-sm font-bold">{selectedIonIsCorrect ? "Kesimpulan didukung bukti" : "Kesimpulan perlu ditinjau"}</p>
                  <p className="mt-1 text-sm"><ChemText>{selectedIonIsCorrect ? "Endapan putih yang larut dalam air panas mendukung Pb^{2+} pada skenario latihan ini." : "Bandingkan kembali dua observasi: endapan putih dengan HCl dan kelarutan dalam air panas."}</ChemText></p>
                  <div className="mt-3">
                    <Equation tex={"Pb^{2+} + 2Cl^{-} \\rightarrow PbCl_{2}(s)"} label="Persamaan ion netto" />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStage.key === "cleanup" && (
            <div className="mt-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--error)]/30 bg-[var(--error-container)]/25 p-4 text-sm text-[var(--on-surface)]">
                <input type="checkbox" checked={wasteChecked} onChange={(event) => setWasteChecked(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--error)]" />
                <span><strong>Wadah limbah logam berat</strong><br /><span className="text-xs text-[var(--on-surface-variant)]">Residu yang mengandung Pb/Ag/Hg/Cr tidak masuk ke wastafel.</span></span>
              </label>
              {wasteChecked && <p className="mt-3 text-sm font-semibold text-[var(--success)]" role="status">✓ Jalur limbah sudah dipilih. Tetap ikuti SOP dan instruksi asisten.</p>}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--outline-variant)]/40 pt-4">
            <button
              type="button"
              onClick={() => goToStage(Math.max(0, activeStage - 1))}
              disabled={activeStage === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--outline-variant)] px-4 py-2.5 text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
              Sebelumnya
            </button>
            {activeStage === stages.length - 1 ? (
              <div
                role="status"
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold ${
                  isCurrentStageComplete
                    ? "bg-[var(--secondary)] text-white"
                    : "bg-[var(--primary-container)] text-white opacity-40"
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  {isCurrentStageComplete ? "check_circle" : "lock"}
                </span>
                {isCurrentStageComplete ? "Rehearsal selesai" : "Selesaikan checklist limbah"}
              </div>
            ) : (
              <button
                type="button"
                onClick={advanceStage}
                disabled={!isCurrentStageComplete}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
              >
                Lanjutkan langkah
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--on-surface-variant)]" aria-live="polite">
            {isCurrentStageComplete ? "Langkah ini siap dilewati." : "Selesaikan tindakan pada panel ini sebelum lanjut."}
          </p>
        </div>
      </div>
    </section>
  );
}
