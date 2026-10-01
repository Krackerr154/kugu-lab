# Rencana Implementasi — Sesi Review & Games

**Status:** Rencana. Belum ada kode yang diubah.
**Cakupan:** Guided learning untuk Sesi Review (19 slide) + Games pasca-review.
**Basis:** Hasil pembacaan kode aktual (bukan asumsi).

---

## 1. Temuan investigasi

Tiga hal yang mengubah rencana awal.

### 1.1 Relay SUDAH mendukung banyak ruang ✅

```js
const rooms = new Map();
const room = rooms.get(message.roomId);   // lookup per roomId
const issueRoom = () => { const roomId = safeId(24); ... rooms.set(roomId, room); };
```

Setiap `POST /internal/rooms` membuat `roomId` unik 32 karakter. Isolasi per ruang,
TTL 4 jam, dan validasi origin semuanya sudah benar. **Tidak perlu diubah.**

### 1.2 Yang bermasalah ada di dua tempat lain

**(a) `lib/server/presentation-session.ts` — singleton tingkat modul**

```ts
let activeSession: InternalPresentationSession | null = null;
```

Satu sesi per proses server. Dua konsekuensi:

- Dua asprak yang membuka sesi akan **saling menimpa** slot yang sama.
- **Restart container di tengah sesi menghapus sesi** — semua posisi slide hilang.

**(b) `relay/server.mjs` — DELETE menghapus SEMUA ruang — TERVERIFIKASI ⚠️**

```js
if (req.method === "DELETE" && req.url.startsWith("/internal/rooms")) {
  for (const [id, r] of rooms) { endRoom(r, "closed-by-api"); }
```

Menutup satu sesi **menutup seluruh ruang di relay**, termasuk milik asprak lain.

**Dibuktikan dengan probe nyata** (`tests/review/relay-multiroom-probe.mjs`),
bukan hanya dibaca dari kode. Hasil:

```json
{
  "roomsAreDistinct": true,
  "roomCountBefore": 2,
  "aJoinableBefore": { "ok": true },
  "bJoinableBefore": { "ok": true },
  "roomCountAfter": 0,
  "bJoinableAfterClosingA": { "ok": false, "code": "room-not-found" },
  "bSurvived": false
}
```

Dua ruang hidup berdampingan → satu ditutup → **ruang kedua ikut mati**.
Ini bug nyata, bukan risiko teoretis.

### 1.3 Kontrak ada di TIGA berkas, dan dua di antaranya TIDAK dijaga apa pun ⚠️

| Berkas | Peran | Konsumen | Diverifikasi tes? |
|---|---|---|---|
| `lib/m3-presentation.ts` | Sumber TypeScript | Aplikasi Next.js | ✅ `m3-presentation-contract.spec.ts` |
| `shared/m3-contract.mjs` | Implementasi JS murni | **Relay** (impor langsung) | ✅ `relay/test/contract.test.mjs` |
| `shared/m3-contract.d.mts` | Deklarasi tipe | Type-check | ❌ **tidak ada** |

**Temuan penting setelah penelusuran:**

```
TS files importing shared/m3-contract:  (none)
Files referencing m3-contract:          relay/protocol.mjs   ← hanya ini
```

- Tidak ada satu pun berkas `.ts`/`.tsx` yang mengimpor `shared/m3-contract.mjs`.
- Yang mengimpor hanya `relay/protocol.mjs` (relay adalah JS murni, tidak punya TS).
- Akibatnya: **`.mjs` dan `.ts` tidak pernah dibandingkan satu sama lain.**
  Keduanya punya tes sendiri-sendiri, tetapi tidak ada tes yang membuktikan
  keduanya menerima/menolak masukan yang **sama**.
- `shared/m3-contract.d.mts` tidak dikonsumsi apa pun dan tidak diperiksa tes.
  Ia bisa menyimpang tanpa ada yang tahu.

