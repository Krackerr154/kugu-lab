# Sesi Review Pembahasan — Slide List

**Session type:** Review post-praktikum, asprak-driven, guided learning.
**Duration:** ~30 menit. **Slides:** 19 (18 konten + 1 penutup).
**Audience:** 12 praktikan (3 kelompok × 4 orang), satu asprak per ruang.
**Screen:** Tidak ada proyektor. Setiap praktikan membuka perangkatnya sendiri.

> **Prinsip:** Karena tidak ada proyektor, *sinkronisasi adalah presentasi itu sendiri*.
> Tidak ada layar bersama untuk dilihat ulang jika praktikan tersesat. Karena itu
> indikator drift (`Anda di slide 5 · Asisten di slide 7`) bersifat wajib, bukan
> pilihan.

---

## Peta sesi

```
PEMBUKA                2 min    slide 1
TUJUAN PRAKTIKUM       3 min    slide 2-4
PEMBAHASAN            11 min    slide 5-11     ← inti teori
PENGOLAHAN DATA        9 min    slide 12-16    ← data kelas
FORMAT LAPORAN         3 min    slide 17
PENUTUP                2 min    slide 18
                      ------
                       30 min
```

**Urutan mengikuti struktur laporan.** Praktikan menulis laporan setelah sesi ini,
jadi urutan slide = urutan yang akan mereka tulis.

---

## PEMBUKA

### Slide 1 — Pembuka

| | |
|---|---|
| **Judul** | Review Praktikum Modul 4 — Sintesis Paduan Sn–Bi |
| **Isi** | Judul modul, penuntun hal. 47–56, alur sesi 4 bab |
| **Asprak** | "Kita sudah selesai praktikum. Sekarang kita bahas apa yang tadi dikerjakan — dari tujuan, teori, data kalian, sampai cara menulisnya di laporan." |
| **Untuk laporan** | — |

**Catatan:** Slide ini menetapkan kontrak sesi. Praktikan tahu akan dibawa ke mana,
dan bahwa output-nya adalah laporan.

---

## BAB 1 — TUJUAN PRAKTIKUM (3 min)

### Slide 2 — Apa yang kita hasilkan hari ini

| | |
|---|---|
| **Judul** | Tujuan & Keluaran Praktikum |
| **Isi** | Tujuan: sintesis paduan Sn–Bi pada substrat tembaga secara kodeposisi. Keluaran: katoda berlapis, data massa sebelum/sesudah, efisiensi arus, dokumentasi visual, sampel untuk XRD Modul 5 |
| **Asprak** | "Ingat, produk akhir kalian bukan cuma pelatnya — tapi juga angka efisiensi dan sampel untuk Modul 5." |
| **Untuk laporan** | Poin **c. Tujuan Praktikum** (10 poin) |

### Slide 3 — Urutan kerja

| | |
|---|---|
| **Judul** | Apa Saja yang Tadi Dikerjakan |
| **Isi** | Urutan ringkas: gores plat tembaga → solder kawat 15 cm → uji kontinuitas dengan amperemeter → cor resin → siapkan elektroda karbon → racik 100 mL elektrolit (A+B+C) → rangkai sel DC → elektrodeposisi → bilas & keringkan → timbang |
| **Asprak** | "Kita urut ulang supaya kalian bisa menuliskan langkahnya dengan benar di laporan." |
| **Untuk laporan** | Poin **f.1** — deskripsi proses sintesis |

**Catatan:** Gerbang mutu yang mudah terlewat — uji kontinuitas dengan amperemeter.
Sambungan solder yang *tampak* baik bisa tidak kontinu secara listrik, dan
kegagalan ini baru terlihat saat deposisi tidak menghasilkan apa-apa.

---

## BAB 2 — PEMBAHASAN (11 min)

Bab terpanjang. Membawa tiga poin rubrik (f.1, f.2, f.3).

### Slide 4 — Mengapa paduan Sn–Bi

| | |
|---|---|
| **Judul** | Mengapa Paduan Sn–Bi, Bukan Logam Murni |
| **Isi** | Sifat mekanik & ketahanan korosi lebih baik dari logam penyusunnya. Eutektik Sn-58Bi meleleh ~139 °C — jauh di bawah solder konvensional. Alternatif bebas timbal (Pb-free), memenuhi RoHS |
| **Asprak** | "Ini alasan kenapa kita bikin paduan, bukan lapisan timah atau bismut saja." |
| **Untuk laporan** | Poin **f.1** — latar belakang |

