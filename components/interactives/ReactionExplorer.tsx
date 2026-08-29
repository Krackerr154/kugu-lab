"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ChemText } from "@/components/shared/ChemText";
import { PredictionPrompt } from "../shared/PredictionPrompt";
import { MysteryChallengeLab } from "./MysteryChallengeLab";
import { ReactionTubeAnimation, type VisualSpec } from "@/components/interactives/ReactionTubeAnimation";

interface ReactionDetail {
  code: "no_reaction" | "white_precipitate" | "coloured_precipitate" | "gas" | "colour_change";
  label: string;
  observation: string;
  inference: string;
  equation: string;
  notes?: string;
  visualSpec: VisualSpec;
}

const cationsMeta = [
  { id: "NH4+", name: "Amonium — NH₄⁺", short: "NH₄⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Na+", name: "Natrium — Na⁺", short: "Na⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "K+", name: "Kalium — K⁺", short: "K⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Mg2+", name: "Magnesium — Mg²⁺", short: "Mg²⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Ca2+", name: "Kalsium — Ca²⁺", short: "Ca²⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Ba2+", name: "Barium — Ba²⁺", short: "Ba²⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Al3+", name: "Aluminium — Al³⁺", short: "Al³⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Pb2+", name: "Timbal(II) — Pb²⁺", short: "Pb²⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Hg2 2+", name: "Merkurium(I) — Hg₂²⁺", short: "Hg₂²⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
  { id: "Ag+", name: "Perak(I) — Ag⁺", short: "Ag⁺", naturalColor: "rgba(235, 245, 255, 0.4)", hint: "Larutan jernih tak berwarna" },
];

const reagentsList = [
  { id: "HCl", name: "HCl (encer)", short: "HCl", icon: "science", desc: "Pereaksi kation Golongan I (pembentuk klorida sukar larut)" },
  { id: "H2S", name: "H₂S (suasana asam)", short: "H₂S", icon: "bubble_chart", desc: "Pereaksi kation Golongan II (pembentuk sulfida suasana asam)" },
  { id: "NaOH", name: "NaOH (basa kuat)", short: "NaOH", icon: "opacity", desc: "Uji hidroksida & sifat amfoter (larut kembali jika berlebih)" },
  { id: "NH3", name: "NH₃ (amonia berlebih)", short: "NH₃", icon: "water_drop", desc: "Uji pembentukan kompleks amina & pembeda kation" },
];

// Comprehensive 32 Reaction Database with Real Visual Simulation Specs
const reactionDatabase: Record<string, Record<string, ReactionDetail>> = {
  "Ag+": {
    "HCl": {
      code: "white_precipitate",
      label: "End. Putih",
      observation: "Terbentuk endapan putih kental menyerupai dadih susu (curdy precipitate) yang peka terhadap cahaya.",
      inference: "Terbentuk perak klorida (AgCl) yang sukar larut dalam air dingin, tetapi mudah larut dalam amonia membentuk kompleks.",
      equation: "\\text{Ag}^+(aq) + \\text{Cl}^-(aq) \\rightarrow \\text{AgCl}(s) \\downarrow",
      notes: "AgCl larut kembali saat ditambahkan NH₃ berlebih karena membentuk kompleks diamina perak(I) [Ag(NH₃)₂]⁺.",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#f8fafc",
        precipitateType: "curd",
        precipitateDensity: "heavy",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
    "H2S": {
      code: "coloured_precipitate",
      label: "End. Hitam",
      observation: "Larutan seketika menjadi keruh gelap dan mengendap padatan hitam pekat.",
      inference: "Terbentuk perak sulfida (Ag₂S) dengan nilai Ksp sangat kecil (sangat sukar larut).",
      equation: "2\\text{Ag}^+(aq) + \\text{S}^{2-}(aq) \\rightarrow \\text{Ag}_2\\text{S}(s) \\downarrow",
      notes: "Endapan Ag₂S tidak larut dalam asam encer maupun amonia.",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(30, 41, 59, 0.5)",
        precipitateColor: "#0f172a",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
    "NaOH": {
      code: "coloured_precipitate",
      label: "End. Coklat",
      observation: "Terbentuk endapan coklat tua kehitaman secara instan.",
      inference: "AgOH yang terbentuk tidak stabil dan langsung terdehidrasi menjadi perak(I) oksida (Ag₂O).",
      equation: "2\\text{Ag}^+(aq) + 2\\text{OH}^-(aq) \\rightarrow \\text{Ag}_2\\text{O}(s) \\downarrow + \\text{H}_2\\text{O}(l)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(245, 230, 211, 0.3)",
        precipitateColor: "#78350f",
        precipitateType: "powder",
        precipitateDensity: "heavy",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
    "NH3": {
      code: "no_reaction",
      label: "Larut (Jernih)",
      observation: "Endapan coklat yang sempat terbentuk langsung larut kembali menjadi larutan jernih tidak berwarna.",
      inference: "Amonia bertindak sebagai ligan membentuk kompleks kation koordinasi [Ag(NH₃)₂]⁺ yang larut sempurna.",
      equation: "\\text{Ag}^+(aq) + 2\\text{NH}_3(aq) \\rightarrow [\\text{Ag}(\\text{NH}_3)_2]^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(235, 248, 255, 0.5)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
  },
  "Pb2+": {
    "HCl": {
      code: "white_precipitate",
      label: "End. Putih",
      observation: "Terbentuk endapan putih kristal jarum tebal. Saat dipanaskan di air mendidih, endapan larut sempurna; saat didinginkan, kristal jarum mengkilap muncul kembali!",
      inference: "Terbentuk timbal(II) klorida (PbCl₂) yang kelarutannya meningkat drastis pada suhu tinggi.",
      equation: "\\text{Pb}^{2+}(aq) + 2\\text{Cl}^-(aq) \\rightarrow \\text{PbCl}_2(s) \\downarrow",
      notes: "Karakteristik khas Pb²⁺: PbCl₂ larut dalam air panas (coba klik tombol 🔥 Panaskan pada simulasi).",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#ffffff",
        precipitateType: "crystalline",
        precipitateDensity: "heavy",
        canDissolveInHeat: true,
      },
    },
    "H2S": {
      code: "coloured_precipitate",
      label: "End. Hitam",
      observation: "Terbentuk endapan hitam padat tebal PbS.",
      inference: "Ion Pb²⁺ terpresipitasi sebagai timbal(II) sulfida dalam suasana asam.",
      equation: "\\text{Pb}^{2+}(aq) + \\text{S}^{2-}(aq) \\rightarrow \\text{PbS}(s) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(30, 41, 59, 0.5)",
        precipitateColor: "#020617",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
    "NaOH": {
      code: "white_precipitate",
      label: "End. Putih (Amfoter)",
      observation: "Mula-mula terbentuk endapan putih Pb(OH)₂. Saat ditambahkan NaOH berlebih, endapan melarut kembali.",
      inference: "Pb(OH)₂ bersifat amfoter dan bereaksi dengan kelebihan OH⁻ membentuk ion tetrahidroksoplumbat(II) [Pb(OH)₄]²⁻.",
      equation: "\\text{Pb}^{2+}(aq) + 2\\text{OH}^-(aq) \\rightarrow \\text{Pb(OH)}_2(s) \\downarrow",
      notes: "Sifat amfoter: Pb(OH)₂ + 2OH⁻ (excess) → [Pb(OH)₄]²⁻ (larutan jernih).",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#f1f5f9",
        precipitateType: "gelatinous",
        precipitateDensity: "medium",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
    "NH3": {
      code: "white_precipitate",
      label: "End. Putih",
      observation: "Terbentuk endapan putih Pb(OH)₂ yang tidak larut meskipun ditambah amonia berlebih.",
      inference: "Pb²⁺ mengendap sebagai hidroksida karena pH basa lemah dari amonia, tetapi tidak membentuk kompleks amina yang stabil.",
      equation: "\\text{Pb}^{2+}(aq) + 2\\text{NH}_3(aq) + 2\\text{H}_2\\text{O}(l) \\rightarrow \\text{Pb(OH)}_2(s) \\downarrow + 2\\text{NH}_4^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#f8fafc",
        precipitateType: "gelatinous",
        precipitateDensity: "medium",
      },
    },
  },
  "Hg2 2+": {
    "HCl": {
      code: "white_precipitate",
      label: "End. Putih",
      observation: "Terbentuk endapan putih padat kalomel (Hg₂Cl₂). Tidak larut dalam air mendidih.",
      inference: "Kation dimer Hg₂²⁺ membentuk endapan klorida dengan ikatan kovalen Hg-Hg.",
      equation: "\\text{Hg}_2^{2+}(aq) + 2\\text{Cl}^-(aq) \\rightarrow \\text{Hg}_2\\text{Cl}_2(s) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#ffffff",
        precipitateType: "crystalline",
        precipitateDensity: "heavy",
      },
    },
    "H2S": {
      code: "coloured_precipitate",
      label: "End. Hitam",
      observation: "Terbentuk endapan hitam pekat (campuran HgS dan logam Hg halus).",
      inference: "Reaksi disproporsionasi dan presipitasi menghasilkan endapan hitam HgS dan droplet logam Hg mikroskopis.",
      equation: "\\text{Hg}_2^{2+}(aq) + \\text{S}^{2-}(aq) \\rightarrow \\text{HgS}(s) \\downarrow + \\text{Hg}(l) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(15, 23, 42, 0.6)",
        precipitateColor: "#020617",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
    "NaOH": {
      code: "coloured_precipitate",
      label: "End. Hitam",
      observation: "Terbentuk endapan hitam gelap Hg₂O yang langsung terurai.",
      inference: "Oksida raksa(I) tidak stabil dan terdisproporsionasi menjadi HgO dan Hg.",
      equation: "\\text{Hg}_2^{2+}(aq) + 2\\text{OH}^-(aq) \\rightarrow \\text{Hg}_2\\text{O}(s) \\downarrow + \\text{H}_2\\text{O}(l)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(15, 23, 42, 0.5)",
        precipitateColor: "#0f172a",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
    "NH3": {
      code: "coloured_precipitate",
      label: "End. Hitam Kelabu",
      observation: "Endapan putih Hg₂Cl₂ berubah menjadi hitam pekat saat terkena amonia!",
      inference: "Uji khas Hg₂²⁺: amonia memicu disproporsionasi menjadi endapan putih merkuri(II) aminoklorida (HgNH₂Cl) bercampur partikel hitam logam merkuri halus (Hg).",
      equation: "\\text{Hg}_2\\text{Cl}_2(s) + 2\\text{NH}_3(aq) \\rightarrow \\text{Hg(NH}_2\\text{)Cl}(s) \\downarrow + \\text{Hg}(l) \\downarrow + \\text{NH}_4\\text{Cl}(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(30, 41, 59, 0.6)",
        precipitateColor: "#1e293b",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
  },
  "Cu2+": {
    "HCl": {
      code: "no_reaction",
      label: "— (Biru)",
      observation: "Tidak ada endapan. Larutan tetap berwarna biru cerah / sedikit kehijauan jika klorida pekat.",
      inference: "CuCl₂ larut sempurna dalam air; tidak terbentuk endapan.",
      equation: "\\text{Cu}^{2+}(aq) + 2\\text{Cl}^-(aq) \\rightarrow \\text{CuCl}_2(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(56, 189, 248, 0.45)",
        finalLiquidColor: "rgba(56, 189, 248, 0.45)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "H2S": {
      code: "coloured_precipitate",
      label: "End. Hitam",
      observation: "Warna biru larutan langsung hilang, berganti endapan hitam pekat CuS.",
      inference: "Tembaga(II) sulfida mengendap secara tuntas bahkan dalam suasana asam kuat.",
      equation: "\\text{Cu}^{2+}(aq) + \\text{S}^{2-}(aq) \\rightarrow \\text{CuS}(s) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(56, 189, 248, 0.45)",
        finalLiquidColor: "rgba(15, 23, 42, 0.5)",
        precipitateColor: "#090d16",
        precipitateType: "powder",
        precipitateDensity: "heavy",
      },
    },
    "NaOH": {
      code: "coloured_precipitate",
      label: "End. Biru Muda",
      observation: "Terbentuk endapan gelatin biru langit Cu(OH)₂ yang lembut.",
      inference: "Ion tembaga(II) mengendap sebagai tembaga(II) hidroksida.",
      equation: "\\text{Cu}^{2+}(aq) + 2\\text{OH}^-(aq) \\rightarrow \\text{Cu(OH)}_2(s) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(56, 189, 248, 0.45)",
        finalLiquidColor: "rgba(224, 242, 254, 0.3)",
        precipitateColor: "#38bdf8",
        precipitateType: "gelatinous",
        precipitateDensity: "heavy",
      },
    },
    "NH3": {
      code: "colour_change",
      label: "Biru Tua Royal",
      observation: "Mula-mula muncul sedikit endapan biru pucat, yang seketika larut membentuk cairan biru tua pekat berkilau (royal blue).",
      inference: "Amonia berlebih membentuk kompleks koordinasi kationik tetraaminatembaga(II) [Cu(NH₃)₄]²⁺ yang sangat stabil dan berwarna khas.",
      equation: "\\text{Cu}^{2+}(aq) + 4\\text{NH}_3(aq) \\rightarrow [\\text{Cu}(\\text{NH}_3)_4]^{2+}(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(56, 189, 248, 0.45)",
        finalLiquidColor: "rgba(30, 58, 138, 0.9)", // Deep Royal Blue
        precipitateColor: undefined,
        precipitateType: "none",
        canDissolveInExcess: true,
        excessResult: "blue_complex",
      },
    },
  },
  "Al3+": {
    "HCl": {
      code: "no_reaction",
      label: "— (Jernih)",
      observation: "Tidak ada reaksi yang terlihat; larutan tetap jernih tidak berwarna.",
      inference: "AlCl₃ larut sempurna dalam air.",
      equation: "\\text{Al}^{3+}(aq) + 3\\text{Cl}^-(aq) \\rightarrow \\text{AlCl}_3(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "H2S": {
      code: "no_reaction",
      label: "— (Jernih)",
      observation: "Tidak terbentuk endapan dalam larutan asam.",
      inference: "Al³⁺ tidak mengendap sebagai sulfida dalam suasana asam (termasuk Golongan III).",
      equation: "\\text{Tidak bereaksi dalam asam}",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "NaOH": {
      code: "white_precipitate",
      label: "End. Putih (Amfoter)",
      observation: "Terbentuk endapan gelatin putih tembus pandang Al(OH)₃. Dengan penambahan NaOH berlebih, endapan melarut tuntas menjadi larutan jernih!",
      inference: "Al(OH)₃ bersifat amfoter; bereaksi dengan basa kuat membentuk ion tetrahidroksoaluminat [Al(OH)₄]⁻ yang larut.",
      equation: "\\text{Al}^{3+}(aq) + 3\\text{OH}^-(aq) \\rightarrow \\text{Al(OH)}_3(s) \\downarrow",
      notes: "Sifat amfoter: Al(OH)₃ + OH⁻ (excess) → [Al(OH)₄]⁻ (larutan jernih).",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#ffffff",
        precipitateType: "gelatinous",
        precipitateDensity: "light",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
    "NH3": {
      code: "white_precipitate",
      label: "End. Putih",
      observation: "Terbentuk endapan gelatin putih Al(OH)₃ yang TIDAK larut dengan penambahan amonia berlebih.",
      inference: "Amonia adalah basa lemah yang tidak cukup kuat untuk melarutkan Al(OH)₃ menjadi aluminat, dan Al³⁺ tidak membentuk kompleks amina.",
      equation: "\\text{Al}^{3+}(aq) + 3\\text{NH}_3(aq) + 3\\text{H}_2\\text{O}(l) \\rightarrow \\text{Al(OH)}_3(s) \\downarrow + 3\\text{NH}_4^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#ffffff",
        precipitateType: "gelatinous",
        precipitateDensity: "light",
      },
    },
  },
  "Cr3+": {
    "HCl": {
      code: "no_reaction",
      label: "— (Hijau)",
      observation: "Tidak ada reaksi pengendapan; larutan tetap berwarna hijau/violet jernih.",
      inference: "CrCl₃ larut dalam air.",
      equation: "\\text{Cr}^{3+}(aq) + 3\\text{Cl}^-(aq) \\rightarrow \\text{CrCl}_3(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(34, 197, 94, 0.4)",
        finalLiquidColor: "rgba(34, 197, 94, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "H2S": {
      code: "no_reaction",
      label: "— (Hijau)",
      observation: "Tidak ada endapan dalam suasana asam.",
      inference: "Kation Golongan III tidak terpresipitasi oleh H₂S dalam suasana asam.",
      equation: "\\text{Tidak bereaksi dalam asam}",
      visualSpec: {
        initialLiquidColor: "rgba(34, 197, 94, 0.4)",
        finalLiquidColor: "rgba(34, 197, 94, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "NaOH": {
      code: "coloured_precipitate",
      label: "End. Hijau (Amfoter)",
      observation: "Terbentuk endapan gelatin hijau keabu-abuan Cr(OH)₃. Dengan NaOH berlebih, endapan melarut menghasilkan larutan hijau terang.",
      inference: "Cr(OH)₃ bersifat amfoter; melarut dalam basa kuat membentuk heksahidroksokromat(III) [Cr(OH)₆]³⁻.",
      equation: "\\text{Cr}^{3+}(aq) + 3\\text{OH}^-(aq) \\rightarrow \\text{Cr(OH)}_3(s) \\downarrow",
      notes: "Sifat amfoter: Cr(OH)₃ + 3OH⁻ (excess) → [Cr(OH)₆]³⁻ (larutan hijau).",
      visualSpec: {
        initialLiquidColor: "rgba(34, 197, 94, 0.4)",
        finalLiquidColor: "rgba(22, 163, 74, 0.3)",
        precipitateColor: "#4ade80",
        precipitateType: "gelatinous",
        precipitateDensity: "medium",
        canDissolveInExcess: true,
        excessResult: "green_solution",
      },
    },
    "NH3": {
      code: "coloured_precipitate",
      label: "End. Hijau-Kelabu",
      observation: "Terbentuk endapan gelatin hijau kelabu Cr(OH)₃ yang sedikit larut pada amonia konsentrasi sangat tinggi.",
      inference: "Presipitasi sebagai hidroksida oleh basa lemah amonia.",
      equation: "\\text{Cr}^{3+}(aq) + 3\\text{NH}_3(aq) + 3\\text{H}_2\\text{O}(l) \\rightarrow \\text{Cr(OH)}_3(s) \\downarrow + 3\\text{NH}_4^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(34, 197, 94, 0.4)",
        finalLiquidColor: "rgba(34, 197, 94, 0.3)",
        precipitateColor: "#65a30d",
        precipitateType: "gelatinous",
        precipitateDensity: "medium",
      },
    },
  },
  "Fe3+": {
    "HCl": {
      code: "no_reaction",
      label: "— (Kuning)",
      observation: "Tidak ada endapan. Larutan tetap berwarna kuning kecoklatan.",
      inference: "FeCl₃ larut dalam air.",
      equation: "\\text{Fe}^{3+}(aq) + 3\\text{Cl}^-(aq) \\rightarrow \\text{FeCl}_3(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(234, 179, 8, 0.5)",
        finalLiquidColor: "rgba(234, 179, 8, 0.5)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "H2S": {
      code: "colour_change",
      label: "Kuning ➔ Hijau + S↓",
      observation: "Warna kuning besi(III) memudar menjadi kehijauan pucat (Fe²⁺) disertai kekeruhan suspensi belerang (S) putih kekuningan.",
      inference: "Reaksi redoks: H₂S mereduksi Fe³⁺ menjadi Fe²⁺ sambil teroksidasi menjadi endapan koloid belerang elemental.",
      equation: "2\\text{Fe}^{3+}(aq) + \\text{H}_2\\text{S}(aq) \\rightarrow 2\\text{Fe}^{2+}(aq) + \\text{S}(s) \\downarrow + 2\\text{H}^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(234, 179, 8, 0.5)",
        finalLiquidColor: "rgba(187, 247, 208, 0.45)",
        precipitateColor: "#fef08a",
        precipitateType: "powder",
        precipitateDensity: "light",
      },
    },
    "NaOH": {
      code: "coloured_precipitate",
      label: "End. Coklat Karat",
      observation: "Terbentuk endapan flokulan coklat-kemerahan (seperti karat besi) yang tebal. Tidak larut dalam NaOH berlebih.",
      inference: "Fe(OH)₃ bukan amfoter dan mengendap sempurna tanpa melarut kembali dalam basa kuat.",
      equation: "\\text{Fe}^{3+}(aq) + 3\\text{OH}^-(aq) \\rightarrow \\text{Fe(OH)}_3(s) \\downarrow",
      visualSpec: {
        initialLiquidColor: "rgba(234, 179, 8, 0.5)",
        finalLiquidColor: "rgba(254, 243, 199, 0.3)",
        precipitateColor: "#9a3412",
        precipitateType: "curd",
        precipitateDensity: "heavy",
      },
    },
    "NH3": {
      code: "coloured_precipitate",
      label: "End. Coklat Karat",
      observation: "Terbentuk endapan coklat kemerahan Fe(OH)₃ yang tidak larut dalam amonia berlebih.",
      inference: "Fe³⁺ tidak membentuk kompleks amina yang stabil dalam larutan air.",
      equation: "\\text{Fe}^{3+}(aq) + 3\\text{NH}_3(aq) + 3\\text{H}_2\\text{O}(l) \\rightarrow \\text{Fe(OH)}_3(s) \\downarrow + 3\\text{NH}_4^+(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(234, 179, 8, 0.5)",
        finalLiquidColor: "rgba(254, 243, 199, 0.3)",
        precipitateColor: "#9a3412",
        precipitateType: "curd",
        precipitateDensity: "heavy",
      },
    },
  },
  "Zn2+": {
    "HCl": {
      code: "no_reaction",
      label: "— (Jernih)",
      observation: "Tidak ada reaksi pengendapan; larutan tetap jernih tidak berwarna.",
      inference: "ZnCl₂ larut dalam air.",
      equation: "\\text{Zn}^{2+}(aq) + 2\\text{Cl}^-(aq) \\rightarrow \\text{ZnCl}_2(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "H2S": {
      code: "no_reaction",
      label: "— (Jernih)",
      observation: "Tidak mengendap dalam suasana asam (Ksp ZnS cukup besar sehingga butuh suasana netral/basa untuk mengendap).",
      inference: "Zn²⁺ termasuk kation Golongan III yang tidak diendapkan oleh H₂S asam.",
      equation: "\\text{Tidak bereaksi dalam suasana asam}",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
      },
    },
    "NaOH": {
      code: "white_precipitate",
      label: "End. Putih (Amfoter)",
      observation: "Terbentuk endapan putih gelatinous Zn(OH)₂. Dengan penambahan NaOH berlebih, endapan melarut kembali secara tuntas!",
      inference: "Zn(OH)₂ bersifat amfoter; bereaksi membentuk ion tetrahidroksozinkat(II) [Zn(OH)₄]²⁻ yang larut.",
      equation: "\\text{Zn}^{2+}(aq) + 2\\text{OH}^-(aq) \\rightarrow \\text{Zn(OH)}_2(s) \\downarrow",
      notes: "Sifat amfoter: Zn(OH)₂ + 2OH⁻ (excess) → [Zn(OH)₄]²⁻ (larutan jernih).",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.3)",
        precipitateColor: "#ffffff",
        precipitateType: "gelatinous",
        precipitateDensity: "medium",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
    "NH3": {
      code: "no_reaction",
      label: "Larut (Kompleks)",
      observation: "Endapan putih yang sempat muncul seketika melarut kembali membentuk larutan jernih.",
      inference: "Zn²⁺ membentuk kompleks amina yang stabil: tetraaminaseng(II) [Zn(NH₃)₄]²⁺.",
      equation: "\\text{Zn}^{2+}(aq) + 4\\text{NH}_3(aq) \\rightarrow [\\text{Zn}(\\text{NH}_3)_4]^{2+}(aq)",
      visualSpec: {
        initialLiquidColor: "rgba(240, 248, 255, 0.4)",
        finalLiquidColor: "rgba(240, 248, 255, 0.4)",
        precipitateColor: undefined,
        precipitateType: "none",
        canDissolveInExcess: true,
        excessResult: "clear",
      },
    },
  },
};

// Add reactions for NH₄⁺, Na⁺, K⁺, Mg²⁺, Ca²⁺, Ba²⁺
reactionDatabase["NH4+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada reaksi yang terlihat; larutan tetap jernih.",
    inference: "NH₄Cl larut sempurna dalam air. Amonium klorida tidak membentuk endapan dengan HCl.",
    equation: "\\\\text{NH}_4^+(aq) + \\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{NH}_4\\\\text{Cl}(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak terbentuk endapan dalam larutan asam.",
    inference: "NH₄⁺ tidak mengendap sebagai sulfida dalam suasana asam.",
    equation: "\\\\text{Tidak bereaksi dalam asam}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "gas",
    label: "Gas (amoniak)",
    observation: "Larutan mengeluarkan bau tajam amoniak (NH₃). Kertas lakmus biru basah di atas tabung menjadi biru lebih pekat.",
    inference: "Pemanasan dengan basa kuat menyebabkan pembentukan gas amonia dari ion amonium. NH₄⁺ + OH⁻ → NH₃↑ + H₂O",
    equation: "\\\\text{NH}_4^+(aq) + \\\\text{OH}^-(aq) \\\\xrightarrow{\\Delta} \\\\text{NH}_3(g) \\\\uparrow + \\\\text{H}_2\\\\text{O}(l)",
    notes: "Uji khas NH₄⁺: baunya menusuk dan membuat lakmus biru makin biru.",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.5)",
      precipitateType: "none",
    },
  },
  "NH3": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada perubahan yang terlihat dengan penambahan amonia.",
    inference: "NH₄⁺ adalah asam konjugat dari NH₃, sehingga tidak bereaksi lebih lanjut.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
};