**Kegagalan yang mungkin terjadi:** field baru ditambahkan di `lib/m3-presentation.ts`
tetapi lupa di `shared/m3-contract.mjs`. Aplikasi menerima state baru; relay
**menolaknya** dengan `invalid-message`. Gejalanya: asprak mengklik slide, layar
praktikan tidak bergerak. Sulit didiagnosis saat sesi berlangsung.

**Solusi (best practice) — satu sumber kebenaran:**

`lib/m3-presentation.ts` **mengimpor ulang** implementasi dari `.mjs` alih-alih
mendefinisikannya lagi. Hanya tipe dan tambahan khusus-browser yang tinggal di `.ts`:

```ts
// lib/m3-presentation.ts
import {
  coercePresentationState as sharedCoerce,
  M3_STAGE_IDS, M3_FOCUS_IDS, M3_DEMO_AGENT_IDS, M3_PRESENTATION_VERSION,
} from "../shared/m3-contract.mjs";
```

**Sudah diuji kelayakannya** (berkas scratch sementara, `npx tsc --noEmit`):

```
EXIT: 0
(no output = CLEAN)
```

Jadi `.ts` bisa mengimpor `.mjs` yang sama dengan **tipe tetap utuh**
(`tsconfig.json` punya `allowJs: true` dan `moduleResolution: "bundler"`).
Berkas scratch sudah dihapus setelah uji.

**Hasilnya:** relay dan aplikasi menjalankan **satu fungsi validasi yang sama**.
Drift menjadi mustahil secara struktural, bukan sekadar dijaga oleh disiplin.
`shared/m3-contract.d.mts` tetap sebagai deklarasi tipe untuk `.mjs`.

**Ditambah tes paritas** di `relay/test/contract.test.mjs`: untuk satu set masukan
yang sama, `.mjs` dan `.ts` harus memberi hasil identik. Ini mengunci kesetaraan
bahkan bila seseorang kelak memisahkannya lagi.

### 1.4 Koreksi: `ElectrolyteFunctionCard` SUDAH ada di halaman M4 ✅

**Temuan awal saya salah.** Saya memeriksa hanya *import langsung* di
`app/modules/m3-sn-bi-electrodeposition/page.tsx` dan menyimpulkan komponen itu
tidak dirender. Itu keliru — rantai render-nya transitif:

```
page.tsx
  └─ <ElectrochemicalCellExplorer />        ← diimpor langsung ✅
       └─ <CodepositionWorkbench />        ← dirender di dalamnya
            └─ <ElectrolyteFunctionCard /> ← dirender tanpa syarat
```

**Diverifikasi di browser** (`localhost:3000`, identitas praktikan diisi), pada
halaman M4 setelah melewati gerbang akses:

```json
{
  "hasCellExplorer": true,
  "tablistCount": 3,
  "tabLabels": [
    "hub  Larutan A  5 mL  Persiapan pengompleks",
    "science  Larutan B  5.5 mL  Sumber ion logam",
    "account_tree  Larutan C  9 mL  Pengompleks pendamping",
    "... tab agen (EDTA / Asam Sitrat / PEG400) ...",
    "LANGKAH 1..6  (urutan pencampuran)"
  ],
  "mentionsPersiapanPengompleks": true,
  "mentionsSumberIonLogam": true,
  "mentionsPengompleksPendamping": true
}
```

**Konsekuensi:**

- **Fase 6.1 DIBATALKAN.** Tidak ada komponen yang perlu dipasang.
- Slide 9 (fungsi A/B/C) dan slide 10 (urutan pencampuran) **sudah punya konten**.
- Poin rubrik **f.2** sudah ada di permukaan halaman M4.
- Yang tersisa hanya **menambahkan anchor** agar slide bisa menunjuk ke sana — itu
  bagian dari Fase 1.2, bukan pekerjaan konten baru.

