// M1 Reaction Explorer — cation/anion vs reagent matrix, equation builder, unknown ion decision tree
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { PredictionPrompt } from "@/components/shared/PredictionPrompt";

interface ReactionCell {
  code: "no_reaction" | "white_precipitate" | "coloured_precipitate" | "gas" | "colour_change" | "";
  description: string;
  equation?: string;
}

// Approved reaction matrix from manual (simplified — instructor must verify)
const cations = ["Ag+", "Pb2+", "Hg2 2+", "Cu2+", "Al3+", "Cr3+", "Fe3+", "Zn2+"];
const reagents = [
  { id: "HCl", name: "HCl (dilute)" },
  { id: "H2S", name: "H2S (in acidic)" },
  { id: "NaOH", name: "NaOH" },
  { id: "NH3", name: "NH3 (excess)" },
];

// Simplified observation matrix — needs instructor verification
const matrix: Record<string, Record<string, ReactionCell>> = {
  "Ag+": {
    "HCl": { code: "white_precipitate", description: "Endapan putih AgCl, larut dalam NH3 berlebih", equation: "Ag^+ + Cl^- \\rightarrow AgCl \\downarrow" },
    "H2S": { code: "black_precipitate_coloured", description: "Endapan hitam Ag2S", equation: "2Ag^+ + S^{2-} \\rightarrow Ag_2S \\downarrow" } as any,
    "NaOH": { code: "brown_precipitate_coloured", description: "Endapan coklat Ag2O", equation: "2Ag^+ + 2OH^- \\rightarrow Ag_2O \\downarrow + H_2O" } as any,
    "NH3": { code: "no_reaction", description: "Larut membentuk kompleks [Ag(NH3)2]+", equation: "Ag^+ + 2NH_3 \\rightarrow [Ag(NH_3)_2]^+" },
  },
  "Pb2+": {
    "HCl": { code: "white_precipitate", description: "Endapan putih PbCl2, larut dalam air panas", equation: "Pb^{2+} + 2Cl^- \\rightarrow PbCl_2 \\downarrow" },
    "H2S": { code: "coloured_precipitate", description: "Endapan hitam PbS", equation: "Pb^{2+} + S^{2-} \\rightarrow PbS \\downarrow" },
    "NaOH": { code: "white_precipitate", description: "Endapan putih Pb(OH)2, larut dalam NaOH berlebih", equation: "Pb^{2+} + 2OH^- \\rightarrow Pb(OH)_2 \\downarrow" },
    "NH3": { code: "white_precipitate", description: "Endapan putih Pb(OH)2 (tidak larut dalam NH3 berlebih)", equation: "Pb^{2+} + 2NH_3 + 2H_2O \\rightarrow Pb(OH)_2 \\downarrow + 2NH_4^+" },
  },
  "Hg2 2+": {
    "HCl": { code: "white_precipitate", description: "Endapan putih Hg2Cl2", equation: "Hg_2^{2+} + 2Cl^- \\rightarrow Hg_2Cl_2 \\downarrow" },
    "H2S": { code: "coloured_precipitate", description: "Endapan hitam HgS", equation: "Hg_2^{2+} + S^{2-} \\rightarrow HgS \\downarrow + Hg \\downarrow" },
    "NaOH": { code: "coloured_precipitate", description: "Endapan hitam Hg2O", equation: "Hg_2^{2+} + 2OH^- \\rightarrow Hg_2O \\downarrow + H_2O" },
    "NH3": { code: "coloured_precipitate", description: "Endapan putih→hitam (HgNH2Cl + Hg)", equation: "Hg_2Cl_2 + 2NH_3 \\rightarrow Hg(NH_2)Cl \\downarrow + Hg \\downarrow + NH_4Cl" },
  },
  "Cu2+": {
    "HCl": { code: "no_reaction", description: "Tidak ada reaksi (larutan biru)" },
    "H2S": { code: "coloured_precipitate", description: "Endapan hitam CuS", equation: "Cu^{2+} + S^{2-} \\rightarrow CuS \\downarrow" },
    "NaOH": { code: "coloured_precipitate", description: "Endapan biru Cu(OH)2", equation: "Cu^{2+} + 2OH^- \\rightarrow Cu(OH)_2 \\downarrow" },
    "NH3": { code: "colour_change", description: "Larutan biru tua — kompleks [Cu(NH3)4]2+", equation: "Cu^{2+} + 4NH_3 \\rightarrow [Cu(NH_3)_4]^{2+}" },
  },
  "Al3+": {
    "HCl": { code: "no_reaction", description: "Tidak ada reaksi" },
    "H2S": { code: "no_reaction", description: "Tidak ada reaksi dalam larutan asam" },
    "NaOH": { code: "white_precipitate", description: "Endapan putih Al(OH)3, larut dalam NaOH berlebih", equation: "Al^{3+} + 3OH^- \\rightarrow Al(OH)_3 \\downarrow" },
    "NH3": { code: "white_precipitate", description: "Endapan putih Al(OH)3 (tidak larut dalam NH3 berlebih)", equation: "Al^{3+} + 3NH_3 + 3H_2O \\rightarrow Al(OH)_3 \\downarrow + 3NH_4^+" },
  },
  "Cr3+": {
    "HCl": { code: "no_reaction", description: "Tidak ada reaksi (larutan hijau/violet)" },
    "H2S": { code: "no_reaction", description: "Tidak ada reaksi dalam larutan asam" },
    "NaOH": { code: "coloured_precipitate", description: "Endapan hijau Cr(OH)3, larut dalam NaOH berlebih (hijau)", equation: "Cr^{3+} + 3OH^- \\rightarrow Cr(OH)_3 \\downarrow" },
    "NH3": { code: "coloured_precipitate", description: "Endapan hijau Cr(OH)3", equation: "Cr^{3+} + 3NH_3 + 3H_2O \\rightarrow Cr(OH)_3 \\downarrow + 3NH_4^+" },
  },
  "Fe3+": {
    "HCl": { code: "no_reaction", description: "Tidak ada reaksi" },
    "H2S": { code: "colour_change", description: "Reduksi Fe3+ → Fe2+, larutan kuning→hijau", equation: "2Fe^{3+} + H_2S \\rightarrow 2Fe^{2+} + S \\downarrow + 2H^+" },
    "NaOH": { code: "coloured_precipitate", description: "Endapan coklat merah Fe(OH)3", equation: "Fe^{3+} + 3OH^- \\rightarrow Fe(OH)_3 \\downarrow" },
    "NH3": { code: "coloured_precipitate", description: "Endapan coklat merah Fe(OH)3", equation: "Fe^{3+} + 3NH_3 + 3H_2O \\rightarrow Fe(OH)_3 \\downarrow + 3NH_4^+" },
  },
  "Zn2+": {
    "HCl": { code: "no_reaction", description: "Tidak ada reaksi" },
    "H2S": { code: "no_reaction", description: "Tidak mengendap dalam larutan asam" },
    "NaOH": { code: "white_precipitate", description: "Endapan putih Zn(OH)2, larut dalam NaOH berlebih", equation: "Zn^{2+} + 2OH^- \\rightarrow Zn(OH)_2 \\downarrow" },
    "NH3": { code: "no_reaction", description: "Larut — membentuk kompleks [Zn(NH3)4]2+", equation: "Zn^{2+} + 4NH_3 \\rightarrow [Zn(NH_3)_4]^{2+}" },
  },
};