reactionDatabase["Na+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan atau reaksi terlihat.",
    inference: "NaCl sangat larut dalam air dan tidak membentuk senyawa sukar larut dengan HCl.",
    equation: "\\\\text{Na}^+(aq) + \\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{NaCl}(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada reaksi terlihat.",
    inference: "Na⁺ tidak mengendap sebagai sulfida.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada reaksi pengendapan dengan NaOH.",
    inference: "NaOH larut sempurna dalam air, membentuk garam natrium yang larut.",
    equation: "\\\\text{Na}^+(aq) + \\\\text{OH}^-(aq) \\\\rightarrow \\\\text{NaOH}(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NH3": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan atau perubahan warna.",
    inference: "Na⁺ tidak membentuk kompleks amina.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
};

reactionDatabase["K+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan atau reaksi terlihat.",
    inference: "KCl sangat larut dalam air.",
    equation: "\\\\text{K}^+(aq) + \\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{KCl}(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada reaksi terlihat.",
    inference: "K⁺ tidak membentuk sulfida sukar larut.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada reaksi pengendapan.",
    inference: "KOH larut sempurna dalam air.",
    equation: "\\\\text{K}^+(aq) + \\\\text{OH}^-(aq) \\\\rightarrow \\\\text{KOH}(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NH3": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan atau perubahan yang terlihat.",
    inference: "K⁺ tidak membentuk kompleks dengan amonia.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
};