**Pelajaran:** memeriksa import langsung tidak cukup; rantai render transitif harus
ditelusuri. Klaim "komponen tidak terpasang" hanya sah setelah diperiksa di DOM.

---

## 2. Keputusan arsitektur

### 2.1 Slide = waypoint, bukan kotak berukuran tetap

Slide didefinisikan sebagai penunjuk ke elemen yang **sudah ada** di DOM:

```ts
interface ReviewSlide {
  id: string;              // "p7"
  chapter: M3StageId;      // "understand"  → memakai rail 4 tahap yang ada
  label: string;           // "Selisih Potensial"
  anchor: string;          // id elemen / data-attribute
  title: string;           // untuk chrome
}
```

**Alasan:** konten tidak ditulis ulang, jadi angka kimia tidak bisa melenceng.
Konten yang lebih tinggi dari viewport akan menggulir di dalam bingkai — tidak
dipotong. Ini juga menghindari me-*remount* interaktif (`ElectrochemicalCellExplorer`
punya state sendiri; remount akan menghapusnya).

**Yang saya TIDAK lakukan tanpa persetujuan:** menulis ulang konten menjadi
kotak berukuran tetap. Itu berarti dua rendering untuk kimia yang sama, dan
risiko drift pada angka yang sudah disetujui kurikulum.

### 2.2 Dua mesin status, bukan satu

| | REVIEW | GAMES |
|---|---|---|
| Pengendali | Asprak (posisi) | Praktikan (jawaban) |
| Arah sinkron | Siaran satu arah | Kiriman independen |
| Status | `slideId` | soal + jawaban per praktikan |
| Jalur data | Relay (WSS) | HTTP terpisah |

Digabung menjadi satu mode dengan flag akan menyulitkan kedua-duanya. Dipisah.

### 2.3 Jawaban games TIDAK lewat relay

Konsisten dengan aturan yang sudah ada: kontrak presentasi hanya membawa ID
semantik. Jawaban, keyakinan, dan skor lewat HTTP ke endpoint terpisah dengan
token partisipan sementara. NIM tetap lokal dan tidak pernah dikirim.

### 2.4 Perbaikan sesi: kunci per ruang

`presentation-session.ts` diubah dari satu variabel menjadi `Map<roomId, session>`.

API tetap kompatibel:

```
GET /api/m4-guided/session
  → { active: boolean, session: {...} | null }        // sesi terbaru (kompatibel)
  → { active, session, sessions: [...] }              // tambahan, opsional dibaca
```

Satu asprak per ruang tetap terpenuhi, tabrakan antar-asprak hilang, dan
penutupan sesi tidak lagi menyapu ruang lain.

**Restart container:** penyimpanan tetap in-memory. Sesi 30 menit bisa dibuat
ulang dalam hitungan detik, jadi persistensi tidak sepadan kompleksitasnya.
Didokumentasikan sebagai batasan yang diketahui, bukan dibiarkan diam-diam.

---

## 3. Perubahan kontrak

Aditif, semua opsional. Absen = perilaku hari ini.

```ts
export const REVIEW_SLIDE_IDS = ['p1', ..., 'p19'] as const;
export type ReviewSlideId = typeof REVIEW_SLIDE_IDS[number];
export const REVIEW_PHASES = ['review', 'games'] as const;
export type ReviewPhase = typeof REVIEW_PHASES[number];

export interface M3PresentationState {
  version: 1;
  stageId: M3StageId;
  focusId?: M3FocusId;
  demoOverlay?: M3DemoOverlay;
  slideId?: ReviewSlideId;     // BARU
  phase?: ReviewPhase;         // BARU
  dataSetId?: string;          // BARU — token saja, bukan angkanya
}
```

Aturan validasi yang ditambahkan ke `coercePresentationState`:

- `slideId` harus ada di allowlist DAN konsisten dengan `stageId`
  (slide `p7` ber-`chapter` `understand` ⇒ `stageId` harus `understand`).