### Slide 5 — Prinsip elektrodeposisi

| | |
|---|---|
| **Judul** | Bagaimana Arus Membentuk Lapisan |
| **Isi** | Arus DC mereduksi kation di katoda; ion menerima elektron dan mengendap sebagai lapisan padat. Berlangsung pada suhu ruang, mampu melapisi geometri rumit. Ketebalan & komposisi dikendalikan oleh rapat arus, potensial, pH, konsentrasi |
| **Asprak** | "Yang mengontrol hasil kalian bukan sulap — tapi rapat arus, pH, dan konsentrasi." |
| **Untuk laporan** | Poin **f.1** |

### Slide 6 — Tantangan beda potensial ⭐

| | |
|---|---|
| **Judul** | Selisih Potensial Menghambat Kodeposisi |
| **Isi** | `SnBiPotentialGapDiagram`. Bi³⁺/Bi = +0,31 V; Sn²⁺/Sn = −0,14 V; ΔE° ≈ 0,45 V |
| **Asprak** | "Ini kesulitan utama modul ini. Dua ion punya potensial reduksi yang jauh berbeda, jadi tidak mau mengendap bersamaan secara alami." |
| **Untuk laporan** | Poin **f.1** — inti pembahasan |

**Catatan:** Ini slide terpenting di bab ini. Beri waktu. Jangan buru-buru.

### Slide 7 — Peran agen pengompleks

| | |
|---|---|
| **Judul** | Mengapa Perlu Agen Pengompleks |
| **Isi** | EDTA/citrat menggeser potensial deposisi efektif secara konseptual sehingga kedua ion dapat tereduksi bersamaan. **Jangan cantumkan nilai efektif numerik** — hanya konsep |
| **Asprak** | "Agen pengompleks menarik potensial kedua ion jadi lebih berdekatan." |
| **Untuk laporan** | Poin **f.2** — penghubung ke fungsi larutan |

### Slide 8 — Fungsi larutan A, B, C ⭐

| | |
|---|---|
| **Judul** | Fungsi Larutan A, B, dan C |
| **Isi** | `ElectrolyteFunctionCard` — tab A/B/C:<br>**A** = Persiapan pengompleks (EDTA)<br>**B** = Sumber ion logam (SnCl₂·2H₂O, Bi(NO₃)₃)<br>**C** = Pengompleks pendamping (media asam, pH ~2) |
| **Asprak** | "Ini pertanyaan yang hampir selalu muncul di laporan. A untuk pengompleks, B sumber logam, C pendamping." |
| **Untuk laporan** | Poin **f.2** — **wajib** |

> ⚠️ **GAP TERKONFIRMASI:** `ElectrolyteFunctionCard` sudah dibangun lengkap
> (18,5 KB, dengan tab A/B/C yang benar) tetapi **tidak dirender di halaman modul
> M4** — saat ini hanya terjangkau lewat `CodepositionWorkbench`. Konten poin
> rubrik f.2 **tidak ada di permukaan review saat ini**. Slide ini memerlukan
> komponen tersebut dipasang di halaman modul M4.

### Slide 9 — Urutan pencampuran

| | |
|---|---|
| **Judul** | Urutan Pencampuran A + B + C |
| **Isi** | `ElectrolyteFunctionCard` — rail langkah: A+B+C → PEG400 → NH₃ → pengenceran → atur pH. Konsentrasi akhir dihitung pada basis 100 mL |
| **Asprak** | "Urutannya tidak boleh ditukar. NH₃ pekat ditambahkan sebelum EDTA dilarutkan." |
| **Untuk laporan** | Poin **f.1** + **f.2** |

**Catatan:** NH₃ sebelum EDTA adalah jebakan klasik. Pastikan disebut.

### Slide 10 — Peta sel elektrokimia

| | |
|---|---|
| **Judul** | Sel Elektrokimia yang Kalian Rangkai |
| **Isi** | `ElectrochemicalCellExplorer` — anoda karbon, katoda tembaga, larutan elektrolit, sumber DC |
| **Asprak** | "Ini rangkaian yang tadi kalian buat. Perhatikan mana anoda, mana katoda." |
| **Untuk laporan** | Poin **f.1** |