reactionDatabase["Mg2+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan; larutan tetap jernih.",
    inference: "MgCl₂ larut sempurna dalam air.",
    equation: "\\\\text{Mg}^{2+}(aq) + 2\\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{MgCl}_2(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan dalam suasana asam.",
    inference: "Mg²⁺ tidak mengendap sebagai sulfida dalam suasana asam.",
    equation: "\\\\text{Tidak bereaksi dalam asam}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "white_precipitate",
    label: "End. Putih",
    observation: "Terbentuk endapan putih gelatinous Mg(OH)₂ yang halus.",
    inference: "Magnesium hidroksida adalah basa lemah yang mengendap dalam pH tinggi. TAPI: Mg(OH)₂ BUKAN amfoter, tidak larut kembali dalam NaOH berlebih.",
    equation: "\\\\text{Mg}^{2+}(aq) + 2\\\\text{OH}^-(aq) \\\\rightarrow \\\\text{Mg(OH)}_2(s) \\\\downarrow",
    notes: "Penting: Mg(OH)₂ berbeda dengan Al³⁺/Zn²⁺ karena TIDAK bersifat amfoter — endapan tidak larut dalam NaOH berlebih!",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(240, 248, 255, 0.3)",
      precipitateColor: "#ffffff",
      precipitateType: "gelatinous",
      precipitateDensity: "medium",
      canDissolveInExcess: false,
    },
  },
  "NH3": {
    code: "white_precipitate",
    label: "End. Putih",
    observation: "Terbentuk endapan putih Mg(OH)₂ saat ditambah NH₃.",
    inference: "Amonia menghasilkan OH⁻ cukup untuk mengendapkan Mg(OH)₂ karena Ksp-nya cukup besar.",
    equation: "\\\\text{Mg}^{2+}(aq) + 2\\\\text{NH}_3(aq) + 2\\\\text{H}_2\\\\text{O}(l) \\\\rightarrow \\\\text{Mg(OH)}_2(s) \\\\downarrow + 2\\\\text{NH}_4^+(aq)",
    notes: "Mg²⁺ juga mengendap sebagai hidroksida dalam basa lemah amonia.",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(240, 248, 255, 0.3)",
      precipitateColor: "#ffffff",
      precipitateType: "gelatinous",
      precipitateDensity: "light",
    },
  },
};