- `phase` harus `"review"` atau `"games"`.
- `dataSetId` harus cocok `/^[A-Za-z0-9_-]{8,32}$/`.
- Field tak dikenal tetap dibuang (perilaku yang sudah ada, dipertahankan).

**Diterapkan di tiga berkas** (§1.3): `lib/m3-presentation.ts`,
`shared/m3-contract.mjs`, `shared/m3-contract.d.mts`.

---

## 4. Fase pengerjaan

### Fase 0 — Perbaikan fondasi

| # | Tugas | Berkas |
|---|---|---|
| 0.1 | Sesi per ruang (`Map<roomId, session>`) | `lib/server/presentation-session.ts` |
| 0.2 | DELETE relay hanya menutup ruang yang diminta | `relay/server.mjs` |
| 0.3 | Tes regresi: dua ruang hidup berdampingan | `relay/test/` |

**Kenapa dulu:** dua-duanya bug yang bisa merusak sesi nyata. Murah diperbaiki,
mahal ditemukan saat demo.

### Fase 1 — Kontrak & urutan slide

| # | Tugas | Berkas |
|---|---|---|
| 1.1 | `slideId`, `phase`, `dataSetId` + validasi | 3 berkas kontrak |
| 1.2 | Data 19 slide (id, chapter, label, anchor) | `lib/m4-review-slides.ts` |
| 1.3 | `presentSlide()` di provider | `M3PresentationProvider.tsx` |
| 1.4 | Tes kontrak: slide valid/tidak valid, konsistensi chapter | `relay/test/contract.test.mjs` |

### Fase 2 — Tampilan slide praktikan

| # | Tugas |
|---|---|
| 2.1 | `ReviewSlideView` — chrome atas (posisi, bab, `Keluar`) + rail bawah |
| 2.2 | Terapkan `slideRequest` → scroll instan ke anchor (pola `navRequest` yang ada) |
| 2.3 | Indikator drift: `Anda di slide 5 · Asisten di slide 7` + `[ Kembali ]` |
| 2.4 | Mode baca-ulang: praktikan boleh mundur tanpa menggeser asprak |
| 2.5 | Status koneksi jujur (`connecting`/`reconnecting`/`disconnected`) tanpa menghapus konten |
| 2.6 | `prefers-reduced-motion`: perpindahan instan |

### Fase 3 — Deck asprak

| # | Tugas |
|---|---|
| 3.1 | `◀ / ▶ / Lompat ke…` di deck yang sudah ada (`data-presenter-deck`) |
| 3.2 | Pengelompokan bab: Tujuan (2–4) · Pembahasan (5–11) · Pengolahan (12–17) · Format (18) |
| 3.3 | Penghitung praktikan yang mengikuti |

### Fase 4 — Slide data (13–14)

| # | Tugas |
|---|---|
| 4.1 | Borang 3 kelompok × 4 angka (I, t, m₁, m₂) |
| 4.2 | `POST /api/m4-guided/dataset` → hitung η, simpan, balas `dataSetId` |
| 4.3 | `GET /api/m4-guided/dataset/[id]` untuk praktikan |
| 4.4 | Bar chart 3 kelompok + penanda >100% |

### Fase 5 — Games

| # | Tugas |
|---|---|
| 5.1 | Bank 8 soal (disetujui) + pengacakan 5 soal per sesi |
| 5.2 | `POST /api/m4-guided/games/answer` — token anonim, server-side scoring |
| 5.3 | Alur: buka → kunci → tampilkan jawaban → soal berikutnya → akhir |
| 5.4 | Skor: Yakin/Ragu/Tebak, tanpa komponen kecepatan |
| 5.5 | Reveal: juara 3 teratas publik, sisanya privat |
| 5.6 | Sudden death untuk seri: satu soal acak dari bank (di luar 5 yang dipakai) |
| 5.7 | Peta miskonsepsi untuk asprak |

### Fase 6 — DIBATALKAN ❌