**Catatan:** Bahan anoda (karbon) **disediakan laboratorium**. Jangan pernah
menginstruksikan pembongkaran baterai bekas.

---

## BAB 3 — PENGOLAHAN DATA (9 min)

Bab dengan data kelas yang nyata. Ini pembeda sesi ini dari belajar mandiri.

### Slide 11 — Rumus dan alasannya

| | |
|---|---|
| **Judul** | Dari Arus ke Massa ke Efisiensi |
| **Isi** | Tiga persamaan berurutan:<br>`Q = I × t`<br>`m_teoretis = (I × t × M) / (n × F)`<br>`η = (m_aktual / m_teoretis) × 100%` |
| **Asprak** | "Urutannya penting: hitung muatan dulu, baru massa teoritis, baru bandingkan dengan massa aktual." |
| **Untuk laporan** | Poin **e. Pengolahan Data** (15 poin) |

### Slide 12 — Data kelas ⭐

| | |
|---|---|
| **Judul** | Data Kelompok |
| **Isi** | Asprak memasukkan 4 angka per kelompok: `I`, `t`, `m₁` (sebelum), `m₂` (sesudah). Sistem menghitung η tiap kelompok |
| **Asprak** | "Sekarang kita masukkan angka kalian, biar kelihatan hasilnya." |
| **Untuk laporan** | Poin **d. Data Pengamatan** (15 poin) + **e** |

**Catatan:** Asprak mengetik 12 angka total (3 kelompok × 4). Cukup untuk
menunjukkan sebaran tanpa merepotkan sesi.

### Slide 13 — Perbandingan efisiensi ⭐

| | |
|---|---|
| **Judul** | Efisiensi Arus Kelompok |
| **Isi** | Bar chart 3 kelompok. Contoh:<br>`Kelompok 1  ###############    87%`<br>`Kelompok 2  ##################  105%  ← di atas 100%`<br>`Kelompok 3  ###########          61%` |
| **Asprak** | "Lihat sebarannya. Kenapa angkanya bisa beda jauh padahal prosedurnya sama?" |
| **Untuk laporan** | Poin **f.4** — hitung efisiensi arus |

**Catatan:** Slide ini bekerja pada kedua kemungkinan hasil:

- **Ada yang >100%** → itu bahan diskusi. Diagnostik yang benar: bilas/pengeringan
  kurang sempurna, kesalahan penimbangan, atau asumsi stoikiometri tidak tepat.
- **Semua <100%** → diskusinya reaksi samping H₂ (evolusi hidrogen), yang juga
  sudah tertulis di halaman.

Kedua kemungkinan memberi momen pengajaran nyata. Ini tanda slide yang dirancang baik.

### Slide 14 — Mengapa efisiensi di bawah 100%

| | |
|---|---|
| **Judul** | Reaksi Samping Hidrogen |
| **Isi** | Tidak semua arus membentuk deposit. Ion H⁺ dalam larutan asam tereduksi menjadi gas H₂ (reaksi evolusi hidrogen). Efisiensi <100% **wajar** |
| **Asprak** | "Jadi kalau hasil kalian 87%, itu bukan berarti kalian salah. Itu memang sifat sistemnya." |
| **Untuk laporan** | Poin **f.4** |

### Slide 15 — Mengapa bisa di atas 100%

| | |
|---|---|
| **Judul** | Bila Hasil Melebihi 100% |
| **Isi** | Efisiensi >100% menandakan galat: pencucian/pengeringan katoda kurang sempurna, kesalahan penimbangan, atau ketidaktepatan asumsi stoikiometri |
| **Asprak** | "Kalau ada yang di atas 100%, bukan berarti hebat — berarti ada yang perlu diperiksa." |
| **Untuk laporan** | Poin **f.4** + **h. Kesimpulan** |

**Catatan:** Slide ini menetralkan rasa "gagal". Praktikan yang mengukur 105%
sering mengira dirinya salah. Framing yang benar: >100% adalah **diagnostik**,
bukan kegagalan.

### Slide 16 — Batas asumsi Sn–Bi

