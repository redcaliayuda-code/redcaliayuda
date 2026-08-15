import Link from "next/link";
import { FormularioPersona } from "./formulario";

export default function ReportarPersonaPage() {
  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/personas" className="text-sm font-bold tracking-tight text-acento">
            Collab x Mindo
          </Link>
          <Link href="/personas" className="text-xs text-texto-suave hover:text-texto">
            Ver tablero
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Reportar persona</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Avisa que estas a salvo o reporta a alguien que buscas.
        </p>
        <div className="mt-5">
          <FormularioPersona />
        </div>
      </div>
    </main>
  );
}