Awalnya direncanakan untuk memasang `ElectrolyteFunctionCard`. Setelah diverifikasi
di DOM, komponen itu **sudah dirender** (lihat §1.4). Tidak ada pekerjaan konten baru.

Penambahan anchor slide sudah tercakup di **Fase 1.2**.

---

## 5. Strategi verifikasi

Sesuai preferensi: **tanpa Playwright** kecuali diminta.

| Lapis | Alat |
|---|---|
| Kontrak & validasi | `node --test relay/test/contract.test.mjs` |
| Sesi per ruang | `node --test relay/test/relay.integration.test.mjs` |
| Isolasi antar-ruang | `node tests/review/relay-multiroom-probe.mjs` (baru, sudah ada) |
| Tipe | `npx tsc --noEmit` |
| Build | `npm run build` |
| UI interaktif | `browser_exec` — 390px & desktop, transisi nyata |
| Probe fitur | `node tests/review/m4-review-session.mjs` (baru) |

**Baseline terverifikasi sebelum perubahan (semua hijau):**

```
relay/test/contract.test.mjs            3 pass
relay/test/factory.test.mjs             (termasuk dalam 3 di atas)
relay/test/relay.integration.test.mjs   2 pass
npx tsc --noEmit                        clean
```

Yang wajib diperiksa dengan `browser_exec`:

- Urutan 19 slide bergerak sesuai klik asprak
- Indikator drift muncul saat praktikan mundur, dan `[ Kembali ]` bekerja
- Konten tidak hilang saat koneksi putus
- Nol overflow horizontal di 390px pada setiap slide
- `Esc` keluar, fokus kembali ke tempat semula
- `prefers-reduced-motion`: perpindahan instan

---

## 6. Bank soal games — 8 soal, dipakai 5

**Disetujui Gerald.** Semua bersumber dari modul (bukan karangan), satu soal per
konsep inti.

**Mekanisme:** setiap sesi mengambil **5 soal acak** dari bank 8. Jadi tiap
pertemuan berbeda, dan tidak ada kelompok yang bisa menghafal urutannya dari
sesi sebelumnya. Sudden death mengambil soal dari 3 yang tidak terpakai.

**Urutan juga diacak**, bukan hanya pemilihannya.

### Soal 1 — Mengapa paduan, bukan logam murni

**Mengapa sintesis dilakukan sebagai paduan Sn–Bi, bukan logam murni?**

- **A.** Paduan eutektik Sn-58Bi meleleh pada ~139 °C, jauh di bawah solder konvensional ✅
- B. Timah dan bismut tidak dapat dideposisi secara terpisah
- C. Paduan selalu lebih murah daripada logam murni penyusunnya
- D. Paduan tidak memerlukan arus listrik untuk terbentuk

*Pembahasan:* Sifat mekanik dan ketahanan korosi paduan lebih unggul, titik lelehnya
jauh lebih rendah, dan bebas timbal sehingga memenuhi regulasi RoHS.

---

### Soal 2 — Selisih potensial

**Berapa selisih potensial reduksi standar antara Bi³⁺/Bi dan Sn²⁺/Sn?**

- A. ≈ 0,14 V
- **B.** ≈ 0,45 V ✅
- C. ≈ 0,31 V
- D. ≈ 0,90 V

*Pembahasan:* Bi³⁺/Bi = +0,31 V; Sn²⁺/Sn = −0,14 V. Selisihnya ≈ 0,45 V — inilah
penghambat utama kodeposisi, karena kedua ion tidak mau tereduksi bersamaan secara alami.

---

### Soal 3 — Jebakan NH₃ ⭐ *(kandidat sudden death)*

**Pada pembuatan larutan A, mengapa NH₃ pekat ditambahkan sebelum EDTA?**

- **A.** Agar EDTA terdeprotonasi dan dapat larut ✅
- B. Agar pH larutan turun ke bawah 2
- C. Agar Sn²⁺ teroksidasi menjadi Sn⁴⁺
- D. Agar terbentuk gas H₂ sebagai pelindung katoda

