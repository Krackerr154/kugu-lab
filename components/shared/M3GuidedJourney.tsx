"use client";

import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation, type ConnectionStatus } from "@/components/shared/M3PresentationProvider";
import { M3_STAGE_IDS, M3_DEMO_AGENT_IDS, type M3StageId } from "@/lib/m3-presentation";
import { BATH_AGENT_LABELS } from "@/lib/m3-ligands";

const STAGE_LABEL: Record<M3StageId, string> = { brief: "Tinjauan", understand: "Pahami", rehearse: "Latih", prove: "Buktikan", ready: "Siap" };
const STATUS_META: Record<ConnectionStatus, { label: string; icon: string; tone: string }> = {
  solo: { label: "Mode mandiri", icon: "cast", tone: "text-[var(--text-secondary)]" },
  connecting: { label: "Menyambungkan…", icon: "sync", tone: "text-[var(--primary-container)]" },
  following: { label: "Mengikuti presentasi", icon: "cast_connected", tone: "text-[var(--primary-container)]" },
  reconnecting: { label: "Menyambung ulang…", icon: "sync_problem", tone: "text-[var(--warning-ink)]" },
  disconnected: { label: "Terputus", icon: "cloud_off", tone: "text-[var(--warning-ink)]" },
  ended: { label: "Presentasi berakhir", icon: "stop_circle", tone: "text-[var(--text-secondary)]" },
  presenting: { label: "Anda memimpin presentasi", icon: "co_present", tone: "text-[var(--primary-container)]" },
};
const controlBtn = "min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const primaryBtn = "min-h-9 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-semibold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const field = "control-field min-h-10 min-w-0 px-2 text-sm";

export function M3Journey({ stages }: { stages: JourneyStage[] }) {
  const { navRequest } = useM3Presentation();
  return <ModuleJourney stages={stages} navRequest={navRequest} />;
}

export function M3FollowControls() {
  const { role, status, snapshot, ended, relayMode, roomId, setRoomId, joinError, follow, unfollow, rejoin } = useM3Presentation();
  const meta = STATUS_META[status];
  const following = role === "following";
  return (
    <div className="space-y-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm" data-presentation-status={status}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span aria-hidden="true" className={`material-symbols-outlined text-[18px] ${meta.tone}`}>{meta.icon}</span>
        <span className={`font-semibold ${status === "solo" ? "text-[var(--foreground)]" : meta.tone}`}>{meta.label}</span>
        {following && snapshot && !ended && <span className="text-xs text-[var(--text-secondary)]">· tahap {STAGE_LABEL[snapshot.stageId]}</span>}
        <span aria-live="polite" role="status" className="sr-only">{meta.label}{snapshot ? `, tahap ${STAGE_LABEL[snapshot.stageId]}` : ""}.</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {role === "solo" && !ended && <button type="button" onClick={follow} className={primaryBtn}>Ikuti presentasi</button>}
          {following && <button type="button" onClick={unfollow} className={controlBtn}>Berhenti mengikuti</button>}
          {(ended || status === "disconnected") && <><button type="button" onClick={rejoin} className={primaryBtn}>Kembali ke presenter</button><button type="button" onClick={unfollow} className={controlBtn}>Jelajahi mandiri</button></>}
        </div>
      </div>
      {relayMode && role !== "following" && <div className="flex flex-wrap items-center gap-2"><label htmlFor="m3-room-id" className="text-xs text-[var(--text-secondary)]">Ruang</label><input id="m3-room-id" aria-label="Kode ruang presentasi" className={`${field} w-36`} value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="contoh: ki3131-m3" autoComplete="off" /></div>}
      {joinError && <p role="alert" className="text-xs text-[var(--danger)]">Tidak dapat tersambung: {joinError}.</p>}
    </div>
  );
}

export function M3PresenterDeck() {
  const { role, snapshot, relayMode, roomId, setRoomId, presenterTicket, setPresenterTicket, joinError, startPresenting, endPresenting, presentStage, presentDemoOverlay } = useM3Presentation();
  const presenting = role === "presenting";
  if (!presenting) return (
    <div className="space-y-2 rounded-lg border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">co_present</span><span className="font-semibold text-[var(--foreground)]">Mode pengajar</span><span className="text-xs text-[var(--text-secondary)]">Publikasikan tahap dan sorotan ke siswa yang mengikuti.</span><button type="button" onClick={startPresenting} className={`${primaryBtn} ml-auto`}>Mulai presentasi</button></div>
      {relayMode && <div className="grid gap-2 sm:grid-cols-2"><label className="text-xs text-[var(--text-secondary)]">Kode ruang<input aria-label="Kode ruang presentasi" className={`${field} mt-1 w-full`} value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="ki3131-m3" autoComplete="off" /></label><label className="text-xs text-[var(--text-secondary)]">Tiket pengajar<input aria-label="Tiket pengajar" type="password" className={`${field} mt-1 w-full`} value={presenterTicket} onChange={(e) => setPresenterTicket(e.target.value)} autoComplete="off" /></label></div>}
      {joinError && <p role="alert" className="text-xs text-[var(--danger)]">Tidak dapat memulai: {joinError}.</p>}
      <p className="text-xs text-[var(--text-secondary)]">NIM siswa tetap lokal dan bukan bukti kehadiran.</p>
    </div>
  );
  return (
    <div className="space-y-2 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3 py-2.5 text-sm" data-presenter-deck>
      <div className="flex flex-wrap items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">co_present</span><span className="font-semibold text-[var(--foreground)]">Anda memimpin presentasi</span><button type="button" onClick={endPresenting} className={`${controlBtn} ml-auto`}>Akhiri presentasi</button></div>
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Tahap</p><div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Publikasikan tahap">{M3_STAGE_IDS.map((id) => <button key={id} type="button" onClick={() => presentStage(id)} aria-pressed={snapshot?.stageId === id} className={`${controlBtn} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}>{STAGE_LABEL[id]}</button>)}</div></div>
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sorotan agen (Pahami)</p><div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Publikasikan sorotan agen">{M3_DEMO_AGENT_IDS.map((id) => <button key={id} type="button" onClick={() => presentDemoOverlay({ kind: "complexing-agent", id })} aria-pressed={snapshot?.demoOverlay?.kind === "complexing-agent" && snapshot.demoOverlay.id === id} className={`${controlBtn} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}>{BATH_AGENT_LABELS[id]}</button>)}<button type="button" onClick={() => presentDemoOverlay(null)} className={controlBtn}>Hapus sorotan</button></div></div>
      <p className="text-xs leading-5 text-[var(--text-secondary)]">Kontrol ini hanya mengirim tahap dan sorotan. Ceklis, catatan, dan jawaban siswa tidak pernah ikut terkirim.</p>
    </div>
  );
}
