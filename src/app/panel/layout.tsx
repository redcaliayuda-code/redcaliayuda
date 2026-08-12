import Link from "next/link";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/panel" className="text-sm font-semibold text-acento">
            RED CALI — Panel
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/panel" className="text-texto-suave hover:text-texto">Resumen</Link>
            <Link href="/panel/necesidades" className="text-texto-suave hover:text-texto">Necesidades</Link>
            <Link href="/panel/voluntarios" className="text-texto-suave hover:text-texto">Voluntarios</Link>
            <Link href="/" className="text-texto-suave hover:text-texto">Sitio público</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