*Pembahasan:* EDTA hanya larut baik setelah dideprotonasi, dan itu memerlukan
media basa. Menambahkan EDTA lebih dulu akan menghasilkan larutan yang tidak larut
sempurna.

---

### Soal 4 — Fungsi HCl pada larutan B

**Apa fungsi HCl pekat pada larutan B?**

- A. Menurunkan potensial reduksi Sn²⁺
- **B.** Menahan hidrolisis Sn²⁺ dan Bi³⁺ ✅
- C. Menaikkan pH agar deposit lebih tebal
- D. Melarutkan agen pengompleks EDTA

*Pembahasan:* Pada pH lebih tinggi, Sn²⁺ mudah membentuk Sn(OH)Cl dan Bi³⁺ membentuk
BiONO₃. Media asam menjaga keduanya tetap sebagai ion terlarut.

---

### Soal 5 — Perhitungan muatan ⭐ *(kandidat sudden death)*

**Jika arus 0,058 A dialirkan selama 900 s, berapa muatan yang mengalir?**

- A. 5,22 C
- **B.** 52,2 C ✅
- C. 522 C
- D. 15.517 C

*Pembahasan:* Q = I × t = 0,058 A × 900 s = 52,2 C. Langkah ini yang mengubah
arus dan waktu menjadi muatan sebelum dihitung menjadi massa teoritis.

---

### Soal 6 — Efisiensi di atas 100%

**Sebuah kelompok memperoleh efisiensi arus 105%. Apa artinya?**

- A. Depositnya lebih baik daripada kelompok lain
- B. Asumsi valensi Sn²⁺ pasti benar
- **C.** Ada galat: bilas/pengeringan kurang sempurna, kesalahan penimbangan, atau asumsi stoikiometri tidak tepat ✅
- D. Reaksi evolusi hidrogen berlangsung lebih cepat

*Pembahasan:* Efisiensi di atas 100% menandakan galat pengukuran, bukan hasil
yang lebih baik. Massa aktual tidak mungkin melebihi massa teoritis bila semua
asumsi benar.

---

### Soal 7 — Peran PEG400

**Apa peran PEG400 dalam resep elektrolit ini?**

- A. Agen pengompleks pengganti EDTA
- **B.** Mengendalikan morfologi dan komposisi deposit ✅
- C. Sumber ion logam tambahan
- D. Menurunkan pH larutan menjadi ~2

*Pembahasan:* PEG400 **bukan** agen pengompleks — ia bekerja pada morfologi
permukaan deposit, bukan pada pengikatan ion. Ia tetap aditif resep, tetapi
perannya berbeda dari EDTA dan asam sitrat.

---

### Soal 8 — Langkah terakhir

**Apa langkah terakhir dalam penyiapan 100 mL larutan elektrolit?**

- A. Menambahkan PEG400 hingga 0,20 M
- B. Menuangkan larutan (A+B) ke dalam larutan C
- **C.** Memeriksa pH larutan (~2) ✅
- D. Menambahkan NH₃ pekat sebanyak 0,5 mL

*Pembahasan:* Urutannya: A ke dalam B → (A+B) ke dalam C → PEG400 → NH₃ 0,5 mL →
encerkan hingga 100 mL → cek pH ~2. Pemeriksaan pH adalah langkah terakhir sebelum
larutan siap dipakai.

---

### Catatan soal

- **Delapan soal ini perlu persetujuanmu sebelum dipakai.** Saya menyusunnya dari
  konten modul, tetapi kamu yang tahu apa yang sudah dan belum diajarkan.
- **Kandidat sudden death:** Soal 3 dan Soal 5 — keduanya punya jawaban tunggal
  yang tegas dan bisa dijawab cepat tanpa menguntungkan yang menebak.