reactionDatabase["Ca2+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan yang terbentuk.",
    inference: "CaCl₂ larut sempurna dalam air.",
    equation: "\\\\text{Ca}^{2+}(aq) + 2\\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{CaCl}_2(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan sulfida dalam suasana asam.",
    inference: "Ca²⁺ tidak mengendap sebagai sulfida.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "white_precipitate",
    label: "End. Putih",
    observation: "Jika konsentrasi cukup tinggi, terbentuk endapan putih kapur sirih Ca(OH)₂ yang sedikit larut.",
    inference: "Kalsium hidroksida memiliki kelarutan terbatas. Pada konsentrasi reagen tinggi (>0.1 M), akan mengendap.",
    equation: "\\\\text{Ca}^{2+}(aq) + 2\\\\text{OH}^-(aq) \\\\rightarrow \\\\text{Ca(OH)}_2(s) \\\\downarrow",
    notes: "Ca(OH)₂ hanya mengendap jika reagen cukup pekat. Kelarutannya lebih besar dibanding Mg(OH)₂.",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(240, 248, 255, 0.3)",
      precipitateColor: "#f1f5f9",
      precipitateType: "powder",
      precipitateDensity: "light",
      canDissolveInExcess: false,
    },
  },
  "NH3": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak terbentuk endapan (konsentrasi OH⁻ dari NH₃ terlalu rendah untuk mencapai Ksp Ca(OH)₂).",
    inference: "NH₃ menghasilkan [OH⁻] yang terlalu rendah untuk mengendapkan Ca(OH)₂.",
    equation: "\\\\text{Tidak bereaksi dalam kondisi ini}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
};

