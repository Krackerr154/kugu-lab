"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toggleFullscreen } from "@/lib/fullscreen";
import { useFullscreenStatus } from "@/components/shared/useFullscreenStatus";

interface DeckActionDialProps {
  /** Jump the student back to the slide the assistant is on. */
  onReturnToPresenter: () => void;
  /** Whether returning is currently meaningful (student is behind/ahead). */
  canReturnToPresenter: boolean;
  /** Human-readable drift summary, e.g. "Slide 3 (Asisten di Slide 7)". */
  driftLabel?: string;
  /** Leave the deck. When absent the exit item is not rendered. */
  onExit?: () => void;
  exitLabel?: string;
}

/**
 * Topbar action menu for the student deck.
 *
 * Placed in the topbar header next to Fullscreen toggle so it never obscures
 * slide content, never collides with bottom navigation chevrons, and stays
 * accessible across portrait and landscape viewports.
 */
export function DeckActionDial({
  onReturnToPresenter,
  canReturnToPresenter,
  driftLabel,
  onExit,
  exitLabel = "Keluar ke Modul",
}: DeckActionDialProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const fullscreen = useFullscreenStatus();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Move focus to the first enabled item when the menu opens.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let timer = 0;
    const focusFirst = () => {
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
      const first = items?.[0];
      if (!first) return false;
      first.focus();
      return document.activeElement === first;
    };
    raf = window.requestAnimationFrame(() => {
      if (focusFirst()) return;
      timer = window.setTimeout(focusFirst, 0);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [open]);

  // Outside click, Escape, and viewport changes all dismiss the menu.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && rootRef.current?.contains(next)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    rootRef.current?.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", () => setOpen(false));
    window.addEventListener("scroll", () => setOpen(false), true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      rootRef.current?.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", () => setOpen(false));
      window.removeEventListener("scroll", () => setOpen(false), true);
    };
  }, [open, close]);

  // Arrow / Home / End walk the items, matching menu-button conventions.
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []
    );
    if (items.length === 0) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
        ? items.length - 1
        : e.key === "ArrowDown"
        ? (idx + 1) % items.length
        : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div
      ref={rootRef}
      data-deck-action-dial
      data-deck-dial-open={open ? "true" : "false"}
      className="relative inline-flex items-center shrink-0"
    >
      {/* Dropdown menu items */}
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-orientation="vertical"
        aria-label="Aksi dek slide"
        inert={!open}
        onKeyDown={onMenuKeyDown}
        className={`absolute right-0 top-full mt-1.5 z-50 flex flex-col items-end gap-1.5 ${
          open ? "" : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          role="menuitem"
          disabled={!canReturnToPresenter}
          onClick={() => runAction(onReturnToPresenter)}
          title={
            canReturnToPresenter
              ? driftLabel
                ? `Kembali ke asisten — ${driftLabel}`
                : "Kembali ke slide asisten"
              : "Sudah berada di slide asisten"
          }
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] pl-3 pr-4 text-xs font-semibold text-[var(--primary-container)] shadow-lg hover:bg-[var(--surface-container)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--surface)] whitespace-nowrap"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            my_location
          </span>
          <span>Kembali ke Asisten</span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          type="button"
          role="menuitem"
          onClick={() => runAction(() => { void toggleFullscreen(); })}
          title={fullscreen ? "Keluar dari mode layar penuh" : "Masuk ke mode layar penuh"}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] pl-3 pr-4 text-xs font-semibold text-[var(--primary-container)] shadow-lg hover:bg-[var(--surface-container)] whitespace-nowrap"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            {fullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
          <span>{fullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}</span>
        </button>

        {onExit ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onExit)}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] pl-3 pr-4 text-xs font-semibold text-[var(--primary-container)] shadow-lg hover:bg-[var(--surface-container)] whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">
              close
            </span>
            <span>{exitLabel}</span>
          </button>
        ) : null}
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Tutup menu aksi dek" : "Buka menu aksi dek"}
        onClick={() => setOpen((v) => !v)}
        className="m4-motion-control inline-flex min-h-7 px-2 items-center justify-center gap-1 rounded-lg border border-[var(--outline-variant)] text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
        title="Menu aksi dek"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">
          {open ? "close" : "more_vert"}
        </span>
      </button>
    </div>
  );
}