- **Tidak ada soal berkomponen kecepatan.** Sesuai keputusan sebelumnya.
- **Pembahasan selalu ikut** saat reveal — feedback adalah bagian yang menghasilkan
  pembelajaran, bukan pelengkap.

---

## 7. Risiko

| Risiko | Tingkat | Penanganan |
|---|---|---|
| Restart container menghapus sesi | Sedang | In-memory by design; sesi bisa dibuat ulang cepat. Didokumentasikan. |
| `presentSlide` membuang `focusId`/`demoOverlay` | Sedang | Ditangani eksplisit di `presentSlide()` |
| Kontrak 3 berkas tidak sinkron | **Tinggi** | Tes kontrak membandingkan TS vs `.mjs` untuk masukan yang sama |
| Slide 9–10 kosong | ~~Tinggi~~ **DIBATALKAN** | Keliru: komponen sudah terpasang, diverifikasi di DOM (§1.4) |
| Asprak jadi penghambat laju | Sedang | `Keluar` selalu tersedia; `Lompat ke…` untuk jalan pintas |
| Praktikan tersesat tanpa proyektor | Sedang | Indikator drift wajib, bukan opsional |
| Angka data salah ketik saat sesi | Rendah | `dataSetId` baru dipublikasikan setelah koreksi; bisa dihitung ulang |

---

## 8. Keputusan yang sudah final

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | 8 soal di §6 | ✅ **Disetujui** |
| 2 | Jumlah soal per sesi | ✅ **5, diacak dari bank 8** |
| 3 | Validasi `slideId` | ✅ **Allowlist eksak** (best practice — lihat §8.1) |
| 4 | `ElectrolyteFunctionCard` | ✅ **Fase 6 dibatalkan** — sudah terpasang (§1.4) |
| 5 | Mulai dari mana | ✅ **Fase 0** |

### 8.1 Mengapa allowlist eksak untuk `slideId`

Tiga pilihan, dan alasannya:

| Pendekatan | Kelebihan | Kekurangan |
|---|---|---|
| **Allowlist eksak** (19 nilai) | Validasi paling ketat; salah ketik tertangkap; konsisten dengan `M3_STAGE_IDS` yang sudah ada | Menambah slide = mengubah kontrak |
| Pola bebas (`p1`–`p99`) | Menambah slide tanpa ubah kontrak | ID yang tidak ada lolos validasi → slide kosong saat sesi |
| Tanpa validasi | Paling sederhana | Melanggar prinsip "semantic IDs only" yang sudah dijaga |

**Dipilih allowlist eksak.** Alasannya: seluruh kontrak yang ada sudah memakai
allowlist (`M3_STAGE_IDS`, `M3_FOCUS_IDS`, `M3_DEMO_AGENT_IDS`), dan `focusId`
bahkan divalidasi terhadap `stageId`. Pola bebas akan jadi satu-satunya pengecualian,
dan konsekuensinya nyata: ID yang tidak ada akan lolos, lalu praktikan melihat
layar kosong tanpa penjelasan. Mengubah 19 menjadi 25 nilai itu murah; kehilangan
sinkronisasi di tengah sesi itu mahal.

**Yang membuat ini aman:** dengan satu sumber kebenaran (§1.3), menambah slide
hanya berarti mengubah `shared/m3-contract.mjs` — bukan tiga berkas.

## 9. Perkiraan urutan pengerjaan

```
Fase 0  fondasi (sesi per ruang + bug DELETE)      ← murah, mencegah kerusakan
Fase 1  kontrak + data slide + anchor
Fase 2  tampilan slide praktikan + drift
Fase 3  deck asprak
Fase 4  slide data (3 kelompok)
Fase 5  games + 5 soal acak dari bank 8
```

Fase 0–3 menghasilkan sesi review yang berfungsi penuh. Fase 4–5 melengkapinya.

**Fase 6 dibatalkan** — tidak ada komponen yang perlu dipasang (§1.4).