const cellColors: Record<string, string> = {
  no_reaction: "bg-slate-100 text-slate-500",
  white_precipitate: "bg-blue-100 text-blue-700 border border-blue-300",
  coloured_precipitate: "bg-amber-100 text-amber-700 border border-amber-300",
  gas: "bg-green-100 text-green-700 border border-green-300",
  colour_change: "bg-purple-100 text-purple-700 border border-purple-300",
  "": "",
};

const cellLabels: Record<string, string> = {
  no_reaction: "—",
  white_precipitate: "End. Putih",
  coloured_precipitate: "End. Berwarna",
  gas: "Gas",
  colour_change: "Perub. Warna",
  "": "",
};

export function ReactionExplorer() {
  const [selected, setSelected] = useState<{ cation: string; reagent: string } | null>(null);
  const [observationMode, setObservationMode] = useState<"predict" | "reveal">("predict");

  const selectedCell = selected ? matrix[selected.cation]?.[selected.reagent] : null;

  return (
    <div className="space-y-4">
      {/* Reaction Matrix */}
      <section className="rounded-xl border border-[var(--border)] bg-white p-4">
        <h3 className="text-lg font-bold">Matriks Reaksi Kation vs Pereaksi</h3>
        <p className="mb-3 text-sm text-[var(--muted)]">
          Klik sel untuk melihat detail reaksi. Data berdasarkan manual — verifikasi instruktur diperlukan.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white border border-[var(--border)] px-2 py-1.5 text-left">
                  Kation \ Pereaksi
                </th>
                {reagents.map((r) => (
                  <th key={r.id} className="border border-[var(--border)] px-2 py-1.5 text-center min-w-[100px]">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cations.map((cation) => (
                <tr key={cation}>
                  <td className="sticky left-0 bg-white border border-[var(--border)] px-2 py-1.5 font-mono font-bold">
                    {cation}
                  </td>
                  {reagents.map((r) => {
                    const cell = matrix[cation]?.[r.id];
                    const isSelected = selected?.cation === cation && selected?.reagent === r.id;
                    return (
                      <td
                        key={r.id}
                        className={`border border-[var(--border)] px-2 py-1.5 text-center cursor-pointer transition-all ${cellColors[cell?.code || ""]} ${
                          isSelected ? "ring-2 ring-[var(--primary)]" : "hover:opacity-80"
                        }`}
                        onClick={() => {
                          setSelected({ cation, reagent: r.id });
                          setObservationMode("predict");
                        }}
                      >
                        {cell ? cellLabels[cell.code] : "?"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {Object.entries(cellLabels).filter(([k]) => k).map(([key, label]) => (
            <span key={key} className={`rounded px-2 py-0.5 ${cellColors[key]}`}>{label}</span>
          ))}
        </div>
      </section>

      {/* Detail panel */}
      {selected && selectedCell && (
        <section className="rounded-xl border border-[var(--primary)] bg-[var(--primary-light)] p-4">
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">
            Detail Reaksi: {selected.cation} + {reagents.find(r => r.id === selected.reagent)?.name}
          </h3>

          {observationMode === "predict" ? (
            <PredictionPrompt
              question={`Prediksikan apa yang terjadi ketika ${selected.cation} direaksikan dengan ${reagents.find(r => r.id === selected.reagent)?.name}?`}
              predictionHint="Jelaskan observasi yang Anda harapkan (endapan, gas, perubahan warna)..."
              revealText={selectedCell.description}
              explanation={selectedCell.equation ? `Persamaan (ion netto): ${selectedCell.equation}` : "Persamaan tidak tersedia."}
            />
          ) : (
            <div className="mt-2 space-y-2">
              <div className="rounded-md bg-white p-3">
                <p className="text-sm font-semibold">Observasi:</p>
                <p className="text-sm">{selectedCell.description}</p>
              </div>
              {selectedCell.equation && (
                <Equation
                  tex={selectedCell.equation}
                  label="Persamaan Ion Netto"
                />
              )}
            </div>
          )}

          <button
            onClick={() => setObservationMode(observationMode === "predict" ? "reveal" : "predict")}
            className="mt-2 text-sm text-[var(--primary-dark)] hover:underline"
          >
            {observationMode === "predict" ? "Lihat detail lengkap →" : "← Kembali ke mode prediksi"}
          </button>
        </section>
      )}

      {/* Gas formation activity */}
      <section className="rounded-xl border border-[var(--border)] bg-white p-4">
        <h3 className="text-lg font-bold">Aktivitas Pembentukan Gas</h3>
        <p className="text-sm text-[var(--muted)] mb-3">
          Beberapa reaksi golongan utama menghasilkan gas. Prediksikan gas yang terbentuk.
        </p>
        <div className="space-y-3">
          <PredictionPrompt
            question="Logam aktif (mis. Mg) ditambahkan ke HCl encer. Gas apa yang dihasilkan?"
            revealText="Gas hidrogen (H_{2})"
            explanation="Logam aktif bereaksi dengan asam menghasilkan H_{2}: Mg + 2HCl → MgCl_{2} + H_{2}↑. Uji nyala (hanya dengan persetujuan SOP): bunyi 'pop'."
          />
          <PredictionPrompt
            question="Karbonat (mis. CaCO_{3}) ditambahkan ke HCl. Gas apa yang dihasilkan?"
            revealText="Gas karbon dioksida (CO_{2})"
            explanation="Karbonat + asam → CO_{2}: CaCO_{3} + 2HCl → CaCl_{2} + H_{2}O + CO_{2}↑. CO_{2} memadamkan nyala api dan mengeruhkan kapur barus."
          />
          <PredictionPrompt
            question="Sulfit (mis. Na_{2}SO_{3}) ditambahkan ke HCl. Gas apa yang dihasilkan?"
            revealText="Gas sulfur dioksida (SO_{2})"
            explanation="Sulfit + asam → SO_{2}: Na_{2}SO_{3} + 2HCl → 2NaCl + H_{2}O + SO_{2}↑. SO_{2} berbau menyengat, dapat memerahkan kertas indikator."
          />
        </div>
        <div className="mt-3 rounded-md bg-[var(--danger-light)] p-2 text-xs text-red-800">
          <span aria-hidden="true">⚠️</span> Uji gas hanya dengan persetujuan SOP dan asisten. Jangan mencampur pereaksi sembarangan.
        </div>
      </section>

      {/* Equation builder */}
      <EquationBuilder />

      {/* Unknown ion decision tree */}
      <UnknownIonDecisionTree />
    </div>
  );
}

// Simple equation balancing exercise
function EquationBuilder() {
  const exercises = [
    {
      equation: "AgNO_3 + NaCl \\rightarrow AgCl + NaNO_3",
      ionic: "Ag^+ + Cl^- \\rightarrow AgCl \\downarrow",
      question: "Seimbangkan persamaan molekuler: AgNO3 + NaCl → ?",
      answer: "AgNO_3 + NaCl \\rightarrow AgCl \\downarrow + NaNO_3",
      explanation: "Reaksi pertukaran ganda. Ag+ bereaksi dengan Cl- membentuk endapan AgCl. Persamaan ion netto hanya menampilkan spesies yang berubah.",
    },
    {
      equation: "Pb(NO_3)_2 + 2NaI \\rightarrow PbI_2 + 2NaNO_3",
      ionic: "Pb^{2+} + 2I^- \\rightarrow PbI_2 \\downarrow",
      question: "Seimbangkan persamaan molekuler: Pb(NO3)2 + NaI → ?",
      answer: "Pb(NO_3)_2 + 2NaI \\rightarrow PbI_2 \\downarrow + 2NaNO_3",
      explanation: "Pb2+ membutuhkan 2 I- untuk membentuk endapan kuning PbI2. Perhatikan koefisien 2 untuk NaI dan NaNO3.",
    },
    {
      equation: "FeCl_3 + 3NaOH \\rightarrow Fe(OH)_3 + 3NaCl",
      ionic: "Fe^{3+} + 3OH^- \\rightarrow Fe(OH)_3 \\downarrow",
      question: "Seimbangkan persamaan molekuler: FeCl3 + NaOH → ?",
      answer: "FeCl_3 + 3NaOH \\rightarrow Fe(OH)_3 \\downarrow + 3NaCl",
      explanation: "Fe3+ membutuhkan 3 OH- untuk endapan coklat merah Fe(OH)3. Koefisien 3 untuk NaOH dan NaCl.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const ex = exercises[current];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Penyusun Persamaan</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Latihan menyeimbangkan persamaan reaksi. ({current + 1}/{exercises.length})
      </p>
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-sm font-medium">{ex.question}</p>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-2 rounded-md bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
          >
            Tampilkan Jawaban
          </button>
        ) : (
          <div className="mt-2 space-y-2">
            <Equation tex={ex.answer} label="Persamaan Molekuler" />
            <Equation tex={ex.ionic} label="Persamaan Ion Netto" />
            <div className="rounded-md bg-[var(--primary-light)] p-2 text-sm text-[var(--primary-dark)]">
              <strong>Penjelasan:</strong> {ex.explanation}
            </div>
            {current < exercises.length - 1 && (
              <button
                onClick={() => { setCurrent(current + 1); setRevealed(false); }}
                className="rounded-md border border-[var(--primary)] px-4 py-1.5 text-sm font-medium text-[var(--primary-dark)] hover:bg-[var(--primary-light)]"
              >
                Latihan Berikutnya →
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Unknown ion identification decision tree
function UnknownIonDecisionTree() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const tree: { question: string; options: { label: string; next: number; result?: string }[] }[] = [
    {
      question: "Tambahkan HCl encer ke larutan cuplikan. Apa yang terjadi?",
      options: [
        { label: "Endapan putih terbentuk", next: 1 },
        { label: "Tidak ada reaksi / larutan jernih", next: 2 },
      ],
    },
    {
      question: "Endapan putih terbentuk dengan HCl. Kemungkinan: Ag+, Pb2+, atau Hg2 2+. Tambahkan air panas. Apakah endapan larut?",
      options: [
        { label: "Larut dalam air panas", next: 3, result: "Kandidat: Pb2+ (PbCl2 larut dalam air panas)" },
        { label: "Tidak larut dalam air panas", next: 4 },
      ],
    },
    {
      question: "Tidak ada endapan dengan HCl. Kelompok II/III/IV/V. Alirkan H2S dalam larutan asam. Apa yang terjadi?",
      options: [
        { label: "Endapan berwarna terbentuk", next: 5 },
        { label: "Tidak ada endapan", next: 6 },
      ],
    },
    {
      question: "Pb2+ dikonfirmasi? Tambahkan K2CrO4. Warna endapan?",
      options: [
        { label: "Endapan kuning (PbCrO4)", next: 7, result: "✓ Teridentifikasi: Pb2+" },
        { label: "Tidak ada endapan kuning", next: 7, result: "Pb2+ tidak terkonfirmasi — uji ulang" },
      ],
    },
    {
      question: "Ag+ atau Hg2 2+. Tambahkan NH3 berlebih. Apa yang terjadi?",
      options: [
        { label: "Endapan larut ( kompleks [Ag(NH3)2]+ )", next: 7, result: "✓ Teridentifikasi: Ag+" },
        { label: "Endapan berubah hitam", next: 7, result: "✓ Teridentifikasi: Hg2 2+" },
      ],
    },
    {
      question: "Endapan berwarna dengan H2S (Kation Golongan II). Warna endapan?",
      options: [
        { label: "Hitam", next: 7, result: "Kandidat: Cu2+, Pb2+, Hg2+, Ag+ — butuh uji lanjutan" },
        { label: "Kuning-putih", next: 7, result: "Kandidat: Cd2+ (CdS kuning) atau As3+" },
        { label: "Jingga-merah", next: 7, result: "Kandidat: Sb3+ (Sb2S3) atau Sn2+" },
      ],
    },
    {
      question: "Tidak ada endapan dengan H2S (Kation Golongan III+). Tambahkan NaOH. Apa yang terjadi?",
      options: [
        { label: "Endapan putih", next: 7, result: "Kandidat: Al3+, Zn2+ (perlu uji pembeda)" },
        { label: "Endapan berwarna", next: 7, result: "Kandidat: Fe3+ (coklat), Cr3+ (hijau), Cu2+ (biru)" },
        { label: "Tidak ada endapan", next: 7, result: "Kandidat: kation Golongan V (Na+, K+, NH4+)" },
      ],
    },
    {
      question: "Analisis selesai. Catat hasil dan bukti dalam laporan.",
      options: [
        { label: "↻ Mulai ulang identifikasi", next: 0 },
      ],
    },
  ];

  const node = tree[step];

  const handleOption = (opt: { label: string; next: number; result?: string }) => {
    setHistory([...history, `Langkah ${step + 1}: ${opt.label}`]);
    setStep(opt.next);
  };

  const reset = () => {
    setStep(0);
    setHistory([]);
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Pohon Keputusan Identifikasi Ion Tidak Dikenal</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Gunakan hanya pereaksi yang diizinkan. Setiap cabang memerlukan bukti observasi.
      </p>

      {history.length > 0 && (
        <div className="mb-3 rounded-md bg-slate-50 p-2 text-xs">
          <p className="font-semibold">Jejak Identifikasi:</p>
          {history.map((h, i) => (
            <p key={i} className="text-slate-600">{h}</p>
          ))}
        </div>
      )}

      <div className="rounded-lg border-2 border-[var(--primary)] bg-[var(--primary-light)] p-4">
        <p className="font-medium text-[var(--primary-dark)]">{node.question}</p>
        <div className="mt-3 flex flex-col gap-2">
          {node.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => opt.next === 0 ? reset() : handleOption(opt)}
              className="rounded-md border border-[var(--primary)] bg-white px-3 py-2 text-left text-sm hover:bg-[var(--primary-light)]"
            >
              {opt.label}
              {opt.result && (
                <span className="block mt-1 text-xs text-[var(--success)] font-medium">{opt.result}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <button onClick={reset} className="mt-3 text-sm text-[var(--accent)] hover:underline">
          ↻ Mulai ulang
        </button>
      )}

      <div className="mt-3 rounded-md bg-[var(--danger-light)] p-2 text-xs text-red-800">
        <span aria-hidden="true">⚠️</span> Dilarang mencampur pereaksi sembarangan. Gunakan hanya pereaksi yang diizinkan dalam alur ini.
      </div>
    </section>
  );
}
