import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { TransitionWatcher } from "@/components/layout/TransitionLink";

export const metadata: Metadata = {
  title: "KUGU Lab — Interactive Praktikum Kimia Unsur Golongan Utama",
  description:
    "Pendamping interaktif untuk Praktikum Anorganik KI3131: Kimia Unsur Golongan Utama, FMIPA ITB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--on-surface)] flex flex-col lg:flex-row">
        <TransitionWatcher />
        <Navigation />
        <div className="app-shell min-w-0 flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out">
          <AppHeader />
          <main className="flex-1">{children}</main>
          <footer className="no-print border-t border-[var(--outline-variant)] bg-[var(--surface)] py-4 px-6 text-center text-xs text-[var(--on-surface-variant)]">
            KUGU Lab · Praktikum Kimia Anorganik KI3131 · FMIPA ITB · Semester 1 2025/2026
            <br />
            Pendamping digital ini bukan pengganti SOP, SDS, putusan instruktur, atau kerja praktikum fisik.
          </footer>
        </div>
      </body>
    </html>
  );
}