reactionDatabase["Ba2+"] = {
  "HCl": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan; larutan tetap jernih.",
    inference: "BaCl₂ sangat larut dalam air.",
    equation: "\\\\text{Ba}^{2+}(aq) + 2\\\\text{Cl}^-(aq) \\\\rightarrow \\\\text{BaCl}_2(aq)",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "H2S": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan sulfida.",
    inference: "BaS larut dalam air; tidak mengendap.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NaOH": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak terbentuk endapan pada konsentrasi reagen standar.",
    inference: "Ba(OH)₂ cukup larut. Hanya mengendap jika reagen sangat pekat.",
    equation: "\\\\text{Tidak bereaksi (larut)}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
  "NH3": {
    code: "no_reaction",
    label: "— (Jernih)",
    observation: "Tidak ada endapan yang terbentuk.",
    inference: "NH₃ tidak dapat mengendapkan Ba²⁺ dalam kondisi praktikum standar.",
    equation: "\\\\text{Tidak bereaksi}",
    visualSpec: {
      initialLiquidColor: "rgba(235, 245, 255, 0.4)",
      finalLiquidColor: "rgba(235, 245, 255, 0.4)",
      precipitateColor: undefined,
      precipitateType: "none",
    },
  },
};


const cellColorMap: Record<string, string> = {
  no_reaction: "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
  white_precipitate: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 font-semibold",
  coloured_precipitate: "bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 font-semibold",
  gas: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400 font-semibold",
  colour_change: "bg-blue-100/70 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border border-blue-300 font-semibold",
};

