// M3 bench procedure, transcribed from Penuntun Praktikum KI3131 Modul 3,
// pages 18-20: stage M3a (cathode + anode fabrication) and stage M3b
// (electrolyte preparation + electrodeposition). Phase tags follow the manual's
// own M3a/M3b split. Hold points mark the manual's irreversible gates (Ampere-
// meter continuity check before resin cast, the 2×24 h cure, mass weigh-ins,
// polarity verification). Quantities, mesh sizes, temperatures and durations
// are the manual's values — they are protocol variables, not to be rounded.
//
// This is the checkable bench version of the interactive ProcedureWalkthrough on
// /prelab/m3-sn-bi-electrodeposition; the two are kept factually in sync.

import type { BenchPhase } from "@/components/shared/BenchChecklist";

export const M3_PROCEDURE: BenchPhase[] = [
  {
    tag: "M3a-1",
    label: "Pembuatan Katoda",
    icon: "bolt",
    items: [
      {
        id: "cathode-scratch",
        text: "Siapkan satu plat tembaga, buat goresan-goresan pada salah satu sisinya.",
      },
      {
        id: "cathode-solder",
        text: "Solder kawat tembaga 15 cm ke sisi tergores dengan kawat timah; tunggu sambungan mengeras.",
        safety:
          "Solder panas dan uap fluks — bekerja di area berventilasi sesuai SOP, gunakan dudukan solder.",
      },
      {
        id: "cathode-continuity",
        text: "Cek kontinuitas sambungan kawat–tembaga dengan Ampere meter sebelum melanjutkan.",
        holdPoint: true,
      },
      {
        id: "cathode-resin",
        text: "Campur resin : hardener 3:1 di gelas plastik, aduk perlahan agar tidak bergelembung, taruh plat di dasar cetakan silikon lalu tuang resin.",
        safety:
          "Resin/hardener iritan-sensitizer — APD dan ventilasi sesuai SDS produk; prosedur ini perlu persetujuan asisten.",
      },
      {
        id: "cathode-cure",
        text: "Biarkan resin mengeras 2 × 24 jam. Mulai tahap ini jauh sebelum sesi elektrodeposisi.",
        holdPoint: true,
      },
    ],
  },
  {
    tag: "M3a-2",
    label: "Pembuatan Anoda (grafit)",
    icon: "battery_horiz_050",
    items: [
      {
        id: "anode-graphite",
        text: "Ambil batang grafit dari baterai bekas.",
        holdPoint: true,
        safety:
          "Pembongkaran baterai bekas (blocker CR-06): jenis baterai, metode isolasi, limbah B3, dan pengawasan ditetapkan asisten lebih dulu — jangan membongkar sendiri.",
      },
      {
        id: "anode-sonicate",
        text: "Rendam grafit di etanol lalu aqua DM, sonikasi masing-masing ~5 menit.",
        safety: "Etanol mudah terbakar — jauhkan dari sumber panas.",
      },
      {
        id: "anode-dry",
        text: "Keringkan grafit di atas hotplate berlapis aluminium foil hingga pengotor keluar.",
      },
    ],
  },
  {
    tag: "M3b-1",
    label: "Penyiapan Elektrolit (100 mL)",
    icon: "science",
    items: [
      {
        id: "elyte-abc",
        text: "Buat larutan A, B, C sesuai tabel komposisi (verifikasi setiap massa di worksheet pre-lab).",
        safety:
          "HCl dan NH_{3} pekat korosif, uap iritan — lemari asam, jangan dicampur langsung. Garam Sn/Bi limbah logam berat.",
      },
      {
        id: "elyte-combine",
        text: "Pipet A ke B sedikit demi sedikit, lalu tuang (A+B) ke C perlahan.",
      },
      {
        id: "elyte-peg-nh3",
        text: "Tambahkan PEG400 (konsentrasi akhir 0,20 M), lalu NH_{3} pekat 0,5 mL.",
      },
      {
        id: "elyte-dilute-ph",
        text: "Encerkan ke 100 mL dengan labu takar, cek pH (~2). Catat pH aktual sebagai deviasi bila menyimpang.",
        holdPoint: true,
      },
    ],
  },
  {
    tag: "M3b-2",
    label: "Elektrodeposisi & Penimbangan",
    icon: "instant_mix",
    items: [
      {
        id: "depo-polish",
        text: "Keluarkan resin dari cetakan, amplas plat 200 → 500 → 800 → 1000 mesh hingga mirror polishing (bantu dengan aqua DM). Ukur panjang × lebar → luas katoda.",
      },
      {
        id: "depo-clean-weigh",
        text: "Sonikasi plat di aseton ≥10 menit, keringkan di oven 60 °C, simpan di desikator, lalu timbang massa awal katoda dan foto. Timbang juga anoda.",
        holdPoint: true,
        safety: "Aseton mudah terbakar, uap iritan — area berventilasi, jauh dari panas/percikan.",
      },
      {
        id: "depo-assemble",
        text: "Isi gelas kimia 250 mL dengan elektrolit; buat tutup karton duplex 9×9 cm dengan dua lubang berjarak ~3 cm; pasang katoda & anoda; sambungkan ke sumber DC dan verifikasi polaritas.",
        holdPoint: true,
        safety:
          "Sumber DC: rangkai saat power supply mati, periksa polaritas bersama asisten, jangan sentuh elektroda saat arus mengalir.",
      },
      {
        id: "depo-run",
        text: "Jalankan 14,5 mA/cm² selama 15 menit — hitung dulu I = 14,5 mA/cm² × luas katoda Anda. Catat arus, tegangan, pH, suhu.",
        safety: "Gas dapat terbentuk di elektroda — area berventilasi, jangan tutup gelas rapat.",
      },
      {
        id: "depo-post",
        text: "Bilas katoda dengan aqua DM, keringkan di oven 60 °C, simpan di desikator, timbang massa akhir, dan foto permukaan sesudah deposisi.",
        holdPoint: true,
      },
      {
        id: "depo-efficiency",
        text: "Hitung efisiensi arus dengan kalkulator di tahap Buktikan; catat asumsi valensi/stoikiometri. Serahkan sampel untuk XRD (Modul 5).",
      },
    ],
  },
];
