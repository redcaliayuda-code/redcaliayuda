import Link from "next/link";
import { FormularioVoluntario } from "./formulario";

export default function QuieroAyudarPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="text-sm text-texto-suave hover:text-texto">
        ← RED CALI
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Quiero ayudar</h1>
      <p className="mt-2 text-texto-suave">
        Cuéntanos qué puedes aportar: tu tiempo, tus recursos o tu transporte.
        Te conectamos con necesidades reales verificadas.
      </p>

      <div className="mt-8">
        <FormularioVoluntario />
      </div>
    </main>
  );
}
