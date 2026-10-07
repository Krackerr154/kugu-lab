"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

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
 * Bottom-right speed dial (Material's "FAB menu") for the student deck.
 *
 * The deck is height-starved on phones, so the header keeps only status and
 * reference info; the two *actions* (return to the assistant, exit the deck)
 * live here instead of taking a permanent row of chrome.
 *
 * Implementation notes:
 * - Hand-rolled rather than pulled from a component library: the app has no
 *   MUI/Mantine dependency, and the existing disclosure widgets
 *   (GlossaryTerm, M4InstructorUnlock, Navigation) follow the same pattern.
 * - ARIA follows the Speed Dial contract: aria-haspopup / aria-expanded /
 *   aria-controls on the trigger, role="menu" + aria-orientation on the list,
 *   role="menuitem" on the items.
 * - Keyboard: Escape closes and restores focus to the trigger; Arrow keys walk
 *   the items; Home/End jump to first/last. Focus is moved into the menu on
 *   open so keyboard and screen-reader users land on the choices directly.
 * - Dismisses on outside pointerdown and on scroll/resize, so it can never
 *   strand itself over the slide content.
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

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Move focus to the first enabled item when the menu opens. The `hidden`
  // attribute is removed in the same commit, so wait for the browser to make
  // the items focusable before trying to focus one — a single rAF still ran
  // while the node was unfocusable.
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
      // Fallback for browsers that need a full task turn after `hidden` flips.
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
      // Focus left the dial entirely (e.g. tabbing past the last item).
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
      className="fixed bottom-[5.5rem] right-3 z-40 flex flex-col items-end gap-2 sm:bottom-20 sm:right-4"
    >
      {/* Items stack above the trigger, per the vertical speed-dial arrangement.
          Removed from the a11y tree while closed so it is not a hidden tab stop. */}
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-orientation="vertical"
        aria-label="Aksi dek slide"
        // `hidden` would make the items unfocusable in the same commit that
        // flips it off, so collapse with inert instead: removed from the a11y
        // tree and not focusable, but still focusable the moment it opens.
        inert={!open}
        onKeyDown={onMenuKeyDown}
        className={`flex flex-col items-end gap-2 ${open ? "" : "pointer-events-none invisible"}`}
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
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] pl-3 pr-4 text-sm font-semibold text-[var(--primary-container)] shadow-lg hover:bg-[var(--surface-container)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--surface)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">
            my_location
          </span>
          <span>Kembali ke Asisten</span>
        </button>

        {onExit ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onExit)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] pl-3 pr-4 text-sm font-semibold text-[var(--primary-container)] shadow-lg hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">
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
        className="m4-motion-control flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-xl hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-2xl">
          {open ? "close" : "more_vert"}
        </span>
      </button>
    </div>
  );
}
