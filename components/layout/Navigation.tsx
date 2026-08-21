"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Beranda", icon: "dashboard", short: "Home" },
  { href: "/modules", label: "Modul", icon: "menu_book", short: "Modules" },
  { href: "/prelab", label: "Pre-lab", icon: "edit_note", short: "Pre-lab" },
  { href: "/notebook", label: "Catatan Praktikum", icon: "notebook", short: "Notebook" },
  { href: "/analisis", label: "Analisis Data", icon: "analytics", short: "Analysis" },
  { href: "/laporan", label: "Laporan", icon: "description", short: "Reports" },
  { href: "/referensi", label: "Referensi & Keselamatan", icon: "shield", short: "Safety" },
  { href: "/pengajar", label: "Ruang Pengajar", icon: "school", short: "Instructor" },
];

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const wasMobileOpen = useRef(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!mobileOpen) {
      if (wasMobileOpen.current) {
        menuButtonRef.current?.focus();
        wasMobileOpen.current = false;
      }
      return;
    }

    wasMobileOpen.current = true;
    const drawer = mobileDrawerRef.current;
    const getFocusable = () => {
      const drawerLinks = drawer
        ? Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector))
        : [];
      return menuButtonRef.current ? [...drawerLinks, menuButtonRef.current] : drawerLinks;
    };

    const focusable = getFocusable();
    focusable[0]?.focus();
    const appShell = document.querySelector<HTMLElement>(".app-shell");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    appShell?.setAttribute("inert", "");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawer) return;

      const currentFocusable = getFocusable();
      if (currentFocusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const activeElement = document.activeElement;
      if (!currentFocusable.includes(activeElement as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      appShell?.removeAttribute("inert");
    };
  }, [mobileOpen]);

  return (
    <>
      {/* === Desktop Sidebar — collapsible (w-20 → w-64 on hover) === */}
      <aside className="no-print sidebar-scroll hidden lg:flex flex-col h-screen w-20 hover:w-64 transition-[width] duration-300 ease-out fixed left-0 top-0 z-20 bg-[var(--primary)] text-[var(--on-primary)] shadow-ambient overflow-x-hidden overflow-y-auto group">
        <div className="flex flex-col h-full py-8 w-64">
          {/* Header */}
          <div className="px-4 mb-8 flex items-center gap-4 whitespace-nowrap">
            <div className="w-12 h-12 rounded-xl bg-[var(--secondary-container)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 font-headline font-bold text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
              K
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="font-bold tracking-tight text-lg text-[var(--secondary-container)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                KUGU Lab
              </p>
              <p className="text-xs text-white/70">KI3131 · FMIPA ITB</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav aria-label="Navigasi utama" className="flex-1 flex flex-col gap-4 px-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  className={`relative flex items-center gap-4 rounded-xl py-2 transition-colors group/nav focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-container)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
                    active ? "text-[var(--secondary-container)]" : "text-white/70 hover:text-[var(--secondary-container)]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      active
                        ? "bg-[var(--primary-container)] border border-[var(--secondary-container)] shadow-[0_0_15px_rgba(252,212,0,0.3)]"
                        : "border border-white/10 hover:border-[var(--secondary-container)]"
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}>
                      {item.icon}
                    </span>
                  </div>
                  <span
                    className={`font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      active ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Term pulse footer */}
          <div className="mt-auto px-4 pb-4">
            <div className="flex items-center gap-4 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="w-12 h-[2px] bg-[var(--secondary-container)] flex-shrink-0"></span>
              <span className="font-bold uppercase tracking-wider text-xs whitespace-nowrap text-[var(--secondary-container)]">
                Praktikum Pulse
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white/70 flex items-center justify-center flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">science</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <span className="text-xs text-white/50 block">Total Modul</span>
                  <span className="font-bold text-white">6</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--secondary-container)]/10 text-[var(--secondary-container)] flex items-center justify-center flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">grade</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <span className="text-xs text-white/50 block">Ambang Lulus</span>
                  <span className="font-bold text-[var(--secondary-container)]">NA ≥ 55</span>
                </div>
              </div>
              <div className="mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                  href="/modules"
                  className="w-full bg-[var(--secondary-container)] text-[var(--primary)] flex items-center justify-center gap-2 py-2 px-4 rounded-full font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>
                  Mulai Praktikum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* === Mobile Top Bar === */}
      <header className="no-print lg:hidden sticky top-0 z-50 h-16 bg-[var(--primary)] text-white border-b border-[var(--outline-variant)] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--secondary-container)] text-[var(--primary)] flex items-center justify-center font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
            K
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>KUGU Lab</span>
        </div>
        <button
          ref={menuButtonRef}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-container)]"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav ref={mobileDrawerRef} id="mobile-navigation" aria-label="Navigasi utama mobile" className="no-print lg:hidden fixed inset-0 top-16 z-40 bg-[var(--primary)] text-white overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-container)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
                    active
                      ? "bg-[var(--primary-container)] text-[var(--secondary-container)] border border-[var(--secondary-container)]/30"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
