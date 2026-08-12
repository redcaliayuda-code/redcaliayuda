import Link from "next/link";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/panel" className="text-sm font-bold text-acento">
            RED CALI — Panel
          </Link>
          <nav className="flex gap-2 text-xs sm:gap-4 sm:text-sm overflow-x-auto">
            <Link href="/panel" className="whitespace-nowrap text-texto-suave hover:text-texto">Resumen</Link>
            <Link href="/panel/necesidades" className="whitespace-nowrap text-texto-suave hover:text-texto">Necesidades</Link>
            <Link href="/panel/voluntarios" className="whitespace-nowrap text-texto-suave hover:text-texto">Voluntarios</Link>
            <Link href="/" className="whitespace-nowrap text-texto-suave hover:text-texto">Sitio</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-6">{children}</main>
    </div>
  );
}
