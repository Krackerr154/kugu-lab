# KUGU Lab — Sesi 2026-09-04 (M3)

Status: build + TypeScript + 107 Playwright test lulus. Belum di-commit
(termasuk pekerjaan sesi 2026-09-02 yang juga masih uncommitted).
Dev server masih berjalan di :3000.

## Yang dikerjakan sesi ini

### 1. Pre-lab walkthrough M3 (`/prelab/m3-sn-bi-electrodeposition`)
11 langkah + 5 cek pemahaman, ditranskrip dari penuntun halaman 20-24
(M3a pembuatan katoda/anoda → M3b elektrolit + elektrodeposisi).
Halaman `/prelab` kini menandai M1, M2, dan M3 sebagai "Tersedia".

Angka protokol diambil apa adanya: resin:hardener 3:1, resin mengeras 2×24 jam,
sonikasi grafit ~5 menit di etanol lalu aqua DM, amplas 200/500/800/1000 mesh,
sonikasi aseton ≥10 menit, oven 60 °C, karton duplex 9×9 cm dengan dua lubang
berjarak ~3 cm, 14,5 mA/cm² selama 15 menit.

### 2. Worksheet preparasi elektrolit (`components/interactives/ElectrolytePrepWorksheet.tsx`)
Data terpisah di `lib/m3-electrolyte.ts` agar angka dapat diuji.

Tiga hal yang tidak bisa dikerjakan halaman modul biasa:

**Basis konsentrasi.** Tabel penuntun mencetak "SnCl₂·2H₂O 0,15 M (3,3846 g)"
tepat di atas baris "Volume akhir larutan 5,5 mL". Molaritas itu berlaku untuk
100 mL akhir, bukan 5,5 mL. Diverifikasi untuk keempat garam:
- EDTA 1,4612 g / 292,244 = 0,00500 mol → 0,0500 M dalam 100 mL
- SnCl₂·2H₂O 3,3846 g / 225,640 = 0,01500 mol → 0,1500 M
- Bi(NO₃)₃·5H₂O 2,4254 g / 485,067 = 0,00500 mol → 0,0500 M
- Asam sitrat 5,7636 g / 192,123 = 0,03000 mol → 0,3000 M

Salah membaca basis → massa SnCl₂·2H₂O ±18× lebih kecil → praktis tanpa deposit.
Setiap baris tabel menampilkan aritmetika verifikasinya dan tanda ✓/✗.

**PEG400.** Penuntun hanya menulis "konsentrasi akhir 0,20 M" — tanpa massa,
tanpa volume. Worksheet menurunkan: 0,020 mol → 8,0 g → ≈7,09 mL (ρ 1,128),
dengan catatan bahwa 400 g/mol adalah massa molar nominal rata-rata polimer
sehingga "0,20 M" bersifat pendekatan.

**Urutan penggabungan.** Checklist bergerbang (langkah berikutnya terbuka setelah
sebelumnya ditandai): A ke B → (A+B) ke C → PEG400 → NH₃ 0,5 mL → encerkan ke
100 mL → cek pH ~2. Ditambah neraca volume: 27,09 mL terpakai, air ≈72,9 mL,
dengan instruksi memakai labu takar 100 mL karena volume tidak aditif.

Catatan bentuk garam: massa penuntun mengasumsikan H₄EDTA anhidrat (292,244) dan
asam sitrat anhidrat (192,123). Bila stok berupa Na₂H₂EDTA·2H₂O (372,24) atau
asam sitrat monohidrat (210,14), massa berbeda ±27% dan ±9% — worksheet meminta
konfirmasi label botol.

### 3. Mode paduan pada kalkulator efisiensi arus (audit item 4)
`ElectrodepositionCalculator` sebelumnya memodelkan satu logam saja, padahal M3
mengendapkan Sn dan Bi bersamaan. Mode paduan menghitung n dan M ekuivalen dari
fraksi mol yang di-set mahasiswa:
- n_ekuiv = x_Sn·2 + x_Bi·3
- M_ekuiv = x_Sn·118,71 + x_Bi·208,98