export function ReactionExplorer() {
  const [activeTab, setActiveTab] = useState<"workbench" | "gas" | "unknown" | "equations">("workbench");
  const [selectedCation, setSelectedCation] = useState("Ag+");
  const [selectedReagent, setSelectedReagent] = useState("HCl");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const currentReaction = reactionDatabase[selectedCation]?.[selectedReagent];
  const cationMeta = cationsMeta.find((c) => c.id === selectedCation);
  const reagentMeta = reagentsList.find((r) => r.id === selectedReagent);

  return (
    <div className="space-y-6">
      {/* Navigation Mode Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]/40 overflow-x-auto">
        <button
          onClick={() => setActiveTab("workbench")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "workbench"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container-highest)]"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">science</span>
          <span>Workbench & Matriks Animasi</span>
        </button>

        <button
          onClick={() => setActiveTab("gas")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "gas"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container-highest)]"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">bubble_chart</span>
          <span>Simulator Uji Gas & Efervesensi</span>
        </button>

        <button
          onClick={() => setActiveTab("unknown")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "unknown"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container-highest)]"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">search_check</span>
          <span>Detektif Cuplikan Misterius</span>
        </button>

        <button
          onClick={() => setActiveTab("equations")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "equations"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container-highest)]"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">edit_note</span>
          <span>Latihan Persamaan Ion Netto</span>
        </button>
      </div>

      {/* TAB 1: WORKBENCH & ANIMATED MATRIX */}
      {activeTab === "workbench" && (
        <div className="space-y-6 animate-fade-in">
          {/* Fixed height wrapper for consistent tab sizing */}
          <section className="min-h-[700px] surface-panel p-3 sm:p-4 md:p-5 lg:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-xl md:rounded-2xl flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 mb-4 border-b border-[var(--outline-variant)]/40">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary-container)]">science</span>
                  <span>Workbench Tabung Reaksi Virtual</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Pilih kation dari rak sampel, teteskan pereaksi, dan amati fenomena pembentukan endapan atau perubahan warna.
                </p>
              </div>
            </div>

            {/* Selection Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Cation Rack */}
              <div className="p-2.5 sm:p-3 bg-[var(--surface-container-low)] rounded-lg md:rounded-xl border border-[var(--outline-variant)]/40">
                <label className="text-[10px] sm:text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
                  1. Pilih Sampel Kation di Rak:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                  {cationsMeta.map((c) => {
                    const isSelected = selectedCation === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCation(c.id)}
                        className={`px-1.5 py-2 sm:px-2 sm:py-2 rounded-md md:rounded-lg text-[9px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 border ${
                          isSelected
                            ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm scale-[1.02]"
                            : "bg-[var(--surface-container-lowest)] text-[var(--foreground)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)]"
                        }`}
                      >
                        <span className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full border border-black/10" style={{ backgroundColor: c.naturalColor }}></span>
                        <span className="text-[8px] sm:text-[10px]">{c.short}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-2 italic">
                  Sampel aktif: <span className="font-semibold text-[var(--foreground)]">{cationMeta?.name}</span> ({cationMeta?.hint})
                </p>
              </div>

              {/* Reagent Dropper Shelf */}
              <div className="p-2.5 sm:p-3 bg-[var(--surface-container-low)] rounded-lg md:rounded-xl border border-[var(--outline-variant)]/40">
                <label className="text-[10px] sm:text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
                  2. Pilih Botol Pipet Pereaksi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {reagentsList.map((r) => {
                    const isSelected = selectedReagent === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReagent(r.id)}
                        className={`p-2 sm:p-2.5 rounded-md md:rounded-lg text-left text-[10px] sm:text-xs transition-all border flex items-start gap-1.5 sm:gap-2 ${
                          isSelected
                            ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)] shadow-sm scale-[1.02]"
                            : "bg-[var(--surface-container-lowest)] text-[var(--foreground)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)]"
                        }`}
                      >\n                        <span aria-hidden="true" className="material-symbols-outlined text-base mt-0.5 text-amber-400">{r.icon}</span>\n                        <div>\n                          <p className="font-semibold text-[10px] sm:text-[11px]">{r.name}</p>
                          <p className="text-[9px] opacity-80 line-clamp-1">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Workbench Grid: Live Animated Tube + Observation Inspector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4 lg:gap-6 items-stretch">
              {/* Left: Animated Tube Simulation */}
              <div className="sm:col-span-full lg:col-span-5 flex items-center justify-center min-h-[200px]">
                {currentReaction && (
                  <ReactionTubeAnimation
                    cationName={cationMeta?.short || selectedCation}
                    reagentName={reagentMeta?.name || selectedReagent}
                    visualSpec={currentReaction.visualSpec}
                  />
                )}
              </div>

              {/* Right: Chemical Observation & Net Ionic Equation Card */}
              <div className="md:col-span-7 flex flex-col justify-between p-5 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)]/50 space-y-4">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Lembar Observasi Laboratorium</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cellColorMap[currentReaction?.code || "no_reaction"]}`}>
                      {currentReaction?.label}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[var(--foreground)] mb-3">
                    {cationMeta?.name} + {reagentMeta?.name}
                  </h4>

                  {/* Observation vs Inference */}
                  <div className="space-y-3">
                    <div className="p-3 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]/40 shadow-xs">
                      <p className="text-xs font-bold text-[var(--primary-container)] flex items-center gap-1 mb-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">visibility</span>
                        <span>Observasi Visual (Apa yang terlihat langsung):</span>
                      </p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed">
                        {currentReaction?.observation}
                      </p>
                    </div>

                    <div className="p-3 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]/40 shadow-xs">
                      <p className="text-xs font-bold text-[var(--secondary)] flex items-center gap-1 mb-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">psychology</span>
                        <span>Inferensi Kimia (Kesimpulan reaksi):</span>
                      </p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed">
                        {currentReaction?.inference}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Net Ionic Equation */}
                {currentReaction?.equation && (
                  <div className="pt-2">
                    <Equation
                      tex={currentReaction.equation}
                      label="Persamaan Reaksi Ion Netto"
                      description="Hanya menampilkan ion yang berikatan menjadi produk fasa padat atau kompleks."
                    />
                  </div>
                )}

                {/* Laboratory Tips */}
                {currentReaction?.notes && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm shrink-0 mt-0.5 text-amber-600">tips_and_updates</span>
                    <p className="leading-relaxed">{currentReaction.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Interactive Matrix Grid (Click any cell to inspect on Workbench) */}
          <section className="surface-panel p-5 sm:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Matriks Reaksi Lengkap (32 Reaksi Kation vs Pereaksi)
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Klik sel mana saja di tabel untuk memutar animasi reaksi tabung secara langsung pada workbench di atas.
                </p>
              </div>

              {/* Legend Filter */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                    activeFilter === "all" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-container-low)]"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveFilter("white_precipitate")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${cellColorMap.white_precipitate}`}
                >
                  End. Putih
                </button>
                <button
                  onClick={() => setActiveFilter("coloured_precipitate")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${cellColorMap.coloured_precipitate}`}
                >
                  End. Berwarna
                </button>
                <button
                  onClick={() => setActiveFilter("colour_change")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${cellColorMap.colour_change}`}
                >
                  Perubahan Warna
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--outline-variant)]/50">
              <table className="w-full text-xs sm:text-sm border-collapse bg-[var(--surface-container-lowest)]">
                <thead>
                  <tr className="bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]/60">
                    <th className="sticky left-0 bg-[var(--surface-container-low)] border-r border-[var(--outline-variant)]/40 px-3 py-2.5 text-left font-bold text-[var(--foreground)]">
                      Kation \ Pereaksi
                    </th>
                    {reagentsList.map((r) => (
                      <th key={r.id} className="border-r border-[var(--outline-variant)]/40 px-3 py-2.5 text-center font-bold text-[var(--foreground)] min-w-[120px]">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cationsMeta.map((cation) => (
                    <tr key={cation.id} className="border-b border-[var(--outline-variant)]/30 hover:bg-[var(--surface-container-low)]/50 transition-colors">
                      <td className="sticky left-0 bg-[var(--surface-container-lowest)] border-r border-[var(--outline-variant)]/40 px-3 py-2.5 font-mono font-bold text-[var(--primary-container)]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cation.naturalColor }}></span>
                          <span>{cation.id}</span>
                        </div>
                      </td>
                      {reagentsList.map((r) => {
                        const cell = reactionDatabase[cation.id]?.[r.id];
                        const isSelected = selectedCation === cation.id && selectedReagent === r.id;
                        const matchesFilter = activeFilter === "all" || cell?.code === activeFilter;

                        return (
                          <td
                            key={r.id}
                            className={`border-r border-[var(--outline-variant)]/30 px-3 py-2 text-center cursor-pointer transition-all duration-200 ${
                              cell ? cellColorMap[cell.code] : ""
                            } ${
                              isSelected
                                ? "ring-2 ring-[var(--primary-container)] ring-inset font-bold scale-[0.98] shadow-inner"
                                : matchesFilter ? "hover:brightness-95" : "opacity-30"
                            }`}
                            onClick={() => {
                              setSelectedCation(cation.id);
                              setSelectedReagent(r.id);
                              // Smooth scroll to workbench
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                          >
                            <span className="text-xs">{cell?.label || "—"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: GAS EVOLUTION & DETECTION SIMULATOR */}
      {activeTab === "gas" && (
        <section className="min-h-[680px] surface-panel p-5 sm:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-2xl space-y-6 animate-fade-in flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-amber-500">bubble_chart</span>
              <span>Simulator Reaksi Pembentukan Gas & Uji Identifikasi</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Beberapa reaksi senyawa golongan utama menghasilkan pelepasan gas. Amati efervesensi (desis gelembung) dan uji identifikasi nyala atau indikatornya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gas 1: H2 */}
            <div className="p-4 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Gas H₂</span>
                  <span className="text-xs text-[var(--muted)]">Logam Aktif + Asam</span>
                </div>
                <h4 className="text-sm font-bold">Mg(s) + 2HCl(aq) ➔ MgCl₂(aq) + H₂(g)↑</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Pita magnesium bereaksi spontan dan melepaskan semburan gelembung gas hidrogen tanpa warna dan tanpa bau.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--outline-variant)]/30">
                <PredictionPrompt
                  question="Bagaimana cara membuktikan gas yang keluar adalah gas Hidrogen (H₂)?"
                  predictionHint="Tulis uji nyala atau uji laboratorium yang sesuai..."
                  revealText="Uji Letup Nyala Pop (Squeaky Pop Test)"
                  explanation="Dekatkan kayu menyala / bara api ke mulut tabung reaksi. Gas H₂ yang mudah terbakar akan meletup kecil menghasilkan bunyi 'pop' khas membentuk H₂O."
                />
              </div>
            </div>

            {/* Gas 2: CO2 */}
            <div className="p-4 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">Gas CO₂</span>
                  <span className="text-xs text-[var(--muted)]">Karbonat + Asam</span>
                </div>
                <h4 className="text-sm font-bold">CaCO₃(s) + 2HCl(aq) ➔ CaCl₂ + H₂O + CO₂(g)↑</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Serbuk kalsium karbonat mendesis kuat menghasilkan gelembung gas karbon dioksida yang mampu memadamkan api.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--outline-variant)]/30">
                <PredictionPrompt
                  question="Bagaimana cara menguji gas CO₂ secara spesifik dengan reagen cairan?"
                  predictionHint="Sebutkan larutan indikator pengendapan..."
                  revealText="Uji Air Kapur — Ca(OH)₂"
                  explanation="Alirkan gas CO₂ ke dalam tabung berisi air kapur jernih Ca(OH)₂. Larutan akan menjadi keruh putih karena terbentuk endapan kalsium karbonat CaCO₃ kembali."
                />
              </div>
            </div>

            {/* Gas 3: SO2 */}
            <div className="p-4 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Gas SO₂</span>
                  <span className="text-xs text-[var(--muted)]">Sulfit + Asam</span>
                </div>
                <h4 className="text-sm font-bold">Na₂SO₃(s) + 2HCl(aq) ➔ 2NaCl + H₂O + SO₂(g)↑</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Garam sulfit melepaskan gas sulfur dioksida yang berbau menyengat seperti korek api yang baru dinyalakan.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--outline-variant)]/30">
                <PredictionPrompt
                  question="Apa yang terjadi bila gas SO₂ dialirkan ke kertas lakmus basah atau larutan KMnO₄?"
                  predictionHint="Sifat asam dan pereduksi gas SO₂..."
                  revealText="Memerahkan lakmus biru & Melunturkan warna ungu KMnO₄"
                  explanation="SO₂ bersifat asam (memerahkan lakmus) dan merupakan reduktor kuat yang dapat mereduksi MnO₄⁻ (ungu) menjadi Mn²⁺ (tidak berwarna)."
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: UNKNOWN SAMPLE DETECTIVE LAB - ENHANCED */}
      {activeTab === "unknown" && <MysteryChallengeLab />}

      {/* TAB 4: EQUATION BALANCING EXERCISES */}
      {activeTab === "equations" && (
        <section className="min-h-[680px] surface-panel p-5 sm:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-2xl space-y-4 animate-fade-in flex flex-col">
          <EquationExercise />
        </section>
      )}
    </div>
  );
}

// Interactive Unknown Sample Mystery Lab Challenge
function UnknownSampleLab() {
  const unknownPool = [
    {
      id: "sampel-a",
      name: "Cuplikan Misterius #01",
      actualCation: "Ag+",
      steps: [
        { reagent: "HCl", action: "Teteskan HCl encer", result: "Terbentuk endapan putih curdy AgCl" },
        { reagent: "NH3", action: "Tambahkan NH₃ berlebih", result: "Endapan putih larut sempurna menjadi larutan jernih [Ag(NH₃)₂]⁺" },
      ],
      options: ["Ag+", "Pb2+", "Hg2 2+", "Al3+"],
      correct: "Ag+",
      explanation: "Endapan putih dengan HCl yang larut kembali dalam NH₃ berlebih merupakan karakteristik mutlak dari kation Perak(I) (Ag⁺). PbCl₂ tidak larut dalam NH₃, sedangkan Hg₂Cl₂ berubah menjadi hitam.",
    },
    {
      id: "sampel-b",
      name: "Cuplikan Misterius #02",
      actualCation: "Pb2+",
      steps: [
        { reagent: "HCl", action: "Teteskan HCl encer", result: "Terbentuk endapan putih kristal PbCl₂" },
        { reagent: "Panas", action: "Panaskan tabung di penangas air", result: "Endapan putih melarut sempurna saat panas dan mengkristal kembali saat dingin" },
      ],
      options: ["Ag+", "Pb2+", "Hg2 2+", "Zn2+"],
      correct: "Pb2+",
      explanation: "PbCl₂ memiliki kurva kelarutan yang sangat curam terhadap suhu. Kation yang endapan kloridanya larut dalam air panas adalah Timbal(II) (Pb²⁺).",
    },
    {
      id: "sampel-c",
      name: "Cuplikan Misterius #03",
      actualCation: "Cu2+",
      steps: [
        { reagent: "NaOH", action: "Teteskan sedikit NaOH", result: "Terbentuk endapan biru muda gelatin Cu(OH)₂" },
        { reagent: "NH3", action: "Tambahkan NH₃ berlebih", result: "Larutan bertransformasi menjadi biru tua royal [Cu(NH₃)₄]²⁺" },
      ],
      options: ["Cr3+", "Cu2+", "Fe3+", "Al3+"],
      correct: "Cu2+",
      explanation: "Warna biru muda yang berubah menjadi larutan biru tua pekat saat ditambah amonia berlebih membuktikan adanya ion Tembaga(II) (Cu²⁺).",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [testedReagents, setTestedReagents] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const sample = unknownPool[currentIndex];

  const handleTest = (reagent: string) => {
    if (!testedReagents.includes(reagent)) {
      setTestedReagents([...testedReagents, reagent]);
    }
  };

  const handleReset = () => {
    setTestedReagents([]);
    setSelectedGuess(null);
    setIsAnswerRevealed(false);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % unknownPool.length);
    handleReset();
  };

  return (
    <section className="surface-panel p-5 sm:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[var(--outline-variant)]/40">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted)]">Uji Tantangan Analisis Kualitatif</span>
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary-container)]">search_check</span>
            <span>Detektif Cuplikan Misterius ({currentIndex + 1} dari {unknownPool.length})</span>
          </h3>
        </div>
        <button
          onClick={handleNext}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--outline-variant)] hover:border-[var(--primary-container)] bg-[var(--surface-container-low)]"
        >
          Ganti Cuplikan Lain ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Reagent Dispenser for Mystery Vial */}
        <div className="md:col-span-5 p-4 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 flex items-center justify-center font-bold text-xl border border-amber-300">
              ?
            </div>
            <div>
              <h4 className="font-bold text-sm">{sample.name}</h4>
              <p className="text-xs text-[var(--muted)]">Larutan cuplikan kation tidak dikenal</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--outline-variant)]/40">
            <p className="text-xs font-bold text-[var(--foreground)]">Uji Reagen yang Tersedia:</p>
            {sample.steps.map((st, idx) => {
              const isTested = testedReagents.includes(st.reagent);
              return (
                <button
                  key={idx}
                  onClick={() => handleTest(st.reagent)}
                  className={`w-full p-2.5 rounded-lg text-xs font-medium text-left border transition-all flex items-center justify-between ${
                    isTested
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                      : "bg-[var(--surface-container-lowest)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">science</span>
                    <span>{st.action}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase">{isTested ? "✓ Diuji" : "Uji"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time Observation Pad & Guess */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">assignment</span>
              <span>Hasil Observasi Langsung:</span>
            </h4>

            {testedReagents.length === 0 ? (
              <p className="text-xs text-[var(--muted)] italic py-3">
                Klik tombol uji reagen di sebelah kiri untuk meneteskan larutan pereaksi ke dalam cuplikan misterius ini.
              </p>
            ) : (
              <div className="space-y-2">
                {testedReagents.map((tr) => {
                  const stepData = sample.steps.find((s) => s.reagent === tr);
                  return (
                    <div key={tr} className="p-2.5 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/40 text-xs animate-fade-in">
                      <span className="font-bold text-[var(--primary-container)]">{stepData?.action}:</span>
                      <p className="mt-0.5 text-[var(--foreground)]">{stepData?.result}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Decision Guessing */}
          <div className="p-4 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]/60 space-y-3">
            <p className="text-xs font-bold text-[var(--foreground)]">Berdasarkan bukti observasi di atas, kation apakah ini?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sample.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedGuess(opt)}
                  disabled={isAnswerRevealed}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    selectedGuess === opt
                      ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)]"
                      : "bg-[var(--surface-container-low)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {selectedGuess && !isAnswerRevealed && (
              <button
                onClick={() => setIsAnswerRevealed(true)}
                className="w-full py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-lg hover:bg-[var(--primary-dark)] transition-all shadow-xs"
              >
                Konfirmasi Kesimpulan Kation
              </button>
            )}

            {isAnswerRevealed && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 animate-fade-in ${
                  selectedGuess === sample.correct
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300"
                    : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-300"
                }`}
              >
                <p className="font-bold text-sm flex items-center gap-1.5">
                  {selectedGuess === sample.correct ? "✓ Jawaban Anda Benar!" : "✕ Kurang Tepat"}
                </p>
                <p className="leading-relaxed">{sample.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Equation Balancing Step-by-Step Exercise - renamed for consistency
function EquationExercise() {
  const exercises = [
    {
      equation: "AgNO_3 + NaCl \\rightarrow AgCl + NaNO_3",
      ionic: "\\text{Ag}^+(aq) + \\text{Cl}^-(aq) \\rightarrow \\text{AgCl}(s) \\downarrow",
      question: "Tuliskan persamaan molekuler dan ion netto untuk reaksi pembentukan endapan perak klorida:",
      reactants: "AgNO₃(aq) + NaCl(aq) ➔ ...",
      answer: "\\text{AgNO}_3(aq) + \\text{NaCl}(aq) \\rightarrow \\text{AgCl}(s) \\downarrow + \\text{NaNO}_3(aq)",
      explanation: "Reaksi metatesis (pertukaran ion). Ion Ag⁺ dan Cl⁻ bersatu membentuk endapan padat AgCl yang sukar larut, sedangkan ion Na⁺ dan NO₃⁻ tetap larut sebagai ion penonton.",
    },
    {
      equation: "Pb(NO_3)_2 + 2NaI \\rightarrow PbI_2 + 2NaNO_3",
      ionic: "\\text{Pb}^{2+}(aq) + 2\\text{I}^-(aq) \\rightarrow \\text{PbI}_2(s) \\downarrow",
      question: "Seimbangkan reaksi pembentukan endapan kuning emas timbal(II) iodida:",
      reactants: "Pb(NO₃)₂(aq) + NaI(aq) ➔ ...",
      answer: "\\text{Pb(NO}_3)_2(aq) + 2\\text{NaI}(aq) \\rightarrow \\text{PbI}_2(s) \\downarrow + 2\\text{NaNO}_3(aq)",
      explanation: "Pb²⁺ bervalensi 2 sehingga membutuhkan 2 ion iodida (I⁻) untuk menghasilkan endapan kuning PbI₂.",
    },
    {
      equation: "FeCl_3 + 3NaOH \\rightarrow Fe(OH)_3 + 3NaCl",
      ionic: "\\text{Fe}^{3+}(aq) + 3\\text{OH}^-(aq) \\rightarrow \\text{Fe(OH)}_3(s) \\downarrow",
      question: "Seimbangkan reaksi pembentukan endapan coklat karat besi(III) hidroksida:",
      reactants: "FeCl₃(aq) + NaOH(aq) ➔ ...",
      answer: "\\text{FeCl}_3(aq) + 3\\text{NaOH}(aq) \\rightarrow \\text{Fe(OH)}_3(s) \\downarrow + 3\\text{NaCl}(aq)",
      explanation: "Kation Fe³⁺ mengikat 3 ion hidroksida OH⁻ membentuk endapan coklat kemerahan Fe(OH)₃.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const ex = exercises[current];

  return (
    <section className="surface-panel p-5 sm:p-6 border border-[var(--outline-variant)]/60 shadow-sm rounded-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]/40">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Latihan Penulisan & Keseimbangan Persamaan Ion Netto
          </h3>
          <p className="text-xs text-[var(--muted)]">Latihan {current + 1} dari {exercises.length}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--surface-container-low)] p-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{ex.question}</p>
        <div className="p-3 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/40 font-mono text-sm font-bold text-[var(--primary-container)]">
          {ex.reactants}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-dark)] transition-all shadow-xs"
          >
            Tampilkan Keseimbangan Persamaan & Penjelasan ➔
          </button>
        ) : (
          <div className="mt-3 space-y-3 animate-fade-in">
            <Equation tex={ex.answer} label="Persamaan Molekuler Lengkap" />
            <Equation tex={ex.ionic} label="Persamaan Ion Netto (Net Ionic)" />
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/50 leading-relaxed">
              <strong>Penjelasan Kimia:</strong> {ex.explanation}
            </div>
            {current < exercises.length - 1 && (
              <button
                onClick={() => {
                  setCurrent(current + 1);
                  setRevealed(false);
                }}
                className="rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-lowest)] px-4 py-2 text-xs font-bold text-[var(--primary-container)] hover:bg-[var(--surface-container)] transition-all"
              >
                Latihan Berikutnya ➔
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
