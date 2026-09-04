# KUGU Lab — Sesi 2026-09-02 (pause point)

Status: semua perubahan sudah lulus build + TypeScript + 93 test Playwright.
Belum di-commit. Dev server sudah dimatikan.

## Yang dikerjakan sesi ini

### 1. Bug KaTeX: semua rumus tampil sebagai teks mentah
`tex="\\frac{...}"` di JSX **attribute** membuat KaTeX menerima `\\` (escaped
line-break) bukan `\frac`, sehingga yang tampil adalah `fracLRtimesA`, bukan
rumus. Perbaikannya: ubah ke JSX **expression** `tex={"\\frac{...}"}` — di dalam
`{}` string, `\\` benar diinterpretasikan sebagai satu backslash.

Diperbaiki di 11 tempat: `app/modules/m2-mg2sno4`, `m5-xrd`, `m6-tga`,
`components/interactives/ElectrodepositionCalculator`, `PhotocatalysisWorkspace`,
`TGAWorkspace`, `XRDWorkspace`.

Aturan untuk ke depan: **jangan pernah** menulis `tex="..."`; selalu
`tex={"..."}` atau template literal. Cek dengan `node tests/review/katex-check.mjs`.

### 2. Bug ProcedureWalkthrough: penjelasan cek pemahaman tidak pernah terlihat
`activeCheck` difilter dengan `!checkRevealed.has(...)`, jadi begitu jawaban
diklik, seluruh panel — termasuk blok "Penjelasan" dan verdict benar/salah —
langsung unmount. Retrieval practice-nya hilang total.

Perbaikan di `components/shared/ProcedureWalkthrough.tsx`:
- `activeCheck` hanya difilter berdasarkan step, tidak lagi oleh state "revealed".
- State `checkRevealed` dihapus; `activeCheckAnswered` diturunkan dari `checkAnswers`.
- Langkah terakhir dapat tombol "Tandai Prosedur Selesai" — sebelumnya langkah
  terakhir tidak pernah masuk `completed`, jadi progress mentok di 88%.

### 3. Bug ikon: nama Material Symbols yang tidak ada = overflow horizontal
`notebook` (Navigation) dan `log_in` (prelab) bukan ligature yang valid, jadi
render sebagai teks literal lebar (48px dan 144px). Ini yang bikin 2 test
responsive-audit gagal di 360/390px.

- `notebook` → `note_alt`, `log_in` → `login`.
- `.material-symbols-outlined` di globals.css sekarang di-clamp ke `width: 1em;
  overflow: hidden` supaya font yang belum ter-load tidak pernah menggeser layout.
- Font Material Symbols pindah ke `display=block` (bukan `swap`).
- Test baru `tests/e2e/icon-names.spec.ts` menyapu **semua** nama ikon di
  codebase dan gagal kalau ada yang bukan ligature valid.

### 4. Fitur baru: pre-lab walkthrough M2 (`/prelab/m2-mg2sno4`)
10 langkah + 5 cek pemahaman, ditranskrip dari Modul Praktikum KUGU 2025 hal.
13-17 (M2a sintesis → M2b kalsinasi → M2c band gap → M2d fotokatalisis).
Angka-angka protokol diambil apa adanya dari penuntun: SnCl2·2H2O 1,355 g
(6 mmol), MgCl2·6H2O 2,44 g (12 mmol), HCl 1,2 mL 32%, H2O2 0,75 mL 30%,
pH 10-13, sonikasi 4×30 menit, kering 24 jam @85 °C, kalsinasi 900 °C 24 jam,
sinter 900 °C 12 jam, metilen biru 4 ppm, UV 30/60/90 menit.

Halaman `/prelab` sekarang menandai M1 dan M2 sebagai "Tersedia".

### 5. Fix layout: Equation di viewport sempit
`components/shared/Equation.tsx` diberi `min-w-0` — tanpa itu grid item-nya
tidak boleh menyusut dan mendorong dokumen sampai 384px di viewport 360px.

## Catatan konten yang perlu konfirmasi asisten
Penomoran tahap M2 tidak konsisten di penuntun: daftar isi menulis uji
fotokatalisis sebagai **M2c**, badan prosedur menulisnya **M2d** (dan pengukuran
band gap juga tertulis M2c). Sudah ditulis sebagai catatan di halaman pre-lab M2,
bukan diputuskan sendiri.

## Verifikasi yang sudah dijalankan
- `npx tsc --noEmit` → bersih
- `npm run build` → sukses, 20 route statis (termasuk `/prelab/m2-mg2sno4`)
- `npx playwright test` → **93 passed, 0 failed**
- `node tests/review/m2-prelab-verify.mjs` → PASS (10/10 langkah, 5 cek, 100%,
  tanpa console error, tanpa overflow di 390px)
- `node tests/review/walkthrough-check-probe.mjs` → PASS (M1, 8/8, 100%)
- `node tests/review/icon-name-probe.mjs` → 59 nama ikon, semua valid
- `node tests/review/icon-clamp-check.mjs` → tidak ada glyph terpotong

## Lanjut berikutnya
1. Commit pekerjaan ini (belum di-commit sama sekali).
2. Pre-lab walkthrough M3 (elektrodeposisi Sn-Bi, hal. 18-21) — komposisi
   Larutan A/B/C, 14,5 mA/cm² selama 15 menit, efisiensi arus.
3. Lalu M4 (zeolit FAU, hal. 23-24), M5 (XRD, hal. 25-28), M6 (TGA, hal. 29-31).
4. Utang teknis: `app/modules/m1-reactions/page.tsx` masih punya 26 kelas warna
   Tailwind hardcoded (sky/amber/emerald/blue/purple) yang melewati design token,
   dan beberapa file masih memakai unicode subscript langsung alih-alih ChemText.
5. Halaman modul M2/M3/M4 masih tipis (79-86 baris) dibanding struktur
   Brief/Understand/Rehearse/Prove/Ready di UI_REBUILD_PLAN.md.