Pada x_Sn = 0 atau 1 nilainya kembali ke logam murni (diuji). Saat mode aktif,
select logam dan input n/M dinonaktifkan dan menampilkan nilai ekuivalen.

Penting: penuntun **tidak** menetapkan komposisi target Sn:Bi (Sn-58Bi hanya
muncul sebagai latar belakang solder eutektik). Karena itu UI melabeli angka ini
sebagai asumsi mahasiswa yang wajib dikonfirmasi asisten, dan menyebut bahwa
komposisi sebenarnya hanya dapat ditentukan dari karakterisasi (Modul 5) —
bukan default yang tampak otoritatif.

## Bug/pitfall yang ditemukan sesi ini

1. **`fieldClass()` mengandung `w-full`.** Dipakai bersama `w-20` pada input
   angka fraksi mol, `w-full` menang di stylesheet dan membuat slider range
   bersebelahan menyusut ke lebar 0 px. Kelas lebar sekarang ditulis eksplisit.
2. **Deteksi kuis lewat teks tidak bisa dipakai.** Paragraf `intro`
   ProcedureWalkthrough memuat frasa "cek pemahaman" di setiap langkah, jadi
   probe harus mendeteksi kuis dari tombol opsi (`w-full` + `disabled`), bukan
   dari teks. Selain itu `innerText` menerapkan `text-transform`, sehingga
   heading "Penjelasan" terbaca "PENJELASAN" — cocokkan case-insensitive.
3. **`svg[role='img']` tidak lagi ada.** `ElectrochemicalCellExplorer` sengaja
   tidak memakai `role="img"` karena role itu membuat subtree presentational dan
   akan menyembunyikan hotspot `role="button"`. `m3-fixes-verify.mjs` diperbarui
   ke `svg[aria-label]`.
4. **`afterStep` bergeser satu.** Check dengan `afterStep: N` tampil pada langkah
   SETELAH langkah N. Nomor check M3 sudah disesuaikan (2, 5, 6, 9, 10).
5. **`toFixed(2)` pada 163,845** menghasilkan "163.84", bukan "163.85"
   (IEEE-754: 163.84499999999998). Test disesuaikan, bukan kodenya.

## Verifikasi yang dijalankan
- `npx tsc --noEmit` → bersih
- `npm run build` → sukses, 21 route statis (termasuk `/prelab/m3-sn-bi-electrodeposition`)
- `npx playwright test` → **107 passed, 0 failed** (naik dari 93; M3 pre-lab dan
  M3 module ditambahkan ke `responsive-audit.spec.ts` × 7 viewport)
- `node tests/review/m3-prelab-verify.mjs` → PASS (22 assert: basis konsentrasi,
  verifikasi 4 garam, PEG400, neraca volume)
- `node tests/review/m3-prelab-walkthrough.mjs` → PASS (gerbang urutan 6 langkah,
  11 langkah walkthrough, 5 cek, 100%, tanpa overflow di 360px)
- `node tests/review/m3-alloy-mode-verify.mjs` → PASS (n/M ekuivalen, endpoint
  logam murni, rasio massa teoretis Bi/Sn sesuai Hukum Faraday, guard bertahan)
- `node tests/review/m3-fixes-verify.mjs` → PASS (regresi fix 1-3)
- `node tests/review/m3-cell-explorer-verify.mjs` → PASS (regresi)

## Lanjut berikutnya
1. Commit pekerjaan 2026-09-02 dan 2026-09-04 (belum di-commit sama sekali).
2. Checklist preparasi katoda/anoda sebagai komponen tersendiri di halaman modul
   (audit item 7) — saat ini materinya ada di walkthrough, bukan sebagai
   checklist yang bisa dicentang di bench.
3. Halaman modul M3 masih tipis (80 baris) dan belum mengikuti struktur
   Brief/Understand/Rehearse/Prove/Ready di UI_REBUILD_PLAN.md.
4. Pre-lab walkthrough M4 (zeolit FAU, hal. 26-28), M5 (XRD), M6 (TGA).
5. Utang teknis lama: `app/modules/m1-reactions/page.tsx` masih punya 26 kelas
   warna Tailwind hardcoded, dan beberapa file memakai unicode subscript langsung
   alih-alih ChemText.