| | |
|---|---|
| **Judul** | Asumsi yang Harus Dikonfirmasi |
| **Isi** | Penuntun **tidak** menetapkan rasio stoikiometri Sn:Bi secara pasti. Contoh perhitungan memakai pendekatan Sn²⁺ (n = 2, M = 118,71) sebagai ilustrasi. Untuk laporan resmi, gunakan asumsi yang **dikonfirmasi asisten** |
| **Asprak** | "Ini penting: jangan mengarang rasio. Tanyakan ke saya, dan tulis asumsinya di laporan." |
| **Untuk laporan** | Poin **f.4** + **h** |

**Catatan:** Contoh perhitungan protokol: Q = 0,058 A × 900 s = 52,20 C →
5,4102 × 10⁻⁴ mol elektron → m_teoretis = 0,032112 g (asumsi Sn²⁺) → η ≈ 87,19%
bila massa aktual 0,0280 g.

---

## BAB 4 — FORMAT LAPORAN (3 min)

### Slide 17 — Rubrik dan cara menulisnya

| | |
|---|---|
| **Judul** | Format & Rubrik Laporan (100 Poin) |
| **Isi** | `ReportFormatGuide` — delapan bagian berbobot: a. Sampul (5), b. Judul (5), c. Tujuan (10), d. Data Pengamatan (15), e. Pengolahan Data (15), f. Pembahasan (35), h. Kesimpulan (10), i. Daftar Pustaka (5) |
| **Asprak** | "Pembahasan bobotnya 35 poin — paling besar. Dan semua yang baru kita bahas tadi masuk ke situ." |
| **Untuk laporan** | Seluruh rubrik |

**Catatan:** Tekankan pemetaan — poin f.1–f.4 yang baru dibahas adalah isi dari
bagian Pembahasan yang berbobot 35 poin.

---

## PENUTUP

### Slide 18 — Penutup & Games

| | |
|---|---|
| **Judul** | Selesai Review — Lanjut Games |
| **Isi** | Ringkasan 4 poin pembahasan + tombol `Mulai Games` |
| **Asprak** | "Segitu dulu reviewnya. Sekarang kita main sebentar." |

---

## Pemetaan rubrik → slide

| Poin rubrik | Bobot | Slide |
|---|---|---|
| c. Tujuan Praktikum | 10 | 2, 3 |
| d. Data Pengamatan | 15 | 13 |
| e. Pengolahan Data | 15 | 12, 13 |
| **f.1** Deskripsi sintesis | ⤷ | 4, 5, 6, 7, 10, 11 |
| **f.2** Fungsi larutan A/B/C | ⤷ | 8, 9, 10 |
| **f.3** Perubahan katoda | ⤷ | 11 |
| **f.4** Hitung efisiensi arus | ⤷ | 14, 15, 16, 17 |
| h. Kesimpulan | 10 | 16, 17 |

*(f.1–f.4 berada di dalam bagian f. Pembahasan = 35 poin)*

---

## Yang belum ada di halaman modul M4

Dua slide memerlukan komponen yang **sudah dibangun tetapi belum dipasang** di
`/modules/m4-sn-bi-electrodeposition`:

| Slide | Komponen | Status |
|---|---|---|
| 9, 10 | `ElectrolyteFunctionCard` | Dibangun (18,5 KB), hanya terjangkau lewat `CodepositionWorkbench` |
| 11 | `ElectrochemicalCellExplorer` | ✅ sudah terpasang |
| 7 | `SnBiPotentialGapDiagram` | ✅ sudah terpasang |
| 18 | `ReportFormatGuide` | ✅ sudah terpasang |

**Konsekuensi:** poin rubrik **f.2** (fungsi larutan A, B, C) — yang wajib di
laporan — saat ini tidak ada di permukaan review. Ini harus ditambahkan sebelum
sesi bisa berjalan lengkap.

---

## Catatan implementasi

- **`slideId`** ditambahkan ke `M3PresentationState` sebagai field opsional.
  Absen = perilaku hari ini. Tetap melewati `coercePresentationState()`.
- **Tidak ada proyektor** → indikator drift wajib. Praktikan yang tersesat tidak
  punya layar bersama untuk dilihat ulang.
- **Bab = stage yang ada.** Rail empat tahap menjadi struktur bab; slide adalah
  kontrol halus di dalamnya.
- **Praktikan hanya menonton/membaca** selama review — tidak ada slide tipe
  `KERJAKAN`. Tiga tipe slide: `LIHAT`, `DATA`, `CEK` (games).
- **Games terpisah** dari review: fase kedua, dipicu tombol `Mulai Games`.
