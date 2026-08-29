// Dynamic Module Renderer - loads data from static JSON files at build time
"use client";

import { useEffect, useState } from "react";
import m1Data from "@/app/data/M1.json";
import m2Data from "@/app/data/M2.json";
import m3Data from "@/app/data/M3.json";
import m4Data from "@/app/data/M4.json";
import m5Data from "@/app/data/M5.json";
import m6Data from "@/app/data/M6.json";

const modulesData = {
  m1: m1Data,
  m2: m2Data,
  m3: m3Data,
  m4: m4Data,
  m5: m5Data,
  m6: m6Data,
};

interface DynamicModuleRendererProps {
  moduleId: string;
}

export function DynamicModuleRenderer({ moduleId }: DynamicModuleRendererProps) {
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mod = modulesData[moduleId as keyof typeof modulesData];
    if (mod) {
      setModule(mod);
      setLoading(false);
    }
  }, [moduleId]);

  if (loading) return <div className="p-8 text-center">Memuat modul...</div>;
  if (!module) return <div className="p-8 text-red-500">Modul tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      {/* Tujuan */}
      <section className="rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Tujuan Praktikum</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          {Array.isArray(module.tujuan) && module.tujuan.map((tujuan: string, i: number) => (
            <li key={i}>{tujuan}</li>
          ))}
        </ul>
      </section>

      {/* Pendahuluan */}
      <section className="rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Pendahuluan</h2>
        <p className="mt-3 text-slate-700">{module.pendahuluan?.ringkas}</p>
        
        {module.pendahuluan?.konsep_kunci && Array.isArray(module.pendahuluan.konsep_kunci) && module.pendahuluan.konsep_kunci.length > 0 && (
          <div className="mt-4 space-y-4">
            {module.pendahuluan.konsep_kunci.map((ck: any, i: number) => (
              <div key={i} className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">{ck.topik}</h3>
                <p className="mt-1 text-sm text-slate-700">{ck.isi}</p>
              </div>
            ))}
          </div>
        )}

        {/* Aturan kelarutan (M1-specific) */}
        {module.pendahuluan?.aturan_kelarutan && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="font-semibold text-green-800">Senyawa Larut dalam Air</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-green-900">
                {module.pendahuluan.aturan_kelarutan.larut_dalam_air?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="font-semibold text-yellow-800">Kelarutan Kecil dalam Air</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-900">
                {module.pendahuluan.aturan_kelarutan.kelarutan_kecil?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Reaksi pembentukan gas */}
        {module.pendahuluan?.reaksi_pembentukan_gas && Array.isArray(module.pendahuluan.reaksi_pembentukan_gas) && (
          <div className="mt-4 space-y-3">
            <h4 className="font-semibold text-slate-900">Reaksi Pembentukan Gas</h4>
            {module.pendahuluan.reaksi_pembentukan_gas.map((rg: any, i: number) => (
              <div key={i} className="rounded-lg bg-indigo-50 p-3">
                <p className="font-mono text-sm text-indigo-900">{rg.persamaan.join(" | ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bahan & Alat */}
      {(module.bahan || module.alat) && (
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-bold">Bahan dan Peralatan</h2>
          {Array.isArray(module.bahan) && (
            <div className="mt-3">
              <h4 className="font-semibold text-slate-900">Bahan Kimia</h4>
              <p className="mt-2 text-sm text-slate-700">
                {module.bahan.join(", ")}
              </p>
            </div>
          )}
          {Array.isArray(module.alat) && (
            <div className="mt-3">
              <h4 className="font-semibold text-slate-900">Peralatan</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {module.alat.map((alat: string, i: number) => (
                  <li key={i}>{alat}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Prosedur */}
      {Array.isArray(module.prosedur) && module.prosedur.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-bold">Prosedur Percobaan</h2>
          <div className="mt-4 space-y-6">
            {module.prosedur.map((prog: any, idx: number) => (
              <div key={idx} className="relative">
                {prog.bagian && (
                  <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {idx + 1}
                    </span>
                    {prog.bagian}
                  </h3>
                )}
                <ol className="ml-4 space-y-3">
                  {Array.isArray(prog.langkah) && prog.langkah.map((langkah: string, li: number) => (
                    <li key={li} className="text-sm text-slate-700">{langkah}</li>
                  ))}
                  
                  {prog.sub && Array.isArray(prog.sub) && prog.sub.map((s: any, si: number) => (
                    <div key={si} className="ml-4">
                      <p className="font-medium text-slate-900">{s.nama}</p>
                      <ol className="mt-1 ml-4 list-decimal space-y-1 text-sm text-slate-700">
                        {Array.isArray(s.langkah) && s.langkah.map((ls: string, lsi: number) => (
                          <li key={lsi}>{ls}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                  
                  {prog.tabel_komposisi && Array.isArray(prog.tabel_komposisi) && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Larutan</th>
                            <th className="px-3 py-2 text-left font-medium">Komposisi</th>
                            <th className="px-3 py-2 text-left font-medium">Volume Akhir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {prog.tabel_komposisi.map((row: any, tr: number) => (
                            <tr key={tr}>
                              <td className="px-3 py-2 font-medium">{row.larutan}</td>
                              <td className="px-3 py-2">{row.bahan}</td>
                              <td className="px-3 py-2">{row.volume}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {prog.parameter_kunci && typeof prog.parameter_kunci === 'object' && Object.keys(prog.parameter_kunci).length > 0 && (
                    <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-900">
                      <span className="font-semibold">Parameter Kunci:</span>{" "}
                      {Object.entries(prog.parameter_kunci).map(([k, v], ik: number) => (
                        <span key={ik} className="mr-2">{k}: <code>{String(v)}</code></span>
                      ))}
                    </div>
                  )}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kisi-Kisi Laporan */}
      {module.kisi_kisi_laporan && (
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-bold">Kisi-Kisi Laporan Praktikum</h2>
          
          {module.kisi_kisi_laporan.data_pengamatan && Array.isArray(module.kisi_kisi_laporan.data_pengamatan) && (
            <div className="mt-3">
              <h3 className="font-semibold text-slate-900">A. Data Pengamatan</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                {module.kisi_kisi_laporan.data_pengamatan.map((dp: any, i: number) => (
                  <li key={i}>{typeof dp === 'string' ? dp : (dp.poin || '')}</li>
                ))}
              </ul>
            </div>
          )}
          
          {module.kisi_kisi_laporan.pembahasan && Array.isArray(module.kisi_kisi_laporan.pembahasan) && (
            <div className="mt-3">
              <h3 className="font-semibold text-slate-900">B. Pembahasan</h3>
              <div className="mt-2 space-y-3">
                {module.kisi_kisi_laporan.pembahasan.map((pbl: any, i: number) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    {pbl.topik && <p className="font-semibold text-slate-900">{pbl.topik}</p>}
                    {Array.isArray(pbl.poin) ? (
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {pbl.poin.map((pt: any, j: number) => (
                          <li key={j}>{typeof pt === 'string' ? pt : (typeof pt === 'object' ? pt.poin : '')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-slate-700">{pbl.poin}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tugas Pendahuluan */}
      {module.tugas_pendahuluan && (
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-bold">Tugas Pendahuluan</h2>
          <div className="mt-3 space-y-3">
            {Array.isArray(module.tugas_pendahuluan) && module.tugas_pendahuluan.map((tp: any, i: number) => (
              <div key={i} className="rounded-lg bg-purple-50 p-3 text-sm">
                <span className="font-semibold text-purple-900">
                  {i+1}. {tp.nomor && tp.nomor !== i+1 ? `No. ${tp.nomor}. ` : ''}{tp.pertanyaan}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Catatan Dokumen */}
      {module.catatan_dokumen && (
        <section className="rounded-xl border border-yellow-300 bg-yellow-50 p-5">
          <h2 className="text-lg font-bold text-yellow-800">Catatan Penting</h2>
          <p className="mt-2 text-sm text-yellow-900">{module.catatan_dokumen}</p>
        </section>
      )}
    </div>
  );
}
